#!/bin/bash

# US Prosthetix CRM - GitHub Pages Deployment Script

echo "🚀 Deploying US Prosthetix CRM to GitHub Pages..."

# Build with production environment variables
VITE_SUPABASE_URL=https://kdffnaqxnxuapduwxhpa.supabase.co \
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmZuYXF4bnh1YXBkdXd4aHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MjM4NTgsImV4cCI6MjA3OTA5OTg1OH0.Ci_kR-AC5-I3vsPtB5a1U9OJ06VhDhgKC7lhu2e5KO0 \
VITE_IS_DEMO=false \
npm run build

# Deploy to GitHub Pages
npx gh-pages -d dist -b gh-pages -m "Deploy $(date '+%Y-%m-%d %H:%M:%S')"

echo "✅ Deployment complete!"
echo "🌐 Your site will be live at: https://mfd3000.github.io/atomic-crm/"
