#!/bin/bash
# Switch to Production Environment

echo "🔄 Switching to Production Environment..."

# Copy production environment file
cp .env.production .env

echo "⚠️  Production environment activated!"
echo "📝 API URL: https://your-production-domain.com/api"
echo "🗄️  Database: MySQL"
echo "📧 Mail: SMTP"
echo "🔒 Security: Enhanced (HTTPS cookies, Redis sessions)"
echo ""
echo "⚠️  WARNING: This is PRODUCTION configuration!"
echo "Make sure to update the following before deployment:"
echo "- Update APP_URL to your actual domain"
echo "- Update VITE_API_URL_PROD to your actual API URL"
echo "- Configure database credentials"
echo "- Configure mail settings"
echo "- Update SANCTUM_STATEFUL_DOMAINS"
echo ""
echo "To build for production, run:"
echo "npm run build"
