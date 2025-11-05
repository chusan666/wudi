# syntax=docker/dockerfile:1

FROM oven/bun:1 AS base
WORKDIR /app

# Install Playwright dependencies and create non-root user
FROM base AS playwright-base
# Install system dependencies required by Playwright
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright browsers
RUN bun install -g playwright
RUN playwright install chromium firefox webkit
RUN playwright install-deps

# Create non-root user
RUN groupadd -r bunuser && useradd -r -g bunuser bunuser
USER bunuser
WORKDIR /home/bunuser

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
COPY apps/api/package.json /temp/prod/apps/api/
COPY packages/shared/package.json /temp/prod/packages/shared/
COPY pnpm-workspace.yaml pnpm-lock.yaml /temp/prod/
WORKDIR /temp/prod
RUN corepack enable pnpm && pnpm install --frozen-lockfile --filter api --filter @monorepo/shared --prod

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
RUN bun run build

# Production image with Playwright
FROM playwright-base AS release
# Copy built application
COPY --from=install --chown=bunuser:bunuser /temp/prod/node_modules /home/bunuser/node_modules
COPY --from=build --chown=bunuser:bunuser /app/apps/api/dist /home/bunuser/dist

# Set environment variables
ENV NODE_ENV=production
ENV API_PORT=3001
ENV PLAYWRIGHT_BROWSERS_PATH=/home/bunuser/.ms-playwright

EXPOSE 3001

# Default command for API server
CMD ["bun", "run", "dist/index.js"]
