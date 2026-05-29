# REED Apparel - Production Deployment Guide

This documentation outlines the steps required to secure, configure, and deploy the **REED Apparel** web application to production servers or cloud-based hosting providers.

---

## 📦 Architecture Overview

REED Apparel is built on a modern **Vite + React (TypeScript) + Tailwind CSS** architecture. 

During the build process (`npm run build`), Vite compiles individual assets (React components, custom utilities, styles) into a highly optimized, minified bundle consisting of:
- A single static `index.html` entry point.
- Bundled CSS and JS assets inside `/dist/assets`.
- Static image resources.

Since it compiles to standard client-side files, the production build can be hosted effortlessly on any static file server or content delivery network (CDN).

---

## 🔐 Environment Variables Manager
Vite utilizes **static replacement** for environment variables during compilation. Only variables explicitly prefixed with `VITE_` are exposed in your client-side files.

### 1. Default Setup (`.env` vs `.env.example`)
To define environment variables locally:
1. Duplicate `.env.example` and name the copy `.env`.
2. Populate the required values:
   ```env
   # .env
   VITE_APP_URL="https://your-production-app.com"
   ```

### 2. Standard Client-Side Key Management (VITE_)
To reference any custom keys (e.g., Stripe public keys, Google Analytics) in the frontend code:
```typescript
const productionURL = import.meta.env.VITE_APP_URL;
```

### 3. Server-Proxy Architecture for Sensitive Keys (`GEMINI_API_KEY`)
> [!CAUTION]
> **API Key Protection Principle**: Under no circumstances should sensitive client secrets or model API keys (like `GEMINI_API_KEY`) be prefixed with `VITE_` or embedded directly in the frontend build. This makes them readable in browser DevTools.

To safely implement Gemini AI or database modules in your production environment:
1. Create a lightweight server-side proxy (e.g., Node.js / Express).
2. Configure the server to fetch and wrap your secrets:
   ```typescript
   // On the server (where process.env is secure)
   const apiKey = process.env.GEMINI_API_KEY;
   ```
3. Point your client-side application requests toward this secure proxy endpoint:
   ```typescript
   const response = await fetch('/api/recommendations', { method: 'POST' });
   ```
4. Define `GEMINI_API_KEY` directly inside your backend host's system configuration manager (e.g., AWS Parameter Store, GCP Secret Manager, Vercel Environment Variables).

---

## ⚙️ Production Web Server Configuration (Nginx)

When deploying on a traditional virtual private server (e.g., DigitalOcean, AWS EC2, Linode), **Nginx** is the gold standard for performance, caching, and SSL termination.

### 1. Root Directory Structure
Extract the `/dist` artifacts into your web directory:
```bash
# Example web location
/var/www/reedapparel/
├── assets/
│   ├── index-xxxx.js
│   └── index-xxxx.css
├── favicon.svg
└── index.html
```

### 2. Nginx Site Block Configuration
Create or modify your Nginx site configuration (usually at `/etc/nginx/sites-available/default` or similar):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name reedapparel.com www.reedapparel.com;

    # Root folder containing compiled 'dist' files
    root /var/www/reedapparel;
    index index.html;

    # Gzip Compression for Fast Assets Delivery
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/x-javascript application/xml;
    gzip_disable "MSIE [1-6]\.";

    # Client-Side SPA Fallback Strategy (Crucial)
    # This prevents 404 errors when a user refreshes deep URLs like /admin or /checkout
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Browser Cache Optimization for Compiled Assets
    location ~* \.(?:css|js)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # Browser Cache Optimization for Media Elements
    location ~* \.(?:jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm|htc)$ {
       expires 1M;
       access_log off;
       add_header Cache-Control "public, max-age=2592000, must-revalidate";
    }

    # Prevent Clickjacking & Increase Security
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
}
```

### 3. Activating HTTPS (SSL Certificate with Let's Encrypt)
To secure the checkout workflow, configure SSL with Certbot:
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d reedapparel.com -d www.reedapparel.com
```

---

## ☁️ Static Cloud Hosting Platforms

### 🚀 Vercel (Recommended)
Vercel has built-in, native comprehension of Vite configurations:
1. Connect your Github/Gitlab account to [Vercel](https://vercel.com).
2. Create **New Project** and import your REED Apparel repo.
3. Vercel auto-selects the **Vite** preset and populates build routines:
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
4. Define your environment parameters (e.g. `VITE_APP_URL`) inside the "Environment Variables" deployment drawer.
5. Click **Deploy**. Vercel will launch your live site instantly with automated SSL and global edge performance.

### 🕸️ Netlify
Netlify delivers a similar direct-git pipeline:
1. Log in to [Netlify](https://netlify.com) and click **Add new site** -> **Import from Git**.
2. Input the following configurations:
   - **Build Command**: `npm run build`
   - **Publish directory**: `dist`
3. Click **Deploy Site**.
4. To implement clean Single Page Application state preservation upon page refresh, add a `_redirects` file in your `/public` folder with the following line before compiling:
   ```text
   /*   /index.html   200
   ```

### 🌩️ Cloudflare Pages
Cloudflare Pages is highly performant and free:
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com) and go to **Version Control** or upload files directly.
2. Under Pages, choose **Create a Project** -> **Connect to Git**.
3. Select build frameworks:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
4. Provide environment variables in the dedicated panel.
5. Save and deploy.

### 🐙 GitHub Pages
If using standard static page hosting:
1. Install development dependencies:
   ```bash
   npm install --save-dev gh-pages
   ```
2. Insert deployment routines inside `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Set your homepage path inside `package.json`:
   ```json
   "homepage": "https://<your-username>.github.io/<your-repository-name>"
   ```
4. Run deployment manually:
   ```bash
   npm run deploy
   ```

---

## 🛠️ Common Production Troubleshooting

### ❔ I refreshed my shop domain at `reedapparel.com/admin` and got a "404 Not Found"
- **Cause**: The server is trying to physically look for `/admin/index.html` on the server disk, which doesn't exist because routing is managed in memory by React's router.
- **Solution**: Configure a fallback route. 
  - On Nginx, verify you have `try_files $uri $uri/ /index.html;` in place.
  - On Vercel, this is handled natively.
  - On Netlify, add a `_redirects` file with `/* /index.html 200` to the `/public` workspace folder.

### ❔ Icons or fonts fail to render correctly in older browsers
- **Cause**: Modern ES Module bundlers can pack font file formats securely, but CDN security heads or CORS policies might block font ingestion.
- **Solution**: Confirm that headers include `Access-Control-Allow-Origin "*"` for font endings (`.woff2`, `.ttf`, `.svg`). All system indicators inside REED Apparel are sourced from standard CDN links or configured explicitly through `lucide-react`, which loads seamlessly out of the box.
