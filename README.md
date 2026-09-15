# DARJIX

A modern, database-backed blog and experimental platform built with **Next.js (App Router)**, **Google Cloud Firestore**, **Firebase Authentication**, and **Firebase Storage**, hosted on **Firebase App Hosting**.

---

## 🚀 Key Features & Architecture

- **Next.js App Router**: Fast, pre-rendered (SSR/SSG) pages with modern React components and Tailwind CSS styling.
- **Cloud Firestore**: Dynamic NoSQL database for managing blog posts, tags, dates, and media metadata.
- **Firebase Auth**: Protected Admin CMS (`/admin`) using **Google Sign-In**.
- **Firebase Storage**: Image asset hosting for photo post galleries and blog media.
- **Markdown & Gallery Support**: Markdown rendering with live previews, syntax highlighting, and responsive photo carousels.

---

## 🛠 Local Development Setup

### 1. Prerequisites
- Node.js 18+ and npm.
- Firebase CLI (`npx -y firebase-tools@latest`).

### 2. Environment Configuration
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=darjix-website.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=darjix-website
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=darjix-website.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Install & Start Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Data Migration & Management

To convert legacy Jekyll markdown posts into JSON / Cloud Firestore format:
```bash
npm run migrate
```
This script parses all files in `_posts/` and exports structured documents to `data/posts.json`.

---

## 🛡 Administration

Navigate to `/admin` on your deployed site or local dev server:
1. Click **Sign in with Google**.
2. Create, edit, publish, or delete posts directly in Cloud Firestore.
3. Drag & drop images to upload directly to Firebase Storage.

---

## 🚢 Deployment

Deploy rules and application configuration via Firebase:
```bash
npx -y firebase-tools@latest deploy --only firestore:rules,storage:rules
```
App hosting builds automatically deploy upon pushing to the `main` branch.
