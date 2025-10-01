export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isSubscribed?: boolean;
}

export interface ArticleSource {
  title: string;
  uri: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string;
  videoUrl?: string | null;
  authorId?: string;
  authorName: string;
  createdAt?: string;
  updatedAt?: string;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  sources?: ArticleSource[];
}

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  status: 'active' | 'inactive';
  placement: 'in-feed' | 'sidebar';
  impressions: number;
  clicks: number;
}

export interface UserPreferences {
    theme: 'light' | 'dark';
    language: 'en' | 'fr' | 'rw';
    accentColor: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'teal' | 'pink';
    contentPreferences: string[];
    newsletter: boolean;
}

export interface Collection {
    id: string;
    name: string;
    articleCount?: number;
    articles?: Article[];
}