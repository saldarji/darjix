# Known Issues and Workarounds

## macOS ARM (M1/M2/M3) - eventmachine Build Failure

### Issue
On macOS with Apple Silicon (ARM), you may encounter errors when trying to install Jekyll dependencies, specifically the `eventmachine` gem which is required for Jekyll's live-reload feature.

```
ERROR: Failed to build gem native extension.
eventmachine-1.2.7
```

### Why This Happens
The `eventmachine` gem hasn't been fully updated for ARM architecture and newer macOS versions (macOS 15.0+), causing native extension compilation to fail.

### Workarounds

#### Option 1: Use Docker (Recommended)
This is the cleanest solution that will work consistently:

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

2. Create a `docker-compose.yml` file:
```yaml
version: '3'
services:
  jekyll:
    image: jekyll/jekyll:latest
    command: sh -c "bundle install && concurrently 'npm run watch:css' 'bundle exec jekyll serve --host 0.0.0.0 --livereload'"
    ports:
      - "4000:4000"
      - "35729:35729"
    volumes:
      - .:/srv/jekyll
      - ./vendor/bundle:/usr/local/bundle
    environment:
      - JEKYLL_ENV=development
```

3. Run: `docker-compose up`

4. Visit: http://localhost:4000

#### Option 2: Build Only (No Live Server)
You can build the site and view it without running a server:

```bash
# Build Tailwind CSS
npm run build:css

# Build Jekyll site
jekyll build

# Open the site
open _site/index.html
```

Note: You'll need to rebuild manually after each change.

#### Option 3: Use Python's HTTP Server
Build once, then serve with Python:

```bash
# Build everything
npm run build:css
jekyll build

# Serve the _site directory
cd _site && python3 -m http.server 4000
```

Visit http://localhost:4000

You'll need to rebuild when you make changes.

#### Option 4: Skip Bundler, Use System Jekyll
If you have Jekyll installed globally:

```bash
# Install Jekyll globally (if not already)
gem install jekyll jekyll-feed jekyll-seo-tag jekyll-sitemap --user-install

# Build Tailwind
npm run build:css

# Build with system Jekyll
jekyll build

# Serve without live-reload
jekyll serve --no-watch
```

### The Good News 🎉
- **GitHub Actions deployment works perfectly** - the automated build on GitHub uses Linux which has no issues
- You can still develop locally using any of the workarounds above
- The live-reload feature is the only thing affected

### Alternative: Fix eventmachine (Advanced)
If you want to try fixing the build issue:

```bash
# Make sure you have Xcode Command Line Tools
xcode-select --install

# Try building with specific flags
gem install eventmachine -- --with-cppflags=-DWITH_SSL

# Or specify architecture explicitly
arch -arm64 gem install eventmachine
```

This may or may not work depending on your exact system configuration.

## Recommendation

For the smoothest development experience on ARM Macs, use **Docker** (Option 1). It's a one-time setup and will work reliably. For quick edits, **Option 3** (Python server) is the simplest.

Remember: **Your deployed site on GitHub Pages will work perfectly** regardless of local development issues!

