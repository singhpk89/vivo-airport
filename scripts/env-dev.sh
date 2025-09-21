#!/bin/bash
# Switch to Development Environment

echo "🔄 Switching to Development Environment..."

# Copy development environment file
cp .env.development .env

echo "✅ Development environment activated!"
echo "📝 API URL: https://lic.test/api"
echo "🗄️  Database: SQLite"
echo "📧 Mail: Log driver"
echo ""
echo "To start development server, run:"
echo "npm run dev"
