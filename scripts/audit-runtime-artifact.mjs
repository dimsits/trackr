#!/usr/bin/env node
/**
 * Audits the ACTUAL production runtime image, not the developer checkout.
 *
 * The developer checkout's `npm audit --omit=dev` reports the Prisma CLI chain
 * (prisma -> @prisma/config -> deepmerge-ts, and mysql2) because `prisma` is an
 * optional peer of @prisma/client and npm installs it regardless. None of it is
 * in the deployed image. This reads the package list out of the built image and
 * audits exactly that set, so the number that gates a release describes the
 * artifact that actually runs.
 *
 * It fails on:
 *   - any high or critical advisory in the image's node_modules
 *   - the presence of any build/deploy-only package that must never ship
 *
 * Usage:
 *   node scripts/audit-runtime-artifact.mjs [image-tag]
 * Default tag: trackr-api:ci
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const image = process.argv[2] ?? 'trackr-api:ci';

/** Packages that are build or deploy tooling and must not be in the image. */
const FORBIDDEN = [
  'prisma',
  '@prisma/config',
  'deepmerge-ts',
  'mysql2',
  '@prisma/engines',
  '@prisma/studio-core',
  'typescript',
  'react',
  'react-dom',
  '@babel',
  '@jest',
  '@angular-devkit',
];

/** Packages the API cannot serve a request without. */
const REQUIRED = ['@prisma/client', '@prisma/adapter-pg', 'pg', '@nestjs/core'];

// Read every installed package out of the image, keyed by its node_modules path.
const READ_PACKAGES = `
const {readdirSync,readFileSync,existsSync}=require("fs");
const out={};
function walk(dir,prefix){
  if(!existsSync(dir))return;
  for(const e of readdirSync(dir,{withFileTypes:true})){
    if(!e.isDirectory()||e.name===".bin")continue;
    if(e.name.startsWith("@")){walk(dir+"/"+e.name,prefix+e.name+"/");continue;}
    const p=dir+"/"+e.name+"/package.json";
    if(existsSync(p)){try{const j=JSON.parse(readFileSync(p,"utf8"));if(j.name&&j.version)out[prefix+e.name]=j.version;}catch{}}
    walk(dir+"/"+e.name+"/node_modules",prefix+e.name+"/node_modules/");
  }
}
walk("/app/node_modules","");
console.log(JSON.stringify(out));
`;

console.log(`audit-runtime-artifact: inspecting ${image}`);

let installed;
try {
  const raw = execFileSync(
    'docker',
    ['run', '--rm', '--entrypoint', 'node', image, '-e', READ_PACKAGES],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
  installed = JSON.parse(raw);
} catch (error) {
  console.error(`FAIL: could not read ${image}. Build it first.`);
  console.error(error.stderr?.toString?.() ?? error.message);
  process.exit(1);
}

const paths = Object.keys(installed);
console.log(`audit-runtime-artifact: ${paths.length} packages in the image`);

// --- 1. Build/deploy tooling must not ship ---------------------------------
const leaked = FORBIDDEN.filter((name) =>
  paths.some((p) => p === name || p.endsWith(`/node_modules/${name}`) || p.startsWith(`${name}/`)),
);
const missing = REQUIRED.filter(
  (name) => !paths.some((p) => p === name || p.endsWith(`/node_modules/${name}`)),
);

for (const name of leaked) console.error(`FAIL: ${name} must not be present in the runtime image`);
for (const name of missing) console.error(`FAIL: required runtime package ${name} is missing`);

// --- 2. Audit exactly the package set the image ships ----------------------
const dependencies = {};
const packages = {};
for (const [path, version] of Object.entries(installed)) {
  const name = path.split('/node_modules/').pop();
  const tarball = name.split('/').pop();
  packages[`node_modules/${path}`] = {
    version,
    resolved: `https://registry.npmjs.org/${name}/-/${tarball}-${version}.tgz`,
  };
  if (!path.includes('/node_modules/')) dependencies[path] = version;
}
packages[''] = { name: 'trackr-runtime-artifact', version: '1.0.0', dependencies };

const dir = mkdtempSync(join(tmpdir(), 'trackr-artifact-audit-'));
writeFileSync(
  join(dir, 'package.json'),
  JSON.stringify({ name: 'trackr-runtime-artifact', version: '1.0.0', dependencies }, null, 1),
);
writeFileSync(
  join(dir, 'package-lock.json'),
  JSON.stringify(
    { name: 'trackr-runtime-artifact', version: '1.0.0', lockfileVersion: 3, requires: true, packages },
    null,
    1,
  ),
);

let report;
try {
  // npm audit exits non-zero when it finds anything; the JSON is still valid,
  // so the severity counts below decide the outcome rather than the exit code.
  report = JSON.parse(
    execFileSync('npm', ['audit', '--json', '--audit-level=low'], {
      cwd: dir,
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
const high = (counts.high ?? 0) + (counts.critical ?? 0);

console.log(
  `audit-runtime-artifact: critical=${counts.critical ?? 0} high=${counts.high ?? 0} ` +
    `moderate=${counts.moderate ?? 0} low=${counts.low ?? 0}`,
);

for (const [name, details] of Object.entries(report.vulnerabilities ?? {})) {
  console.log(`  ${name} | ${details.severity} | ${details.range}`);
}

if (high > 0) console.error(`FAIL: ${high} high/critical advisories in the runtime image`);

if (leaked.length > 0 || missing.length > 0 || high > 0) process.exit(1);

console.log('audit-runtime-artifact: PASS - no high/critical advisories, no build tooling shipped');
