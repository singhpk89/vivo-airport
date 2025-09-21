# Environment Configuration Guide

This project supports separate environment configurations for development and production deployments.

## 🔧 Environment Files

- `.env` - Current active environment (automatically generated)
- `.env.development` - Development environment template
- `.env.production` - Production environment template
- `.env.example` - Example environment file

## 🚀 Quick Environment Switching

### Windows (PowerShell/CMD)
```bash
# Switch to Development
scripts\env-dev.bat

# Switch to Production  
scripts\env-prod.bat
```

### Linux/Mac (Bash)
```bash
# Make scripts executable (first time only)
chmod +x scripts/*.sh

# Switch to Development
./scripts/env-dev.sh

# Switch to Production
./scripts/env-prod.sh
```

### Manual Switching
```bash
# Development
cp .env.development .env

# Production
cp .env.production .env
```

## 🌐 API URL Configuration

### Development Environment
- **Frontend API URL**: `https://lic.test/api`
- **Laravel Herd**: Automatically served at `https://lic.test`
- **Database**: SQLite (for easy development)
- **Cache**: File-based
- **Mail**: Log driver (emails saved to logs)

### Production Environment
- **Frontend API URL**: `https://your-production-domain.com/api`
- **Database**: MySQL/PostgreSQL
- **Cache**: Redis
- **Mail**: SMTP
- **Security**: Enhanced (HTTPS cookies, secure sessions)

## 📝 Environment Variables

### Frontend API Configuration
```env
# Development API URL
VITE_API_URL_DEV=https://lic.test/api

# Production API URL  
VITE_API_URL_PROD=https://your-production-domain.com/api

# Current active API URL (switches automatically)
VITE_API_URL=${VITE_API_URL_DEV}  # or ${VITE_API_URL_PROD}
```

### AuthContext Usage
The `AuthContext.jsx` automatically uses the correct API URL:
```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'https://lic.test/api';
```

## 🚀 Deployment Workflows

### Development Deployment
```bash
# 1. Switch to development environment
scripts\env-dev.bat  # Windows
./scripts/env-dev.sh # Linux/Mac

# 2. Start development server
npm run dev
```

### Production Deployment
```bash
# 1. Switch to production environment
scripts\env-prod.bat  # Windows
./scripts/env-prod.sh # Linux/Mac

# 2. Update production settings in .env.production:
# - APP_URL=https://your-actual-domain.com
# - VITE_API_URL_PROD=https://your-actual-domain.com/api
# - Database credentials
# - Mail settings
# - SANCTUM_STATEFUL_DOMAINS

# 3. Build for production
npm run build

# 4. Deploy built files from dist/ folder
```

## ⚙️ Production Checklist

Before deploying to production, ensure you update these settings in `.env.production`:

- [ ] `APP_URL` - Your actual production domain
- [ ] `VITE_API_URL_PROD` - Your actual production API URL
- [ ] Database credentials (MySQL/PostgreSQL)
- [ ] Mail configuration (SMTP settings)
- [ ] `SANCTUM_STATEFUL_DOMAINS` - Your production domain
- [ ] `SESSION_DOMAIN` - Your production domain
- [ ] Redis configuration (if using Redis)
- [ ] SSL/Security settings

## 🔄 Environment Variable Precedence

1. **Current `.env` file** (highest priority)
2. **Environment template files** (`.env.development`, `.env.production`)
3. **System environment variables**
4. **Default values in code** (lowest priority)

## 🛠️ Troubleshooting

### API URL Not Updating
1. Restart Vite development server: `npm run dev`
2. Clear browser cache
3. Check if `VITE_API_URL` is correctly set in `.env`

### Environment Not Switching
1. Verify `.env` file was copied correctly
2. Check file permissions
3. Restart development server

### Production Build Issues
1. Ensure all production environment variables are set
2. Check console for environment variable errors
3. Verify API URLs are accessible

## 📱 Mobile Development

For mobile app development, the API URLs will automatically adjust based on the environment:

**Development**: `https://lic.test/api`
**Production**: `https://your-production-domain.com/api`

The mobile app should use the same base URL for all API calls.
