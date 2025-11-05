export interface NoteAuthor {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
  bio?: string;
}

export interface NoteStatistics {
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
}

export interface NoteMedia {
  id: string;
  url: string;
  type: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  alt?: string;
  order: number;
}

export interface NoteDetail {
  id: string;
  title: string;
  content: string;
  slug: string;
  published: boolean;
  tags: string[];
  author: NoteAuthor;
  statistics: NoteStatistics;
  media: NoteMedia[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrawledNoteData {
  noteId: string;
  title: string;
  content: string;
  authorId: string;
  authorUsername: string;
  authorName?: string;
  authorAvatar?: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  mediaUrls: Array<{
    url: string;
    type: string;
    width?: number;
    height?: number;
  }>;
  tags: string[];
  publishedAt?: Date;
}
