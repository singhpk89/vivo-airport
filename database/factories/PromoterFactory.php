<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Promoter>
 */
class PromoterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $states = ['Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Rajasthan', 'Punjab', 'Haryana'];
        $districts = [
            'Maharashtra' => ['Mumbai', 'Pune', 'Nagpur', 'Thane'],
            'Gujarat' => ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
            'Karnataka' => ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
            'Tamil Nadu' => ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
        ];

        $state = $this->faker->randomElement($states);
        $district = $this->faker->randomElement($districts[$state] ?? ['Central', 'North', 'South', 'East', 'West']);

        return [
            'name' => $this->faker->name(),
            'username' => $this->faker->unique()->userName(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'employee_id' => 'EMP' . $this->faker->unique()->numberBetween(1000, 9999),
            'password' => bcrypt('password'),
            'state' => $state,
            'district' => $district,
            'is_active' => $this->faker->boolean(80),
            'address' => $this->faker->address(),
            'profile_image' => $this->faker->optional()->imageUrl(200, 200, 'people'),
            'device_id' => $this->faker->optional()->uuid(),
            'is_logged_in' => $this->faker->boolean(30),
            'last_active' => $this->faker->optional()->dateTimeBetween('-1 week', 'now'),
            'app_version' => $this->faker->randomElement(['1.0.0', '1.1.0', '1.2.0', '2.0.0']),
            'device_token' => $this->faker->optional()->sha256(),
            'status' => $this->faker->randomElement(['active', 'inactive', 'pending', 'suspended']),
        ];
    }
}
