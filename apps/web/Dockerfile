# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN corepack enable pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile --filter web

# Build shared package
FROM base AS build-shared
RUN corepack enable pnpm
WORKDIR /app
COPY packages/shared ./packages/shared
WORKDIR /app/packages/shared
RUN pnpm install && pnpm run build

# Build Next.js app
FROM base AS builder
RUN corepack enable pnpm
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build-shared /app/packages/shared/dist ./packages/shared/dist
COPY apps/web ./apps/web
WORKDIR /app/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
