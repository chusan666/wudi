# Data Platform - Frontend Foundation

A modern Next.js 15 application with React 19, TypeScript, TailwindCSS, shadcn/ui, TanStack Query, and Zustand.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **React**: React 19
- **TypeScript**: Strict mode enabled
- **Styling**: TailwindCSS with dark mode support
- **UI Components**: shadcn/ui
- **Data Fetching**: TanStack Query (React Query)
- **State Management**: Zustand
- **Testing**: Vitest + Testing Library
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js >= 18.17.0
- pnpm >= 8.0.0

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm web:dev
# or
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts

```bash
# Development
pnpm web:dev          # Start Next.js dev server
pnpm dev              # Alias for web:dev

# Build
pnpm web:build        # Build for production
pnpm build            # Alias for web:build

# Production
pnpm web:start        # Start production server

# Quality
pnpm web:lint         # Run ESLint
pnpm web:test         # Run tests
pnpm web:test:watch   # Run tests in watch mode
```

## Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles with Tailwind
│   │   ├── search/             # Search page
│   │   ├── notes/              # Notes page (with TanStack Query demo)
│   │   ├── users/              # Users page
│   │   ├── kol-analytics/      # KOL Analytics page
│   │   └── comments/           # Comments page (with Zustand demo)
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── dialog.tsx
│   │   └── navigation.tsx      # Main navigation component
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn, etc.)
│   ├── providers/
│   │   ├── query-provider.tsx  # TanStack Query provider
│   │   └── theme-provider.tsx  # Theme provider
│   ├── store/
│   │   └── ui-store.ts         # Zustand global state
│   └── test/
│       └── setup.ts            # Vitest setup
├── components.json             # shadcn/ui configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
├── vitest.config.ts            # Vitest configuration
└── package.json
```

## Features

### TailwindCSS & Design Tokens

- Pre-configured with design tokens for colors, spacing, and border radius
- Dark mode support using CSS variables
- Responsive design utilities
- Custom animation utilities

### shadcn/ui Components

The following components are included and ready to use:

- **Button**: Multiple variants (default, destructive, outline, secondary, ghost, link) and sizes
- **Input**: Form input with focus states
- **Card**: Container with header, content, footer sections
- **Table**: Data table with header, body, footer
- **Skeleton**: Loading state placeholder
- **Dialog**: Modal dialog component

#### Adding New shadcn/ui Components

To add more components from shadcn/ui:

```bash
# Navigate to the web app directory
cd apps/web

# Add a component (example: dropdown-menu)
npx shadcn@latest add dropdown-menu

# The component will be added to src/components/ui/
```

All components use the path aliases configured in `tsconfig.json`:
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/` → `src/`

### TanStack Query (React Query)

TanStack Query is configured globally with:
- 60-second stale time
- Window focus refetching disabled by default
- SSR/ISR support with hydration

#### Usage Example

See `apps/web/src/app/notes/page.tsx` for a working example:

```tsx
import { useQuery } from '@tanstack/react-query';

function NotesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  // Your component logic
}
```

### Zustand State Management

Global UI state is managed with Zustand. The store includes:

- **Theme**: Light/dark/system theme preference
- **Sidebar**: Open/closed state
- **Filters**: Search and filtering state
- **Selected Entities**: Multi-select state for data grids

#### Usage Example

See `apps/web/src/app/comments/page.tsx` for a working example:

```tsx
import { useUIStore } from '@/store/ui-store';

function MyComponent() {
  const { filters, setFilters, resetFilters } = useUIStore();
  
  // Your component logic
}
```

#### Available Store Actions

```typescript
// Theme
setTheme(theme: 'light' | 'dark' | 'system')

// Sidebar
setSidebarOpen(open: boolean)
toggleSidebar()

// Filters
setFilters(filters: Partial<Filter>)
resetFilters()

// Entity Selection
setSelectedEntities(entities: string[])
toggleEntity(entityId: string)
clearSelectedEntities()
```

### Path Aliases

The following path aliases are configured:

- `@/*` → `src/*` (web app)
- `@shared/*` → `../../packages/shared/src/*` (monorepo shared code)

Example:
```tsx
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/ui-store';
```

### Testing

Component tests are set up with Vitest and Testing Library. See `apps/web/src/components/ui/__tests__/button.test.tsx` for an example.

```bash
# Run tests
pnpm web:test

# Run tests in watch mode
pnpm web:test:watch
```

## Routes

The application includes the following routes:

- `/` - Home page with overview cards
- `/search` - Search functionality
- `/notes` - Notes management (demonstrates TanStack Query)
- `/users` - User management
- `/kol-analytics` - KOL Analytics dashboard
- `/comments` - Comment analysis (demonstrates Zustand state)

## Dark Mode

Dark mode is implemented using Tailwind's class-based approach with CSS variables. Users can toggle between light, dark, and system themes using the theme toggle in the header.

The theme preference is stored in Zustand state and persisted across page navigations.

## Extending the Frontend

### Adding a New Page

1. Create a new directory in `apps/web/src/app/`
2. Add a `page.tsx` file
3. Add the route to the navigation in `apps/web/src/components/navigation.tsx`

### Creating Custom Components

1. Create your component in `apps/web/src/components/`
2. Use the `cn()` utility for conditional class names
3. Follow the existing component patterns for consistency

### Adding Zustand Store Slices

You can extend the UI store or create new stores:

```typescript
// apps/web/src/store/my-store.ts
import { create } from 'zustand';

interface MyState {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

## Edge Runtime Compatibility

The project is configured for edge runtime compatibility where appropriate. To opt a route into edge runtime:

```typescript
export const runtime = 'edge';
```

## TypeScript Configuration

The project uses strict TypeScript settings:
- Strict mode enabled
- No implicit any
- No unused variables (warning level)
- Exhaustive deps for React hooks (warning level)

## Production Build

```bash
# Build for production
pnpm web:build

# The build output will be in apps/web/.next/
# Static files will be optimized and bundled

# Start production server
pnpm web:start
```

## Environment Variables

Create a `.env.local` file in `apps/web/` for environment-specific configuration:

```env
# Example
NEXT_PUBLIC_API_URL=https://api.example.com
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run linting: `pnpm web:lint`
4. Run tests: `pnpm web:test`
5. Build to verify: `pnpm web:build`
6. Submit a pull request

## License

MIT
