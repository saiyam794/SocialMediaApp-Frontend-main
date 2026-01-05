export interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  email: string;
  createdAt: string;
}

export interface Feed {
  id: string;
  userId: string;
  content: string;
  images: string[];
  imageLayout: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  isReportedByCurrentUser?: boolean;
  _count: {
    comments: number;
    reports: number;
  };
}

export interface Comment {
  id: string;
  feedId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Report {
  id: string;
  feedId: string;
  userId: string;
  reason?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}