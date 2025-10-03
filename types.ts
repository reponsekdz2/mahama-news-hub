export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthenticatedUser extends User {
  token: string;
}

export interface UserPreferences {
    theme: 'light' | 'dark';
    accentColor: 'red' | 'orange' | 'green' | 'blue' | 'purple' | 'teal' | 'pink';
    language: 'en' | 'fr' | 'rw';
    contentPreferences?: string[];
    newsletter?: boolean;
    commentNotificationsEnabled?: boolean;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string;
  videoUrl?: string;
  authorName: string;
  viewCount: number;
  likeCount: number;
  isLiked?: boolean; // Optional as it might depend on the user context
  sources?: { title: string; uri: string }[];
  tags?: string[];
  status?: 'draft' | 'published';
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

export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    userName: string;
}

export interface Collection {
    id: string;
    name: string;
    articles?: Article[];
    articleCount?: number;
}

export interface Notification {
    id: string;
    type: 'new_comment';
    relatedArticleId: string;
    relatedArticleTitle: string;
    actorName: string;
    isRead: boolean;
    createdAt: string;
}