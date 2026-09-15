# syntax=docker/dockerfile:1.7
#
# Production image for the Trackr API.
#
# Build from the REPOSITORY ROOT, not from this directory - the single
# authoritative package-lock.json lives there and npm workspaces needs it:
#
#   docker build -f apps/backend/Dockerfile -t trackr-api:local .
#
# The point of the split below is that the Prisma CLI is build/deploy
# tooling, not a runtime library. @prisma/client declares `prisma` as an
# OPTIONAL peer dependency, so npm installs it even under `--omit=dev`,
# dragging @prisma/config -> deepmerge-ts and mysql2 into any naive
# production install. Trackr talks to PostgreSQL through @prisma/adapter-pg,
# so mysql2 is never used to serve a request. The runtime stage therefore
# prunes that tooling and then PROVES it is gone, failing the build if it
# is not.

ARG NODE_VERSION=22.23.2

# ---------------------------------------------------------------------------
# Stage 1: builder - full dependency tree, Prisma client generation, tsc build
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS builder
WORKDIR /app

ENV NODE_ENV=development \
    npm_config_update_notifier=false \
    npm_config_fund=false

# Manifests first so dependency layers cache independently of source edits.
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/

# --ignore-scripts: the backend's postinstall runs `prisma generate`, which
# needs the schema that has not been copied yet. Generation is an explicit
# step below instead.
RUN npm ci --ignore-scripts

COPY apps/backend/ apps/backend/

RUN npm run db:generate --workspace @trackr/backend \
 && npm run build --workspace @trackr/backend

# ---------------------------------------------------------------------------
# Stage 2: migrator - explicit deployment target, NOT part of the runtime image
# ---------------------------------------------------------------------------
# Migrations are never applied while building an image. Run this stage as a
# deployment job against the database you have chosen:
#
#   docker build -f apps/backend/Dockerfile --target migrator -t trackr-migrate:local .
#   docker run --rm -e DATABASE_URL="postgresql://..." trackr-migrate:local
#
FROM builder AS migrator
WORKDIR /app/apps/backend
USER node
CMD ["npx", "prisma", "migrate", "deploy"]

# ---------------------------------------------------------------------------
# Stage 3: prod-deps - production dependencies only, minus the Prisma CLI
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS prod-deps
WORKDIR /app

ENV NODE_ENV=production \
    npm_config_update_notifier=false \
    npm_config_fund=false

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
COPY scripts/prune-runtime-deps.mjs scripts/

RUN npm ci --omit=dev --ignore-scripts \
      --workspace @trackr/backend --include-workspace-root

# `--omit=dev` alone still ships the Prisma CLI, because `prisma` is an
# OPTIONAL peer of @prisma/client - and with it @prisma/config -> deepmerge-ts,
# mysql2, and the Studio tree (React, Radix, visx, esbuild, Babel). Deleting
# `prisma` by name would leave all of that behind, orphaned but still shipped,
# so this reduces node_modules to the backend's real runtime closure instead:
# dependencies + optionalDependencies + required peers, resolved from the
# committed lockfile. No version is re-resolved.
RUN node scripts/prune-runtime-deps.mjs --workspace apps/backend \
 && rm -rf scripts

# Fail the build if any of it survived, or if the runtime client did not.
RUN set -eu; \
    for pkg in prisma @prisma/config deepmerge-ts mysql2 \
               typescript react react-dom @babel @jest @angular-devkit \
               @prisma/engines @prisma/studio-core; do \
      if [ -e "node_modules/$pkg" ]; then \
        echo "FATAL: $pkg must not be present in the runtime dependency tree" >&2; \
        exit 1; \
      fi; \
    done; \
    for pkg in @prisma/client @prisma/adapter-pg pg; do \
      if [ ! -e "node_modules/$pkg" ]; then \
        echo "FATAL: runtime dependency $pkg is missing" >&2; \
        exit 1; \
      fi; \
    done; \
    echo "prod-deps: Prisma CLI tooling absent, runtime client present"

# ---------------------------------------------------------------------------
# Stage 4: runtime - compiled app + production dependencies only
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS runtime
WORKDIR /app

# A container has its own network namespace; a loopback-only bind would make
# the API unreachable even from the host. What is actually exposed is decided
# by how the port is published, not by this value.
ENV NODE_ENV=production \
    PORT=3001 \
    HOST=0.0.0.0

COPY --from=prod-deps /app/node_modules ./node_modules
# The generated Prisma client, produced by `prisma generate` in the builder.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY package.json ./

# node:*-bookworm-slim ships an unprivileged `node` user (uid 1000).
USER node
WORKDIR /app/apps/backend

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/src/main.js"]
