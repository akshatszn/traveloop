#!/usr/bin/env bash
set -e

echo ""
echo "🌍 Traveloop — Local Setup"
echo "=========================="
echo ""

# Check Node version
NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20+ required. Download from https://nodejs.org"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# Check env files exist
if [ ! -f "apps/api/.env" ]; then
  cp apps/api/.env.example apps/api/.env
  echo ""
  echo "⚠️  Created apps/api/.env — EDIT THIS FILE BEFORE CONTINUING:"
  echo "   1. Set DATABASE_URL to your Neon/PostgreSQL connection string"
  echo "   2. Set JWT_SECRET to any 32+ character random string"
  echo ""
  echo "   Get a free DB at: https://neon.tech"
  echo ""
  read -p "Press ENTER once you've filled in apps/api/.env ..."
fi

if [ ! -f "apps/web/.env.local" ]; then
  cp apps/web/.env.local.example apps/web/.env.local
  echo "✅ Created apps/web/.env.local"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Setting up database..."
npm run db:generate
npm run db:migrate
npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "Run the app with:"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo "Login:     demo@traveloop.ai / Traveloop2026!"
echo ""
