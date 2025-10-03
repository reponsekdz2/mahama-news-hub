export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  subscriptionStatus?: 'free' | 'premium' | 'trial';
  subscriptionEndDate?: string;
  pushSubscription?: object;
}

export interface AuthenticatedUser extends User {
  token: string;
}

export interface UserPreferences {
    theme: 'light' | 'dark';
    accentColor: 'red' | 'orange' | 'green' | 'blue' | 'purple' | 'teal' | 'pink';
    language: 'en' | 'fr' | 'rw';
    fontSize?: 'sm' | 'base' | 'lg';
    lineHeight?: 'normal' | 'relaxed' | 'loose';
    contentPreferences?: string[];
    newsletter?: boolean;
    commentNotificationsEnabled?: boolean;
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
  userVote?: string; // The ID of the option the user voted for
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
  tags?: string[];
  status?: 'draft' | 'published';
  isPremium?: boolean;
  poll?: Poll;
  meta_title?: string;
  meta_description?: string;
}

export interface AdCampaign {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    budget_type: 'impressions' | 'clicks';
    budget: number;
    status: 'active' | 'inactive' | 'completed';
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
  campaign_id?: string;
  targeting_categories?: string[]; // JSON array of category strings
}

export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    userName: string;
    status?: 'pending' | 'approved' | 'rejected';
    articleTitle?: string;
}

export interface Collection {
    id: string;
    name: string;
    articles?: Article[];
    articleCount?: number;
}

export interface Notification {
    id:string;
    type: 'new_comment';
    relatedArticleId: string;
    relatedArticleTitle: string;
    actorName: string;
    isRead: boolean;
    createdAt: string;
}

export interface SiteSettings {
    site_title: string;
    contact_email: string;
    social_links: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
    };
    allow_registration: boolean;
}

export interface ArticleAnalysis {
    sentiment: string;
    keyTopics: string[];
    seoKeywords: string[];
    readabilityScore: string;
}