<?php

use Illuminate\Support\Facades\Route;
use App\Models\Setting;
use App\Http\Controllers\WebManifestController;

Route::get('/', function () {
    $settings = Setting::getAppSettings();
    return view('welcome', compact('settings'));
});

// Dynamic web app manifest
Route::get('/site.webmanifest', [WebManifestController::class, 'manifest']);

// Catch-all route for React Router - this should be last
Route::get('/{any}', function () {
    $settings = Setting::getAppSettings();
    return view('welcome', compact('settings'));
})->where('any', '.*');
