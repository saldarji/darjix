import { getPublishedPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";
import Pagination from "@/components/Pagination";
import fs from "fs";
import path from "path";
import { Post } from "@/lib/types";
import { notFound } from "next/navigation";

const POSTS_PER_PAGE = 5;

interface PageProps {
  params: {
    num: string;
  };
}

async function fetchPosts(): Promise<Post[]> {
  const firestorePosts = await getPublishedPosts(50);
  if (firestorePosts && firestorePosts.length > 0) {
    return firestorePosts;
  }

  try {
    const jsonPath = path.join(process.cwd(), "data/posts.json");
    if (fs.existsSync(jsonPath)) {
      const fileData = fs.readFileSync(jsonPath, "utf-8");
      return JSON.parse(fileData) as Post[];
    }
  } catch (err) {
    console.error("Local posts fallback read error:", err);
  }

  return [];
}

export async function generateStaticParams() {
  const posts = await fetchPosts();
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paths = [];

  for (let pageNum = 2; pageNum <= totalPages; pageNum++) {
    paths.push({ num: pageNum.toString() });
  }

  return paths;
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Page ${params.num} - DARJIX`,
  };
}

export default async function PaginatedPostsPage({ params }: PageProps) {
  const pageNum = parseInt(params.num, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    notFound();
  }

  const posts = await fetchPosts();
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  if (pageNum > totalPages && totalPages > 0) {
    notFound();
  }

  const startIndex = (pageNum - 1) * POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-12">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-7">
            {currentPosts.length === 0 ? (
              <div className="p-8 border border-dashed border-gray-300 rounded text-center">
                <p className="text-gray-600 font-medium">No posts found on this page.</p>
              </div>
            ) : (
              <div>
                {currentPosts.map((post, idx) => (
                  <PostCard key={post.id || post.slug} post={post} isLast={idx === currentPosts.length - 1} />
                ))}

                <Pagination currentPage={pageNum} totalPages={totalPages} />
              </div>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-3">
            <Sidebar />
          </div>
        </div>
      </div>
    </section>
  );
}
