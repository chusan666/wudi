import { render, screen } from '@testing-library/react'
import { NoteCard } from '@/components/search/note-card'
import { Note } from '@/types'

const mockNote: Note = {
  id: '1',
  title: 'Test Note Title',
  content: 'This is a test note content that should be displayed properly',
  author: {
    id: 'author1',
    username: 'testuser',
    avatar: 'https://example.com/avatar.jpg',
    verified: true,
  },
  platform: 'xiaohongshu',
  stats: {
    likes: 1234,
    comments: 56,
    shares: 78,
    views: 9012,
  },
  publishedAt: '2024-01-15T10:00:00Z',
  thumbnail: 'https://example.com/thumbnail.jpg',
  url: 'https://example.com/note/1',
}

describe('NoteCard', () => {
  it('renders note information correctly', () => {
    render(<NoteCard note={mockNote} />)
    
    expect(screen.getByText('Test Note Title')).toBeInTheDocument()
    expect(screen.getByText('This is a test note content that should be displayed properly')).toBeInTheDocument()
    expect(screen.getByText('testuser')).toBeInTheDocument()
    expect(screen.getByText('小红书')).toBeInTheDocument()
  })

  it('displays verification badge for verified authors', () => {
    render(<NoteCard note={mockNote} />)
    
    const verificationBadge = screen.getByText('✓')
    expect(verificationBadge).toBeInTheDocument()
    expect(verificationBadge.closest('div')).toHaveClass('bg-blue-500')
  })

  it('formats and displays statistics correctly', () => {
    render(<NoteCard note={mockNote} />)
    
    expect(screen.getByText('1.2K')).toBeInTheDocument() // likes
    expect(screen.getByText('56')).toBeInTheDocument() // comments
    expect(screen.getByText('78')).toBeInTheDocument() // shares
    expect(screen.getByText('9K')).toBeInTheDocument() // views
  })

  it('displays thumbnail when provided', () => {
    render(<NoteCard note={mockNote} />)
    
    const thumbnail = screen.getByAltText('Test Note Title')
    expect(thumbnail).toBeInTheDocument()
    expect(thumbnail).toHaveAttribute('src', 'https://example.com/thumbnail.jpg')
  })

  it('renders view button with correct link', () => {
    render(<NoteCard note={mockNote} />)
    
    const viewButton = screen.getByRole('link', { name: /view/i })
    expect(viewButton).toHaveAttribute('href', 'https://example.com/note/1')
    expect(viewButton).toHaveAttribute('target', '_blank')
    expect(viewButton).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('handles different platforms correctly', () => {
    const douyinNote = { ...mockNote, platform: 'douyin' as const }
    render(<NoteCard note={douyinNote} />)
    
    expect(screen.getByText('抖音')).toBeInTheDocument()
    expect(screen.getByText('抖音').closest('span')).toHaveClass('bg-black', 'text-white')
  })
})