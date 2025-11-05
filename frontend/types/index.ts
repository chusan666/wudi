export interface Note {
  id: string
  title: string
  content: string
  author: {
    id: string
    username: string
    avatar?: string
    verified: boolean
  }
  platform: 'xiaohongshu' | 'douyin' | 'bilibili' | 'kuaishou'
  stats: {
    likes: number
    comments: number
    shares: number
    views?: number
  }
  publishedAt: string
  thumbnail?: string
  url: string
}

export interface User {
  id: string
  username: string
  displayName: string
  bio?: string
  avatar?: string
  verified: boolean
  platform: 'xiaohongshu' | 'douyin' | 'bilibili' | 'kuaishou'
  stats: {
    followers: number
    following: number
    posts: number
    likes?: number
  }
  url: string
}

export interface SearchResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SearchFilters {
  platform?: string
  dateRange?: {
    start: string
    end: string
  }
  sortBy?: 'relevance' | 'date' | 'popularity'
  verifiedOnly?: boolean
}