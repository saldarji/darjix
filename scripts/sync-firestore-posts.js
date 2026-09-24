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
  const targetPath = path.join(__dirname, "../data/posts.json");
  const existingMap = new Map();
  if (fs.existsSync(targetPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
      existing.forEach((p) => existingMap.set(p.slug || p.id, p));
    } catch (e) {}
  }

  const posts = [];

  snap.forEach((doc) => {
    const data = doc.data();
    const slug = data.slug || doc.id;
    const existing = existingMap.get(slug) || existingMap.get(doc.id);

    const images = data.images && data.images.length > 0 ? data.images : (existing?.images || null);
    const image = data.image || existing?.image || undefined;
    const caption = data.caption || existing?.caption || undefined;
    const alt_text = data.alt_text || existing?.alt_text || undefined;

    posts.push({
      id: doc.id,
      title: data.title,
      slug: slug,
      date: data.date,
      layout: data.layout || existing?.layout || "post",
      published: data.published ?? true,
      content: data.content || "",
      images: images,
      caption: caption,
      alt_text: alt_text,
      image: image,
      created_at: data.created_at || data.date,
      updated_at: data.updated_at || data.date,
    });
  });

  console.log(`✅ Fetched ${posts.length} published posts from Firestore.`);
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
