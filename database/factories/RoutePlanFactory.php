<?php

namespace Database\Factories;

use App\Models\RoutePlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RoutePlan>
 */
class RoutePlanFactory extends Factory
{
    protected $model = RoutePlan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'state' => $this->faker->randomElement(['Maharashtra', 'Karnataka', 'Gujarat', 'Rajasthan', 'Punjab']),
            'district' => $this->faker->randomElement(['Mumbai', 'Pune', 'Bangalore', 'Ahmedabad', 'Jaipur', 'Amritsar']),
            'sub_district' => $this->faker->city,
            'village' => $this->faker->city . ' Village',
            'village_code' => strtoupper($this->faker->lexify('??###')),
            'description' => $this->faker->sentence(10),
            'latitude' => $this->faker->latitude,
            'longitude' => $this->faker->longitude,
            'is_active' => $this->faker->boolean(80), // 80% chance of being active
        ];
    }

    /**
     * Indicate that the route plan is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the route plan is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Create a route plan for a specific state.
     */
    public function forState(string $state): static
    {
        return $this->state(fn (array $attributes) => [
            'state' => $state,
        ]);
    }

    /**
     * Create a route plan for a specific district.
     */
    public function forDistrict(string $district): static
    {
        return $this->state(fn (array $attributes) => [
            'district' => $district,
        ]);
    }
}
