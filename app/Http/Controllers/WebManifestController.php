<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class WebManifestController extends Controller
{
    /**
     * Generate dynamic web app manifest
     */
    public function manifest()
    {
        $settings = Setting::getAppSettings();

        $manifest = [
            'name' => $settings['app_name'] ?? config('app.name', 'Laravel'),
            'short_name' => $settings['app_name'] ?? config('app.name', 'Laravel'),
            'icons' => [
                [
                    'src' => '/android-chrome-192x192.png',
                    'sizes' => '192x192',
                    'type' => 'image/png'
                ],
                [
                    'src' => '/android-chrome-512x512.png',
                    'sizes' => '512x512',
                    'type' => 'image/png'
                ]
            ],
            'theme_color' => '#ffffff',
            'background_color' => '#ffffff',
            'display' => 'standalone',
            'start_url' => '/',
            'scope' => '/'
        ];

        return response()->json($manifest, 200, [
            'Content-Type' => 'application/manifest+json'
        ]);
    }
}
