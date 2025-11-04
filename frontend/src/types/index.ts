export interface VideoInfo {
  title: string;
  author: string;
  description: string;
  cover: string;
  video_url: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  tags: string[];
  platform?: string;
  duration?: number;
  pubdate?: number;
  coins?: number;
  favorites?: number;
}

export interface AnalysisResult {
  basic_info?: {
    title: string;
    author: string;
    platform: string;
    has_video_url: boolean;
    has_cover: boolean;
    duration?: string;
    duration_category?: string;
    publish_date?: string;
    days_since_publish?: number;
  };
  engagement?: {
    likes: string;
    comments: string;
    shares: string;
    views?: string;
    total_interactions: string;
    engagement_rate?: string;
    engagement_level?: string;
    comment_like_ratio?: string;
    share_like_ratio?: string;
    popularity_score: string;
  };
  content?: {
    title_length: number;
    description_length: number;
    has_description: boolean;
    tags_count: number;
    tags: string[];
    title_features?: {
      has_emoji: boolean;
      has_numbers: boolean;
      has_question: boolean;
      has_exclamation: boolean;
      has_engaging_keywords: boolean;
    };
    description_features?: {
      word_count: number;
      has_hashtag: boolean;
      has_at_mention: boolean;
      has_url: boolean;
    };
    content_type: string[];
  };
  recommendations?: Recommendation[];
}

export interface Recommendation {
  type: string;
  level: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
  example: string;
}
