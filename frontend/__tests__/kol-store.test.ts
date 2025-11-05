import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useKOLStore } from '@/store/kol-store'

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('KOL Store', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useKOLStore(), { wrapper })

    expect(result.current.favorites).toEqual([])
    expect(result.current.currentKOL).toBeNull()
    expect(result.current.activeTab).toBe('profile')
  })

  it('should add and remove favorites', () => {
    const { result } = renderHook(() => useKOLStore(), { wrapper })

    act(() => {
      result.current.addToFavorites('kol-1')
    })

    expect(result.current.favorites).toContain('kol-1')
    expect(result.current.isFavorite('kol-1')).toBe(true)

    act(() => {
      result.current.removeFromFavorites('kol-1')
    })

    expect(result.current.favorites).not.toContain('kol-1')
    expect(result.current.isFavorite('kol-1')).toBe(false)
  })

  it('should set current KOL and active tab', () => {
    const { result } = renderHook(() => useKOLStore(), { wrapper })

    act(() => {
      result.current.setCurrentKOL('kol-2')
      result.current.setActiveTab('pricing')
    })

    expect(result.current.currentKOL).toBe('kol-2')
    expect(result.current.activeTab).toBe('pricing')
  })

  it('should not add duplicate favorites', () => {
    const { result } = renderHook(() => useKOLStore(), { wrapper })

    act(() => {
      result.current.addToFavorites('kol-1')
      result.current.addToFavorites('kol-1')
    })

    expect(result.current.favorites).toEqual(['kol-1'])
  })
})