import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

describe('Tab Navigation', () => {
  it('renders all tabs correctly', () => {
    const queryClient = createTestQueryClient()
    
    render(
      <QueryClientProvider client={queryClient}>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
            <TabsTrigger value="marketing-index">Marketing Index</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">Profile Content</TabsContent>
          <TabsContent value="pricing">Pricing Content</TabsContent>
          <TabsContent value="audience">Audience Content</TabsContent>
          <TabsContent value="performance">Performance Content</TabsContent>
          <TabsContent value="conversion">Conversion Content</TabsContent>
          <TabsContent value="marketing-index">Marketing Index Content</TabsContent>
        </Tabs>
      </QueryClientProvider>
    )

    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByText('Audience')).toBeInTheDocument()
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('Conversion')).toBeInTheDocument()
    expect(screen.getByText('Marketing Index')).toBeInTheDocument()
  })

  it('switches tabs correctly', () => {
    const queryClient = createTestQueryClient()
    
    render(
      <QueryClientProvider client={queryClient}>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">Profile Content</TabsContent>
          <TabsContent value="pricing">Pricing Content</TabsContent>
        </Tabs>
      </QueryClientProvider>
    )

    // Initially shows profile content
    expect(screen.getByText('Profile Content')).toBeInTheDocument()
    expect(screen.queryByText('Pricing Content')).not.toBeInTheDocument()

    // Click on pricing tab
    fireEvent.click(screen.getByText('Pricing'))
    
    // Shows pricing content
    expect(screen.getByText('Pricing Content')).toBeInTheDocument()
    expect(screen.queryByText('Profile Content')).not.toBeInTheDocument()
  })
})