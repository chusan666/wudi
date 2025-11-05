# shadcn/ui Components Guide

This document provides guidance on using and extending the shadcn/ui component library in this project.

## Overview

shadcn/ui is a collection of re-usable components built using Radix UI and Tailwind CSS. Unlike traditional component libraries, shadcn/ui components are copied into your project, giving you full control over the code.

## Configuration

The shadcn/ui configuration is stored in `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

## Installed Components

### Button

A versatile button component with multiple variants and sizes.

**Location**: `src/components/ui/button.tsx`

**Usage**:
```tsx
import { Button } from '@/components/ui/button';

// Default
<Button>Click me</Button>

// Variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Input

A styled input component for forms.

**Location**: `src/components/ui/input.tsx`

**Usage**:
```tsx
import { Input } from '@/components/ui/input';

<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="Email" />
<Input disabled placeholder="Disabled" />
```

### Card

A container component for displaying content with header, content, and footer sections.

**Location**: `src/components/ui/card.tsx`

**Usage**:
```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Table

A data table component with semantic HTML structure.

**Location**: `src/components/ui/table.tsx`

**Usage**:
```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table';

<Table>
  <TableCaption>A list of your items</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Item 1</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Skeleton

A loading placeholder component.

**Location**: `src/components/ui/skeleton.tsx`

**Usage**:
```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Loading state for text
<Skeleton className="h-4 w-[250px]" />

// Loading state for avatar
<Skeleton className="h-12 w-12 rounded-full" />

// Loading state for card
<div className="space-y-2">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
</div>
```

### Dialog

A modal dialog component.

**Location**: `src/components/ui/dialog.tsx`

**Usage**:
```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description goes here
      </DialogDescription>
    </DialogHeader>
    <div>Dialog content</div>
    <DialogFooter>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Adding New Components

To add additional components from the shadcn/ui library:

1. **Navigate to the web directory**:
   ```bash
   cd apps/web
   ```

2. **Add a component** (examples):
   ```bash
   # Add dropdown menu
   npx shadcn@latest add dropdown-menu
   
   # Add select
   npx shadcn@latest add select
   
   # Add form components
   npx shadcn@latest add form
   
   # Add toast notifications
   npx shadcn@latest add toast
   
   # Add data table
   npx shadcn@latest add data-table
   ```

3. The component will be automatically added to `src/components/ui/`

4. Import and use in your components:
   ```tsx
   import { NewComponent } from '@/components/ui/new-component';
   ```

## Available Components to Add

Here are some popular components you might want to add:

- **accordion** - Collapsible content sections
- **alert** - Alert messages
- **alert-dialog** - Modal alert dialogs
- **avatar** - User avatar component
- **badge** - Small status indicators
- **calendar** - Date picker calendar
- **checkbox** - Checkbox input
- **collapsible** - Collapsible content
- **command** - Command palette
- **context-menu** - Right-click context menus
- **dropdown-menu** - Dropdown menus
- **form** - Form components with validation
- **hover-card** - Hover tooltips
- **label** - Form labels
- **popover** - Popover component
- **progress** - Progress bars
- **radio-group** - Radio button groups
- **scroll-area** - Scrollable areas
- **select** - Select dropdowns
- **separator** - Visual separators
- **sheet** - Side sheet/drawer
- **switch** - Toggle switch
- **tabs** - Tab navigation
- **textarea** - Multi-line text input
- **toast** - Toast notifications
- **toggle** - Toggle button
- **tooltip** - Tooltips

## Customizing Components

Since components are copied into your project, you have full control to customize them:

1. **Edit the component file directly** in `src/components/ui/`
2. **Modify Tailwind classes** to change styling
3. **Add new variants** using `class-variance-authority`
4. **Extend props** to add new functionality

Example - Adding a new button variant:

```tsx
// src/components/ui/button.tsx
const buttonVariants = cva(
  // ... base classes
  {
    variants: {
      variant: {
        default: '...',
        destructive: '...',
        // Add your custom variant
        success: 'bg-green-500 text-white hover:bg-green-600',
      },
      // ...
    },
  }
);
```

Usage:
```tsx
<Button variant="success">Success Action</Button>
```

## Utility Functions

### `cn()` - Conditional Class Names

The `cn()` utility function is used throughout the components to merge Tailwind classes conditionally.

**Location**: `src/lib/utils.ts`

**Usage**:
```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  condition && 'conditional-class',
  anotherCondition ? 'true-class' : 'false-class',
  className // Allow prop override
)} />
```

## Theming

All components use CSS variables for theming, defined in `src/app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  /* ... more variables */
}
```

To customize the theme:

1. Edit the CSS variables in `globals.css`
2. Use the [shadcn/ui theme generator](https://ui.shadcn.com/themes) for color palettes
3. All components will automatically use the new theme

## Dark Mode

Dark mode is implemented using Tailwind's class-based approach:

- The `ThemeProvider` (in `src/providers/theme-provider.tsx`) manages the theme state
- Theme preference is stored in Zustand (`useUIStore`)
- Toggle theme using the theme switcher in the navigation

## Best Practices

1. **Use semantic components**: Choose the right component for the use case
2. **Leverage variants**: Use component variants instead of custom styling when possible
3. **Compose components**: Build complex UIs by composing smaller components
4. **Maintain accessibility**: Keep ARIA attributes and semantic HTML structure
5. **Test components**: Write tests for custom component behavior
6. **Document changes**: Document any modifications to standard components

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Class Variance Authority](https://cva.style/docs)

## Examples in the Project

Check out these pages for component usage examples:

- **Home page** (`src/app/page.tsx`): Card components
- **Search page** (`src/app/search/page.tsx`): Input and Button
- **Notes page** (`src/app/notes/page.tsx`): Table and Skeleton
- **Comments page** (`src/app/comments/page.tsx`): Input with state management

## Troubleshooting

### Component not found

Make sure the component is installed:
```bash
npx shadcn@latest add component-name
```

### Styles not applying

1. Check that Tailwind is configured correctly in `tailwind.config.ts`
2. Ensure `globals.css` is imported in the root layout
3. Verify CSS variables are defined in `globals.css`

### Type errors

Components use TypeScript. If you encounter type errors:
1. Check the component props match the expected types
2. Use `React.ComponentProps<typeof Component>` to extract prop types
3. Ensure your TypeScript version is up to date

### Conflicts with existing styles

The `cn()` utility merges classes intelligently, but complex conflicts may require:
1. Using `!important` (sparingly)
2. Reordering classes
3. Using more specific Tailwind utilities
