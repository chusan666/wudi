# Frontend Search Views Documentation

## Overview

This frontend application provides search functionality for notes and users across multiple social media platforms. It's built with Next.js 14, TypeScript, and modern React patterns.

## Features

### Search Notes (`/search/notes`)
- Search for posts, articles, and content across social media platforms
- Filter by platform (小红书, 抖音, B站, 快手)
- Sort by relevance, date, or popularity
- Filter for verified creators only
- Pagination with infinite scrolling support
- Display note metadata (title, stats, publish date, author info)

### Search Users (`/search/users`)
- Search for creators, influencers, and users across platforms
- Filter by platform and verification status
- Display user statistics (followers, following, posts, likes)
- Quick actions to view user profiles
- Pagination support

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query (React Query)
- **UI Components**: shadcn/ui with Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest with React Testing Library

## Project Structure

```
frontend/
├── app/
│   ├── search/
│   │   ├── layout.tsx          # Shared search layout
│   │   ├── notes/
│   │   │   └── page.tsx        # Notes search page
│   │   └── users/
│   │       └── page.tsx        # Users search page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/
│   ├── providers/
│   │   └── query-provider.tsx  # TanStack Query provider
│   ├── search/
│   │   ├── search-form.tsx     # Search form component
│   │   ├── note-card.tsx       # Note display card
│   │   ├── user-card.tsx       # User display card
│   │   ├── pagination.tsx      # Pagination component
│   │   ├── empty-state.tsx     # Empty state component
│   │   ├── error-state.tsx     # Error handling component
│   │   └── search-results-skeleton.tsx  # Loading skeleton
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── api.ts                  # API client
│   └── utils.ts                # Utility functions
├── store/
│   └── search.ts               # Zustand store
├── types/
│   └── index.ts                # TypeScript types
└── __tests__/                  # Test files
```

## API Integration

The frontend expects the following API endpoints:

### Search Notes
```
GET /api/search/notes?q={query}&page={page}&limit={limit}&platform={platform}&sortBy={sortBy}&verifiedOnly={boolean}
```

Response:
```typescript
{
  data: Note[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### Search Users
```
GET /api/search/users?q={query}&page={page}&limit={limit}&platform={platform}&verifiedOnly={boolean}
```

Response:
```typescript
{
  data: User[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

## State Management

### Zustand Store (`store/search.ts`)
- Persists filters and search state
- Manages separate state for notes and users search
- Handles query changes, filters, and pagination

### TanStack Query
- Caches API responses
- Handles loading and error states
- Automatic refetching on window focus
- Optimistic updates support

## Components

### SearchForm
- Reusable search form with filters
- Platform selection dropdown
- Sort options
- Verified-only toggle
- Keyboard navigation support

### NoteCard
- Displays note information
- Platform badges with colors
- Statistics formatting (1.2K, 3.4M)
- Author verification badges
- External link buttons

### UserCard
- User profile display
- Avatar with fallback
- Statistics display
- Platform indicators
- Verification status

### Pagination
- Smart page range display
- Ellipsis for large page counts
- Loading state handling
- Keyboard navigation

## Accessibility Features

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- Screen reader friendly
- High contrast support

## Performance Optimizations

- Component memoization
- Image lazy loading
- Infinite scrolling ready
- Client-side caching
- Code splitting by route
- Optimistic updates

## Error Handling

- Global error boundaries
- Network error recovery
- Retry mechanisms
- User-friendly error messages
- Fallback UI components

## Testing

### Unit Tests
- Component rendering tests
- User interaction tests
- State management tests
- API integration tests

### Test Coverage
- Form submission
- Pagination controls
- Filter application
- Error scenarios
- Accessibility checks

## Responsive Design

- Mobile-first approach
- Tailwind CSS breakpoints
- Touch-friendly interactions
- Adaptive layouts
- Optimized for all screen sizes

## Development

### Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Testing
```bash
npm run test
npm run test:watch
```

### Linting
```bash
npm run lint
```

## Deployment

The application is configured for deployment on:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Any Node.js hosting platform

Environment variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL (defaults to `/api`)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- Real-time search suggestions
- Advanced filtering options
- Search history
- Export functionality
- Dark mode support
- Internationalization
- Advanced analytics tracking