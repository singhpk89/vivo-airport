<?php

// Simple test to check if the RoutePlanImportService can be instantiated
require_once __DIR__ . '/vendor/autoload.php';

try {
    $service = new \App\Services\RoutePlanImportService();
    echo "✓ RoutePlanImportService instantiated successfully\n";
} catch (Exception $e) {
    echo "✗ Error instantiating RoutePlanImportService: " . $e->getMessage() . "\n";
}

try {
    $controller = new \App\Http\Controllers\RoutePlanController();
    echo "✓ RoutePlanController instantiated successfully\n";
} catch (Exception $e) {
    echo "✗ Error instantiating RoutePlanController: " . $e->getMessage() . "\n";
}
