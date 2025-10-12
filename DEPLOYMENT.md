# Deployment Guide

This guide explains how to deploy your Jekyll + Tailwind CSS site to GitHub Pages.

## Prerequisites

1. A GitHub account
2. Git installed on your machine
3. The darijx.com domain configured (or use the default GitHub Pages URL)

## Initial Setup

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it whatever you like (e.g., `darijx`)
3. Make it public (required for free GitHub Pages)
4. Don't initialize with README (we already have one)

### Step 2: Connect Your Local Repository

```bash
# Add the remote repository
git remote add origin https://github.com/saldarji/darjix.git

# Push your code
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Build and deployment**:
   - Source: Select **GitHub Actions**
4. The workflow will automatically deploy on every push to `main`

### Step 4: Configure Custom Domain (Optional)

If you own darijx.com:

1. In your domain registrar's DNS settings, add these records:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   
   Type: A
   Name: @
   Value: 185.199.109.153
   
   Type: A
   Name: @
   Value: 185.199.110.153
   
   Type: A
   Name: @
   Value: 185.199.111.153
   
   Type: CNAME
   Name: www
   Value: saldarji.github.io
   ```

2. In GitHub repository settings → Pages → Custom domain:
   - Enter: `darijx.com`
   - Click Save
   - Wait for DNS check to pass (can take up to 48 hours)
   - Enable "Enforce HTTPS" once available

## Deployment Workflow

The site automatically deploys when you push to the `main` branch:

```bash
# Make your changes
git add .
git commit -m "Your commit message"
git push origin main
```

The GitHub Actions workflow will:
1. Install Ruby and Node.js dependencies
2. Build Tailwind CSS (minified for production)
3. Build the Jekyll site
4. Deploy to GitHub Pages

You can monitor the deployment progress in the **Actions** tab of your repository.

## Build Status

Check your latest deployment status:
- Go to your repository on GitHub
- Click the **Actions** tab
- See the status of your latest workflow run

## Viewing Your Site

- **With custom domain**: https://darijx.com
- **Without custom domain**: https://saldarji.github.io/darjix/

Note: If using the default GitHub Pages URL (not a custom domain), you'll need to update `baseurl` in `_config.yml`:

```yaml
baseurl: "/darjix"
```

## Troubleshooting

### Site Not Updating
- Check the Actions tab for build errors
- Ensure the workflow completed successfully
- Clear your browser cache

### CSS Not Loading
- Verify the GitHub Pages deployment completed
- Check that `assets/css/style.css` exists in the repository
- Inspect browser console for 404 errors

### Custom Domain Not Working
- Verify DNS records are correctly configured
- Wait up to 48 hours for DNS propagation
- Ensure CNAME file contains only the domain name

## Local Development

To test before deploying:

```bash
# Install dependencies (first time only)
bundle install
npm install

# Run development server
npm run dev
```

Visit http://localhost:4000 to preview your site.

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

