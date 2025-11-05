# Monorepo Project

A modern monorepo setup with Next.js 15 frontend and Bun + Hono backend, managed by pnpm workspaces.

## 📋 Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Adding New Packages](#adding-new-packages)
- [Docker Support](#docker-support)

## 🏗️ Architecture

This monorepo follows a clean architecture pattern with:

- **apps/**: Application packages (Next.js web app, Bun API server)
- **packages/**: Shared packages (types, utilities, configurations)

TypeScript project references are configured for optimal type checking and build performance across the workspace.

## 🚀 Tech Stack

### Frontend (apps/web)

- **Next.js 15**: React framework with App Router
- **React 18**: UI library
- **TypeScript 5**: Type safety

### Backend (apps/api)

- **Bun**: Fast JavaScript runtime
- **Hono**: Lightweight web framework
- **TypeScript 5**: Type safety

### Shared (packages/shared)

- Shared TypeScript types and interfaces
- Common utilities and helpers
- Shared configuration

### Development Tools

- **pnpm**: Fast, disk space efficient package manager
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript Project References**: Incremental builds

## 📁 Project Structure

```
.
├── apps/
│   ├── web/                 # Next.js 15 frontend
│   │   ├── src/
│   │   │   └── app/        # App Router pages
│   │   ├── next.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── api/                 # Bun + Hono backend
│       ├── src/
│       │   └── index.ts    # API entry point
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/              # Shared types and utilities
│       ├── src/
│       │   ├── types.ts
│       │   ├── utils.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── .editorconfig
├── .eslintrc.json
├── .gitattributes
├── .gitignore
├── .npmrc
├── .prettierrc
├── .prettierignore
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── README.md
```

## 🎯 Getting Started

### Prerequisites

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Bun**: >= 1.0.0 (for running the API)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

4. Build shared packages:

```bash
pnpm --filter @monorepo/shared build
```

## 💻 Development

### Run all apps in development mode:

```bash
pnpm dev
```

### Run specific apps:

**Frontend only:**

```bash
pnpm dev:web
```

**Backend only:**

```bash
pnpm dev:api
```

### Access the applications:

- **Web**: http://localhost:3000
- **API**: http://localhost:3001

## 🔐 Environment Variables

### Root Level (.env)

Database, Redis, and global configuration variables. See `.env.example` for all available options:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

### Web App (apps/web/.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### API (apps/api/.env)

```env
API_PORT=3001
API_HOST=localhost
NODE_ENV=development
```

## 📝 Scripts

### Root-level scripts (run from repository root):

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `pnpm install`      | Install all dependencies         |
| `pnpm dev`          | Run all apps in development mode |
| `pnpm dev:web`      | Run only the web app             |
| `pnpm dev:api`      | Run only the API                 |
| `pnpm build`        | Build all apps and packages      |
| `pnpm build:web`    | Build only the web app           |
| `pnpm build:api`    | Build only the API               |
| `pnpm lint`         | Lint all packages                |
| `pnpm lint:fix`     | Fix linting issues               |
| `pnpm format`       | Format code with Prettier        |
| `pnpm format:check` | Check code formatting            |
| `pnpm type-check`   | Type check all packages          |
| `pnpm test`         | Run tests in all packages        |
| `pnpm clean`        | Clean all build artifacts        |

### Package-specific scripts:

```bash
# Run commands in specific packages
pnpm --filter web <command>
pnpm --filter api <command>
pnpm --filter @monorepo/shared <command>
```

## ➕ Adding New Packages

### 1. Create a new package:

```bash
mkdir -p packages/new-package/src
cd packages/new-package
```

### 2. Create package.json:

```json
{
  "name": "@monorepo/new-package",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc --build",
    "dev": "tsc --build --watch",
    "clean": "rm -rf dist *.tsbuildinfo"
  }
}
```

### 3. Create tsconfig.json:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### 4. Add to root tsconfig.json references:

```json
{
  "references": [{ "path": "./packages/new-package" }]
}
```

### 5. Install dependencies:

```bash
pnpm install
```

## 🐳 Docker Support

Docker configuration can be added for containerized deployments. Each app can have its own Dockerfile:

### Example Dockerfile for API:

```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

FROM base as install
COPY package.json pnpm-lock.yaml ./
RUN bun install --frozen-lockfile

FROM base as build
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base as release
COPY --from=build /app/dist ./dist
EXPOSE 3001
CMD ["bun", "run", "dist/index.js"]
```

### Example Dockerfile for Web:

```dockerfile
FROM node:20-alpine as base

FROM base as deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base as builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm run build

FROM base as runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

## 🔧 Troubleshooting

### pnpm install fails

- Ensure you have pnpm >= 8.0.0: `pnpm --version`
- Clear pnpm cache: `pnpm store prune`
- Delete node_modules and reinstall: `pnpm clean && pnpm install`

### TypeScript errors in shared package

- Build the shared package first: `pnpm --filter @monorepo/shared build`
- Check TypeScript version consistency across packages

### Bun not found

- Install Bun: `curl -fsSL https://bun.sh/install | bash`
- Restart your terminal after installation

## 📚 Additional Resources

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Next.js Documentation](https://nextjs.org/docs)
- [Bun Documentation](https://bun.sh/docs)
- [Hono Documentation](https://hono.dev/)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

## 📄 License

This project is private and proprietary.
