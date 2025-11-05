#!/bin/bash

# Database Migration Script
# This script runs Prisma migrations and generates the client

set -e

echo "🔄 Running database migrations..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    exit 1
fi

# Change to the API directory
cd "$(dirname "$0")/../apps/api"

# Generate Prisma client
echo "📦 Generating Prisma client..."
bunx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
bunx prisma migrate deploy

# Optional: Run prisma db push for development (uncomment if needed)
# echo "🔄 Pushing schema changes..."
# bunx prisma db push

echo "✅ Database migrations completed successfully!"