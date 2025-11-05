import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SearchForm } from '@/components/search/search-form'
import { SearchFilters } from '@/types'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

describe('SearchForm', () => {
  let queryClient: QueryClient
  let mockOnQueryChange: jest.Mock
  let mockOnSearch: jest.Mock
  let mockOnFiltersChange: jest.Mock

  beforeEach(() => {
    queryClient = createTestQueryClient()
    mockOnQueryChange = jest.fn()
    mockOnSearch = jest.fn()
    mockOnFiltersChange = jest.fn()
  })

  const renderComponent = (props = {}) => {
    const defaultProps = {
      query: '',
      onQueryChange: mockOnQueryChange,
      onSearch: mockOnSearch,
      filters: {},
      onFiltersChange: mockOnFiltersChange,
      placeholder: 'Search...',
    }

    return render(
      <QueryClientProvider client={queryClient}>
        <SearchForm {...defaultProps} {...props} />
      </QueryClientProvider>
    )
  }

  it('renders search input and buttons', () => {
    renderComponent()
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument()
  })

  it('calls onQueryChange when typing in search input', () => {
    renderComponent()
    
    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test query' } })
    
    expect(mockOnQueryChange).toHaveBeenCalledWith('test query')
  })

  it('calls onSearch when search button is clicked', () => {
    renderComponent({ query: 'test query' })
    
    const searchButton = screen.getByRole('button', { name: 'Search' })
    fireEvent.click(searchButton)
    
    expect(mockOnSearch).toHaveBeenCalled()
  })

  it('calls onSearch when form is submitted', () => {
    renderComponent({ query: 'test query' })
    
    const form = screen.getByPlaceholderText('Search...').closest('form')
    fireEvent.submit(form!)
    
    expect(mockOnSearch).toHaveBeenCalled()
  })

  it('toggles filters visibility when filters button is clicked', () => {
    renderComponent()
    
    const filtersButton = screen.getByRole('button', { name: 'Filters' })
    fireEvent.click(filtersButton)
    
    expect(screen.getByText('Platform')).toBeInTheDocument()
    expect(screen.getByText('Sort By')).toBeInTheDocument()
  })

  it('calls onFiltersChange when platform filter is changed', async () => {
    renderComponent()
    
    // Show filters first
    const filtersButton = screen.getByRole('button', { name: 'Filters' })
    fireEvent.click(filtersButton)
    
    // Change platform filter
    const platformSelect = screen.getByDisplayValue('All Platforms')
    fireEvent.change(platformSelect, { target: { value: 'xiaohongshu' } })
    
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ platform: 'xiaohongshu' })
      )
    })
  })
})