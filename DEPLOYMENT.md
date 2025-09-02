# Deployment Guide

This project supports multiple deployment options for both public and private repositories.

## 🚀 Deployment Options

### Option 1: GitHub Pages (Public Repos Only)
**Best for**: Public repositories, portfolio showcase, open source projects

**Steps:**
1. Make repository public
2. Go to repository Settings → Pages
3. Select "GitHub Actions" as source
4. Push to main branch - auto-deploys

**URL**: `https://sudilhasitha.github.io/screen-recorder`

### Option 2: Netlify (Public & Private Repos)
**Best for**: Private repositories, custom domains, advanced features

**Steps:**
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login with GitHub
3. Click "New site from Git"
4. Connect your repository
5. Configure build settings:
   - Build command: `echo 'Static site'`
   - Publish directory: `.` (root)
6. Deploy!

**Auto-deploy**: Every push to main branch

### Option 3: Manual Netlify Deploy
**For quick testing without Git integration**

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your project folder
3. Instant deployment!

## 🔧 Netlify Configuration

The project includes `netlify.toml` with:
- ✅ Security headers
- ✅ Content Security Policy
- ✅ HTTPS redirects
- ✅ SPA routing support

## 📊 Comparison

| Feature | GitHub Pages | Netlify |
|---------|-------------|---------|
| Private Repos | ❌ (Pro only) | ✅ Free |
| Custom Domain | ✅ | ✅ |
| HTTPS | ✅ | ✅ |
| Build Hooks | ✅ | ✅ |
| Form Handling | ❌ | ✅ |
| Serverless Functions | ❌ | ✅ |
| CDN | ✅ | ✅ |
| Branch Previews | ✅ | ✅ |

## 🎯 Recommendation

- **Public repo + Portfolio**: Use GitHub Pages
- **Private repo**: Use Netlify
- **Custom domain needed**: Use Netlify
- **Quick testing**: Use Netlify drag-and-drop
