#!/bin/bash

# ==============================================================================
# REED Apparel - Deployment Automation Script
# ==============================================================================
# This script automates the installation of dependencies and the compilation of
# the production build. It also provides deployment guidance for popular hosting engines.

# Standard shell configuration
set -e

# Output styling
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
RESET='\033[0m'

clear

# Default flags
PROVIDER=""
AUTO=false

# Parse CLI args for non-interactive deployments
while [[ "$#" -gt 0 ]]; do
    case "$1" in
        -p|--provider)
            PROVIDER="$2"
            shift 2
            ;;
        -y|--yes|--auto)
            AUTO=true
            shift
            ;;
        -h|--help)
            echo "Usage: bash deploy.sh [--provider <vercel|netlify|cloudflare|github|nginx|firebase>] [--yes]"
            exit 0
            ;;
        *)
            shift
            ;;
    esac
done

echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${CYAN}${BOLD}                 R E E D  A P P A R E L  -  D E P L O Y E R              ${RESET}"
echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

# 1. Dependency Check
echo -e "${BLUE}[1/3] Checking Node.js environment...${RESET}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed. Please install Node.js (v18+) to proceed.${RESET}"
    exit 1
fi
echo -e "● Node.js version: $(node -v)"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}ERROR: npm is not installed. Please install npm to proceed.${RESET}"
    exit 1
fi
echo -e "● npm version:     $(npm -v)"
echo ""

# 2. Package Installation (if needed)
echo -e "${BLUE}[2/3] Resolving dependencies...${RESET}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}node_modules not found. Installing packages...${RESET}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed successfully.${RESET}"
else
    echo -e "${GREEN}✓ node_modules folder is present.${RESET}"
fi
echo ""

# 3. Running Production Build
echo -e "${BLUE}[3/3] Compiling production build...${RESET}"
echo -e "Executing 'npm run build'..."
echo ""

if npm run build; then
    echo ""
    echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${GREEN}${BOLD}             🎉 PRODUCTION BUILD COMPILED SUCCESSFULLY! 🎉               ${RESET}"
    echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "All production assets are ready inside the ${BOLD}dist/${RESET} directory."
    echo ""
else
    echo ""
    echo -e "${RED}${BOLD}❌ ERROR: Clean build failed. Please verify console output logs.${RESET}"
    echo ""
    exit 1
fi

# 4. Provider Directory: either non-interactive via CLI flags or interactive as before
if [ -n "$PROVIDER" ]; then
    # Normalize provider keyword
    case "$(echo "$PROVIDER" | tr '[:upper:]' '[:lower:]')" in
        vercel|netlify|cloudflare|github|gh|nginx|firebase)
            SEL_PROVIDER="$PROVIDER"
            ;;
        *)
            echo -e "${YELLOW}Unknown provider: $PROVIDER. Falling back to interactive mode.${RESET}"
            SEL_PROVIDER=""
            ;;
    esac
fi

if [ -n "$SEL_PROVIDER" ]; then
    echo -e "${CYAN}${BOLD}Non-interactive deploy: provider=$SEL_PROVIDER, auto=$AUTO${RESET}\n"
    case "$(echo "$SEL_PROVIDER" | tr '[:upper:]' '[:lower:]')" in
        vercel)
            if ! command -v vercel &> /dev/null; then
                echo -e "${YELLOW}Vercel CLI not found. Installing...${RESET}"
                npm install -g vercel || true
            fi
            if $AUTO; then
                vercel --prod || { echo "vercel deploy failed"; exit 1; }
            else
                echo -e "Run: vercel or vercel --prod to deploy.${RESET}"
            fi
            ;;
        netlify)
            if ! command -v netlify &> /dev/null; then
                echo -e "${YELLOW}Netlify CLI not found. Installing...${RESET}"
                npm install -g netlify-cli || true
            fi
            if $AUTO; then
                netlify deploy --dir=dist --prod || { echo "netlify deploy failed"; exit 1; }
            else
                echo -e "Run: netlify deploy --dir=dist --prod to deploy.${RESET}"
            fi
            ;;
        cloudflare)
            if $AUTO; then
                npx wrangler pages deploy dist --project-name=reed-apparel || { echo "wrangler deploy failed"; exit 1; }
            else
                echo -e "Run: npx wrangler pages deploy dist --project-name=reed-apparel${RESET}"
            fi
            ;;
        github|gh)
            if $AUTO; then
                npx gh-pages -d dist || { echo "gh-pages deploy failed"; exit 1; }
            else
                echo -e "Run: npm run deploy (or npx gh-pages -d dist) to publish to GitHub Pages.${RESET}"
            fi
            ;;
        firebase)
            if ! command -v firebase &> /dev/null; then
                echo -e "${YELLOW}Firebase CLI not found. Installing...${RESET}"
                npm install -g firebase-tools || true
            fi
            if [ ! -f "firebase.json" ]; then
                echo -e "${RED}firebase.json not found. Please run 'firebase init hosting' first or provide a configured firebase.json.${RESET}"
                exit 1
            fi
            if $AUTO; then
                firebase deploy --only hosting || { echo "firebase deploy failed"; exit 1; }
            else
                echo -e "Run: firebase deploy --only hosting to publish.${RESET}"
            fi
            ;;
        nginx)
            echo -e "${CYAN}Nginx/static server selected. Please upload contents of dist/ to your webserver.${RESET}"
            ;;
        *)
            echo -e "Unknown provider: $SEL_PROVIDER"
            ;;
    esac
    echo ""
    echo -e "${CYAN}Done.${RESET}"
    exit 0
fi

# If we reach here, fall back to interactive menu (original behavior)
echo -e "${CYAN}${BOLD}🌐 DEPLOYMENT DIRECTORY & ACTIONS:${RESET}"
echo -e "The ${BOLD}dist/${RESET} folder contains clean, self-contained HTML (with embedded Tailwind CSS"
echo -e "and bundled JS). It is compatible with any modern static web hosting provider."
echo ""
echo -e "${BOLD}Select a platform below to see hosting instructions:${RESET}"
echo -e "  [1] Vercel"
echo -e "  [2] Netlify"
echo -e "  [3] Cloudflare Pages"
echo -e "  [4] GitHub Pages"
echo -e "  [5] Nginx / Traditional Linux Server"
echo -e "  [6] Exit"
echo ""

read -p "Enter Choice [1-6]: " choice
echo ""

case $choice in
    1)
        echo -e "${CYAN}${BOLD}▲ DEPLOYING TO VERCEL:${RESET}"
        echo -e "1. Install the Vercel CLI globally (if not already installed):"
        echo -e "   ${BOLD}npm install -g vercel${RESET}"
        echo -e "2. Run deployment command in your project root:"
        echo -e "   ${BOLD}vercel${RESET}"
        echo -e "3. When prompted for settings, choose default options. Vercel automatically"
        echo -e "   detects Vite and deploys the ${BOLD}dist/${RESET} folder."
        echo -e "4. For instant production deployments bypassing preview checks:"
        echo -e "   ${BOLD}vercel --prod${RESET}"
        ;;
    2)
        echo -e "${CYAN}${BOLD}◈ DEPLOYING TO NETLIFY:${RESET}"
        echo -e "1. Install the Netlify CLI globally:"
        echo -e "   ${BOLD}npm install -g netlify-cli${RESET}"
        echo -e "2. Authenticate Netlify CLI with your account:"
        echo -e "   ${BOLD}netlify login${RESET}"
        echo -e "3. Initialize and deploy:"
        echo -e "   ${BOLD}netlify deploy --dir=dist${RESET}"
        echo -e "4. Push securely straight to production (live site):"
        echo -e "   ${BOLD}netlify deploy --dir=dist --prod${RESET}"
        ;;
    3)
        echo -e "${CYAN}${BOLD}⚡ DEPLOYING TO CLOUDFLARE PAGES:${RESET}"
        echo -e "1. Use Wrangler (Cloudflare's CLI helper):"
        echo -e "   ${BOLD}npx wrangler pages deploy dist --project-name=reed-apparel${RESET}"
        echo -e "2. Alternatively, authenticate on dash.cloudflare.com, create a new Pages project,"
        echo -e "   link this GitHub repository, and specify standard build settings:"
        echo -e "   - Framework Preset: ${BOLD}Vite${RESET}"
        echo -e "   - Build Command:    ${BOLD}npm run build${RESET}"
        echo -e "   - Build Output:     ${BOLD}dist${RESET}"
        ;;
    4)
        echo -e "${CYAN}${BOLD}🐙 DEPLOYING TO GITHUB PAGES:${RESET}"
        echo -e "1. Install the gh-pages helper package:"
        echo -e "   ${BOLD}npm install --save-dev gh-pages${RESET}"
        echo -e "2. Add deployment scripts to your package.json:"
        echo -e "   ${BOLD}\"predeploy\": \"npm run build\",${RESET}"
        echo -e "   ${BOLD}\"deploy\": \"gh-pages -d dist\"${RESET}"
        echo -e "3. Configure 'homepage' domain key in package.json:"
        echo -e "   ${BOLD}\"homepage\": \"https://<your-username>.github.io/<your-repo-name>\"${RESET}"
        echo -e "4. Trigger the deploy:"
        echo -e "   ${BOLD}npm run deploy${RESET}"
        ;;
    5)
        echo -e "${CYAN}${BOLD}⚙️ TRADITIONAL NGINX SERVER CONFIGURATION:${RESET}"
        echo -e "1. Upload files inside the ${BOLD}dist/${RESET} directory onto your Linux server at ${BOLD}/var/www/reedapparel${RESET}"
        echo -e "2. Add the following Virtual Host template inside your Nginx config file (${BOLD}/etc/nginx/sites-available/default${RESET}):"
        echo -e "   ------------------------------------------------------------------"
        echo -e "   ${YELLOW}server {${RESET}"
        echo -e "   ${YELLOW}    listen 80;${RESET}"
        echo -e "   ${YELLOW}    server_name yourdomain.com;${RESET}"
        echo -e "   ${YELLOW}    root /var/www/reedapparel;${RESET}"
        echo -e "   ${YELLOW}    index index.html;${RESET}"
        echo -e "   ${YELLOW}    location / {${RESET}"
        echo -e "   ${YELLOW}        try_files \\$uri \\$uri/ /index.html;${RESET}"
        echo -e "   ${YELLOW}    }${RESET}"
        echo -e "   ${YELLOW}}${RESET}"
        echo -e "   ------------------------------------------------------------------"
        echo -e "3. Reload Nginx configs: ${BOLD}sudo systemctl restart nginx${RESET}"
        ;;
    *)
        echo -e "Exiting deployment shell. Keep making beautiful updates!"
        ;;
esac

echo ""
echo -e "${CYAN}Read DEPLOYMENT.md in your project root for extensive configuration guides.${RESET}"
echo ""
