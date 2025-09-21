<?php

namespace App\Services;

class TextFormattingService
{
    /**
     * Convert text to sentence case for better visibility in exports
     * Handles ALL CAPS and converts to proper sentence case format
     *
     * @param string|null $text
     * @return string
     */
    public static function toSentenceCase(?string $text): string
    {
        if (empty($text)) {
            return '';
        }

        // Clean the text
        $text = trim($text);

        // Handle common cases like "N/A"
        if (in_array(strtoupper($text), ['N/A', 'NA', 'NULL', 'UNKNOWN'])) {
            return 'N/A';
        }

        // Convert to lowercase first
        $text = strtolower($text);

        // Capitalize first character
        $text = ucfirst($text);

        // Handle special cases and abbreviations
        $specialCases = [
            '/\bid\b/' => 'ID',
            '/\bapi\b/' => 'API',
            '/\burl\b/' => 'URL',
            '/\bhtml\b/' => 'HTML',
            '/\bcss\b/' => 'CSS',
            '/\bjs\b/' => 'JS',
            '/\bphp\b/' => 'PHP',
        ];

        foreach ($specialCases as $pattern => $replacement) {
            $text = preg_replace($pattern, $replacement, $text);
        }

        return $text;
    }

    /**
     * Format display value specifically for exports
     * Similar to frontend formatDisplayValue but for PHP backend
     *
     * @param string|null $value
     * @return string
     */
    public static function formatDisplayValue(?string $value): string
    {
        if (empty($value)) {
            return '';
        }

        // Handle null, empty, or whitespace-only strings
        $value = trim($value);
        if ($value === '') {
            return '';
        }

        // Convert underscores and hyphens to spaces
        $value = str_replace(['_', '-'], ' ', $value);

        // Apply sentence case formatting
        return self::toSentenceCase($value);
    }

    /**
     * Format status values with proper capitalization
     *
     * @param string|null $status
     * @return string
     */
    public static function formatStatus(?string $status): string
    {
        if (empty($status)) {
            return '';
        }

        // Convert common status values to proper format
        $statusMappings = [
            'pending' => 'Pending',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'active' => 'Active',
            'inactive' => 'Inactive',
            'draft' => 'Draft',
            'published' => 'Published',
            'completed' => 'Completed',
            'in_progress' => 'In Progress',
            'cancelled' => 'Cancelled',
        ];

        $lowerStatus = strtolower(trim($status));

        return $statusMappings[$lowerStatus] ?? self::formatDisplayValue($status);
    }

    /**
     * Format location data (state, district, village) with sentence case
     *
     * @param string|null $location
     * @return string
     */
    public static function formatLocation(?string $location): string
    {
        if (empty($location)) {
            return '';
        }

        return self::formatDisplayValue($location);
    }

    /**
     * Format multiple values separated by delimiter
     *
     * @param array $values
     * @param string $delimiter
     * @return string
     */
    public static function formatMultipleValues(array $values, string $delimiter = ', '): string
    {
        $formattedValues = array_map([self::class, 'formatDisplayValue'], $values);
        $formattedValues = array_filter($formattedValues); // Remove empty values

        return implode($delimiter, $formattedValues);
    }
}
