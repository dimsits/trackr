// Shared helpers for Trackr's local-development orchestration.
//
// Hard rule: this file (and everything that imports it) must run on a bare
// checkout *before* `npm ci` has finished, so it may only use Node built-ins.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const IS_WINDOWS = process.platform === 'win32';

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

const useColor =
  !process.env.NO_COLOR &&
  process.env.TERM !== 'dumb' &&
  Boolean(process.stdout.isTTY);

const paint = (code) => (text) =>
  useColor ? `[${code}m${text}[0m` : text;

export const bold = paint('1');
export const dim = paint('2');
export const red = paint('31');
export const green = paint('32');
export const yellow = paint('33');
export const cyan = paint('36');

let stepNumber = 0;

export function step(message) {
  stepNumber += 1;
  console.log(`\n${cyan(bold(`[${stepNumber}]`))} ${bold(message)}`);
}

export const ok = (m) => console.log(`    ${green('OK')}  ${m}`);
export const info = (m) => console.log(`    ${dim('--')}  ${m}`);
export const warn = (m) => console.log(`    ${yellow('!!')}  ${m}`);

/** Prints an actionable error block and exits non-zero. */
export function fail(title, ...hints) {
  console.error(`\n${red(bold('x Failed:'))} ${title}`);
  for (const hint of hints.filter(Boolean)) console.error(`  ${hint}`);
  console.error('');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Repository root
// ---------------------------------------------------------------------------

/**
 * Resolves the repository root from this file's own location and validates that
 * it really is the Trackr workspace root, rather than trusting the caller's cwd.
 */
export function resolveRepoRoot() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const manifestPath = join(root, 'package.json');

  if (!existsSync(manifestPath)) {
    fail(
      `No package.json found at ${root}.`,
      'Run this from a complete checkout of the Trackr repository.',
    );
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    fail(`Could not parse ${manifestPath}.`, String(error?.message ?? error));
  }

  if (manifest.name !== 'trackr' || !Array.isArray(manifest.workspaces)) {
    fail(
      `${manifestPath} is not the Trackr workspace root.`,
      'Expected "name": "trackr" and a "workspaces" array.',
    );
  }

  for (const workspace of manifest.workspaces) {
    if (!existsSync(join(root, workspace, 'package.json'))) {
      fail(
        `Workspace "${workspace}" is missing its package.json.`,
        'The checkout looks incomplete.',
      );
    }
  }

  return { root, manifest };
}

// ---------------------------------------------------------------------------
// Process execution
// ---------------------------------------------------------------------------

// On Windows `npm` and `docker` are .cmd/.exe shims, so Node needs a shell to
// resolve them through PATHEXT. Every argument we pass is a plain token, so the
// shell join is safe on both platforms.
const spawnOptions = (opts) => ({
  cwd: opts.cwd,
  env: { ...process.env, ...opts.env },
  shell: IS_WINDOWS,
});

/** Runs a command with inherited stdio. Exits the process on failure. */
export function run(command, args, opts = {}) {
  const printable = `${command} ${args.join(' ')}`;
  if (!opts.quiet) info(dim(`$ ${printable}`));

  const result = spawnSync(command, args, {
    ...spawnOptions(opts),
    stdio: 'inherit',
  });

  if (result.error) {
    if (opts.allowFailure) return { code: 1 };
    fail(
      `Could not run: ${printable}`,
      String(result.error?.message ?? result.error),
    );
  }

  const code = result.status ?? 1;
  if (code !== 0 && !opts.allowFailure) {
    fail(`Command exited with code ${code}: ${printable}`, ...(opts.hints ?? []));
  }

  return { code };
}

/** Runs a command capturing its output. Never exits, never throws. */
export function capture(command, args, opts = {}) {
  const result = spawnSync(command, args, {
    ...spawnOptions(opts),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return {
    code: result.error ? -1 : result.status ?? -1,
    stdout: (result.stdout ?? '').trim(),
    stderr: (result.stderr ?? '').trim(),
    failed: Boolean(result.error) || result.status !== 0,
  };
}

// ---------------------------------------------------------------------------
// Versions
// ---------------------------------------------------------------------------

/** Parses the leading x.y.z out of a version-ish string. */
export function parseVersion(text) {
  const match = /(\d+)\.(\d+)\.(\d+)/.exec(text ?? '');
  if (!match) return null;
  return { major: +match[1], minor: +match[2], patch: +match[3] };
}

function compareVersions(a, b) {
  for (const key of ['major', 'minor', 'patch']) {
    if (a[key] !== b[key]) return a[key] < b[key] ? -1 : 1;
  }
  return 0;
}

/** Reads the minimum version out of an engines range such as ">=20.11.0". */
export function minimumFromRange(range) {
  return parseVersion(range) ?? { major: 0, minor: 0, patch: 0 };
}

export function satisfiesMinimum(actualText, range) {
  const actual = parseVersion(actualText);
  if (!actual) return false;
  return compareVersions(actual, minimumFromRange(range)) >= 0;
}

// ---------------------------------------------------------------------------
// Prerequisite checks
// ---------------------------------------------------------------------------

export const DOCKER_INSTALL_HINT =
  'Install Docker Desktop: https://www.docker.com/products/docker-desktop/';

export const DOCKER_DAEMON_HINT =
  'Start Docker Desktop and wait until it reports "Engine running", then retry.';

/** Verifies the Docker CLI, a running daemon, and the Compose v2 plugin. */
export function requireDocker() {
  const cli = capture('docker', ['--version']);
  if (cli.failed) {
    fail('Docker is not available on your PATH.', DOCKER_INSTALL_HINT);
  }
  ok(`Docker CLI: ${cli.stdout}`);

  const daemon = capture('docker', ['info', '--format', '{{.ServerVersion}}']);
  if (daemon.failed) {
    fail(
      'The Docker daemon is not running.',
      DOCKER_DAEMON_HINT,
      dim(daemon.stderr.split('\n')[0] ?? ''),
    );
  }
  ok(`Docker daemon: ${daemon.stdout}`);

  const compose = capture('docker', ['compose', 'version']);
  if (compose.failed) {
    fail(
      'The Docker Compose plugin is not available.',
      'Compose v2 ships with Docker Desktop; on Linux install the docker-compose-plugin package.',
    );
  }
  ok(`Docker Compose: ${compose.stdout}`);
}

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

/** Blocking sleep without timers, so step output stays strictly ordered. */
export function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/** Reads POSTGRES_PORT the same way Compose does: root .env, then the shell. */
export function postgresHostPort(root) {
  const fromShell = process.env.POSTGRES_PORT?.trim();
  if (fromShell) return Number(fromShell);

  const dotenv = join(root, '.env');
  if (existsSync(dotenv)) {
    const match = /^\s*POSTGRES_PORT\s*=\s*"?([0-9]+)"?\s*$/m.exec(
      readFileSync(dotenv, 'utf8'),
    );
    if (match) return Number(match[1]);
  }

  return 5432;
}

/** Resolves true if something is already accepting TCP connections on `port`. */
function probePort(port, timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = createConnection({ host: '127.0.0.1', port });
    const settle = (isOpen) => {
      socket.destroy();
      resolve(isOpen);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => settle(true));
    socket.once('timeout', () => settle(false));
    socket.once('error', () => settle(false));
  });
}

/** True when this project's `db` container is already running. */
function composeDbRunning(root) {
  const result = capture('docker', ['compose', 'ps', '-q', 'db'], { cwd: root });
  return !result.failed && result.stdout.length > 0;
}

/**
 * Guards against the most confusing local failure there is: a *different*
 * Postgres already owning the host port, so Compose reports a healthy container
 * while Prisma authenticates against someone else's database.
 */
export async function assertPortIsOurs(root) {
  const port = postgresHostPort(root);

  if (composeDbRunning(root)) return port;

  if (await probePort(port)) {
    fail(
      `Port ${port} is already in use by another process.`,
      'Something other than this project (a native PostgreSQL service, or another',
      'container) is listening there, so Trackr would connect to the wrong database.',
      '',
      'Fix it either way:',
      `  - stop the other service, or`,
      `  - put ${bold(`POSTGRES_PORT=5433`)} in a .env file at the repository root and`,
      `    change the port in DATABASE_URL (apps/backend/.env) to match.`,
    );
  }

  return port;
}

/**
 * Brings Postgres up and blocks until its healthcheck passes.
 * Safe to call when the container is already running.
 */
export function startDatabase(root) {
  run('docker', ['compose', 'up', '-d', '--wait'], {
    cwd: root,
    hints: [
      'Is port 5432 already in use by another Postgres instance?',
      'Inspect with: docker compose ps   or   npm run db:logs',
    ],
  });

  // `--wait` already honours the healthcheck; re-asserting readiness here means
  // a stuck database is reported as such instead of as a Prisma connect error.
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const probe = capture(
      'docker',
      ['compose', 'exec', '-T', 'db', 'pg_isready', '-U', 'trackr', '-d', 'trackr'],
      { cwd: root },
    );
    if (!probe.failed) {
      ok('PostgreSQL is accepting connections.');
      return;
    }
    sleepSync(1000);
  }

  fail(
    'PostgreSQL did not become healthy in time.',
    'Inspect the container logs with: npm run db:logs',
  );
}
