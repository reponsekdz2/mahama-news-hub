export type Role = 'user' | 'admin';
export type SubscriptionStatus = 'free' | 'trial' | 'premium';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionEndDate?: string;
  createdAt?: string;
  last_login?: string;
}

export interface AuthenticatedUser extends User {
  token: string;
}

export interface PollOption {
  id: string;
  option_text: string;
  voteCount?: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes?: number;
  userVote?: string | null; // option_id
}


export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string;
  videoUrl?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  isPremium: boolean;
  status: 'draft' | 'published';
  tags?: string[];
  isLiked?: boolean;
  poll?: Poll;
}

export interface Advertisement {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  placement: 'sidebar' | 'in-feed';
  status: 'active' | 'paused';
  startDate?: string;
  endDate?: string;
  impressions: number;
  clicks: number;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string;
  articleId: string;
  articleTitle?: string; // for moderation queue
  status?: 'pending' | 'approved' | 'rejected';
}

export interface Collection {
  id: string;
  name: string;
  userId: string;
  articles?: Article[];
  articleCount?: number;
}

export interface Notification {
  id: string;
  type: 'new_comment' | 'article_mention' | 'system';
  actorName: string;
  isRead: boolean;
  createdAt: string;
  relatedArticleId: string;
  relatedArticleTitle: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  accentColor: 'red' | 'orange' | 'green' | 'blue' | 'purple' | 'teal' | 'pink';
  language: 'en' | 'fr' | 'rw';
  fontSize: 'sm' | 'base' | 'lg';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  contentPreferences?: string[];
  newsletter?: boolean;
  commentNotificationsEnabled?: boolean;
}
