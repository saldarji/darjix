const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where, orderBy } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB5v0YZVZJzfAuBVOulTifXfK84RgCUuw4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "darjix-website.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "darjix-website",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncPosts() {
  console.log("📡 Fetching published posts from Cloud Firestore...");
  const postsRef = collection(db, "posts");
  const q = query(postsRef, where("published", "==", true), orderBy("date", "desc"));
  const snap = await getDocs(q);
  const posts = [];

  snap.forEach((doc) => {
    const data = doc.data();
    posts.push({
      id: doc.id,
      title: data.title,
      slug: data.slug || doc.id,
      date: data.date,
      layout: data.layout || "post",
      published: data.published ?? true,
      content: data.content || "",
      images: data.images || null,
      caption: data.caption || undefined,
      alt_text: data.alt_text || undefined,
      image: data.image || undefined,
      created_at: data.created_at || data.date,
      updated_at: data.updated_at || data.date,
    });
  });

  console.log(`✅ Fetched ${posts.length} published posts from Firestore.`);
  const targetPath = path.join(__dirname, "../data/posts.json");
  fs.writeFileSync(targetPath, JSON.stringify(posts, null, 2) + "\n");
  console.log(`💾 Synced posts to ${path.relative(process.cwd(), targetPath)}`);
}

if (require.main === module) {
  syncPosts()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Error syncing posts from Firestore:", err);
      process.exit(1);
    });
}

module.exports = { syncPosts };
