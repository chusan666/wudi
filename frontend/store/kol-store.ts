import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface KOLProfile {
  id: string
  name: string
  platform: string
  avatar?: string
  followers: number
  verified: boolean
  bio?: string
}

export interface KOLPricing {
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

export interface KOLAudience {
  id: string
  kolId: string
  ageGroups: Record<string, number>
  gender: Record<string, number>
  locations: Record<string, number>
  interests: string[]
  languages: string[]
}

export interface KOLPerformance {
  id: string
  kolId: string
  engagementRate: number
  avgLikes: number
  avgComments: number
  avgShares: number
  reach: number
  impressions: number
  videoViews: number
  monthlyGrowth: number
}

export interface KOLConversion {
  id: string
  kolId: string
  clickThroughRate: number
  conversionRate: number
  costPerClick: number
  costPerConversion: number
  returnOnAdSpend: number
  revenueGenerated: number
}

export interface KOLMarketingIndex {
  id: string
  kolId: string
  overallScore: number
  reachScore: number
  engagementScore: number
  conversionScore: number
  contentQualityScore: number
  brandSafetyScore: number
  trendAlignmentScore: number
}

interface KOLStore {
  // State
  favorites: string[]
  currentKOL: string | null
  activeTab: string
  
  // Actions
  addToFavorites: (kolId: string) => void
  removeFromFavorites: (kolId: string) => void
  setCurrentKOL: (kolId: string | null) => void
  setActiveTab: (tab: string) => void
  isFavorite: (kolId: string) => boolean
}

export const useKOLStore = create<KOLStore>()(
  persist(
    (set, get) => ({
      // Initial state
      favorites: [],
      currentKOL: null,
      activeTab: 'profile',
      
      // Actions
      addToFavorites: (kolId: string) =>
        set((state) => ({
          favorites: state.favorites.includes(kolId)
            ? state.favorites
            : [...state.favorites, kolId],
        })),
      
      removeFromFavorites: (kolId: string) =>
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== kolId),
        })),
      
      setCurrentKOL: (kolId: string | null) =>
        set({ currentKOL: kolId }),
      
      setActiveTab: (tab: string) =>
        set({ activeTab: tab }),
      
      isFavorite: (kolId: string) =>
        get().favorites.includes(kolId),
    }),
    {
      name: 'kol-storage',
    }
  )
)