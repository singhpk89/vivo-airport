# API Documentation Setup

This directory contains comprehensive API documentation for the LI Council project, designed to help mobile app developers integrate with our backend APIs using AI MCP tools.

## Documentation Files

### 📋 Main Documentation
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API documentation with examples
- **[openapi.yaml](./openapi.yaml)** - OpenAPI 3.0 specification for Swagger/automated tools

### 🔧 Development Tools
- **[postman-collection.json](./docs/postman-collection.json)** - Postman collection for API testing
- **[api-examples/](./docs/api-examples/)** - Code examples in multiple languages

### 📱 Mobile-Specific Documentation
- **[mobile-integration-guide.md](./docs/mobile-integration-guide.md)** - Mobile app integration guide
- **[authentication-flow.md](./docs/authentication-flow.md)** - Authentication implementation guide

## Quick Start for Mobile Developers

### 1. **View API Documentation**
```bash
# View in browser with Swagger UI
npx swagger-ui-serve openapi.yaml

# Or use online viewer
# Upload openapi.yaml to https://editor.swagger.io/
```

### 2. **Test API Endpoints**
```bash
# Import Postman collection
# File > Import > docs/postman-collection.json
```

### 3. **Generate Client Code with AI**
Provide this documentation link to AI MCP tools:
- **Documentation URL**: `https://github.com/singhpk89/licouncil/blob/main/API_DOCUMENTATION.md`
- **OpenAPI Spec URL**: `https://github.com/singhpk89/licouncil/blob/main/openapi.yaml`

## AI MCP Integration

### For Code Generation
When using AI MCP tools to generate mobile app code, provide these resources:

1. **Main Documentation**: Link to `API_DOCUMENTATION.md`
2. **OpenAPI Specification**: Link to `openapi.yaml`
3. **Base URL**: `https://vair.test/api`

### Example AI Prompts
```
Generate Flutter/React Native code for LI Council API integration.
Documentation: https://github.com/singhpk89/licouncil/blob/main/API_DOCUMENTATION.md
OpenAPI Spec: https://github.com/singhpk89/licouncil/blob/main/openapi.yaml

Include:
- Authentication service
- Activity creation with image upload
- Route plans fetching
- Error handling
- Offline data sync
```

## API Endpoints Summary

### 🔐 Authentication
- `POST /mobile/auth/login` - Promoter login
- `GET /mobile/auth/profile` - Get profile
- `PUT /mobile/auth/profile` - Update profile
- `POST /mobile/auth/logout` - Logout

### 📍 Route Plans
- `GET /mobile/route-plans` - Get accessible route plans

### 🎯 Activities
- `GET /mobile/activities` - Get activities
- `POST /mobile/activities` - Create new activity

### 👑 Admin Endpoints
- `POST /auth/login` - Admin login
- `GET /promoters` - Promoter management
- `GET /activity-recces` - Activity management
- `GET /route-plans` - Route plan management

## Environment Configuration

### Production
```
Base URL: https://vair.test/api
Authentication: Bearer Token (Sanctum)
```

### Development
```
Base URL: http://localhost:8000/api
Authentication: Bearer Token (Sanctum)
```

## Rate Limiting
- Mobile endpoints: 60 requests/minute
- Admin endpoints: 100 requests/minute

## Support
For API questions or issues:
- Review documentation: `API_DOCUMENTATION.md`
- Check OpenAPI spec: `openapi.yaml`
- Test with Postman collection
- Contact development team

---

*Last Updated: August 24, 2025*
