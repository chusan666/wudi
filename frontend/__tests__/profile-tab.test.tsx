import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfileTab } from '@/components/kol-tabs/profile-tab'

// Mock the hooks
jest.mock('@/hooks/use-kol-data', () => ({
  useKOLProfile: () => ({
    data: {
      id: 'test-kol-1',
      name: 'Test Influencer',
      platform: 'xiaohongshu',
      followers: 1000000,
      verified: true,
      bio: 'Test bio for the influencer'
    },
    isLoading: false,
    error: null
  })
}))

jest.mock('@/store/kol-store', () => ({
  useKOLStore: () => ({
    addToFavorites: jest.fn(),
    removeFromFavorites: jest.fn(),
    isFavorite: jest.fn(() => false)
  })
}))

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

describe('ProfileTab', () => {
  it('renders KOL profile information correctly', () => {
    const queryClient = createTestQueryClient()
    
    render(
      <QueryClientProvider client={queryClient}>
        <ProfileTab kolId="test-kol-1" />
      </QueryClientProvider>
    )

    expect(screen.getByText('Test Influencer')).toBeInTheDocument()
    expect(screen.getByText('xiaohongshu')).toBeInTheDocument()
    expect(screen.getByText('1,000,000')).toBeInTheDocument()
    expect(screen.getByText('Test bio for the influencer')).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    const queryClient = createTestQueryClient()
    
    // Override the mock to return loading state
    jest.doMock('@/hooks/use-kol-data', () => ({
      useKOLProfile: () => ({
        data: null,
        isLoading: true,
        error: null
      })
    }))

    render(
      <QueryClientProvider client={queryClient}>
        <ProfileTab kolId="test-kol-1" />
      </QueryClientProvider>
    )

    expect(screen.getByText('Loading profile...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    const queryClient = createTestQueryClient()
    
    // Override the mock to return error state
    jest.doMock('@/hooks/use-kol-data', () => ({
      useKOLProfile: () => ({
        data: null,
        isLoading: false,
        error: { message: 'Failed to load profile' }
      })
    }))

    render(
      <QueryClientProvider client={queryClient}>
        <ProfileTab kolId="test-kol-1" />
      </QueryClientProvider>
    )

    expect(screen.getByText('Error loading profile: Failed to load profile')).toBeInTheDocument()
  })
})