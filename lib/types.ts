export interface PhotoItem {
  url: string;
  caption?: string;
  alt_text?: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  date: string; // ISO string or format YYYY-MM-DD
  content: string; // Markdown body
  excerpt?: string;
  layout?: 'post' | 'photo' | 'news' | 'podcast';
  image?: string; // Single image url if photo layout or hero image
  images?: PhotoItem[]; // Multi-image gallery for photo posts
  caption?: string;
  alt_text?: string;
  published: boolean;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}
