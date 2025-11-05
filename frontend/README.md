# KOL Analytics Dashboard

A comprehensive influencer analytics platform built with Next.js, TypeScript, and FastAPI. This dashboard provides detailed insights into Key Opinion Leader (KOL) performance, audience demographics, pricing trends, and marketing effectiveness.

## Features

### 🎯 Core Analytics Tabs

1. **Profile Tab**
   - KOL profile information with verification status
   - Follower counts and growth metrics
   - Account details and bio information
   - Trust score calculation

2. **Pricing Tab**
   - Current pricing for different content types (posts, videos, stories, livestreams)
   - Historical pricing trends and analysis
   - Market position and ROI scoring
   - Currency support and price performance metrics

3. **Audience Tab**
   - Demographic breakdown (age, gender, location)
   - Interest analysis and language distribution
   - Geographic heatmaps and audience insights
   - Growth opportunities and market alignment

4. **Performance Tab**
   - Engagement rate analysis with industry benchmarks
   - Reach and impressions tracking
   - Video performance metrics
   - Monthly growth trends and content optimization insights

5. **Conversion Tab**
   - End-to-end conversion funnels
   - Click-through rates and cost analysis
   - Revenue generation and ROAS tracking
   - Conversion optimization recommendations

6. **Marketing Index Tab**
   - Comprehensive scoring system (0-100)
   - Component scores: Reach, Engagement, Conversion, Content Quality, Brand Safety, Trend Alignment
   - Competitive positioning analysis
   - Historical performance tracking

### 🛠 Technical Features

- **Data Fetching**: TanStack Query with intelligent caching and prefetching
- **State Management**: Zustand for global state persistence
- **Visualizations**: Recharts for interactive charts and graphs
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Export Capabilities**: CSV and PDF export functionality
- **Testing**: Jest and React Testing Library setup

## Architecture

### Frontend Structure

```
frontend/
├── app/                    # Next.js app router
│   ├── kol/[id]/          # Dynamic KOL dashboard routes
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── charts/           # Chart components and visualizations
│   └── kol-tabs/         # Individual tab components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── providers/            # React context providers
├── services/             # API service layer
├── store/                # Zustand state management
└── __tests__/           # Test files
```

### Backend Structure

```
backend/
├── main.py               # FastAPI application with KOL endpoints
├── parsers/              # Video parsing modules
├── config.py             # Configuration management
├── utils.py              # Utility functions
└── tests/                # Backend tests
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+ and pip
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kol-dashboard
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development Commands

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

**Backend:**
```bash
python main.py       # Start development server
uvicorn main:app --host 0.0.0.0 --port 8000  # Production server
pytest              # Run tests
pytest -v           # Verbose test output
```

## API Documentation

### KOL Analytics Endpoints

#### Profile Endpoints
- `GET /api/kol/profiles` - Get all KOL profiles
- `GET /api/kol/{kolId}/profile` - Get specific KOL profile

#### Pricing Endpoints
- `GET /api/kol/{kolId}/pricing` - Get KOL pricing information
- `GET /api/kol/{kolId}/pricing/history` - Get pricing history

#### Audience Endpoints
- `GET /api/kol/{kolId}/audience` - Get audience demographics
- `GET /api/kol/{kolId}/audience/timeline` - Get audience timeline data

#### Performance Endpoints
- `GET /api/kol/{kolId}/performance` - Get performance metrics
- `GET /api/kol/{kolId}/performance/timeline` - Get performance timeline

#### Conversion Endpoints
- `GET /api/kol/{kolId}/conversion` - Get conversion metrics
- `GET /api/kol/{kolId}/conversion/funnel` - Get conversion funnel data

#### Marketing Index Endpoints
- `GET /api/kol/{kolId}/marketing-index` - Get marketing index
- `GET /api/kol/{kolId}/marketing-index/history` - Get index history

#### Export Endpoints
- `GET /api/kol/{kolId}/export?format=csv` - Export data as CSV
- `GET /api/kol/{kolId}/export?format=pdf` - Export data as PDF

## Data Models

### KOLProfile
```typescript
interface KOLProfile {
  id: string
  name: string
  platform: string
  avatar?: string
  followers: number
  verified: boolean
  bio?: string
}
```

### KOLPricing
```typescript
interface KOLPricing {
  id: string
  kolId: string
  platform: string
  postPrice: number
  videoPrice: number
  storyPrice: number
  livestreamPrice: number
  currency: string
  lastUpdated: string
}
```

### KOLAudience
```typescript
interface KOLAudience {
  id: string
  kolId: string
  ageGroups: Record<string, number>
  gender: Record<string, number>
  locations: Record<string, number>
  interests: string[]
  languages: string[]
}
```

## State Management

The application uses Zustand for state management with the following store structure:

```typescript
interface KOLStore {
  favorites: string[]           // Favorite KOL IDs
  currentKOL: string | null     // Currently selected KOL
  activeTab: string            // Active dashboard tab
  
  // Actions
  addToFavorites: (kolId: string) => void
  removeFromFavorites: (kolId: string) => void
  setCurrentKOL: (kolId: string | null) => void
  setActiveTab: (tab: string) => void
  isFavorite: (kolId: string) => boolean
}
```

## Caching Strategy

TanStack Query implements intelligent caching with the following configuration:

- **Profile Data**: 10 minutes stale time
- **Pricing Data**: 15 minutes stale time
- **Audience Data**: 20 minutes stale time
- **Performance Data**: 5 minutes stale time
- **Conversion Data**: 15 minutes stale time
- **Marketing Index**: 25 minutes stale time

Prefetching is automatically triggered when navigating to a KOL dashboard to ensure smooth user experience.

## Testing

### Frontend Tests

```bash
npm run test                    # Run all tests
npm run test:watch             # Run tests in watch mode
npm run test -- --coverage     # Run with coverage
```

Test files are located in `__tests__/` directory and cover:
- Component rendering
- Tab navigation
- State management
- API integration

### Backend Tests

```bash
pytest                         # Run all tests
pytest -v                      # Verbose output
pytest --cov=.                 # With coverage
```

## Deployment

### Frontend Deployment

The frontend can be deployed to any platform supporting Next.js:

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Netlify**
   ```bash
   npm run build
   # Upload .next folder to Netlify
   ```

3. **Docker**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   CMD ["npm", "start"]
   ```

### Backend Deployment

1. **Heroku**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

2. **Docker**
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

3. **AWS ECS/GCP Cloud Run**
   - Use the provided Dockerfile
   - Configure environment variables
   - Set up load balancer and auto-scaling

## Environment Variables

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend
```env
DATABASE_URL=postgresql://user:password@localhost/db
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with Next.js rules
- **Prettier**: For code formatting
- **Husky**: Pre-commit hooks for code quality

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [FAQ](docs/FAQ.md)
- Review the [API Documentation](docs/API.md)

## Roadmap

- [ ] Real-time data streaming with WebSockets
- [ ] Advanced filtering and search capabilities
- [ ] Custom dashboard builder
- [ ] Integration with more social platforms
- [ ] AI-powered insights and recommendations
- [ ] Team collaboration features
- [ ] Mobile app development