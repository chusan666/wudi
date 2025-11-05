import { render, screen } from '@testing-library/react'
import { UserCard } from '@/components/search/user-card'
import { User } from '@/types'

const mockUser: User = {
  id: '1',
  username: 'testuser',
  displayName: 'Test User',
  bio: 'This is a test user bio',
  avatar: 'https://example.com/avatar.jpg',
  verified: true,
  platform: 'xiaohongshu',
  stats: {
    followers: 12345,
    following: 678,
    posts: 90,
    likes: 123456,
  },
  url: 'https://example.com/user/1',
}

describe('UserCard', () => {
  it('renders user information correctly', () => {
    render(<UserCard user={mockUser} />)
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('@testuser')).toBeInTheDocument()
    expect(screen.getByText('This is a test user bio')).toBeInTheDocument()
    expect(screen.getByText('小红书')).toBeInTheDocument()
  })

  it('displays verification badge for verified users', () => {
    render(<UserCard user={mockUser} />)
    
    const verificationIcon = screen.getByTestId('user-check') || document.querySelector('[data-lucide="user-check"]')
    expect(screen.getByText('Test User').parentElement).toContainHTML('UserCheck')
  })

  it('formats and displays statistics correctly', () => {
    render(<UserCard user={mockUser} />)
    
    expect(screen.getByText('12.3K')).toBeInTheDocument() // followers
    expect(screen.getByText('678')).toBeInTheDocument() // following
    expect(screen.getByText('90')).toBeInTheDocument() // posts
    expect(screen.getByText('123.5K')).toBeInTheDocument() // likes
  })

  it('displays avatar when provided', () => {
    render(<UserCard user={mockUser} />)
    
    const avatar = screen.getByAltText('Test User')
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('renders view button with correct link', () => {
    render(<UserCard user={mockUser} />)
    
    const viewButton = screen.getByRole('link', { name: /view/i })
    expect(viewButton).toHaveAttribute('href', 'https://example.com/user/1')
    expect(viewButton).toHaveAttribute('target', '_blank')
    expect(viewButton).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('handles different platforms correctly', () => {
    const douyinUser = { ...mockUser, platform: 'douyin' as const }
    render(<UserCard user={douyinUser} />)
    
    expect(screen.getByText('抖音')).toBeInTheDocument()
    expect(screen.getByText('抖音').closest('span')).toHaveClass('bg-black', 'text-white')
  })

  it('displays fallback when no avatar provided', () => {
    const userWithoutAvatar = { ...mockUser, avatar: undefined }
    render(<UserCard user={userWithoutAvatar} />)
    
    const avatar = screen.queryByAltText('Test User')
    expect(avatar).not.toBeInTheDocument()
    
    // Should show fallback icon
    const fallbackIcon = document.querySelector('[data-lucide="users"]')
    expect(fallbackIcon).toBeInTheDocument()
  })

  it('handles missing bio gracefully', () => {
    const userWithoutBio = { ...mockUser, bio: undefined }
    render(<UserCard user={userWithoutBio} />)
    
    expect(screen.queryByText('This is a test user bio')).not.toBeInTheDocument()
  })
})