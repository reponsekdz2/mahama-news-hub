
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
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
