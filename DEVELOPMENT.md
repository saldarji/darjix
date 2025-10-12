# Development Workflows

This document outlines different ways to develop and preview your site.

## Option 1: Deploy-and-Preview (Recommended - No Local Setup!)

**Perfect if you want to avoid installing Docker or dealing with Ruby dependencies.**

### How It Works

1. Make changes to your files locally
2. Commit and push to GitHub
3. Wait 1-2 minutes for GitHub Actions to build
4. Preview on your live site

### Workflow

```bash
# Edit your files in your favorite editor
# Then:

git add .
git commit -m "Update homepage content"
git push origin main

# Wait ~1-2 minutes, then visit your site!
```

### Tips for This Workflow

**Use a staging branch (optional but recommended):**
```bash
# Create a staging branch for testing
git checkout -b staging
# Make changes, commit
git push origin staging

# Set up GitHub Pages to deploy from 'staging' branch for testing
# Once happy, merge to main:
git checkout main
git merge staging
git push origin main
```

**Quick CSS preview:**
Since Tailwind CSS is already compiled and committed, you can:
1. Open `index.html` (or any page) directly in your browser
2. The styling will mostly work for quick visual checks
3. Links won't work perfectly, but you can see layout/colors

**Preview compiled CSS locally:**
```bash
# Just build and view the CSS changes
npm run build:css

# Then open files directly in browser
open index.html
# or
python3 -m http.server 4000
# Visit http://localhost:4000
```

### When to Use This Approach

✅ Small content changes  
✅ CSS/styling updates  
✅ Adding new pages  
✅ You prefer simplicity over local preview  
✅ You don't mind waiting 1-2 minutes to see changes  

### Pros
- ✅ No local setup required (just Node.js for CSS)
- ✅ No compatibility issues
- ✅ See exactly what users will see
- ✅ Simple and fast workflow

### Cons
- ⏱️ 1-2 minute wait to see changes
- 🌐 Need internet connection
- 🐛 Slightly slower debugging cycle

---

## Option 2: Python Server (Quick Local Preview)

For a faster feedback loop without Docker:

```bash
# Build everything once
npm run build:css
jekyll build    # Skip if Jekyll not installed

# Serve the site
python3 -m http.server 4000 --directory _site

# Or serve without Jekyll build:
python3 -m http.server 4000
```

Visit http://localhost:4000

**Caveat**: Jekyll templating won't work (no `{{ }}` processing), but you can see HTML/CSS.

---

## Option 3: Docker (Full Local Development)

If you want the complete local experience:

```bash
docker-compose up
```

Visit http://localhost:4000 with live reload.

---

## Option 4: Build Manually (If You Get Jekyll Working)

For those who successfully install Jekyll locally:

```bash
npm run dev
```

---

## Recommended Workflow by Project Size

### Small Site (3-10 pages) → **Deploy-and-Preview**
Just push and view live. It's fast enough!

### Medium Site (10-50 pages) → **Python Server or Deploy-and-Preview**
Use Python server for quick checks, deploy for final review.

### Large Site (50+ pages) → **Docker or Full Setup**
Worth the setup time for faster iteration.

---

## Your Site is Small - Deploy-and-Preview is Perfect!

With just 3 pages (home, about, contact), the deploy-and-preview workflow will work great. GitHub Actions builds in about 1-2 minutes, which is totally reasonable for iterative development.

## Pro Tips

1. **Make multiple changes before pushing** - batch your edits
2. **Use GitHub's web editor** for quick text changes
3. **Check the Actions tab** on GitHub to monitor build status
4. **Keep CSS changes in a separate commit** for easy debugging

## Build Monitoring

Check your build status:
- Go to your repo on GitHub
- Click "Actions" tab
- See real-time build progress
- Builds typically take 60-120 seconds

## Testing Checklist Before Pushing

- [ ] Updated content looks good in editor
- [ ] No obvious typos
- [ ] CSS classes match Tailwind documentation
- [ ] Links use correct format: `{{ '/about' | relative_url }}`
- [ ] Committed any asset changes (images, etc.)

---

**Bottom Line**: For a 3-page site like darjix.com, you really don't need Docker. Just edit, push, and preview live! 🚀

