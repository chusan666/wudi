# Social Media Parser Frontend

A modern web application for parsing and exploring social media content from multiple platforms including 小红书, 抖音, B站, and 快手.

## Features

- **Content Parsing**: Extract detailed information from social media URLs
- **Note Details**: View comprehensive note information with media galleries
- **User Profiles**: Explore user profiles with statistics and content history
- **Interactive Charts**: Visualize engagement metrics and analytics
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Data**: Powered by TanStack Query with intelligent caching

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Running backend API (see ../README.md)

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
frontend/
├── app/                    # Next.js app router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   ├── parse/            # URL parsing interface
│   ├── notes/[id]/       # Note detail pages
│   ├── users/[id]/       # User profile pages
│   └── providers.tsx     # React Query provider
├── components/            # Reusable components
│   ├── ui/              # shadcn/ui components
│   ├── charts/          # Data visualization
│   └── user/            # User-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and API client
└── __tests__/           # Test files
```

## Key Pages

### Home Page (`/`)
- Overview of the application
- Quick navigation to main features
- Platform showcase

### Parse Page (`/parse`)
- Input field for social media URLs
- Real-time parsing results
- Preview of extracted content

### Note Details (`/notes/[id]`)
- Media galleries (video/images)
- Content metadata
- Engagement statistics
- Interactive charts

### User Profiles (`/users/[id]`)
- Profile information and statistics
- Paginated content list
- Analytics dashboard
- Activity timeline

## Data Flow

The application uses a structured data flow:

1. **API Layer** (`lib/api.ts`) - HTTP client with TypeScript types
2. **Hooks Layer** (`hooks/useApi.ts`) - TanStack Query wrappers
3. **Component Layer** - React components consuming data

### Caching Strategy

- **Note Data**: 1 minute stale time
- **User Data**: 5 minute stale time  
- **Platform Info**: 30 minute stale time
- **Health Checks**: 30 second intervals

## Testing

Run the test suite:

```bash
npm test
```

Tests cover:
- Component rendering
- User interactions
- Data fetching hooks
- Error boundaries

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Setup for Production

1. Set `NEXT_PUBLIC_API_URL` to your backend API URL
2. Ensure CORS is configured on the backend
3. Configure image domains in `next.config.js` if needed

## Contributing

1. Follow the existing code style and conventions
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## Architecture Documentation

For detailed technical information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## License

This project is licensed under the same license as the main repository.