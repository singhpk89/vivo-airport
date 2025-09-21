/**
 * Text formatting utilities for consistent sentence case throughout the application
 */

/**
 * Convert text to sentence case (First letter uppercase, rest lowercase)
 * @param {string} text - The text to format
 * @returns {string} - The formatted text in sentence case
 */
export const toSentenceCase = (text) => {
    if (!text || typeof text !== 'string') return text;

    // Handle empty strings
    if (text.length === 0) return text;

    // Trim whitespace and convert to sentence case: first letter uppercase, rest lowercase
    const trimmed = text.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

/**
 * Convert text to title case (Each Word Capitalized)
 * @param {string} text - The text to format
 * @returns {string} - The formatted text in title case
 */
export const toTitleCase = (text) => {
    if (!text || typeof text !== 'string') return text;

    return text.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
};

/**
 * Format dropdown/select values for display
 * @param {string} value - The value to format
 * @returns {string} - The formatted value
 */
export const formatDisplayValue = (value) => {
    if (!value || typeof value !== 'string') return value;

    // Replace underscores and hyphens with spaces, then apply sentence case
    return toSentenceCase(value.replace(/[_-]/g, ' '));
};

/**
 * Format status values with proper casing
 * @param {string} status - The status to format
 * @returns {string} - The formatted status
 */
export const formatStatus = (status) => {
    if (!status || typeof status !== 'string') return status;

    // Special handling for common status values
    const statusMap = {
        'active': 'Active',
        'inactive': 'Inactive',
        'pending': 'Pending',
        'approved': 'Approved',
        'rejected': 'Rejected',
        'suspended': 'Suspended',
        'completed': 'Completed',
        'in_progress': 'In Progress',
        'not_started': 'Not Started'
    };

    const normalizedStatus = status.toLowerCase().replace(/[_-]/g, '_');
    return statusMap[normalizedStatus] || formatDisplayValue(status);
};

/**
 * Format table cell values consistently
 * @param {any} value - The value to format
 * @returns {string} - The formatted value
 */
export const formatTableValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return formatDisplayValue(value);

    return String(value);
};

/**
 * Apply sentence case to all select/dropdown options
 * @param {Array} options - Array of option objects with value/label
 * @returns {Array} - Formatted options array
 */
export const formatSelectOptions = (options) => {
    if (!Array.isArray(options)) return options;

    return options.map(option => {
        if (typeof option === 'string') {
            return {
                value: option,
                label: formatDisplayValue(option)
            };
        }

        if (option && typeof option === 'object') {
            return {
                ...option,
                label: option.label ? formatDisplayValue(option.label) : formatDisplayValue(option.value || '')
            };
        }

        return option;
    });
};
