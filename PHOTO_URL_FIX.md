# Photo URL Display Fix

## Issue
Photos from AWS S3 were showing incorrect URLs in the frontend:
- **Incorrect**: `https://vair.test/storage/https://vivo-experience-bucket.s3.amazonaws.com/photos/1758514927791_activity_1758514320167.jpg`
- **Correct**: `https://vivo-experience-bucket.s3.amazonaws.com/photos/1758514927791_activity_1758514320167.jpg`

## Root Cause
The frontend was accessing the `url` attribute on photo objects, but this attribute wasn't being automatically included in API responses. When the frontend tried to access it, it may have been falling back to using `Storage::url()` on the full S3 URL, causing the incorrect prefix.

## Solution
Added the `url` attribute to the `$appends` property in the `PromoterActivityPhoto` model. This ensures that:

1. The `url` attribute is automatically included in all JSON responses
2. The `getUrlAttribute()` method correctly handles S3 URLs by returning them as-is
3. The frontend can reliably access `photo.url` and get the correct URL

## Changes Made

### File: `app/Models/PromoterActivityPhoto.php`
```php
/**
 * The attributes that should be appended to the model's array form.
 */
protected $appends = ['url'];
```

## Technical Details

The `getUrlAttribute()` method works as follows:
- **For S3 URLs**: Returns the URL directly (no modification)
- **For local paths**: Uses `Storage::url()` to generate the correct local URL

## API Response
Photos now include both `file_path` and `url` in the JSON response:
```json
{
  "id": 1,
  "file_path": "https://vivo-experience-bucket.s3.amazonaws.com/photos/1758514927791_activity_1758514320167.jpg",
  "url": "https://vivo-experience-bucket.s3.amazonaws.com/photos/1758514927791_activity_1758514320167.jpg",
  ...
}
```

## Testing
- ✅ Verified S3 URLs are returned correctly without `/storage/` prefix
- ✅ Local storage URLs continue to work with proper prefix
- ✅ API responses include the `url` attribute automatically

## Status
**RESOLVED** - Photos should now display correctly in the frontend using the `url` attribute.
