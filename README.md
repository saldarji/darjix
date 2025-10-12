# Darijx.com

A modern static website built with Jekyll, Tailwind CSS, and hosted on GitHub Pages.

## 💡 Development Approach

**Recommended for this project**: Just edit your files and push to GitHub! No need to install Docker or deal with local setup.

Since this is a small 3-page site, you can use the **Deploy-and-Preview** workflow:
1. Edit files locally in your favorite editor
2. `git push` to GitHub
3. Wait ~1-2 minutes for GitHub Actions to build
4. Preview your changes live!

See `DEVELOPMENT.md` for details on this and other workflows.

*Note: If you want full local development with live reload, Docker is available (see below), but it's optional for a site this size.*

## Prerequisites

Choose one of the following:

### Option A: Docker (Recommended for macOS ARM)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Option B: Native Installation
- Ruby (2.7 or higher)
- Node.js (14 or higher)
- Bundler (`gem install bundler`)

## Quick Start

### 1. Install Node.js Dependencies (One-time)

```bash
npm install
```

### 2. Development Workflow

**Option A: Deploy-and-Preview (Simplest - No Setup!)**
```bash
# Edit your files, then:
git add .
git commit -m "Your changes"
git push origin main

# Wait ~1-2 minutes, view at https://darijx.com
```

**Option B: Preview Tailwind CSS Changes Locally**
```bash
# Rebuild CSS after making style changes
npm run build:css

# Open files in browser or use Python server
python3 -m http.server 4000
```

**Option C: Full Local Development with Docker** (Optional)
```bash
docker-compose up
# Visit http://localhost:4000
```

See `DEVELOPMENT.md` for detailed workflow information.

### Build Commands

- Build Tailwind CSS: `npm run build:css`
- Watch Tailwind CSS: `npm run watch:css`
- Build for production: `npm run build:production`

## Project Structure

```
darjix/
├── _layouts/          # HTML templates
├── _includes/         # Reusable components
├── assets/
│   ├── css/          # Compiled CSS output
│   └── src/
│       └── input.css # Tailwind source
├── _config.yml       # Jekyll configuration
├── index.html        # Homepage
└── package.json      # Node dependencies
```

## Deployment

The site automatically deploys to GitHub Pages when you push to the main branch. See `DEPLOYMENT.md` for detailed instructions.

### Quick Deployment Steps

1. Create a GitHub repository at https://github.com/saldarji/darjix
2. Connect and push: `git remote add origin https://github.com/saldarji/darjix.git && git push -u origin main`
3. Enable GitHub Pages with "GitHub Actions" as the source
4. Done! Your site will build and deploy automatically at https://darijx.com

## Troubleshooting

Having issues with local development? Check `KNOWN_ISSUES.md` for common problems and solutions.

## Project Status

✅ **Ready to deploy to GitHub Pages**  
✅ Tailwind CSS configured and built  
✅ GitHub Actions workflow configured  
✅ Responsive design with modern UI  
✅ SEO optimized  

## License

All rights reserved.

