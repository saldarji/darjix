"use client";

import { useState, useEffect } from "react";
import { auth, googleProvider, db, storage } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Post, PhotoItem } from "@/lib/types";
import { LogIn, LogOut, Plus, Trash2, Edit3 } from "lucide-react";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [layout, setLayout] = useState<"post" | "photo">("post");
  const [images, setImages] = useState<PhotoItem[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchAdminPosts();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setStatusMsg(`Sign in failed: ${err.message}`);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
  };

  const fetchAdminPosts = async () => {
    try {
      const postsRef = collection(db, "posts");
      const q = query(postsRef, orderBy("date", "desc"));
      const snap = await getDocs(q);
      const list: Post[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Post);
      });
      setPosts(list);
    } catch (err) {
      console.warn("Could not fetch Firestore admin posts:", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploaded: PhotoItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileRef = ref(storage, `posts/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        uploaded.push({ url, caption: "", alt_text: file.name });
      }
      setImages((prev) => [...prev, ...uploaded]);
      setStatusMsg("Images uploaded to Firebase Storage!");
    } catch (err: any) {
      console.error("Image upload failed:", err);
      setStatusMsg("Image upload failed (Check Firebase Storage configuration).");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const postSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const dateStr = new Date().toISOString();

    const postData = {
      title,
      slug: postSlug,
      content,
      layout,
      images: images.length > 0 ? images : null,
      date: dateStr,
      published: true,
      updated_at: dateStr,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "posts", editingId), postData);
        setStatusMsg("Post updated successfully!");
      } else {
        await addDoc(collection(db, "posts"), {
          ...postData,
          created_at: dateStr,
        });
        setStatusMsg("New post created successfully!");
      }

      resetForm();
      fetchAdminPosts();
    } catch (err: any) {
      console.error("Error saving post:", err);
      setStatusMsg(`Error saving post: ${err.message}`);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setContent("");
    setLayout("post");
    setImages([]);
    setEditingId(null);
  };

  const handleEdit = (post: Post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setContent(post.content);
    setLayout(post.layout === "photo" ? "photo" : "post");
    setImages(post.images || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "posts", id));
      setStatusMsg("Post deleted.");
      fetchAdminPosts();
    } catch (err: any) {
      console.error("Delete error:", err);
      setStatusMsg(`Delete error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500 font-mono">Loading authentication state...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-md mx-auto px-6 border-2 border-black p-8 text-center">
          <h1 className="text-2xl font-bold text-black mb-2">Admin Sign-In</h1>
          <p className="text-sm text-gray-600 mb-6">
            Sign in with Google to access the DARJIX CMS & Firestore Manager.
          </p>
          {statusMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs text-left rounded break-words">
              <strong>Error:</strong> {statusMsg}
            </div>
          )}
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 bg-black text-white font-medium flex items-center justify-center space-x-2 hover:bg-gray-800 transition rounded mb-3"
          >
            <LogIn className="w-5 h-5" />
            <span>Sign in with Google</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Admin Panel</h1>
            <p className="text-xs text-gray-500 mt-1">Logged in as {user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-100 transition rounded flex items-center space-x-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {statusMsg && (
          <div className="mb-6 p-4 bg-gray-100 border-l-4 border-black text-sm text-gray-800 flex items-center justify-between">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg("")} className="text-xs underline ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* Create / Edit Form */}
        <div className="border-2 border-black p-6 mb-12 bg-white">
          <h2 className="text-lg font-bold text-black mb-4 flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>{editingId ? "Edit Post" : "Create New Post"}</span>
          </h2>

          <form onSubmit={handleSavePost} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Post Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title of post..."
                required
                className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="custom-slug-name"
                  className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Layout Mode</label>
                <select
                  value={layout}
                  onChange={(e) => setLayout(e.target.value as "post" | "photo")}
                  className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none text-sm"
                >
                  <option value="post">Standard Post</option>
                  <option value="photo">Photo Post Gallery</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Upload Images to Firebase Storage
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
              />
              {uploadingImage && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
            </div>

            {images.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-black uppercase">Attached Images ({images.length})</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group border border-gray-200 p-1">
                      <img src={img.url} alt="" className="h-20 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-black mb-1">Markdown Body</label>
              <textarea
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post in Markdown..."
                className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none font-mono text-sm"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition"
              >
                {editingId ? "Update Post" : "Publish Post"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 border border-gray-300 text-sm font-medium hover:bg-gray-100"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Managing Posts */}
        <div>
          <h2 className="text-xl font-bold text-black mb-4">Firestore Posts ({posts.length})</h2>
          {posts.length === 0 ? (
            <p className="text-sm text-gray-500">No posts in Firestore database yet.</p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 border border-gray-200 hover:border-black transition"
                >
                  <div>
                    <h3 className="font-bold text-black">{post.title}</h3>
                    <p className="text-xs text-gray-500">
                      /posts/{post.slug} • {post.date ? new Date(post.date).toLocaleDateString() : ""}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2 text-gray-600 hover:text-black transition"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-red-600 hover:text-red-800 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
