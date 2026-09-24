import { getPostBySlug, getPublishedPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PhotoGallery from "@/components/PhotoGallery";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import fs from "fs";
import path from "path";
import { Post } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const slugs = new Set<string>();

  try {
    const firestorePosts = await getPublishedPosts(100);
    if (firestorePosts && firestorePosts.length > 0) {
      firestorePosts.forEach((post) => {
        const s = post.slug || post.id;
        if (s) slugs.add(s);
      });
    }
  } catch (err) {
    console.warn("Firestore fetch in generateStaticParams failed:", err);
  }

  try {
    const jsonPath = path.join(process.cwd(), "data/posts.json");
    if (fs.existsSync(jsonPath)) {
      const fileData = fs.readFileSync(jsonPath, "utf-8");
      const posts = JSON.parse(fileData) as Post[];
      posts.forEach((post) => {
        const s = post.slug || post.id;
        if (s) slugs.add(s);
      });
    }
  } catch (err) {
    console.error("Error in generateStaticParams:", err);
  }

  return Array.from(slugs).map((slug) => ({ slug }));
}

async function findPost(slug: string): Promise<Post | null> {
  const post = await getPostBySlug(slug);
  if (post) return post;

  try {
    const jsonPath = path.join(process.cwd(), "data/posts.json");
    if (fs.existsSync(jsonPath)) {
      const fileData = fs.readFileSync(jsonPath, "utf-8");
      const posts = JSON.parse(fileData) as Post[];
      return posts.find((p) => p.slug === slug || p.id === slug) || null;
    }
  } catch (err) {
    console.error("Fallback error:", err);
  }

  return null;
}

export async function generateMetadata({ params }: PostPageProps) {
  const post = await findPost(params.slug);
  if (!post) return { title: "Post Not Found - DARJIX" };

  return {
    title: `${post.title} - DARJIX`,
    description: post.excerpt || `${post.title} on DARJIX`,
  };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const post = await findPost(params.slug);

  if (!post) {
    notFound();
  }

  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-black">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to posts
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-12">
          <article className="lg:col-span-7">
            <time className="text-sm text-gray-500 font-mono" dateTime={post.date}>
              {formattedDate}
            </time>
            <h1 className="text-3xl md:text-4xl font-bold text-black mt-2 mb-6">
              {post.title}
            </h1>

            {post.layout === "photo" && post.images && post.images.length > 0 && (
              <PhotoGallery images={post.images} title={post.title} />
            )}

            {post.layout === "photo" && post.image && !post.images && (
              <div className="my-6">
                <img
                  src={encodeURI(post.image)}
                  alt={post.alt_text || post.title}
                  className="w-full h-auto rounded border border-gray-200"
                />
                {post.caption && (
                  <p className="mt-2 text-sm text-gray-600 italic px-2">{post.caption}</p>
                )}
              </div>
            )}

            <div className="mt-6">
              <MarkdownRenderer content={post.content} />
            </div>
          </article>

          <div className="lg:col-span-3">
            <Sidebar />
          </div>
        </div>
      </div>
    </section>
  );
}
