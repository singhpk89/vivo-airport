<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ActivityRecceBulkStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'activities' => ['required', 'array', 'min:1', 'max:100'],
            'activities.*.visit_date' => ['required', 'date'],
            'activities.*.promoter_id' => ['required', 'exists:promoters,id'],
            'activities.*.plan_id' => ['required', 'exists:route_plans,id'],
            'activities.*.device_id' => ['nullable', 'string', 'max:255'],
            'activities.*.state' => ['required', 'string', 'max:255'],
            'activities.*.district' => ['required', 'string', 'max:255'],
            'activities.*.sub_district' => ['nullable', 'string', 'max:255'],
            'activities.*.village' => ['required', 'string', 'max:255'],
            'activities.*.village_code' => ['nullable', 'string', 'max:255'],
            'activities.*.location' => ['required', 'string', 'max:255'],
            'activities.*.landmark' => ['nullable', 'string', 'max:255'],
            'activities.*.close_shot1' => ['nullable', 'string'],
            'activities.*.close_shot_2' => ['nullable', 'string'],
            'activities.*.long_shot_1' => ['nullable', 'string'],
            'activities.*.long_shot_2' => ['nullable', 'string'],
            'activities.*.remarks' => ['nullable', 'string'],
            'activities.*.latitude' => ['required', 'numeric', 'between:-90,90'],
            'activities.*.longitude' => ['required', 'numeric', 'between:-180,180'],
            'activities.*.width' => ['nullable', 'numeric', 'min:0'],
            'activities.*.height' => ['nullable', 'numeric', 'min:0'],
            'activities.*.status' => ['nullable', 'string', 'in:pending,in_progress,completed,approved,rejected'],
            'activities.*.local_id' => ['nullable', 'string', 'max:255'], // For device-to-server ID mapping
            'activities.*.product_type' => ['nullable', 'string', 'in:Motor,Health,Crop'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'activities.required' => 'Activities array is required',
            'activities.array' => 'Activities must be an array',
            'activities.min' => 'At least one activity is required',
            'activities.max' => 'Maximum 100 activities allowed per bulk request',
            'activities.*.visit_date.required' => 'Visit date and time is required for all activities',
            'activities.*.visit_date.date' => 'Visit date must be a valid date and time (e.g., 2025-08-24 14:30:00)',
            'activities.*.promoter_id.required' => 'Promoter is required for all activities',
            'activities.*.promoter_id.exists' => 'Selected promoter does not exist',
            'activities.*.plan_id.required' => 'Route plan is required for all activities',
            'activities.*.plan_id.exists' => 'Selected route plan does not exist',
            'activities.*.state.required' => 'State is required for all activities',
            'activities.*.district.required' => 'District is required for all activities',
            'activities.*.village.required' => 'Village is required for all activities',
            'activities.*.location.required' => 'Location is required for all activities',
            'activities.*.latitude.required' => 'Latitude is required for all activities',
            'activities.*.latitude.numeric' => 'Latitude must be a valid number',
            'activities.*.latitude.between' => 'Latitude must be between -90 and 90',
            'activities.*.longitude.required' => 'Longitude is required for all activities',
            'activities.*.longitude.numeric' => 'Longitude must be a valid number',
            'activities.*.longitude.between' => 'Longitude must be between -180 and 180',
            'activities.*.width.numeric' => 'Width must be a valid number',
            'activities.*.width.min' => 'Width must be greater than or equal to 0',
            'activities.*.height.numeric' => 'Height must be a valid number',
            'activities.*.height.min' => 'Height must be greater than or equal to 0',
            'activities.*.status.in' => 'Status must be one of: pending, in_progress, completed, approved, rejected',
        ];
    }
}
