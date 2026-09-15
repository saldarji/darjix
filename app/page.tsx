import { getPublishedPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";
import fs from "fs";
import path from "path";
import { Post } from "@/lib/types";

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

export default async function HomePage() {
  const posts = await fetchPosts();

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-12">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-7">
            {posts.length === 0 ? (
              <div className="p-8 border border-dashed border-gray-300 rounded text-center">
                <p className="text-gray-600 font-medium">No blog posts found yet.</p>
                <p className="text-xs text-gray-500 mt-2">
                  Run <code className="bg-gray-100 px-1 py-0.5 font-mono">npm run migrate</code> to parse existing posts into database format.
                </p>
              </div>
            ) : (
              <div>
                {posts.map((post, idx) => (
                  <PostCard key={post.id || post.slug} post={post} isLast={idx === posts.length - 1} />
                ))}
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
