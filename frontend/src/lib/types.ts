export interface Post {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string;
  tags: string[];
  cover_image: string;
  published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author: string;
  body: string;
  created_at: string;
}

export interface Tag {
  slug: string;
  label: string;
}

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  tags: string[];
}
