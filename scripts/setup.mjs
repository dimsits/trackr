#!/usr/bin/env node
//
// `npm run setup` - one-shot, idempotent first-time integration for Trackr.
//
// Verifies prerequisites, installs the workspace, creates (never overwrites)
// local env files, starts PostgreSQL, applies committed migrations, seeds
// development data, and builds both apps as an integration check.
//
// Built-in Node modules only: this runs before dependencies are installed.

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join, relative } from 'node:path';

import {
  assertPortIsOurs,
  bold,
  capture,
  cyan,
  dim,
  fail,
  green,
  info,
  ok,
  requireDocker,
  resolveRepoRoot,
  run,
  satisfiesMinimum,
  startDatabase,
  step,
  warn,
} from './lib.mjs';

// ---------------------------------------------------------------------------

const { root, manifest } = resolveRepoRoot();
const rel = (p) => relative(root, p).split('\\').join('/');

/** Local env files, and the checked-in example each is created from. */
const ENV_FILES = [
  {
    label: 'backend',
    target: join(root, 'apps', 'backend', '.env'),
    example: join(root, 'apps', 'backend', '.env.example'),
    // Replace the placeholder with a real secret when the file is created.
    transform: (contents) => {
      const secret = randomBytes(48).toString('base64url');
      return contents.replace(
        /^JWT_SECRET=.*$/m,
        `JWT_SECRET=${secret}`,
      );
    },
    generatedNote: 'a cryptographically random JWT_SECRET was generated',
  },
  {
    label: 'frontend',
    target: join(root, 'apps', 'frontend', '.env.local'),
    example: join(root, 'apps', 'frontend', '.env.example'),
  },
];

console.log(bold(cyan('\nTrackr - local development setup\n')));
console.log(dim(`repository root: ${root}`));

// --- 1. Node -----------------------------------------------------------------

step('Checking Node.js');

const requiredNode = manifest.engines?.node ?? '^20.19.0 || >=22.12.0';
if (!satisfiesMinimum(process.versions.node, requiredNode)) {
  fail(
    `Node.js ${process.versions.node} is not supported (this repository requires ${requiredNode}).`,
    'Install a supported release from https://nodejs.org/ or via nvm / fnm / volta.',
  );
}
ok(`Node.js ${process.versions.node} (requires ${requiredNode})`);

// --- 2. npm ------------------------------------------------------------------

step('Checking npm');

const npmVersion = capture('npm', ['--version']);
if (npmVersion.failed) {
  fail(
    'npm is not available on your PATH.',
    'npm ships with Node.js - reinstall Node.js from https://nodejs.org/.',
  );
}

const requiredNpm = manifest.engines?.npm ?? '>=10.0.0';
if (!satisfiesMinimum(npmVersion.stdout, requiredNpm)) {
  fail(
    `npm ${npmVersion.stdout} is too old (this repository requires ${requiredNpm}).`,
    'Upgrade with: npm install -g npm@latest',
  );
}
ok(`npm ${npmVersion.stdout} (requires ${requiredNpm})`);

// --- 3. Docker ---------------------------------------------------------------

step('Checking Docker');
requireDocker();

// --- 4. Install --------------------------------------------------------------

step('Installing workspace dependencies');

if (!existsSync(join(root, 'package-lock.json'))) {
  fail(
    'package-lock.json is missing from the repository root.',
    'The committed root lockfile is what makes `npm ci` reproducible.',
    'Regenerate it with: npm install',
  );
}

info('This installs both workspaces from the root lockfile; it may take a minute.');
run('npm', ['ci'], {
  cwd: root,
  hints: [
    'If npm reports the lockfile is out of sync with package.json, run: npm install',
  ],
});
ok('Dependencies installed for @trackr/frontend and @trackr/backend.');

// --- 5. Environment files ----------------------------------------------------

step('Preparing local environment files');

for (const entry of ENV_FILES) {
  if (existsSync(entry.target)) {
    // Never clobber a developer's real credentials.
    ok(`${rel(entry.target)} already exists - left untouched.`);
    continue;
  }

  if (!existsSync(entry.example)) {
    fail(
      `Cannot create ${rel(entry.target)}: ${rel(entry.example)} is missing.`,
      'The checkout looks incomplete.',
    );
  }

  if (entry.transform) {
    const contents = entry.transform(readFileSync(entry.example, 'utf8'));
    writeFileSync(entry.target, contents, { encoding: 'utf8', flag: 'wx' });
    ok(`Created ${rel(entry.target)} (${entry.generatedNote}).`);
  } else {
    copyFileSync(entry.example, entry.target);
    ok(`Created ${rel(entry.target)} from ${rel(entry.example)}.`);
  }
}

// --- 6. Database -------------------------------------------------------------

step('Starting PostgreSQL');
const pgPort = await assertPortIsOurs(root);
info(`Host port ${pgPort} -> container port 5432.`);
startDatabase(root);

// --- 7. Prisma ---------------------------------------------------------------

step('Generating the Prisma client');
run('npm', ['run', 'db:generate', '--workspace', '@trackr/backend'], { cwd: root });

step('Applying database migrations');
run('npm', ['run', 'db:migrate', '--workspace', '@trackr/backend'], {
  cwd: root,
  hints: [
    'Migrations are applied with `prisma migrate deploy`, which never resets data.',
    'Check DATABASE_URL in apps/backend/.env if the connection was refused.',
    `An authentication error usually means another PostgreSQL already owns port ${pgPort} -`,
    'see the "Port 5432 already in use" section of the README.',
  ],
});

step('Seeding development data');
info('The seed is idempotent - re-running it updates rather than duplicates.');
run('npm', ['run', 'db:seed', '--workspace', '@trackr/backend'], { cwd: root });

// --- 8. Build ----------------------------------------------------------------

step('Building both applications (integration check)');
run('npm', ['run', 'build'], { cwd: root });
ok('Frontend and backend both compile.');

// --- Summary -----------------------------------------------------------------

const line = (label, value) => `  ${label.padEnd(18)}${value}`;

console.log(`\n${green(bold('Setup complete.'))}\n`);
console.log(bold('Services'));
console.log(line('Frontend', 'http://localhost:3000'));
console.log(line('API', 'http://localhost:3001/api'));
console.log(line('Health', 'http://localhost:3001/api/health'));
console.log(line('API docs', 'http://localhost:3001/docs'));
console.log(line('PostgreSQL', `localhost:${pgPort} (user/db: trackr)`));
console.log(`\n${bold('Seeded login')}`);
console.log(line('Email', 'seed@trackr.dev'));
console.log(line('Password', 'password123'));
console.log(`\n${bold('Next step')}`);
console.log(`  ${cyan('npm run dev')}\n`);

if (!existsSync(join(root, 'apps', 'backend', '.env'))) {
  warn('apps/backend/.env is still missing - `npm run dev` will fail.');
}
