<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $settings = Setting::getAppSettings();

            return response()->json([
                'success' => true,
                'data' => $settings,
            ]);
        } catch (Exception $e) {
            Log::error('Error fetching settings: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error fetching settings',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cast value based on type
     */
    private function castValue($value, string $type)
    {
        return match ($type) {
            'boolean' => (bool) $value,
            'integer' => (int) $value,
            'float' => (float) $value,
            'array', 'json' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Store/Update application settings
     */
    public function store(Request $request)
    {
        try {
            Log::info('Settings update request received', [
                'method' => $request->method(),
                'content_type' => $request->header('Content-Type'),
                'has_file' => $request->hasFile('admin_logo'),
                'all_data' => $request->all()
            ]);

            $validator = Validator::make($request->all(), [
                'app_name' => 'required|string|max:255',
                'admin_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            $data = [
                'app_name' => $request->app_name,
            ];

            // Handle logo upload
            if ($request->hasFile('admin_logo')) {
                $logoName = $this->handleLogoUpload($request->file('admin_logo'));
                $data['admin_logo'] = $logoName;
            }

            $settings = Setting::updateAppSettings($data);

            // Return updated settings with logo URL
            $responseData = Setting::getAppSettings();
            if ($responseData['admin_logo']) {
                $responseData['admin_logo_url'] = asset('uploads/logo/' . $responseData['admin_logo']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => $responseData,
            ]);

        } catch (Exception $e) {
            Log::error('Error updating settings: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error updating settings',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $key)
    {
        $setting = Setting::where('key', $key)->first();

        if (! $setting) {
            return response()->json([
                'success' => false,
                'message' => 'Setting not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'value' => 'required',
            'type' => 'sometimes|in:string,boolean,integer,float,file',
            'description' => 'nullable|string',
            'is_public' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $value = $request->value;

        // Handle file upload for logo
        if ($request->type === 'file' && $request->hasFile('value')) {
            // Delete old file if exists
            if ($setting->value && file_exists(public_path($setting->value))) {
                unlink(public_path($setting->value));
            }

            $value = $this->handleFileUpload($request->file('value'), $key);
        }

        $setting->update([
            'value' => $value,
            'type' => $request->type ?? $setting->type,
            'description' => $request->description ?? $setting->description,
            'is_public' => $request->boolean('is_public', $setting->is_public),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Setting updated successfully',
            'data' => $setting,
        ]);
    }

    /**
     * Update multiple settings at once
     */
    public function updateBatch(Request $request)
    {
        try {
            // Debug logging
            Log::info('Settings update batch request received', [
                'all_inputs' => $request->all(),
                'files' => $request->allFiles(),
                'has_admin_logo_file' => $request->hasFile('admin_logo'),
                'content_type' => $request->header('Content-Type'),
            ]);

            // Parse settings from multipart form data
            $settings = $this->parseSettingsFromRequest($request);

            Log::info('Parsed settings', [
                'settings_count' => count($settings),
                'settings' => $settings,
            ]);

            // Check if logo file is being uploaded
            $hasLogoUpload = $request->hasFile('admin_logo');

            // Validate that we have either settings data or a logo upload
            if (empty($settings) && ! $hasLogoUpload) {
                return response()->json([
                    'success' => false,
                    'message' => 'No settings data or file to update',
                ], 400);
            }

            $updatedSettings = [];

            // Process settings if provided
            if (! empty($settings)) {
                foreach ($settings as $settingData) {
                    $setting = Setting::updateOrCreate(
                        ['key' => $settingData['key']],
                        [
                            'value' => $settingData['value'],
                            'type' => $settingData['type'] ?? 'string',
                        ]
                    );
                    $updatedSettings[] = $setting;
                }
            }

            // Handle admin logo upload if provided
            if ($hasLogoUpload) {
                $logoFile = $request->file('admin_logo');
                $logoSetting = $this->handleFileUpload($logoFile, 'admin_logo');
                $updatedSettings[] = $logoSetting;
            }

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'settings' => $updatedSettings,
            ]);

        } catch (Exception $e) {
            Log::error('Settings update failed', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Parse settings from multipart form data
     */
    private function parseSettingsFromRequest(Request $request): array
    {
        $settings = [];
        $allInputs = $request->all();

        Log::info('Parsing settings from request', [
            'all_inputs' => $allInputs,
            'input_keys' => array_keys($allInputs),
        ]);

        // Parse settings from the format settings[0][key], settings[0][value], etc.
        $settingsData = [];
        foreach ($allInputs as $key => $value) {
            if (preg_match('/^settings\[(\d+)\]\[(\w+)\]$/', $key, $matches)) {
                $index = (int) $matches[1];
                $field = $matches[2];
                $settingsData[$index][$field] = $value;
                Log::info('Found settings field', [
                    'key' => $key,
                    'index' => $index,
                    'field' => $field,
                    'value' => $value,
                ]);
            }
        }

        Log::info('Parsed settings data', [
            'settings_data' => $settingsData,
        ]);

        // Convert to array format
        foreach ($settingsData as $settingData) {
            if (isset($settingData['key']) && isset($settingData['value'])) {
                $settings[] = [
                    'key' => $settingData['key'],
                    'value' => $settingData['value'],
                    'type' => $settingData['type'] ?? 'string',
                ];
            }
        }

        Log::info('Final parsed settings', [
            'settings' => $settings,
        ]);

        return $settings;
    }

    /**
     * Get public settings
     */
    public function publicSettings()
    {
        return response()->json([
            'success' => true,
            'data' => Setting::getPublicSettings(),
        ]);
    }

    /**
     * Handle file upload
     */
    private function handleFileUpload($file, string $key): string
    {
        $extension = $file->getClientOriginalExtension();
        $filename = $key.'_'.time().'.'.$extension;

        // Ensure uploads/logo directory exists
        $uploadPath = public_path('uploads/logo');
        if (! file_exists($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }

        $file->move($uploadPath, $filename);

        return 'uploads/logo/'.$filename;
    }

    /**
     * Handle logo file upload for dedicated column
     */
    private function handleLogoUpload($file): string
    {
        $extension = $file->getClientOriginalExtension();
        $filename = 'admin_logo_'.time().'.'.$extension;

        // Ensure uploads/logo directory exists
        $uploadPath = public_path('uploads/logo');
        if (! file_exists($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }

        $file->move($uploadPath, $filename);

        return $filename; // Return just the filename, not the full path
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $key)
    {
        $setting = Setting::where('key', $key)->first();

        if (! $setting) {
            return response()->json([
                'success' => false,
                'message' => 'Setting not found',
            ], 404);
        }

        // Delete associated file if it's a file type
        if ($setting->type === 'file' && $setting->value && file_exists(public_path($setting->value))) {
            unlink(public_path($setting->value));
        }

        $setting->delete();

        return response()->json([
            'success' => true,
            'message' => 'Setting deleted successfully',
        ]);
    }
}
