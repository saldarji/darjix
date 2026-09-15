# Firebase & Next.js Architecture Guide

## Overview

The DARJIX site has been converted from a static Jekyll file structure into a database-backed Next.js web application utilizing Google Cloud Infrastructure:

1. **Database**: Cloud Firestore (`posts` collection).
2. **Auth**: Firebase Authentication (Google Sign-In Provider).
3. **Storage**: Firebase Storage (`posts/{filename}`).
4. **Framework**: Next.js App Router.

---

## Firestore Schema (`posts/{id}`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | string | Firestore Document ID / Post Slug |
| `title` | string | Post title |
| `slug` | string | Unique URL path identifier |
| `date` | string (ISO) | Publication timestamp |
| `content` | string | Markdown body |
| `excerpt` | string | Short summary snippet |
| `layout` | string | `post` or `photo` |
| `images` | array | Array of `{ url, caption, alt_text }` objects |
| `published` | boolean | Visibility status flag |
| `created_at` | string (ISO) | Creation timestamp |
| `updated_at` | string (ISO) | Last update timestamp |

---

## Image Hosting with Firebase Storage

When uploading photo posts in `/admin`:
1. Images are stored at `gs://darjix-website.appspot.com/posts/{timestamp}_{filename}`.
2. The download URL is added to the `images` array of the target Firestore document.
3. The `PhotoGallery` component renders interactive slideshow carousels with lazy loading.
