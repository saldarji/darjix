# Darijx.com

A modern static website built with Jekyll, Tailwind CSS, and hosted on GitHub Pages.

## ⚠️ Important Note for macOS ARM Users

If you're on an Apple Silicon Mac (M1/M2/M3) and macOS 15.0+, you may encounter issues installing Jekyll dependencies locally. **This is completely normal** and doesn't affect deployment. See `KNOWN_ISSUES.md` for details.

**Recommended**: Use Docker for local development (see below) or deploy directly to GitHub Pages where everything works perfectly.

## Prerequisites

Choose one of the following:

### Option A: Docker (Recommended for macOS ARM)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Option B: Native Installation
- Ruby (2.7 or higher)
- Node.js (14 or higher)
- Bundler (`gem install bundler`)

## Local Development

### Using Docker (Recommended)

1. **First-time setup**: Just have Docker installed

2. **Run the site**:
   ```bash
   docker-compose up
   ```

3. **Visit**: http://localhost:4000

That's it! Docker handles all dependencies automatically.

### Using Native Installation

**Note**: May not work on macOS ARM. See `KNOWN_ISSUES.md` for workarounds.

1. Install Ruby dependencies:
   ```bash
   bundle install
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Run both Jekyll and Tailwind in watch mode:
   ```bash
   npm run dev
   ```

This will:
- Start Jekyll server at `http://localhost:4000`
- Watch for Tailwind CSS changes and rebuild automatically

### Individual Commands

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

1. Create a GitHub repository
2. Push your code: `git push origin main`
3. Enable GitHub Pages with "GitHub Actions" as the source
4. Done! Your site will build and deploy automatically

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

