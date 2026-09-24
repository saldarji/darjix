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

      {/* Photo Gallery for multiple images */}
      {post.images && post.images.length > 1 && (
        <PhotoGallery images={post.images} title={post.title} />
      )}

      {/* Single image from images array */}
      {post.images && post.images.length === 1 && (
        <div className="my-4">
          <img
            src={encodeURI(post.images[0].url)}
            alt={post.images[0].alt_text || post.title}
            className="w-full h-auto rounded border border-gray-200"
          />
          {post.images[0].caption && (
            <p className="mt-2 text-sm text-gray-600 italic px-2">{post.images[0].caption}</p>
          )}
        </div>
      )}

      {/* Single image from image property */}
      {(!post.images || post.images.length === 0) && (post.image || imageUrl) && (
        <div className="my-4">
          <img
            src={imageUrl || encodeURI(post.image!)}
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
