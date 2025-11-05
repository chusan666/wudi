# Development Guide

This guide provides detailed information for developers working on this project.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Navigate to http://localhost:3000
```

## Project Overview

This is a modern full-stack application built with:

- **Next.js 15** with App Router
- **React 19** with Server Components
- **TypeScript** in strict mode
- **TailwindCSS** for styling
- **shadcn/ui** for UI components
- **TanStack Query** for data fetching
- **Zustand** for state management

## Monorepo Structure

```
/
├── apps/
│   └── web/              # Next.js application
│       ├── src/
│       │   ├── app/      # App Router pages
│       │   ├── components/
│       │   ├── lib/
│       │   ├── providers/
│       │   └── store/
│       ├── components.json
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── package.json
├── packages/
│   └── (future shared packages)
├── package.json          # Root package.json
├── pnpm-workspace.yaml   # Workspace configuration
└── README.md
```

## Development Workflow

### Running the App

```bash
# Development mode with hot reload
pnpm web:dev

# Production build
pnpm web:build

# Start production server
pnpm web:start
```

### Code Quality

```bash
# Lint code
pnpm web:lint

# Run tests
pnpm web:test

# Run tests in watch mode
pnpm web:test:watch
```

### Adding Dependencies

```bash
# Add to web app
pnpm --filter web add package-name

# Add dev dependency
pnpm --filter web add -D package-name
```

## Key Features

### Server and Client Components

- **Server Components**: Default for all components in `app/` directory
- **Client Components**: Use `'use client'` directive at the top of the file

```tsx
// Server Component (default)
export default function ServerComponent() {
  // Can fetch data directly
  return <div>Content</div>;
}

// Client Component
'use client';

export default function ClientComponent() {
  // Can use hooks, event handlers, browser APIs
  const [state, setState] = useState();
  return <div>Interactive content</div>;
}
```

### Data Fetching with TanStack Query

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';

export default function DataComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['key'],
    queryFn: async () => {
      const response = await fetch('/api/data');
      return response.json();
    },
  });

  if (isLoading) return <Skeleton />;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

### State Management with Zustand

```tsx
// Define store
import { create } from 'zustand';

interface MyStore {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// Use in component
'use client';

import { useMyStore } from '@/store/my-store';

export default function Counter() {
  const { count, increment } = useMyStore();
  return <button onClick={increment}>Count: {count}</button>;
}
```

### Styling with Tailwind

```tsx
import { cn } from '@/lib/utils';

export function Component({ className }) {
  return (
    <div className={cn(
      'base-classes',
      'hover:bg-accent',
      className
    )}>
      Content
    </div>
  );
}
```

## Adding New Features

### Creating a New Page

1. Create a new directory in `apps/web/src/app/`
2. Add a `page.tsx` file:

```tsx
// apps/web/src/app/my-page/page.tsx
export const metadata = {
  title: 'My Page | Data Platform',
  description: 'Page description',
};

export default function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
    </div>
  );
}
```

3. Add to navigation in `apps/web/src/components/navigation.tsx`

### Adding shadcn/ui Components

```bash
cd apps/web
npx shadcn@latest add component-name
```

See `SHADCN_COMPONENTS.md` for detailed component documentation.

### Creating Custom Components

1. Create component file in `src/components/`
2. Use TypeScript for props
3. Export as named or default export

```tsx
// src/components/my-component.tsx
interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

### Writing Tests

```tsx
// src/components/__tests__/my-component.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../my-component';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test">Content</MyComponent>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Routing

Next.js 15 uses the App Router with file-based routing:

- `app/page.tsx` → `/`
- `app/about/page.tsx` → `/about`
- `app/blog/[slug]/page.tsx` → `/blog/:slug` (dynamic route)
- `app/api/route.ts` → API route at `/api`

### Navigation

```tsx
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Using Link component
<Link href="/about">About</Link>

// Programmatic navigation
function Component() {
  const router = useRouter();
  
  const navigate = () => {
    router.push('/about');
  };
}
```

## Styling Guidelines

### Tailwind Classes

- Use utility classes directly in components
- Leverage Tailwind's responsive utilities: `md:`, `lg:`, etc.
- Use dark mode utilities: `dark:bg-gray-800`
- Prefer composition over custom CSS

### CSS Variables

Theme colors are defined as CSS variables in `globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
}

.dark {
  --primary: 217.2 91.2% 59.8%;
}
```

Use in Tailwind: `bg-primary`, `text-primary`, etc.

## Environment Variables

Create `.env.local` in `apps/web/`:

```env
# Public variables (exposed to browser)
NEXT_PUBLIC_API_URL=https://api.example.com

# Private variables (server-side only)
DATABASE_URL=postgresql://...
API_SECRET_KEY=...
```

Access in code:
```tsx
// Client-side
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Server-side only
const dbUrl = process.env.DATABASE_URL;
```

## TypeScript

### Strict Mode

The project uses strict TypeScript. Common patterns:

```tsx
// Props with children
interface Props {
  children: React.ReactNode;
}

// Event handlers
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // ...
};

// Refs
const inputRef = useRef<HTMLInputElement>(null);

// Generic components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}
```

## Performance

### Code Splitting

- Use dynamic imports for heavy components
- Server Components are automatically code-split

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
});
```

### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/image.png"
  alt="Description"
  width={500}
  height={300}
  priority // For above-the-fold images
/>
```

## Debugging

### Development Tools

- React DevTools browser extension
- TanStack Query DevTools (add to your app)
- Zustand DevTools (via Redux DevTools extension)

### Common Issues

**Build errors**: Check TypeScript and ESLint errors
```bash
pnpm web:lint
```

**Style issues**: Ensure Tailwind is configured correctly
- Check `tailwind.config.ts`
- Verify `globals.css` is imported

**State not updating**: 
- Check if component needs `'use client'`
- Verify state mutation patterns (Zustand uses immutable updates)

## Deployment

The app can be deployed to:

- **Vercel** (recommended for Next.js)
- **Other platforms** supporting Node.js

### Build

```bash
pnpm web:build
```

This creates an optimized production build in `apps/web/.next/`.

### Environment

Set environment variables in your deployment platform:
- Add `NEXT_PUBLIC_*` variables for client-side use
- Add other variables for server-side use

## Best Practices

1. **Use Server Components** when possible for better performance
2. **Leverage TanStack Query** for data fetching and caching
3. **Keep state minimal** - derive values when possible
4. **Type everything** - avoid `any` types
5. **Test components** - write tests for complex logic
6. **Follow conventions** - match existing patterns
7. **Document complex code** - add comments for non-obvious logic
8. **Keep components small** - split into smaller components when needed

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## Getting Help

- Check the README.md for general information
- See SHADCN_COMPONENTS.md for UI component details
- Review existing code for patterns and examples
- Check the official documentation for each technology
