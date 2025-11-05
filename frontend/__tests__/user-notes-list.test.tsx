import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserNotesList } from '@/components/user/user-notes-list';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('UserNotesList', () => {
  it('renders notes grid', () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <UserNotesList userId="test-user" page={1} onPageChange={jest.fn()} />
      </QueryClientProvider>
    );

    // Check if notes are rendered - use getAllByText since there are multiple instances
    const noteTitles = screen.getAllByText(/Note Title \d+/);
    expect(noteTitles.length).toBeGreaterThan(0);
  });

  it('handles pagination correctly', async () => {
    const queryClient = createTestQueryClient();
    const mockPageChange = jest.fn();
    
    render(
      <QueryClientProvider client={queryClient}>
        <UserNotesList userId="test-user" page={1} onPageChange={mockPageChange} />
      </QueryClientProvider>
    );

    // Check pagination controls - wait for them to appear
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeInTheDocument();
    
    // Click next page
    fireEvent.click(nextButton);
    
    // Wait for the setTimeout to complete
    await new Promise(resolve => setTimeout(resolve, 600));
    
    expect(mockPageChange).toHaveBeenCalledWith(2);
  });

  it('shows note details', () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <UserNotesList userId="test-user" page={1} onPageChange={jest.fn()} />
      </QueryClientProvider>
    );

    // Check if note details are displayed using regex to match the pattern
    expect(screen.getAllByText(/likes/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/comments/i).length).toBeGreaterThan(0);
  });
});