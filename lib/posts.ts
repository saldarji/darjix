import { collection, getDocs, getDoc, doc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";
import { Post } from "./types";

export async function getPublishedPosts(limitCount = 50): Promise<Post[]> {
  try {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      where("published", "==", true),
      orderBy("date", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];
    querySnapshot.forEach((docSnap) => {
      posts.push({ id: docSnap.id, ...docSnap.data() } as Post);
    });
    return posts;
  } catch (error) {
    console.warn("Firestore query error (using local fallback if unconfigured):", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Post;
    }
    const directDoc = await getDoc(doc(db, "posts", slug));
    if (directDoc.exists()) {
      return { id: directDoc.id, ...directDoc.data() } as Post;
    }
    return null;
  } catch (error) {
    console.warn("Error fetching post by slug:", error);
    return null;
  }
}
