# AI Quickstart Guide for DARJIX

Welcome! This guide will help you quickly understand the DARJIX codebase and work effectively on it.

## What is DARJIX?

DARJIX is a personal blog and content site focused on AI and education technology. It's built by Sal Darji to document his journey building AI products for higher education. The site features:

- **Blog posts** - Regular text-based posts about AI, education, and technology
- **Photo posts** - Image-focused posts with AI-generated alt-text
- **EdTech News** - Automatically curated and summarized education technology news (updated weekly via GitHub Actions)
- **EdTech Podcasts** - Curated podcast episodes about education technology
- **Featured Content** - Manually curated articles and resources

**Live Site:** https://darjix.com

## Tech Stack

- **Static Site Generator:** Jekyll (Ruby-based)
- **Styling:** Tailwind CSS (utility-first CSS framework)
- **Hosting:** GitHub Pages
- **Build Tool:** PostCSS for Tailwind processing
- **Python Scripts:** For automated content generation (news, podcasts, alt-text)
- **AI Services:** Replicate API (for content summarization and image captioning)

## Project Structure

```
darjix/
├── _config.yml              # Jekyll configuration
├── _layouts/                # Page layouts
│   ├── default.html         # Base layout (header, footer, main)
│   ├── post.html           # Layout for regular blog posts
│   └── photo.html          # Layout for photo posts
├── _includes/               # Reusable components
│   ├── header.html         # Site header/navigation
│   ├── footer.html         # Site footer
│   ├── inset.html          # Expandable image/table component
│   ├── edtech-news.md      # Auto-generated news content
│   ├── edtech-podcasts.md  # Auto-generated podcast content
│   └── featured-content.md # Manually curated featured content
├── _posts/                 # Blog posts (Jekyll convention)
│   └── YYYY-MM-DD-Title.md # Post files (date prefix required)
├── assets/                  # Static assets
│   ├── css/                # Compiled CSS (from src/input.css)
│   ├── images/             # Image files
│   │   └── image posts/    # Photos for photo posts
│   └── js/                 # JavaScript files
│       └── inset.js        # Inset component modal functionality
├── scripts/                 # Python automation scripts
│   ├── edtech_news_agent.py      # Fetches & summarizes EdTech news
│   ├── edtech_podcast_agent.py   # Fetches & selects EdTech podcasts
│   ├── generate_alt_text.py      # Generates alt-text for images using BLIP
│   └── edtech_domains.json       # Curated list of EdTech domains
├── documentation/           # Documentation files
│   ├── PHOTO_POSTS.md      # Photo post usage guide
│   ├── INSET_USAGE.md      # Inset component guide
│   └── scripts-*.md         # Script documentation
├── .github/workflows/      # GitHub Actions workflows
│   ├── pages.yml           # GitHub Pages deployment
│   ├── update-edtech-news.yml    # Weekly news updates
│   └── update-edtech-podcasts.yml # Podcast updates
└── index.html              # Homepage (two-column layout)
```

## Key Features & Components

### 1. Blog Posts

**Location:** `_posts/YYYY-MM-DD-Title.md`

**Layout:** `post` (uses `_layouts/post.html`)

**Template:** `documentation/post-template.md`

**Front Matter:**
```yaml
---
layout: post
title: "Post Title"
date: YYYY-MM-DD
author: "Sal Darji"
---
```

**Features:**
- Automatic pagination (5 posts per page)
- Appears in sidebar "Recent Posts"
- Supports markdown content
- Can use inset component for expandable images/tables

### 2. Photo Posts

**Location:** `_posts/YYYY-MM-DD-Photo-Title.md`

**Layout:** `photo` (uses `_layouts/photo.html`)

**Template:** `documentation/photo-template.md`

**Front Matter:**
```yaml
---
layout: photo
title: "Photo Title"
date: YYYY-MM-DD
image: "/assets/images/image posts/FILENAME.jpg"
alt_text: "Descriptive alt-text"
caption: "Optional caption"
---
```

**Features:**
- Prominent image display
- AI-generated alt-text support (via `scripts/generate_alt_text.py`)
- Optional captions
- Appears on homepage with image preview

**Documentation:** `documentation/PHOTO_POSTS.md`

### 3. Inset Component

**Location:** `_includes/inset.html`

**Usage:** Add expandable images or tables to blog posts

```liquid
{% include inset.html 
   content="<img src='/path/to/image.jpg' alt='Description'>" 
   caption="Optional caption" 
%}
```

**Documentation:** `documentation/INSET_USAGE.md`

### 4. EdTech News

**Location:** `_includes/edtech-news.md` (auto-generated)

**Script:** `scripts/edtech_news_agent.py`

**Workflow:** `.github/workflows/update-edtech-news.yml` (runs weekly on Mondays)

**Features:**
- Fetches news from NewsAPI
- Uses Replicate AI to select and summarize articles
- Domain filtering for EdTech sources
- Automatic deduplication and source limiting
- Updates `_includes/edtech-news.md`

**Display:** `news.html` page

**Documentation:** `documentation/scripts-README.md`, `documentation/scripts-QUICKSTART.md`

### 5. EdTech Podcasts

**Location:** `_includes/edtech-podcasts.md` (auto-generated)

**Script:** `scripts/edtech_podcast_agent.py`

**Workflow:** `.github/workflows/update-edtech-podcasts.yml`

**Features:**
- Fetches podcasts from iTunes API
- Uses Replicate AI to select relevant episodes
- Updates `_includes/edtech-podcasts.md`

**Display:** `podcasts.html` page

### 6. Featured Content

**Location:** `_includes/featured-content.md` (manually edited)

**Display:** Homepage "What I'm Consuming" box

**Format:** Markdown list of articles/resources

## Common Tasks

### Creating a New Blog Post

1. Copy `documentation/post-template.md` to `_posts/YYYY-MM-DD-Title.md`
2. Fill in front matter (title, date, author)
3. Write content in markdown
4. Commit and push - GitHub Pages will rebuild automatically

### Creating a Photo Post

1. Add image to `assets/images/image posts/`
2. Copy `documentation/photo-template.md` to `_posts/YYYY-MM-DD-Photo-Title.md`
3. Fill in front matter (title, date, image path)
4. Generate alt-text: `python scripts/generate_alt_text.py "path/to/image.jpg" --update-post "_posts/YYYY-MM-DD-Photo-Title.md"`
5. Add optional caption
6. Commit and push

**See:** `documentation/PHOTO_POSTS.md` for full details

### Updating Featured Content

1. Edit `_includes/featured-content.md`
2. Use markdown format for links
3. Commit and push

### Running News/Podcast Scripts Locally

**Prerequisites:**
- Python 3 with virtual environment
- Environment variables: `REPLICATE_API_TOKEN`, `NEWS_API_KEY`

**News Script:**
```bash
cd scripts
source ../venv/bin/activate  # or your venv path
python edtech_news_agent.py
```

**Podcast Script:**
```bash
python edtech_podcast_agent.py
```

**Alt-Text Generation:**
```bash
python generate_alt_text.py "assets/images/image posts/image.jpg" --update-post "_posts/YYYY-MM-DD-Post.md"
```

## Important Conventions

### File Naming

- **Posts:** `YYYY-MM-DD-Title.md` (date prefix required for Jekyll)
- **Images:** Descriptive filenames, stored in `assets/images/` or subdirectories
- **Scripts:** Snake_case (e.g., `edtech_news_agent.py`)

### Paths

- **Image paths:** Start with `/assets/images/` (absolute from site root)
- **Post URLs:** Auto-generated as `/:year/:month/:day/:title/`
- **Includes:** Use `{% include filename.html %}` or `{% include filename.md %}`

### Styling

- **Framework:** Tailwind CSS (utility classes)
- **Source:** `assets/src/input.css` (compiled to `assets/css/style.css`)
- **Theme:** Minimalist, black and white with gray accents
- **Typography:** Uses Tailwind's prose classes for content

### Layout Structure

- **Homepage:** Two-column layout (7/10 main, 3/10 sidebar)
- **Post pages:** Single column, max-width centered
- **Photo pages:** Single column, image-focused

## Key Files to Know

| File | Purpose |
|------|---------|
| `_config.yml` | Jekyll configuration, site settings |
| `index.html` | Homepage layout and structure |
| `_layouts/default.html` | Base layout (header, footer, main wrapper) |
| `_layouts/post.html` | Blog post layout |
| `_layouts/photo.html` | Photo post layout |
| `assets/src/input.css` | Tailwind CSS source (edit this, not compiled CSS) |
| `tailwind.config.js` | Tailwind configuration |
| `package.json` | Node dependencies (PostCSS, Tailwind) |
| `Gemfile` | Ruby dependencies (Jekyll, plugins) |

## GitHub Actions Workflows

### Pages Deployment (`pages.yml`)
- **Trigger:** Push to `main` branch, manual dispatch
- **Action:** Builds Jekyll site and deploys to GitHub Pages

### EdTech News Update (`update-edtech-news.yml`)
- **Trigger:** Weekly on Mondays at 9am UTC, manual dispatch
- **Action:** Runs `edtech_news_agent.py`, commits updates, triggers Pages rebuild

### EdTech Podcasts Update (`update-edtech-podcasts.yml`)
- **Trigger:** Manual dispatch
- **Action:** Runs `edtech_podcast_agent.py`, commits updates

## Environment Variables

Required for scripts (set in GitHub Secrets for Actions):

- `REPLICATE_API_TOKEN` - For AI content generation
- `NEWS_API_KEY` - For fetching news articles

## Development Workflow

1. **Make changes** to files
2. **Test locally** (if possible with Jekyll)
3. **Commit and push** to `main` branch
4. **GitHub Pages** automatically rebuilds and deploys
5. **Check site** at https://darjix.com (may take 1-2 minutes)

## Where to Find More Information

- **Photo Posts:** `documentation/PHOTO_POSTS.md`
- **Inset Component:** `documentation/INSET_USAGE.md`
- **Scripts:** `documentation/scripts-README.md`, `documentation/scripts-QUICKSTART.md`
- **Jekyll Docs:** https://jekyllrb.com/docs/
- **Tailwind CSS Docs:** https://tailwindcss.com/docs

## Design Philosophy

- **Minimalist:** Clean, simple design with black, white, and gray
- **Content-first:** Design doesn't distract from content
- **Accessible:** Alt-text for images, semantic HTML
- **Automated:** Where possible, content is auto-generated and updated

## Tips for AI Assistants

1. **Always check existing patterns** - Look at similar files before creating new ones
2. **Follow Jekyll conventions** - Date prefixes, front matter, etc.
3. **Use Tailwind utilities** - Don't write custom CSS unless necessary
4. **Test paths** - Image and link paths are relative to site root
5. **Check documentation** - Most features have detailed docs in `documentation/`
6. **Respect the minimalist design** - Keep styling simple and clean
7. **Update documentation** - If you add features, document them

## Common Issues

**Images not displaying:**
- Check path starts with `/assets/images/`
- Verify file exists in correct location
- Ensure image format is supported

**Posts not appearing:**
- Check filename has date prefix: `YYYY-MM-DD-`
- Verify `date` in front matter matches filename
- Ensure file is in `_posts/` directory

**Styles not applying:**
- Edit `assets/src/input.css`, not compiled CSS
- Rebuild Tailwind: `npm run build` (if needed)
- Check Tailwind classes are correct

**Scripts failing:**
- Verify environment variables are set
- Check API tokens are valid
- Review script logs for specific errors

---

**Last Updated:** November 2025

**Questions?** Check the documentation folder or examine similar existing files for patterns.

