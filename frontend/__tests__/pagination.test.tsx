import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Pagination } from '@/components/search/pagination'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

describe('Pagination', () => {
  let queryClient: QueryClient
  let mockOnPageChange: jest.Mock

  beforeEach(() => {
    queryClient = createTestQueryClient()
    mockOnPageChange = jest.fn()
  })

  const renderComponent = (props = {}) => {
    const defaultProps = {
      currentPage: 1,
      totalPages: 5,
      onPageChange: mockOnPageChange,
    }

    return render(
      <QueryClientProvider client={queryClient}>
        <Pagination {...defaultProps} {...props} />
      </QueryClientProvider>
    )
  }

  it('does not render when total pages is 1 or less', () => {
    renderComponent({ totalPages: 1 })
    
    expect(screen.queryByText('Previous')).not.toBeInTheDocument()
    expect(screen.queryByText('Next')).not.toBeInTheDocument()
  })

  it('renders pagination controls correctly', () => {
    renderComponent()
    
    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    renderComponent({ currentPage: 1 })
    
    const previousButton = screen.getByText('Previous')
    expect(previousButton).toBeDisabled()
  })

  it('disables next button on last page', () => {
    renderComponent({ currentPage: 5 })
    
    const nextButton = screen.getByText('Next')
    expect(nextButton).toBeDisabled()
  })

  it('calls onPageChange when page number is clicked', () => {
    renderComponent()
    
    const pageButton = screen.getByText('3')
    fireEvent.click(pageButton)
    
    expect(mockOnPageChange).toHaveBeenCalledWith(3)
  })

  it('calls onPageChange when next button is clicked', () => {
    renderComponent({ currentPage: 2 })
    
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    
    expect(mockOnPageChange).toHaveBeenCalledWith(3)
  })

  it('calls onPageChange when previous button is clicked', () => {
    renderComponent({ currentPage: 3 })
    
    const previousButton = screen.getByText('Previous')
    fireEvent.click(previousButton)
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('shows dots for large page ranges', () => {
    renderComponent({ currentPage: 10, totalPages: 20 })
    
    expect(screen.getByText('...')).toBeInTheDocument()
  })

  it('disables all buttons when loading', () => {
    renderComponent({ isLoading: true })
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('highlights current page', () => {
    renderComponent({ currentPage: 3 })
    
    const currentPageButton = screen.getByText('3')
    expect(currentPageButton).toHaveClass('bg-primary', 'text-primary-foreground')
  })
})