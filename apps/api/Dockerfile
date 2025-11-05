# syntax=docker/dockerfile:1

FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
COPY apps/api/package.json /temp/prod/apps/api/
COPY packages/shared/package.json /temp/prod/packages/shared/
COPY pnpm-workspace.yaml pnpm-lock.yaml /temp/prod/
WORKDIR /temp/prod
RUN corepack enable pnpm && pnpm install --frozen-lockfile --filter api --prod

# Build shared package
FROM base AS build-shared
COPY packages/shared /app/packages/shared
WORKDIR /app/packages/shared
RUN bun run build

# Build API
FROM base AS build
COPY --from=install /temp/prod/node_modules /app/node_modules
COPY --from=build-shared /app/packages/shared/dist /app/packages/shared/dist
COPY apps/api /app/apps/api
WORKDIR /app/apps/api
RUN bun build src/index.ts --outdir dist --target bun

# Production image
FROM base AS release
COPY --from=install /temp/prod/node_modules /app/node_modules
COPY --from=build /app/apps/api/dist /app/dist

ENV NODE_ENV=production
ENV API_PORT=3001

EXPOSE 3001

CMD ["bun", "run", "dist/index.js"]
