#!/usr/bin/env node
//
// Runs automatically before `npm run dev` (and `npm run dev:backend`).
//
// Keeps the day-to-day loop short: make sure PostgreSQL is up and healthy and
// that committed migrations are applied. It deliberately does NOT seed - that
// belongs to `npm run setup` / `npm run db:seed`.

import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';

import {
  assertPortIsOurs,
  bold,
  cyan,
  dim,
  fail,
  ok,
  requireDocker,
  resolveRepoRoot,
  run,
  startDatabase,
} from './lib.mjs';

const { root } = resolveRepoRoot();
const rel = (p) => relative(root, p).split('\\').join('/');

console.log(dim('\nPreparing local services...'));

// --- Dependencies ------------------------------------------------------------

if (!existsSync(join(root, 'node_modules'))) {
  fail(
    'Dependencies are not installed.',
    `Run ${bold('npm run setup')} first.`,
  );
}

// --- Environment files -------------------------------------------------------

const backendEnv = join(root, 'apps', 'backend', '.env');
if (!existsSync(backendEnv)) {
  fail(
    `${rel(backendEnv)} is missing.`,
    `Run ${bold('npm run setup')} to create it, or copy apps/backend/.env.example manually.`,
  );
}
ok(`${rel(backendEnv)} present.`);

const frontendEnv = join(root, 'apps', 'frontend', '.env.local');
if (!existsSync(frontendEnv)) {
  // Not fatal: lib/config.ts falls back to the local default.
  console.log(
    dim(`    -- ${rel(frontendEnv)} missing; using the built-in default API URL.`),
  );
}

// --- Database ----------------------------------------------------------------

requireDocker();
const pgPort = await assertPortIsOurs(root);
startDatabase(root);

run('npm', ['run', 'db:migrate', '--workspace', '@trackr/backend'], {
  cwd: root,
  hints: [
    'Check DATABASE_URL in apps/backend/.env, then retry.',
    `An authentication error usually means another PostgreSQL already owns port ${pgPort}.`,
    'Container logs: npm run db:logs',
  ],
});

console.log(`\n${cyan('Services ready.')} ${dim('Starting applications...')}\n`);
