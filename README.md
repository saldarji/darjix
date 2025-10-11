# Darijx.com

A modern static website built with Jekyll, Tailwind CSS, and hosted on GitHub Pages.

## Prerequisites

- Ruby (2.7 or higher)
- Node.js (14 or higher)
- Bundler (`gem install bundler`)

## Local Development

### First-time setup

1. Install Ruby dependencies:
   ```bash
   bundle install
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

### Running locally

Run both Jekyll and Tailwind in watch mode:
```bash
npm run dev
```

This will:
- Start Jekyll server at `http://localhost:4000`
- Watch for Tailwind CSS changes and rebuild automatically

### Individual commands

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

The site automatically deploys to GitHub Pages when you push to the main branch.

## License

All rights reserved.

