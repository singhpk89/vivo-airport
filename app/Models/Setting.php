<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
        'is_public',
        'app_name',
        'admin_logo',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    /**
     * Get a setting value by key
     */
    public static function getValue(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();

        if (! $setting) {
            return $default;
        }

        return static::castValue($setting->value, $setting->type);
    }

    /**
     * Set a setting value
     */
    public static function set(string $key, $value, string $type = 'string', ?string $description = null): static
    {
        $setting = static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type,
                'description' => $description,
            ]
        );

        return $setting;
    }

    /**
     * Cast value based on type
     */
    protected static function castValue($value, string $type)
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
     * Get all public settings
     */
    public static function getPublicSettings(): array
    {
        $settings = static::first();

        if (!$settings) {
            return [
                'app_name' => 'Li Council Admin',
                'admin_logo' => null,
            ];
        }

        return [
            'app_name' => $settings->app_name ?? 'Li Council Admin',
            'admin_logo' => $settings->admin_logo,
        ];
    }

    /**
     * Get the application settings with dedicated columns
     */
    public static function getAppSettings(): array
    {
        $settings = static::first();

        if (!$settings) {
            return [
                'app_name' => 'Li Council Admin',
                'admin_logo' => null,
            ];
        }

        return [
            'app_name' => $settings->app_name ?? 'Li Council Admin',
            'admin_logo' => $settings->admin_logo,
        ];
    }

    /**
     * Update application settings
     */
    public static function updateAppSettings(array $data): static
    {
        $settings = static::first();

        if (!$settings) {
            $settings = new static();
            $settings->save();
        }

        $settings->update($data);

        return $settings;
    }

    /**
     * Get the admin logo URL
     */
    public function getAdminLogoUrlAttribute(): ?string
    {
        if (!$this->admin_logo) {
            return null;
        }

        return asset('uploads/logo/' . $this->admin_logo);
    }
}
