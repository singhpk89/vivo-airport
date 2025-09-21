<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;

class ApiLogViewer extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'api:logs
                            {type=requests : Type of logs to view (requests, responses, errors)}
                            {--date= : Date to view logs for (Y-m-d format)}
                            {--tail=50 : Number of lines to show from the end}
                            {--filter= : Filter logs by specific text}
                            {--user= : Filter by user ID}
                            {--method= : Filter by HTTP method}
                            {--status= : Filter by status code}
                            {--clear : Clear old log files}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'View and manage API logs';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if ($this->option('clear')) {
            return $this->clearOldLogs();
        }

        $type = $this->argument('type');
        $date = $this->option('date') ?: Carbon::now()->format('Y-m-d');

        $logFile = storage_path("logs/api-{$type}-{$date}.log");

        if (!File::exists($logFile)) {
            $this->error("Log file not found: {$logFile}");
            return 1;
        }

        $this->info("Viewing API {$type} logs for {$date}");
        $this->line(str_repeat('=', 60));

        $content = File::get($logFile);
        $lines = explode(PHP_EOL, $content);

        // Apply filters
        $filteredLines = $this->applyFilters($lines);

        // Show tail
        $tail = (int) $this->option('tail');
        if ($tail > 0) {
            $filteredLines = array_slice($filteredLines, -$tail);
        }

        foreach ($filteredLines as $line) {
            if (trim($line)) {
                $this->line($line);
            }
        }

        $this->line(str_repeat('=', 60));
        $this->info("Showing " . count($filteredLines) . " lines");

        return 0;
    }

    /**
     * Apply filters to log lines
     */
    private function applyFilters(array $lines): array
    {
        $filtered = $lines;

        if ($filter = $this->option('filter')) {
            $filtered = array_filter($filtered, function ($line) use ($filter) {
                return stripos($line, $filter) !== false;
            });
        }

        if ($userId = $this->option('user')) {
            $filtered = array_filter($filtered, function ($line) use ($userId) {
                return stripos($line, "User ID: {$userId}") !== false;
            });
        }

        if ($method = $this->option('method')) {
            $filtered = array_filter($filtered, function ($line) use ($method) {
                return stripos($line, strtoupper($method)) !== false;
            });
        }

        if ($status = $this->option('status')) {
            $filtered = array_filter($filtered, function ($line) use ($status) {
                return stripos($line, "Status: {$status}") !== false;
            });
        }

        return array_values($filtered);
    }

    /**
     * Clear old log files
     */
    private function clearOldLogs(): int
    {
        $days = 30; // Keep logs for 30 days
        $cutoffDate = Carbon::now()->subDays($days);

        $logDir = storage_path('logs');
        $files = File::glob($logDir . '/api-*-*.log');

        $deletedCount = 0;

        foreach ($files as $file) {
            $filename = basename($file);

            // Extract date from filename (api-requests-2024-01-15.log)
            if (preg_match('/api-\w+-(\d{4}-\d{2}-\d{2})\.log$/', $filename, $matches)) {
                $fileDate = Carbon::parse($matches[1]);

                if ($fileDate->isBefore($cutoffDate)) {
                    File::delete($file);
                    $deletedCount++;
                    $this->info("Deleted: {$filename}");
                }
            }
        }

        $this->info("Deleted {$deletedCount} old log files (older than {$days} days)");

        return 0;
    }
}
