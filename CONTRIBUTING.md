# Contributing Guide

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Bun >= 1.0.0 (for API development)

### Initial Setup

1. Install dependencies:

```bash
pnpm install
```

2. Build shared packages:

```bash
pnpm --filter @monorepo/shared build
```

3. Set up environment variables:

```bash
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

## Development Workflow

### Running Applications

```bash
# Run all applications
pnpm dev

# Run specific applications
pnpm dev:web    # Frontend only
pnpm dev:api    # Backend only
```

### Building

```bash
# Build all packages and apps
pnpm build

# Build specific packages
pnpm --filter @monorepo/shared build
pnpm --filter web build
pnpm --filter api build
```

### Code Quality

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint:fix

# Formatting
pnpm format:check
pnpm format
```

## Project Structure

```
monorepo/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   └── api/          # Bun + Hono backend
├── packages/
│   └── shared/       # Shared types and utilities
├── .editorconfig
├── .eslintrc.json
├── .prettierrc
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## Working with Packages

### Adding Dependencies

```bash
# Add to root (dev dependencies)
pnpm add -D <package> -w

# Add to specific package
pnpm --filter web add <package>
pnpm --filter api add <package>
pnpm --filter @monorepo/shared add <package>
```

### Creating a New Package

1. Create directory structure:

```bash
mkdir -p packages/new-package/src
```

2. Create `package.json`
3. Create `tsconfig.json`
4. Add to root `tsconfig.json` references
5. Run `pnpm install`

## Code Style

- Use TypeScript for all new code
- Follow the ESLint and Prettier configurations
- Use consistent type imports: `import type { Type } from 'module'`
- Write meaningful commit messages
- Keep functions small and focused
- Add types for all function parameters and return values

## Testing

```bash
# Run all tests
pnpm test

# Run tests in specific package
pnpm --filter web test
```

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Clean all build artifacts:

```bash
pnpm clean
```

2. Reinstall dependencies:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

3. Rebuild everything:

```bash
pnpm build
```

### Type Errors in Shared Package

If apps can't find types from `@monorepo/shared`:

```bash
pnpm --filter @monorepo/shared build
```

### Port Conflicts

Default ports:

- Web: 3000
- API: 3001

Change ports in `.env` files if needed.

## Git Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run quality checks: `pnpm type-check && pnpm lint && pnpm format:check`
4. Commit your changes
5. Push and create a pull request

## Additional Resources

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Next.js Documentation](https://nextjs.org/docs)
- [Bun Documentation](https://bun.sh/docs)
- [Hono Documentation](https://hono.dev/)
