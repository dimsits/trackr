#!/usr/bin/env node
/**
 * Reduces an installed node_modules tree to the production runtime closure of
 * a single workspace, and prints what it removed.
 *
 * Why this exists
 * ---------------
 * `npm ci --omit=dev` is not sufficient to keep build tooling out of a runtime
 * image. `@prisma/client` declares `prisma` as an OPTIONAL peer dependency, so
 * npm installs the whole Prisma CLI anyway - and with it @prisma/config ->
 * deepmerge-ts, mysql2, and the Studio UI tree (React, Radix, esbuild, Babel,
 * angular-devkit). Deleting the `prisma` directory alone leaves that entire
 * subtree behind, orphaned but still shipped.
 *
 * So instead of deleting packages by name, this walks the lockfile and keeps
 * only what the workspace can actually reach at runtime:
 *
 *   dependencies + optionalDependencies + REQUIRED peerDependencies
 *
 * Optional peers are deliberately not traversed: that is exactly the edge npm
 * follows to install a CLI into a production tree, and the semantics of
 * `peerDependenciesMeta.optional` are that the dependent works without it.
 *
 * Versions stay exactly as the committed lockfile pinned them - nothing is
 * re-resolved or re-installed.
 *
 * Usage:
 *   node scripts/prune-runtime-deps.mjs --workspace apps/backend [--dry-run]
 */

import { readFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const wsIndex = args.indexOf('--workspace');
const workspace = wsIndex === -1 ? 'apps/backend' : args[wsIndex + 1];

const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
const packages = lock.packages ?? {};

if (!packages[workspace]) {
  console.error(`prune-runtime-deps: "${workspace}" is not a workspace in package-lock.json`);
  process.exit(1);
}

/**
 * Resolves `name` as Node would from `fromPath`: try <fromPath>/node_modules/<name>,
 * then walk up one directory at a time to the lockfile root.
 */
function resolve(fromPath, name) {
  let base = fromPath;
  for (;;) {
    const candidate = base ? posix.join(base, 'node_modules', name) : `node_modules/${name}`;
    if (packages[candidate]) return candidate;
    if (!base) return null;
    const cut = base.lastIndexOf('/node_modules/');
    base = cut === -1 ? '' : base.slice(0, cut);
  }
}

/** Edges that a package can still traverse once it is installed and running. */
function runtimeEdges(entry) {
  const names = new Set([
    ...Object.keys(entry.dependencies ?? {}),
    ...Object.keys(entry.optionalDependencies ?? {}),
  ]);
  const meta = entry.peerDependenciesMeta ?? {};
  for (const peer of Object.keys(entry.peerDependencies ?? {})) {
    if (!meta[peer]?.optional) names.add(peer);
  }
  return names;
}

// The workspace itself is the root of the closure, but only its runtime deps -
// its devDependencies are what we are trying to shed.
const keep = new Set();
const queue = [];

for (const name of runtimeEdges(packages[workspace])) {
  const target = resolve(workspace, name);
  if (target) queue.push(target);
}

while (queue.length > 0) {
  const path = queue.pop();
  if (keep.has(path)) continue;
  keep.add(path);
  const entry = packages[path];
  if (!entry) continue;
  for (const name of runtimeEdges(entry)) {
    const target = resolve(path, name);
    if (target && !keep.has(target)) queue.push(target);
  }
}

/** Every installed top-level package directory, as lockfile-style paths. */
function installedPackageDirs(nodeModulesDir, prefix) {
  if (!existsSync(nodeModulesDir)) return [];
  const found = [];
  for (const entry of readdirSync(nodeModulesDir, { withFileTypes: true })) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    if (entry.name === '.bin' || entry.name.startsWith('.')) continue;
    if (entry.name.startsWith('@')) {
      const scopeDir = join(nodeModulesDir, entry.name);
      for (const scoped of readdirSync(scopeDir, { withFileTypes: true })) {
        if (!scoped.isDirectory() && !scoped.isSymbolicLink()) continue;
        found.push({
          path: `${prefix}${entry.name}/${scoped.name}`,
          dir: join(scopeDir, scoped.name),
        });
      }
    } else {
      found.push({ path: `${prefix}${entry.name}`, dir: join(nodeModulesDir, entry.name) });
    }
  }
  return found;
}

const installed = installedPackageDirs(join(root, 'node_modules'), 'node_modules/');
const removed = [];

for (const pkg of installed) {
  // Workspace symlinks (node_modules/@trackr/*) are the apps themselves.
  if (pkg.path.startsWith('node_modules/@trackr/')) continue;
  if (keep.has(pkg.path)) continue;
  removed.push(pkg.path.replace(/^node_modules\//, ''));
  if (!dryRun) rmSync(pkg.dir, { recursive: true, force: true });
}

// Emptying a scope leaves the scope directory behind (node_modules/@babel with
// nothing in it). Harmless to Node, but it makes "is @babel present?" answer
// yes in an image that ships none of it, so clear them out too.
if (!dryRun) {
  const nodeModules = join(root, 'node_modules');
  for (const entry of readdirSync(nodeModules, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('@')) continue;
    const scopeDir = join(nodeModules, entry.name);
    if (readdirSync(scopeDir).length === 0) rmSync(scopeDir, { recursive: true, force: true });
  }
}

removed.sort();
const verb = dryRun ? 'would remove' : 'removed';
console.log(
  `prune-runtime-deps: kept ${keep.size} runtime packages for ${workspace}, ${verb} ${removed.length}.`,
);
if (removed.length > 0) console.log(`  ${verb}: ${removed.join(', ')}`);
