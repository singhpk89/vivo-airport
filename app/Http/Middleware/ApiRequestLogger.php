<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ApiRequestLogger
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if logging is enabled
        if (!config('api_logging.enabled', true)) {
            return $next($request);
        }

        // Check if this route should be excluded
        if ($this->shouldExcludeRequest($request)) {
            return $next($request);
        }

        $startTime = microtime(true);
        $memoryStart = memory_get_usage(true);
        $requestId = Str::uuid()->toString();

        // Log the incoming request
        if (config('api_logging.levels.log_requests', true)) {
            $this->logRequest($request, $requestId);
        }

        // Process the request
        $response = $next($request);

        $endTime = microtime(true);
        $memoryEnd = memory_get_usage(true);
        $duration = round(($endTime - $startTime) * 1000, 2); // Duration in milliseconds
        $memoryUsage = $memoryEnd - $memoryStart;

        // Log the response
        if (config('api_logging.levels.log_responses', true)) {
            $this->logResponse($request, $response, $requestId, $duration, $memoryUsage);
        }

        return $response;
    }

    /**
     * Check if request should be excluded from logging
     */
    private function shouldExcludeRequest(Request $request): bool
    {
        $excludeRoutes = config('api_logging.filters.exclude_routes', []);
        $excludeMethods = config('api_logging.filters.exclude_methods', []);

        // Check excluded routes
        foreach ($excludeRoutes as $route) {
            if (Str::is($route, $request->path())) {
                return true;
            }
        }

        // Check excluded methods
        if (in_array($request->method(), $excludeMethods)) {
            return true;
        }

        return false;
    }

    /**
     * Check if response should be logged based on status code
     */
    private function shouldLogResponse($statusCode): bool
    {
        $includeStatusCodes = config('api_logging.filters.include_status_codes', []);
        $excludeStatusCodes = config('api_logging.filters.exclude_status_codes', []);

        // If include list is specified, only log those status codes
        if (!empty($includeStatusCodes) && !in_array($statusCode, $includeStatusCodes)) {
            return false;
        }

        // If exclude list is specified, don't log those status codes
        if (!empty($excludeStatusCodes) && in_array($statusCode, $excludeStatusCodes)) {
            return false;
        }

        // Check error-only or successful-only logging
        if (config('api_logging.levels.log_errors_only', false) && $statusCode < 400) {
            return false;
        }

        if (config('api_logging.levels.log_successful_only', false) && $statusCode >= 400) {
            return false;
        }

        return true;
    }

    /**
     * Log the incoming request
     */
    private function logRequest(Request $request, string $requestId): void
    {
        $headers = $this->sanitizeHeaders($request->headers->all());
        $body = $this->sanitizeBody($request->all());

        $logData = [
            'request_id' => $requestId,
            'timestamp' => Carbon::now()->toISOString(),
            'type' => 'REQUEST',
            'method' => $request->getMethod(),
            'url' => $request->fullUrl(),
            'uri' => $request->getRequestUri(),
            'ip' => $request->ip(),
            'user_agent' => config('api_logging.format.include_user_agent', true) ? $request->userAgent() : null,
            'headers' => $headers,
            'query_params' => $request->query(),
            'body' => $body,
            'content_type' => $request->header('Content-Type'),
            'content_length' => $request->header('Content-Length'),
            'user_id' => Auth::id(),
            'user_type' => $this->getUserType($request),
        ];

        // Write to daily log file
        $this->writeToLogFile($logData, 'api-requests');

        // Also log to Laravel's default log
        Log::channel('daily')->info('API Request', [
            'request_id' => $requestId,
            'method' => $request->getMethod(),
            'url' => $request->fullUrl(),
            'user_id' => Auth::id(),
        ]);
    }

    /**
     * Log the outgoing response
     */
    private function logResponse(Request $request, $response, string $requestId, float $duration, int $memoryUsage = 0): void
    {
        $responseHeaders = [];
        $responseBody = null;
        $statusCode = 200;

        if ($response instanceof Response) {
            $responseHeaders = $response->headers->all();
            $responseBody = $this->sanitizeResponseBody($response->getContent());
            $statusCode = $response->getStatusCode();
        } elseif (method_exists($response, 'headers')) {
            $responseHeaders = $response->headers->all();
            $statusCode = $response->getStatusCode();

            if (method_exists($response, 'getContent')) {
                $responseBody = $this->sanitizeResponseBody($response->getContent());
            }
        }

        // Check if we should log this response
        if (!$this->shouldLogResponse($statusCode)) {
            return;
        }

        $logData = [
            'request_id' => $requestId,
            'timestamp' => Carbon::now()->toISOString(),
            'type' => 'RESPONSE',
            'method' => $request->getMethod(),
            'url' => $request->fullUrl(),
            'status_code' => $statusCode,
            'status_text' => $this->getStatusText($statusCode),
            'duration_ms' => $duration,
            'memory_usage_bytes' => config('api_logging.performance.log_memory_usage', false) ? $memoryUsage : null,
            'memory_usage_mb' => config('api_logging.performance.log_memory_usage', false) ? round($memoryUsage / 1024 / 1024, 2) : null,
            'headers' => $this->sanitizeHeaders($responseHeaders),
            'body' => $responseBody,
            'user_id' => Auth::id(),
            'user_type' => $this->getUserType($request),
            'is_slow_request' => $duration > config('api_logging.performance.slow_request_threshold', 1000),
        ];

        // Write to daily log file
        $this->writeToLogFile($logData, 'api-responses');

        // Log slow requests separately
        if ($logData['is_slow_request']) {
            Log::channel('daily')->warning('Slow API Request', [
                'request_id' => $requestId,
                'method' => $request->getMethod(),
                'url' => $request->fullUrl(),
                'duration_ms' => $duration,
                'user_id' => Auth::id(),
            ]);
        }

        // Log errors separately
        if ($statusCode >= 400) {
            $this->writeToLogFile($logData, 'api-errors');
        }

        // Also log to Laravel's default log
        Log::channel('daily')->info('API Response', [
            'request_id' => $requestId,
            'method' => $request->getMethod(),
            'url' => $request->fullUrl(),
            'status_code' => $statusCode,
            'duration_ms' => $duration,
            'user_id' => Auth::id(),
        ]);
    }

    /**
     * Write formatted log data to daily log file
     */
    private function writeToLogFile(array $logData, string $logType): void
    {
        $date = Carbon::now()->format('Y-m-d');
        $logFileName = storage_path("logs/{$logType}-{$date}.log");

        // Ensure log directory exists
        $logDir = dirname($logFileName);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        // Format the log entry
        $formattedLog = $this->formatLogEntry($logData);

        // Write to file
        file_put_contents($logFileName, $formattedLog . PHP_EOL, FILE_APPEND | LOCK_EX);
    }

    /**
     * Format log entry for better readability
     */
    private function formatLogEntry(array $logData): string
    {
        $separator = str_repeat('=', 80);
        $minorSeparator = str_repeat('-', 40);

        $formatted = PHP_EOL . $separator . PHP_EOL;
        $formatted .= sprintf(
            "[%s] %s %s %s",
            $logData['timestamp'],
            $logData['type'],
            $logData['method'] ?? '',
            $logData['url'] ?? ''
        ) . PHP_EOL;

        if (isset($logData['request_id'])) {
            $formatted .= "Request ID: {$logData['request_id']}" . PHP_EOL;
        }

        if (isset($logData['status_code'])) {
            $formatted .= sprintf(
                "Status: %d %s | Duration: %s ms",
                $logData['status_code'],
                $logData['status_text'] ?? '',
                $logData['duration_ms'] ?? 'N/A'
            ) . PHP_EOL;
        }

        if (isset($logData['ip'])) {
            $formatted .= "IP: {$logData['ip']}" . PHP_EOL;
        }

        if (isset($logData['user_id']) && $logData['user_id']) {
            $formatted .= "User ID: {$logData['user_id']} ({$logData['user_type']})" . PHP_EOL;
        }

        if (isset($logData['user_agent'])) {
            $formatted .= "User Agent: {$logData['user_agent']}" . PHP_EOL;
        }

        // Headers
        if (!empty($logData['headers'])) {
            $formatted .= PHP_EOL . $minorSeparator . PHP_EOL;
            $formatted .= "HEADERS:" . PHP_EOL;
            $formatted .= $this->formatArray($logData['headers'], 1);
        }

        // Query Parameters
        if (!empty($logData['query_params'])) {
            $formatted .= PHP_EOL . $minorSeparator . PHP_EOL;
            $formatted .= "QUERY PARAMETERS:" . PHP_EOL;
            $formatted .= $this->formatArray($logData['query_params'], 1);
        }

        // Body
        if (!empty($logData['body'])) {
            $formatted .= PHP_EOL . $minorSeparator . PHP_EOL;
            $formatted .= "BODY:" . PHP_EOL;
            if (is_string($logData['body'])) {
                // Try to format as JSON if possible
                $decoded = json_decode($logData['body'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $formatted .= json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL;
                } else {
                    $formatted .= $logData['body'] . PHP_EOL;
                }
            } else {
                $formatted .= $this->formatArray($logData['body'], 1);
            }
        }

        $formatted .= $separator;

        return $formatted;
    }

    /**
     * Format array data for logging
     */
    private function formatArray(array $data, int $indent = 0): string
    {
        $indentStr = str_repeat('  ', $indent);
        $result = '';

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $result .= $indentStr . $key . ":" . PHP_EOL;
                $result .= $this->formatArray($value, $indent + 1);
            } else {
                $result .= $indentStr . $key . ": " . $this->formatValue($value) . PHP_EOL;
            }
        }

        return $result;
    }

    /**
     * Format individual values
     */
    private function formatValue($value): string
    {
        if (is_null($value)) {
            return '[null]';
        }

        if (is_bool($value)) {
            return $value ? '[true]' : '[false]';
        }

        if (is_string($value) && strlen($value) > 500) {
            return substr($value, 0, 500) . '... [truncated]';
        }

        return (string) $value;
    }

    /**
     * Sanitize headers to remove sensitive information
     */
    private function sanitizeHeaders(array $headers): array
    {
        $sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];

        foreach ($sensitiveHeaders as $header) {
            if (isset($headers[$header])) {
                $headers[$header] = ['[REDACTED]'];
            }
        }

        return $headers;
    }

    /**
     * Sanitize request body to remove sensitive information
     */
    private function sanitizeBody(array $body): array
    {
        $sensitiveFields = ['password', 'password_confirmation', 'current_password', 'token', 'api_key'];

        return $this->recursiveSanitize($body, $sensitiveFields);
    }

    /**
     * Sanitize response body
     */
    private function sanitizeResponseBody(?string $content): ?string
    {
        if (!$content) {
            return null;
        }

        // Try to decode JSON and sanitize
        $decoded = json_decode($content, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $sensitiveFields = ['password', 'token', 'api_key', 'secret'];
            $sanitized = $this->recursiveSanitize($decoded, $sensitiveFields);
            return json_encode($sanitized, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }

        return $content;
    }

    /**
     * Recursively sanitize array data
     */
    private function recursiveSanitize(array $data, array $sensitiveFields): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->recursiveSanitize($value, $sensitiveFields);
            } elseif (in_array(strtolower($key), $sensitiveFields)) {
                $data[$key] = '[REDACTED]';
            }
        }

        return $data;
    }

    /**
     * Get user type based on request
     */
    private function getUserType(Request $request): string
    {
        if (str_starts_with($request->getPathInfo(), '/api/mobile')) {
            return 'mobile';
        }

        if (str_starts_with($request->getPathInfo(), '/api/')) {
            return 'admin';
        }

        return 'unknown';
    }

    /**
     * Get HTTP status text
     */
    private function getStatusText(int $statusCode): string
    {
        $statusTexts = [
            200 => 'OK',
            201 => 'Created',
            204 => 'No Content',
            400 => 'Bad Request',
            401 => 'Unauthorized',
            403 => 'Forbidden',
            404 => 'Not Found',
            422 => 'Unprocessable Entity',
            500 => 'Internal Server Error',
        ];

        return $statusTexts[$statusCode] ?? 'Unknown';
    }
}
