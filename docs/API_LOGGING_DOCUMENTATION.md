# API Request/Response Logging System

## Overview

The LI Council application includes a comprehensive API logging system that captures detailed information about every API request and response. This system is designed to help with debugging, monitoring, security auditing, and performance analysis.

## Features

### 🔍 **Comprehensive Logging**
- **Request Logging**: Method, URL, headers, body, IP address, user agent
- **Response Logging**: Status code, headers, body, duration, memory usage
- **User Tracking**: User ID and user type (mobile/admin)
- **Performance Monitoring**: Request duration and memory usage tracking
- **Error Logging**: Separate logging for API errors and slow requests

### 📁 **Daily Log Files**
- Separate log files for requests, responses, and errors
- Daily rotation with configurable retention period
- Formatted output for easy reading and analysis
- JSON structure for programmatic processing

### 🛡️ **Security & Privacy**
- Automatic sanitization of sensitive data (passwords, tokens, API keys)
- Configurable field redaction
- IP address and user agent tracking for security auditing
- Request ID correlation between requests and responses

### ⚡ **Performance Optimized**
- Configurable logging levels and filters
- Memory usage tracking
- Slow request detection and alerting
- Optional async logging via queues

## Log File Structure

### Daily Log Files
Log files are created daily in the `storage/logs/` directory:

```
storage/logs/
├── api-requests-2024-01-15.log    # All API requests
├── api-responses-2024-01-15.log   # All API responses  
├── api-errors-2024-01-15.log      # Error responses (4xx, 5xx)
└── laravel-2024-01-15.log         # Standard Laravel logs
```

### Log Entry Format

Each log entry includes:

```
================================================================================
[2024-01-15T14:30:25.123456Z] REQUEST POST https://li-council.uplive.at/api/mobile/activities
Request ID: 550e8400-e29b-41d4-a716-446655440000
IP: 192.168.1.100
User ID: 123 (mobile)
User Agent: Mozilla/5.0 (Android 10; Mobile) AppleWebKit/537.36

----------------------------------------
HEADERS:
  content-type: application/json
  authorization: [REDACTED]
  accept: application/json
  user-agent: Mozilla/5.0 (Android 10; Mobile) AppleWebKit/537.36
  x-requested-with: XMLHttpRequest

----------------------------------------
QUERY PARAMETERS:
  page: 1
  per_page: 15

----------------------------------------
BODY:
{
  "visit_date": "2024-01-15",
  "activity_type": "recce",
  "location": "Near Hebbal Lake",
  "village": "Hebbal",
  "latitude": 13.0358,
  "longitude": 77.5970,
  "remarks": "Good location for survey"
}
================================================================================
```

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# API Logging Configuration
API_LOGGING_ENABLED=true
API_LOG_RETENTION_DAYS=30
API_LOG_REQUESTS=true
API_LOG_RESPONSES=true
API_LOG_MEMORY_USAGE=true
API_LOG_SLOW_THRESHOLD=1000
API_LOG_PRETTY_JSON=true
```

### Configuration File

The logging system is configured via `config/api_logging.php`:

```php
return [
    'enabled' => env('API_LOGGING_ENABLED', true),
    
    'filters' => [
        'exclude_routes' => ['api/test', 'up'],
        'exclude_methods' => [],
        'include_status_codes' => [],
        'exclude_status_codes' => [],
    ],
    
    'sanitization' => [
        'sensitive_headers' => ['authorization', 'cookie', 'x-api-key'],
        'sensitive_fields' => ['password', 'token', 'api_key'],
        'max_field_length' => 1000,
        'max_response_length' => 5000,
    ],
    
    'performance' => [
        'slow_request_threshold' => 1000, // milliseconds
        'log_memory_usage' => true,
        'use_queue' => false,
    ],
];
```

## Usage

### Viewing Logs

#### Using Artisan Command

View recent API logs:
```bash
# View latest 50 request logs
php artisan api:logs requests

# View response logs for specific date
php artisan api:logs responses --date=2024-01-15

# Filter by user ID
php artisan api:logs requests --user=123

# Filter by HTTP method
php artisan api:logs requests --method=POST

# Filter by status code
php artisan api:logs responses --status=500

# Search for specific text
php artisan api:logs requests --filter="activities"

# Clear old log files (older than retention period)
php artisan api:logs --clear
```

#### Direct File Access

Access log files directly:
```bash
# View today's request logs
tail -f storage/logs/api-requests-$(date +%Y-%m-%d).log

# View error logs
tail -f storage/logs/api-errors-$(date +%Y-%m-%d).log

# Search for specific request ID
grep "550e8400-e29b-41d4-a716-446655440000" storage/logs/api-*.log
```

### Testing the Logging System

Test endpoints are available to verify logging:

```bash
# Test basic logging
curl -X GET https://li-council.uplive.at/api/test

# Test POST request logging
curl -X POST https://li-council.uplive.at/api/test-logging \
  -H "Content-Type: application/json" \
  -d '{"test": "data", "timestamp": "2024-01-15T14:30:00Z"}'

# Test slow request logging
curl -X GET https://li-council.uplive.at/api/test-slow

# Test error logging
curl -X GET https://li-council.uplive.at/api/test-error
```

## Log Analysis

### Common Analysis Tasks

#### 1. **Performance Monitoring**
```bash
# Find slow requests (>1 second)
grep "duration_ms.*[0-9][0-9][0-9][0-9]" storage/logs/api-responses-*.log

# Check memory usage patterns
grep "memory_usage_mb" storage/logs/api-responses-*.log
```

#### 2. **Error Analysis**
```bash
# View all 5xx errors
grep "Status: 5[0-9][0-9]" storage/logs/api-errors-*.log

# Check authentication failures
grep "Status: 401" storage/logs/api-responses-*.log
```

#### 3. **User Activity**
```bash
# Track specific user activity
grep "User ID: 123" storage/logs/api-requests-*.log

# Mobile vs Admin usage
grep "user_type.*mobile" storage/logs/api-requests-*.log
```

#### 4. **API Endpoint Usage**
```bash
# Most used endpoints
grep "REQUEST.*POST" storage/logs/api-requests-*.log | sort | uniq -c | sort -nr

# Check specific endpoint usage
grep "/api/mobile/activities" storage/logs/api-requests-*.log
```

### Log Rotation and Cleanup

Logs are automatically rotated daily. To manage disk space:

```bash
# Automatic cleanup (configured retention)
php artisan api:logs --clear

# Manual cleanup (specific date range)
find storage/logs -name "api-*-*.log" -mtime +30 -delete

# Compress old logs
find storage/logs -name "api-*-*.log" -mtime +7 -exec gzip {} \;
```

## Security Considerations

### Data Sanitization

The logging system automatically redacts sensitive information:

- **Headers**: `authorization`, `cookie`, `x-api-key`, `x-auth-token`
- **Fields**: `password`, `password_confirmation`, `token`, `api_key`, `secret`
- **Long Values**: Truncated to prevent log bloat

### Log File Security

Ensure log files are properly secured:

```bash
# Set proper permissions
chmod 640 storage/logs/api-*.log
chown www-data:www-data storage/logs/api-*.log

# Add to log rotation
echo 'storage/logs/api-*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 640 www-data www-data
}' > /etc/logrotate.d/li-council-api
```

## Troubleshooting

### Common Issues

#### 1. **Log Files Not Created**
```bash
# Check permissions
ls -la storage/logs/
chmod 755 storage/logs/

# Check middleware registration
grep -r "ApiRequestLogger" bootstrap/app.php
```

#### 2. **Missing Log Entries**
```bash
# Check if logging is enabled
php artisan config:show api_logging.enabled

# Verify middleware is applied
php artisan route:list --path=api
```

#### 3. **Large Log Files**
```bash
# Check file sizes
du -h storage/logs/api-*.log

# Configure shorter retention
# Set API_LOG_RETENTION_DAYS=7 in .env
```

#### 4. **Performance Impact**
```bash
# Enable async logging
# Set API_LOG_USE_QUEUE=true in .env

# Disable memory logging
# Set API_LOG_MEMORY_USAGE=false in .env
```

## Best Practices

### 1. **Monitoring Setup**
- Set up log monitoring alerts for error rates
- Monitor log file sizes and disk usage
- Create dashboards for API performance metrics

### 2. **Data Retention**
- Keep logs for compliance requirements (typically 30-90 days)
- Compress older logs to save disk space
- Archive critical logs for longer retention

### 3. **Performance Optimization**
- Use queue-based logging for high-traffic applications
- Exclude health check endpoints from logging
- Adjust log levels based on environment (less verbose in production)

### 4. **Security Auditing**
- Regularly review authentication failure logs
- Monitor for suspicious API usage patterns
- Alert on repeated failed authentication attempts

---

## API Endpoints Summary

All API endpoints are automatically logged with this system:

### Mobile API (`/api/mobile/*`)
- Authentication endpoints
- Activity management (CRUD operations)
- Route plan access
- Bulk operations

### Admin API (`/api/*`)
- User management
- Role and permission management
- Promoter management
- Route plan management
- Activity monitoring

The logging system provides complete visibility into API usage, performance, and security across all these endpoints.
