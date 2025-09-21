<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    /**
     * Upload a single image to S3
     */
    public function uploadSingle(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max
            'folder' => 'nullable|string|in:activities,profiles,documents',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $image = $request->file('image');
            $folder = $request->input('folder', 'activities');

            // Generate unique filename
            $filename = Str::random(32).'.'.$image->getClientOriginalExtension();
            $path = "{$folder}/".date('Y/m/d')."/{$filename}";

            // Upload to S3
            $uploaded = Storage::disk('s3')->put($path, file_get_contents($image), 'public');

            if (! $uploaded) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to upload image',
                ], 500);
            }

            // Generate S3 URL manually
            $bucket = env('AWS_BUCKET');
            $region = env('AWS_DEFAULT_REGION');
            $url = "https://{$bucket}.s3.{$region}.amazonaws.com/{$path}";

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'data' => [
                    'url' => $url,
                    'path' => $path,
                    'filename' => $filename,
                    'size' => $image->getSize(),
                    'mime_type' => $image->getMimeType(),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload multiple images to S3
     */
    public function uploadMultiple(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'images' => 'required|array|min:1|max:5',
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240',
            'folder' => 'nullable|string|in:activities,profiles,documents',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $images = $request->file('images');
            $folder = $request->input('folder', 'activities');
            $uploadedImages = [];

            foreach ($images as $image) {
                // Generate unique filename
                $filename = Str::random(32).'.'.$image->getClientOriginalExtension();
                $path = "{$folder}/".date('Y/m/d')."/{$filename}";

                // Upload to S3
                $uploaded = Storage::disk('s3')->put($path, file_get_contents($image), 'public');

                if ($uploaded) {
                    // Generate S3 URL manually
                    $bucket = env('AWS_BUCKET');
                    $region = env('AWS_DEFAULT_REGION');
                    $url = "https://{$bucket}.s3.{$region}.amazonaws.com/{$path}";

                    $uploadedImages[] = [
                        'url' => $url,
                        'path' => $path,
                        'filename' => $filename,
                        'size' => $image->getSize(),
                        'mime_type' => $image->getMimeType(),
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => count($uploadedImages).' images uploaded successfully',
                'data' => [
                    'images' => $uploadedImages,
                    'count' => count($uploadedImages),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload images: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an image from S3
     */
    public function deleteImage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $url = $request->input('url');

            // Extract path from S3 URL
            $parsedUrl = parse_url($url);
            $path = ltrim($parsedUrl['path'], '/');

            // Remove bucket name from path if present
            $bucketName = env('AWS_BUCKET');
            if (strpos($path, $bucketName.'/') === 0) {
                $path = substr($path, strlen($bucketName) + 1);
            }

            // Check if file exists
            if (! Storage::disk('s3')->exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Image not found',
                ], 404);
            }

            // Delete from S3
            $deleted = Storage::disk('s3')->delete($path);

            if (! $deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete image',
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete image: '.$e->getMessage(),
            ], 500);
        }
    }
}
