<?php

namespace App\Services;

use App\Models\RoutePlan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Exception;

class RoutePlanImportService
{
    private const BATCH_SIZE = 1000;
    private const REQUIRED_COLUMNS = [
        'state', 'district', 'sub_district', 'village', 'village_code',
        'width', 'height', 'area', 'wall_count', 'status'
    ];

    /**
     * Validate CSV file structure and data
     */
    public function validateFile(string $filePath): array
    {
        if (!file_exists($filePath)) {
            throw new Exception("File not found: {$filePath}");
        }

        $handle = fopen($filePath, 'r');
        if (!$handle) {
            throw new Exception("Cannot open file: {$filePath}");
        }

        try {
            $headers = fgetcsv($handle);
            if (!$headers) {
                throw new Exception("File is empty or invalid CSV format");
            }

            // Clean headers
            $headers = array_map('trim', $headers);
            
            // Check required columns
            $missingColumns = array_diff(self::REQUIRED_COLUMNS, $headers);
            if (!empty($missingColumns)) {
                throw new Exception("Missing required columns: " . implode(', ', $missingColumns));
            }

            // Count total rows and validate sample data
            $totalRows = 0;
            $validRows = 0;
            $invalidRows = 0;
            $errors = [];
            $sampleData = [];

            $columnMap = array_flip($headers);

            while (($row = fgetcsv($handle)) !== false && $totalRows < 100) { // Validate first 100 rows for speed
                $totalRows++;
                $rowNumber = $totalRows + 1;

                $validation = $this->validateRow($row, $columnMap, $rowNumber);
                
                if ($validation['valid']) {
                    $validRows++;
                    if (count($sampleData) < 3) {
                        $sampleData[] = array_combine($headers, $row);
                    }
                } else {
                    $invalidRows++;
                    $errors = array_merge($errors, $validation['errors']);
                }
            }

            // Count remaining rows without validation for performance
            while (fgetcsv($handle) !== false) {
                $totalRows++;
            }

            return [
                'total_rows' => $totalRows,
                'valid_rows' => $validRows,
                'invalid_rows' => $invalidRows,
                'errors' => array_slice($errors, 0, 10), // Limit errors shown
                'sample_data' => $sampleData,
                'column_mapping' => $columnMap
            ];

        } finally {
            fclose($handle);
        }
    }

    /**
     * Import CSV file data into database
     */
    public function importFile(string $filePath): array
    {
        if (!file_exists($filePath)) {
            throw new Exception("File not found: {$filePath}");
        }

        $handle = fopen($filePath, 'r');
        if (!$handle) {
            throw new Exception("Cannot open file: {$filePath}");
        }

        try {
            $headers = fgetcsv($handle);
            $headers = array_map('trim', $headers);
            $columnMap = array_flip($headers);

            $imported = 0;
            $updated = 0;
            $failed = 0;
            $batch = [];
            $errors = [];

            DB::beginTransaction();

            while (($row = fgetcsv($handle)) !== false) {
                try {
                    $validation = $this->validateRow($row, $columnMap);
                    
                    if (!$validation['valid']) {
                        $failed++;
                        $errors = array_merge($errors, $validation['errors']);
                        continue;
                    }

                    $routePlanData = $this->mapRowData($row, $columnMap);
                    
                    // Check for existing record
                    $existing = RoutePlan::where('village_code', $routePlanData['village_code'])->first();
                    
                    if ($existing) {
                        $existing->update($routePlanData);
                        $updated++;
                    } else {
                        $batch[] = $routePlanData;
                        
                        // Process batch when it reaches the limit
                        if (count($batch) >= self::BATCH_SIZE) {
                            RoutePlan::insert($batch);
                            $imported += count($batch);
                            $batch = [];
                        }
                    }

                } catch (Exception $e) {
                    $failed++;
                    $errors[] = [
                        'row' => $failed + $imported + $updated,
                        'message' => $e->getMessage()
                    ];
                }
            }

            // Insert remaining batch
            if (!empty($batch)) {
                RoutePlan::insert($batch);
                $imported += count($batch);
            }

            DB::commit();

            return [
                'imported' => $imported,
                'updated' => $updated,
                'failed' => $failed,
                'total_processed' => $imported + $updated + $failed,
                'errors' => array_slice($errors, 0, 10) // Limit errors returned
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        } finally {
            fclose($handle);
        }
    }

    /**
     * Validate individual row data
     */
    private function validateRow(array $row, array $columnMap, int $rowNumber = null): array
    {
        $errors = [];
        $valid = true;

        // Check required fields
        foreach (self::REQUIRED_COLUMNS as $column) {
            if (!isset($columnMap[$column]) || !isset($row[$columnMap[$column]]) || trim($row[$columnMap[$column]]) === '') {
                $errors[] = [
                    'row' => $rowNumber,
                    'message' => "Missing or empty value for column: {$column}"
                ];
                $valid = false;
            }
        }

        if (!$valid) {
            return ['valid' => false, 'errors' => $errors];
        }

        // Validate data types
        $width = trim($row[$columnMap['width']] ?? '');
        $height = trim($row[$columnMap['height']] ?? '');
        $wallCount = trim($row[$columnMap['wall_count']] ?? '');
        $status = trim($row[$columnMap['status']] ?? '');

        if (!is_numeric($width) || $width <= 0) {
            $errors[] = ['row' => $rowNumber, 'message' => 'Width must be a positive number'];
            $valid = false;
        }

        if (!is_numeric($height) || $height <= 0) {
            $errors[] = ['row' => $rowNumber, 'message' => 'Height must be a positive number'];
            $valid = false;
        }

        if (!is_numeric($wallCount) || $wallCount < 0) {
            $errors[] = ['row' => $rowNumber, 'message' => 'Wall count must be a non-negative integer'];
            $valid = false;
        }

        if (!in_array($status, ['active', 'planning', 'completed', 'cancelled'])) {
            $errors[] = ['row' => $rowNumber, 'message' => 'Status must be one of: active, planning, completed, cancelled'];
            $valid = false;
        }

        return ['valid' => $valid, 'errors' => $errors];
    }

    /**
     * Map row data to route plan attributes
     */
    private function mapRowData(array $row, array $columnMap): array
    {
        $width = floatval(trim($row[$columnMap['width']]));
        $height = floatval(trim($row[$columnMap['height']]));

        return [
            'state' => trim($row[$columnMap['state']]),
            'district' => trim($row[$columnMap['district']]),
            'sub_district' => trim($row[$columnMap['sub_district']]),
            'village' => trim($row[$columnMap['village']]),
            'village_code' => trim($row[$columnMap['village_code']]),
            'width' => $width,
            'height' => $height,
            'area' => $width * $height, // Auto-calculate area
            'wall_count' => intval(trim($row[$columnMap['wall_count']])),
            'status' => trim($row[$columnMap['status']]),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
