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

/**
 * Encode local asset paths (e.g. spaces) without double-encoding remote URLs
 * such as Firebase Storage download URLs that already contain `%2F`.
 */
export function getSafeImageUrl(url: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return encodeURI(url);
}
