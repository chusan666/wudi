# Frontend Detail Pages Architecture

## Overview

This frontend application provides detailed pages for exploring social media content parsed by the backend API. It's built with Next.js 14, TypeScript, and Tailwind CSS, featuring modern React patterns with TanStack Query for data management.

## Architecture

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Testing**: Jest with React Testing Library

### Project Structure
```
frontend/
├── app/                    # Next.js app router pages
│   ├── [id]/              # Dynamic routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   ├── parse/            # Parse page
│   ├── notes/            # Note detail pages
│   ├── users/            # User detail pages
│   └── providers.tsx     # React Query provider
├── components/           # Reusable components
│   ├── ui/              # shadcn/ui components
│   ├── charts/          # Chart components
│   └── user/            # User-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and API client
└── __tests__/           # Test files
```

## Data Flow

### API Integration
1. **API Client** (`lib/api.ts`): Axios-based client with type definitions
2. **Custom Hooks** (`hooks/useApi.ts`): TanStack Query wrappers for API calls
3. **Components**: Consume data through hooks with automatic caching and refetching

### Caching Strategy
- **Stale Time**: 1 minute for most queries, 30 minutes for platforms data
- **Background Refetching**: Enabled for window focus
- **Retry Logic**: 3 attempts with exponential backoff
- **Health Checks**: Every 30 seconds for API availability

## Pages

### 1. Home Page (`/`)
- Landing page with navigation to main features
- Platform showcase and quick access links
- Responsive design with gradient background

### 2. Note Detail Page (`/notes/[id]`)
**Features:**
- Media gallery (video player or image grid)
- Note metadata (title, description, user info)
- Statistics display (likes, comments, shares)
- Engagement metrics chart
- Technical details tab
- Share functionality

**Data Structure:**
```typescript
interface NoteData {
  note_id: string;
  title: string;
  desc: string;
  type: string;
  user: {
    nickname: string;
    user_id: string;
  };
  video?: {
    duration: number;
    width: number;
    height: number;
    video_url?: string;
  };
  images?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
}
```

### 3. User Detail Page (`/users/[id]`)
**Features:**
- Profile header with avatar and stats
- Paginated notes list
- Analytics charts
- Activity timeline
- Certifications and achievements

**Components:**
- `UserNotesList`: Paginated grid of user's notes
- `UserStatsChart`: Bar chart for user statistics
- Profile information cards

### 4. Parse Page (`/parse`)
- URL input form with platform detection
- Real-time parsing results
- Preview of extracted content
- Navigation to detail pages

## Components

### UI Components (shadcn/ui)
- **Button**: Consistent button styling with variants
- **Card**: Container component with header and content
- **Skeleton**: Loading state placeholders
- **Tabs**: Tabbed content organization
- **Badge**: Status indicators and tags

### Chart Components
- **EngagementChart**: Line chart showing engagement over time
- **UserStatsChart**: Bar chart for user statistics

### Custom Components
- **UserNotesList**: Paginated notes with loading states
- **Providers**: React Query and context providers

## State Management

### TanStack Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Data Fetching Patterns
- **useParseVideo**: Fetches parsed video data
- **usePlatforms**: Gets supported platforms (longer cache)
- **useHealth**: API health monitoring

## Responsive Design

### Breakpoints
- **Mobile**: < 768px - Single column layout
- **Tablet**: 768px - 1024px - Two columns
- **Desktop**: > 1024px - Multi-column layouts

### Adaptations
- Grid layouts adjust column count
- Navigation becomes mobile-friendly
- Charts resize responsively
- Pagination controls adapt to screen size

## Testing Strategy

### Unit Tests
- Component rendering with Jest/React Testing Library
- Mock external dependencies (recharts, API)
- User interaction testing
- Loading and error states

### Test Coverage
- Chart components (mocked chart library)
- User notes list with pagination
- Home page navigation
- API hook functionality

## SEO and Performance

### Meta Tags
- Dynamic Open Graph tags for detail pages
- Structured data for content
- Proper meta descriptions

### Performance Optimizations
- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- TanStack Query caching reduces API calls
- Skeleton loading states improve perceived performance

## Error Handling

### Fallback UI
- Graceful degradation when API unavailable
- Error boundaries for component errors
- Loading states during data fetching
- Empty states for no data scenarios

### User Feedback
- Toast notifications for actions
- Progress indicators for long operations
- Clear error messages with recovery options

## Future Enhancements

### Potential Features
- Real-time updates with WebSockets
- Advanced filtering and search
- User authentication and favorites
- Export functionality
- Dark mode support

### Scalability Considerations
- Server-side rendering for better SEO
- Incremental Static Regeneration (ISR)
- API response caching at edge level
- Component lazy loading

## Development Guidelines

### Code Style
- TypeScript for type safety
- Consistent naming conventions
- Component composition over inheritance
- Custom hooks for shared logic

### Best Practices
- Prop drilling avoidance with context
- Proper error boundaries
- Accessibility considerations
- Performance monitoring

This architecture provides a solid foundation for the social media parser frontend, with room for growth and optimization as the application scales.