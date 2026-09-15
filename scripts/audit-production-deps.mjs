#!/usr/bin/env node
/**
 * Gates `npm audit --omit=dev` on the developer checkout.
 *
 * Fails on every high or critical advisory except a small, explicitly named
 * set that is build/deploy tooling npm cannot leave out of a production
 * install: `@prisma/client` declares `prisma` as an OPTIONAL peer dependency,
 * so npm installs the Prisma CLI - and with it @prisma/config -> deepmerge-ts
 * and mysql2 - even under `--omit=dev`. Trackr is PostgreSQL-only and reaches
 * the database through @prisma/adapter-pg, so none of it serves a request.
 *
 * This is NOT a blanket threshold change:
 *   - only the four packages below are tolerated, by name;
 *   - a high/critical in anything else fails the run;
 *   - a NEW advisory in one of the four still fails unless it is also proven
 *     absent from the artifact, because the exception is conditional on
 *     scripts/audit-runtime-artifact.mjs passing in the same pipeline. That
 *     script fails if any of these packages is in the runtime image, so the
 *     exception cannot mask something that actually ships.
 *
 * The authoritative production gate is the runtime artifact audit. This one
 * exists so the developer checkout still fails fast on a real regression.
 *
 * Usage: node scripts/audit-production-deps.mjs
 */

import { execFileSync } from 'node:child_process';

/**
 * Packages that npm installs into a production tree only because `prisma` is
 * an optional peer of @prisma/client, and which the runtime image provably
 * does not contain (see scripts/prune-runtime-deps.mjs and
 * scripts/audit-runtime-artifact.mjs).
 */
const BUILD_ONLY = new Set(['prisma', '@prisma/config', 'deepmerge-ts', 'mysql2']);

const BLOCKING = new Set(['high', 'critical']);

let report;
try {
  // npm audit exits non-zero whenever it finds anything, so the severity
  // breakdown below decides the outcome instead of the exit code.
  report = JSON.parse(
    execFileSync('npm', ['audit', '--omit=dev', '--json'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      shell: process.platform === 'win32',
    }),
  );
} catch (error) {
  const stdout = error.stdout?.toString?.() ?? '';
  try {
    report = JSON.parse(stdout);
  } catch {
    console.error('FAIL: npm audit did not return parseable JSON');
    console.error(stdout || error.message);
    process.exit(1);
  }
}

if (report.error) {
  console.error(`FAIL: npm audit errored: ${report.error.summary ?? report.error.code}`);
  process.exit(1);
}

const counts = report.metadata?.vulnerabilities ?? {};
console.log(
  `audit-production-deps: critical=${counts.critical ?? 0} high=${counts.high ?? 0} ` +
    `moderate=${counts.moderate ?? 0} low=${counts.low ?? 0}`,
);

const blocking = [];
const tolerated = [];

for (const [name, details] of Object.entries(report.vulnerabilities ?? {})) {
  if (!BLOCKING.has(details.severity)) continue;
  (BUILD_ONLY.has(name) ? tolerated : blocking).push(`${name} (${details.severity}) ${details.range}`);
}

if (tolerated.length > 0) {
  console.log(
    'audit-production-deps: tolerated - Prisma CLI tooling npm installs via an ' +
      'optional peer, absent from the runtime image:',
  );
  for (const line of tolerated.sort()) console.log(`  - ${line}`);
}

if (blocking.length > 0) {
  console.error('audit-production-deps: FAIL - high/critical advisories that must be fixed:');
  for (const line of blocking.sort()) console.error(`  - ${line}`);
  process.exit(1);
}

console.log('audit-production-deps: PASS - no unexpected high/critical advisories');
