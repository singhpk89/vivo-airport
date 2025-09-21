<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ActivityRecceStoreRequest extends FormRequest
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
            'visit_date' => ['required', 'date'],
            'promoter_id' => ['required', 'exists:promoters,id'],
            'plan_id' => ['required', 'exists:route_plans,id'],
            'device_id' => ['nullable', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'district' => ['required', 'string', 'max:255'],
            'sub_district' => ['nullable', 'string', 'max:255'],
            'village' => ['required', 'string', 'max:255'],
            'village_code' => ['nullable', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'landmark' => ['nullable', 'string', 'max:255'],
            'close_shot1' => ['nullable', 'string'],
            'close_shot_2' => ['nullable', 'string'],
            'long_shot_1' => ['nullable', 'string'],
            'long_shot_2' => ['nullable', 'string'],
            'remarks' => ['nullable', 'string'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'width' => ['nullable', 'numeric', 'min:0'],
            'height' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'in:pending,in_progress,completed,approved,rejected'],
            'local_id' => ['nullable', 'string', 'max:255'], // For device-to-server ID mapping
            'product_type' => ['nullable', 'string', 'in:Motor,Health,Crop'],
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
            'visit_date.required' => 'Visit date and time is required',
            'visit_date.date' => 'Visit date must be a valid date and time (e.g., 2025-08-24 14:30:00)',
            'promoter_id.required' => 'Promoter is required',
            'promoter_id.exists' => 'Selected promoter does not exist',
            'plan_id.required' => 'Route plan is required',
            'plan_id.exists' => 'Selected route plan does not exist',
            'state.required' => 'State is required',
            'district.required' => 'District is required',
            'village.required' => 'Village is required',
            'location.required' => 'Location is required',
            'latitude.required' => 'Latitude is required',
            'latitude.numeric' => 'Latitude must be a valid number',
            'latitude.between' => 'Latitude must be between -90 and 90',
            'longitude.required' => 'Longitude is required',
            'longitude.numeric' => 'Longitude must be a valid number',
            'longitude.between' => 'Longitude must be between -180 and 180',
            'width.numeric' => 'Width must be a valid number',
            'width.min' => 'Width must be greater than or equal to 0',
            'height.numeric' => 'Height must be a valid number',
            'height.min' => 'Height must be greater than or equal to 0',
            'status.in' => 'Status must be one of: pending, in_progress, completed, approved, rejected',
        ];
    }
}
