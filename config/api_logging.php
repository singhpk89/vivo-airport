<?php

return [

    /*
    |--------------------------------------------------------------------------
    | API Logging Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for API request/response logging.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Enable API Logging
    |--------------------------------------------------------------------------
    |
    | Set to true to enable API request/response logging.
    | You can disable this in production if needed for performance.
    |
    */
    'enabled' => env('API_LOGGING_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Log File Settings
    |--------------------------------------------------------------------------
    |
    | Configure how log files are managed and rotated.
    |
    */
    'log_files' => [
        'retention_days' => env('API_LOG_RETENTION_DAYS', 30),
        'max_file_size' => env('API_LOG_MAX_FILE_SIZE', '50MB'),
        'daily_rotation' => env('API_LOG_DAILY_ROTATION', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging Levels
    |--------------------------------------------------------------------------
    |
    | Configure what types of requests/responses to log.
    |
    */
    'levels' => [
        'log_requests' => env('API_LOG_REQUESTS', true),
        'log_responses' => env('API_LOG_RESPONSES', true),
        'log_errors_only' => env('API_LOG_ERRORS_ONLY', false),
        'log_successful_only' => env('API_LOG_SUCCESSFUL_ONLY', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Request Filtering
    |--------------------------------------------------------------------------
    |
    | Configure which requests should be logged or excluded.
    |
    */
    'filters' => [
        // Exclude specific routes from logging
        'exclude_routes' => [
            'api/test',
            'up', // Health check
        ],

        // Exclude specific HTTP methods
        'exclude_methods' => [
            // 'OPTIONS',
        ],

        // Only log specific status codes (empty = log all)
        'include_status_codes' => [
            // 400, 401, 403, 404, 422, 500
        ],

        // Exclude specific status codes
        'exclude_status_codes' => [
            // 200, 201
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Data Sanitization
    |--------------------------------------------------------------------------
    |
    | Configure which data should be sanitized/redacted in logs.
    |
    */
    'sanitization' => [
        // Headers to redact
        'sensitive_headers' => [
            'authorization',
            'cookie',
            'x-api-key',
            'x-auth-token',
            'x-csrf-token',
        ],

        // Request/Response fields to redact
        'sensitive_fields' => [
            'password',
            'password_confirmation',
            'current_password',
            'token',
            'api_key',
            'secret',
            'private_key',
            'credit_card',
            'ssn',
        ],

        // Truncate long values (in characters)
        'max_field_length' => 1000,

        // Truncate response body if larger than (in characters)
        'max_response_length' => 5000,
    ],

    /*
    |--------------------------------------------------------------------------
    | Performance Settings
    |--------------------------------------------------------------------------
    |
    | Configure performance-related settings for logging.
    |
    */
    'performance' => [
        // Log slow requests (in milliseconds)
        'slow_request_threshold' => env('API_LOG_SLOW_THRESHOLD', 1000),

        // Log memory usage
        'log_memory_usage' => env('API_LOG_MEMORY_USAGE', false),

        // Use queue for logging (async)
        'use_queue' => env('API_LOG_USE_QUEUE', false),
        'queue_connection' => env('API_LOG_QUEUE_CONNECTION', 'default'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Format Settings
    |--------------------------------------------------------------------------
    |
    | Configure log formatting options.
    |
    */
    'format' => [
        'include_stack_trace' => env('API_LOG_STACK_TRACE', false),
        'pretty_print_json' => env('API_LOG_PRETTY_JSON', true),
        'include_request_id' => env('API_LOG_REQUEST_ID', true),
        'include_user_agent' => env('API_LOG_USER_AGENT', true),
        'include_ip_address' => env('API_LOG_IP_ADDRESS', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Storage Settings
    |--------------------------------------------------------------------------
    |
    | Configure where and how logs are stored.
    |
    */
    'storage' => [
        'driver' => env('API_LOG_STORAGE_DRIVER', 'file'), // file, database, s3
        'path' => env('API_LOG_STORAGE_PATH', storage_path('logs')),
        'compress_old_files' => env('API_LOG_COMPRESS_OLD', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Database Storage (if using database driver)
    |--------------------------------------------------------------------------
    |
    | Configuration for database-based log storage.
    |
    */
    'database' => [
        'connection' => env('API_LOG_DB_CONNECTION', 'default'),
        'table' => env('API_LOG_DB_TABLE', 'api_logs'),
        'cleanup_after_days' => env('API_LOG_DB_CLEANUP_DAYS', 30),
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Settings
    |--------------------------------------------------------------------------
    |
    | Security-related configuration for API logging.
    |
    */
    'security' => [
        'log_authentication_attempts' => env('API_LOG_AUTH_ATTEMPTS', true),
        'log_authorization_failures' => env('API_LOG_AUTH_FAILURES', true),
        'alert_on_suspicious_activity' => env('API_LOG_SECURITY_ALERTS', false),
        'suspicious_request_threshold' => env('API_LOG_SUSPICIOUS_THRESHOLD', 100),
    ],

];
