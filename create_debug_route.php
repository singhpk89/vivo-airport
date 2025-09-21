<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Create a simple test route to debug exactly what Laravel receives
Route::put('/api/debug/settings', function (Request $request) {
    $data = [
        'all_inputs' => $request->all(),
        'files' => $request->allFiles(),
        'has_admin_logo' => $request->hasFile('admin_logo'),
        'content_type' => $request->header('Content-Type'),
    ];

    // Try to get the admin_logo file details
    if ($request->hasFile('admin_logo')) {
        $file = $request->file('admin_logo');
        $data['admin_logo_details'] = [
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'extension' => $file->getClientOriginalExtension(),
        ];
    }

    // Test parsing settings manually
    $settingsData = [];
    foreach ($request->all() as $key => $value) {
        if (preg_match('/^settings\[(\d+)\]\[(\w+)\]$/', $key, $matches)) {
            $index = (int) $matches[1];
            $field = $matches[2];
            $settingsData[$index][$field] = $value;
        }
    }
    $data['parsed_settings'] = $settingsData;

    return response()->json($data);
});

echo "Debug route created at /api/debug/settings\n";
echo "You can test logo upload to this endpoint to see what Laravel receives.\n";
