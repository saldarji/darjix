import Link from "next/link";
import { Post } from "@/lib/types";
import PhotoGallery from "./PhotoGallery";
import MarkdownRenderer from "./MarkdownRenderer";

interface PostCardProps {
  post: Post;
  isLast?: boolean;
}

export default function PostCard({ post, isLast }: PostCardProps) {
  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const imageUrl = post.image ? encodeURI(post.image) : null;

  return (
    <article className={`pb-12 ${!isLast ? "border-b border-gray-200 mb-12" : ""}`}>
      <time className="text-sm text-gray-500 font-mono" dateTime={post.date}>
        {formattedDate}
      </time>
      <h2 className="text-2xl md:text-3xl font-bold text-black mt-2 mb-4">
        <Link href={`/posts/${post.slug}`} className="hover:underline">
          {post.title}
        </Link>
      </h2>

      {post.layout === "photo" && post.images && post.images.length > 0 && (
        <PhotoGallery images={post.images} title={post.title} />
      )}

      {post.layout === "photo" && imageUrl && !post.images && (
        <div className="my-4">
          <img
            src={imageUrl}
            alt={post.alt_text || post.title}
            className="w-full h-auto rounded border border-gray-200"
          />
          {post.caption && (
            <p className="mt-2 text-sm text-gray-600 italic px-2">{post.caption}</p>
          )}
        </div>
      )}

      <div className="mt-4">
        <MarkdownRenderer content={post.content} />
      </div>
    </article>
  );
}
