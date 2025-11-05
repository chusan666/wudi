import { 
  KOLProfile, 
  KOLPricing, 
  KOLAudience, 
  KOLPerformance, 
  KOLConversion, 
  KOLMarketingIndex 
} from '@/store/kol-store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class KOLApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  // Profile endpoints
  async getKOLProfile(kolId: string): Promise<KOLProfile> {
    return this.request<KOLProfile>(`/api/kol/${kolId}/profile`)
  }

  async getKOLProfiles(): Promise<KOLProfile[]> {
    return this.request<KOLProfile[]>('/api/kol/profiles')
  }

  // Pricing endpoints
  async getKOLPricing(kolId: string): Promise<KOLPricing> {
    return this.request<KOLPricing>(`/api/kol/${kolId}/pricing`)
  }

  async getKOLPricingHistory(kolId: string): Promise<KOLPricing[]> {
    return this.request<KOLPricing[]>(`/api/kol/${kolId}/pricing/history`)
  }

  // Audience endpoints
  async getKOLAudience(kolId: string): Promise<KOLAudience> {
    return this.request<KOLAudience>(`/api/kol/${kolId}/audience`)
  }

  async getKOLAudienceTimeline(kolId: string): Promise<KOLAudience[]> {
    return this.request<KOLAudience[]>(`/api/kol/${kolId}/audience/timeline`)
  }

  // Performance endpoints
  async getKOLPerformance(kolId: string): Promise<KOLPerformance> {
    return this.request<KOLPerformance>(`/api/kol/${kolId}/performance`)
  }

  async getKOLPerformanceTimeline(kolId: string): Promise<KOLPerformance[]> {
    return this.request<KOLPerformance[]>(`/api/kol/${kolId}/performance/timeline`)
  }

  // Conversion endpoints
  async getKOLConversion(kolId: string): Promise<KOLConversion> {
    return this.request<KOLConversion>(`/api/kol/${kolId}/conversion`)
  }

  async getKOLConversionFunnel(kolId: string): Promise<any> {
    return this.request<any>(`/api/kol/${kolId}/conversion/funnel`)
  }

  // Marketing Index endpoints
  async getKOLMarketingIndex(kolId: string): Promise<KOLMarketingIndex> {
    return this.request<KOLMarketingIndex>(`/api/kol/${kolId}/marketing-index`)
  }

  async getKOLMarketingIndexHistory(kolId: string): Promise<KOLMarketingIndex[]> {
    return this.request<KOLMarketingIndex[]>(`/api/kol/${kolId}/marketing-index/history`)
  }

  // Export endpoints
  async exportKOLData(kolId: string, format: 'csv' | 'pdf'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/kol/${kolId}/export?format=${format}`)
    if (!response.ok) {
      throw new Error(`Export Error: ${response.status} ${response.statusText}`)
    }
    return response.blob()
  }
}

export const kolApiService = new KOLApiService()