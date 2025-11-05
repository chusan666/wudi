import { useQuery, useQueryClient } from '@tanstack/react-query'
import { kolApiService } from './kol-api'

// Query keys
export const kolKeys = {
  all: ['kol'] as const,
  profiles: () => [...kolKeys.all, 'profiles'] as const,
  profile: (id: string) => [...kolKeys.all, 'profile', id] as const,
  pricing: (id: string) => [...kolKeys.all, 'pricing', id] as const,
  pricingHistory: (id: string) => [...kolKeys.all, 'pricing', 'history', id] as const,
  audience: (id: string) => [...kolKeys.all, 'audience', id] as const,
  audienceTimeline: (id: string) => [...kolKeys.all, 'audience', 'timeline', id] as const,
  performance: (id: string) => [...kolKeys.all, 'performance', id] as const,
  performanceTimeline: (id: string) => [...kolKeys.all, 'performance', 'timeline', id] as const,
  conversion: (id: string) => [...kolKeys.all, 'conversion', id] as const,
  conversionFunnel: (id: string) => [...kolKeys.all, 'conversion', 'funnel', id] as const,
  marketingIndex: (id: string) => [...kolKeys.all, 'marketing-index', id] as const,
  marketingIndexHistory: (id: string) => [...kolKeys.all, 'marketing-index', 'history', id] as const,
}

// Profile hooks
export const useKOLProfiles = () => {
  return useQuery({
    queryKey: kolKeys.profiles(),
    queryFn: () => kolApiService.getKOLProfiles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useKOLProfile = (kolId: string) => {
  return useQuery({
    queryKey: kolKeys.profile(kolId),
    queryFn: () => kolApiService.getKOLProfile(kolId),
    enabled: !!kolId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Pricing hooks
export const useKOLPricing = (kolId: string) => {
  return useQuery({
    queryKey: kolKeys.pricing(kolId),
    queryFn: () => kolApiService.getKOLPricing(kolId),
    enabled: !!kolId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export const useKOLPricingHistory = (kolId: string) => {
  return useQuery({
    queryKey: kolKeys.pricingHistory(kolId),
    queryFn: () => kolApiService.getKOLPricingHistory(kolId),
    enabled: !!kolId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Audience hooks
export const useKOLAudience = (kolId: string) => {
  return useQuery({
    queryKey: kolKeys.audience(kolId),
    queryFn: () => kolApiService.getKOLAudience(kolId),
    enabled: !!kolId,
    staleTime: 20 * 60 * 1000, // 20 minutes
  })
}

export const useKOLAudienceTimeline = (kolId: string) => {
  return useQuery({
    queryKey: kolKeys.audienceTimeline(kolId),
    queryFn: () => kolApiService.getKOLAudienceTimeline(kolId),
    enabled: !!kolId,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

// Performance hooks
export const useKOLPerformance = (kolId: string) => {
  return useQuery({
    queryKey: kolKeys.performance(kolId),
    queryFn: () => kolApiService.getKOLPerformance(kolId),
    enabled: !!kolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useKOLPerformanceTimeline = (kolId: string) => {
  return useQuery({
    queryKey: kolKeys.performanceTimeline(kolId),
    queryFn: () => kolApiService.getKOLPerformanceTimeline(kolId),
    enabled: !!kolId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Conversion hooks
export const useKOLConversion = (kolId: string) => {
  return useQuery({
    queryKey: kolKeys.conversion(kolId),
    queryFn: () => kolApiService.getKOLConversion(kolId),
    enabled: !!kolId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export const useKOLConversionFunnel = (kolId: string) => {
  return useQuery({
    queryKey: kolKeys.conversionFunnel(kolId),
    queryFn: () => kolApiService.getKOLConversionFunnel(kolId),
    enabled: !!kolId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Marketing Index hooks
export const useKOLMarketingIndex = (kolId: string) => {
  return useQuery({
    queryKey: kolKeys.marketingIndex(kolId),
    queryFn: () => kolApiService.getKOLMarketingIndex(kolId),
    enabled: !!kolId,
    staleTime: 25 * 60 * 1000, // 25 minutes
  })
}

export const useKOLMarketingIndexHistory = (kolId: string) => {
  return useQuery({
    queryKey: kolKeys.marketingIndexHistory(kolId),
    queryFn: () => kolApiService.getKOLMarketingIndexHistory(kolId),
    enabled: !!kolId,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

// Prefetch hook for loading all KOL data
export const usePrefetchKOLData = (kolId: string) => {
  const queryClient = useQueryClient()

  return () => {
    // Prefetch all data for the KOL
    queryClient.prefetchQuery({
      queryKey: kolKeys.profile(kolId),
      queryFn: () => kolApiService.getKOLProfile(kolId),
    })
    
    queryClient.prefetchQuery({
      queryKey: kolKeys.pricing(kolId),
      queryFn: () => kolApiService.getKOLPricing(kolId),
    })
    
    queryClient.prefetchQuery({
      queryKey: kolKeys.audience(kolId),
      queryFn: () => kolApiService.getKOLAudience(kolId),
    })
    
    queryClient.prefetchQuery({
      queryKey: kolKeys.performance(kolId),
      queryFn: () => kolApiService.getKOLPerformance(kolId),
    })
    
    queryClient.prefetchQuery({
      queryKey: kolKeys.conversion(kolId),
      queryFn: () => kolApiService.getKOLConversion(kolId),
    })
    
    queryClient.prefetchQuery({
      queryKey: kolKeys.marketingIndex(kolId),
      queryFn: () => kolApiService.getKOLMarketingIndex(kolId),
    })
  }
}