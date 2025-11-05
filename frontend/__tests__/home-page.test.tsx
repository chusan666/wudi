import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders main heading', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Social Media Parser')).toBeInTheDocument();
    expect(screen.getByText(/Explore and analyze content/)).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<HomePage />);
    
    expect(screen.getByText('Start Parsing')).toBeInTheDocument();
    expect(screen.getByText('Sample Note')).toBeInTheDocument();
    expect(screen.getByText('Sample User')).toBeInTheDocument();
  });

  it('displays supported platforms', () => {
    render(<HomePage />);
    
    expect(screen.getByText('小红书')).toBeInTheDocument();
    expect(screen.getByText('抖音')).toBeInTheDocument();
    expect(screen.getByText('B站')).toBeInTheDocument();
    expect(screen.getByText('快手')).toBeInTheDocument();
  });
});