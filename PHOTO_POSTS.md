# Photo Posts Usage Guide

Photo posts are a special post type for sharing photographs on your site. They feature a minimalist design that showcases images with optional captions and automatically generated alt-text for accessibility.

## Overview

Photo posts:
- Display images prominently with a clean, minimalist layout
- Support alt-text for accessibility (can be auto-generated using AI)
- Include optional captions
- Appear on the homepage with image previews
- Show up in the sidebar under "Recent Posts"
- Have their own dedicated page with full-size image

## Creating a Photo Post

### Step 1: Add Your Image

1. Place your image in `assets/images/image posts/`
2. Use a descriptive filename (e.g., `IMG_4346.jpeg`, `conference-speaker.jpg`)

### Step 2: Create the Post File

1. Copy `photo-template.md` to `_posts/YYYY-MM-DD-Photo-Title.md`
2. Fill in the front matter:

```yaml
---
layout: photo
title: "Your Photo Title"
date: YYYY-MM-DD
author: "Sal Darji"
image: "/assets/images/image posts/FILENAME.jpg"
alt_text: "Description of the photograph for accessibility"
caption: "Optional caption text for the photograph"
---
```

### Step 3: Generate Alt-Text (Recommended)

Use the automated alt-text generation script to create descriptive alt-text using AI:

```bash
python scripts/generate_alt_text.py "assets/images/image posts/FILENAME.jpg" \
    --update-post "_posts/YYYY-MM-DD-Photo-Title.md"
```

**What the script does:**
- Uploads your image to Replicate
- Uses the BLIP (Bootstrapping Language-Image Pre-training) model to generate a descriptive caption
- Automatically updates the `alt_text` field in your post file

**Requirements:**
- `REPLICATE_API_TOKEN` environment variable must be set
- Get your token at: https://replicate.com/account/api-tokens

**Example:**
```bash
python scripts/generate_alt_text.py "assets/images/image posts/IMG_4346.jpeg" \
    --update-post "_posts/2025-11-18-Photo-Post.md"
```

**Output:**
```
🖼️  Processing image: assets/images/image posts/IMG_4346.jpeg
   📤 Uploading image to Replicate...
   ✅ Image uploaded successfully
   🔄 Creating prediction with salesforce/blip model...
   ✅ Found model version: 2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746
   ✅ Prediction created: ntae71wfaxrg80ctm7h9z5yd4w
   ⏳ Waiting for prediction to complete...
   ✅ Generated alt-text: A man standing in front of a crowd holding a microphone

📋 Generated Alt-Text:
   A man standing in front of a crowd holding a microphone

📝 Updating post file: _posts/2025-11-18-Photo-Post.md
   ✅ Updated existing alt_text field
   ✅ Post file updated successfully

✅ Done! Alt-text has been added to the post file.
```

### Step 4: Manual Alt-Text (Alternative)

If you prefer to write alt-text manually, simply fill in the `alt_text` field in the front matter:

```yaml
alt_text: "A detailed description of what's in the photograph"
```

**Best practices for alt-text:**
- Be descriptive and specific
- Describe what's happening in the image
- Include important details (people, objects, setting)
- Keep it concise (typically 1-2 sentences)
- Don't include "image of" or "picture of" (screen readers announce it's an image)

## Front Matter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `layout` | Yes | Must be `"photo"` |
| `title` | Yes | The title of your photo post |
| `date` | Yes | Publication date in `YYYY-MM-DD` format |
| `author` | No | Author name (defaults to "Sal Darji" if not specified) |
| `image` | Yes | Path to the image file (relative to site root) |
| `alt_text` | Yes | Descriptive text for accessibility |
| `caption` | No | Optional caption displayed below the image |

## How Photo Posts Appear

### Homepage
- Photo posts appear in the main content area with:
  - Date
  - Clickable title
  - Image preview (max height: 384px)
  - Caption (if provided)

### Individual Post Page
- Full-size image display
- Title and date in header
- Image with caption below (if provided)
- Optional additional content in markdown below the image
- "Back to all posts" link

### Sidebar
- Photo posts automatically appear in the "Recent Posts" section
- Listed by title with date
- Clickable links to the full post

## Examples

### Basic Photo Post

```yaml
---
layout: photo
title: "Conference Speaker"
date: 2025-11-18
author: "Sal Darji"
image: "/assets/images/image posts/speaker.jpg"
alt_text: "A person standing at a podium addressing an audience"
caption: "Keynote speaker at AIxED Conference"
---
```

### Photo Post with Additional Content

You can add markdown content below the front matter:

```yaml
---
layout: photo
title: "Sunset Over Campus"
date: 2025-11-19
image: "/assets/images/image posts/sunset.jpg"
alt_text: "A vibrant sunset over a university campus with buildings silhouetted against orange and pink sky"
caption: "Evening view from the library"
---

This was taken during a late evening study session. The colors were incredible that night.
```

## Troubleshooting

### Alt-Text Generation Fails

**Error: "REPLICATE_API_TOKEN environment variable not set"**
- Set your token: `export REPLICATE_API_TOKEN="your-token"`
- Or add it to a `.env` file in the project root

**Error: "Failed to upload image"**
- The script will automatically try base64 encoding as a fallback
- Check your internet connection
- Verify your Replicate API token is valid

**Error: "Prediction failed"**
- Check your Replicate account has credits
- Verify the image file is valid (not corrupted)
- Try running the script again

### Image Not Displaying

- Verify the image path in the `image` field is correct
- Check the image file exists at the specified location
- Ensure the path starts with `/assets/images/`
- Image file should be a valid image format (jpg, jpeg, png, gif, webp)

### Post Not Appearing

- Verify the filename follows the format: `YYYY-MM-DD-Title.md`
- Check the `date` field matches the filename date
- Ensure `layout: photo` is set correctly
- Make sure the file is in the `_posts/` directory

## Technical Details

- **Layout:** `_layouts/photo.html`
- **Template:** `photo-template.md`
- **Image Storage:** `assets/images/image posts/`
- **Alt-Text Script:** `scripts/generate_alt_text.py`
- **Model Used:** Salesforce BLIP (via Replicate API)

## Related Documentation

- [Inset Component Usage](INSET_USAGE.md) - For adding expandable images to regular blog posts
- [Post Template](post-template.md) - For regular text-based blog posts

