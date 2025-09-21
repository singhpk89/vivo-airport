<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityRecceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'local_id' => $this->local_id,
            'visit_date' => $this->visit_date?->format('Y-m-d H:i:s'),
            'visit_date_iso' => $this->visit_date?->toISOString(),
            'promoter_id' => $this->promoter_id,
            'plan_id' => $this->plan_id,
            'device_id' => $this->device_id,
            'location_details' => [
                'state' => $this->state,
                'district' => $this->district,
                'sub_district' => $this->sub_district,
                'village' => $this->village,
                'village_code' => $this->village_code,
                'location' => $this->location,
                'landmark' => $this->landmark,
            ],
            'coordinates' => [
                'latitude' => $this->latitude ? (float) $this->latitude : null,
                'longitude' => $this->longitude ? (float) $this->longitude : null,
            ],
            'dimensions' => [
                'width' => $this->width ? (float) $this->width : null,
                'height' => $this->height ? (float) $this->height : null,
                'area' => $this->area,
            ],
            'images' => [
                'close_shot1' => $this->close_shot1,
                'close_shot_2' => $this->close_shot_2,
                'long_shot_1' => $this->long_shot_1,
                'long_shot_2' => $this->long_shot_2,
            ],
            'remarks' => $this->remarks,
            'status' => $this->status,
            'status_color' => $this->status_color,
            'product_type' => $this->product_type,
            'formatted_location' => $this->formatted_location,
            'promoter' => $this->whenLoaded('promoter', function () {
                return [
                    'id' => $this->promoter->id,
                    'name' => $this->promoter->name,
                    'email' => $this->promoter->email,
                    'phone' => $this->promoter->phone,
                ];
            }),
            'route_plan' => $this->whenLoaded('routePlan', function () {
                return [
                    'id' => $this->routePlan->id,
                    'name' => $this->routePlan->name,
                    'location' => $this->routePlan->location,
                ];
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
