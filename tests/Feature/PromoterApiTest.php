<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Promoter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class PromoterApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a test user and authenticate
        $user = User::factory()->create();
        Sanctum::actingAs($user);
    }

    /** @test */
    public function it_can_list_promoters()
    {
        // Create some test promoters
        Promoter::factory()->count(3)->create();

        $response = $this->getJson('/api/promoters');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'username',
                            'email',
                            'employee_id',
                            'status',
                            'state',
                            'district'
                        ]
                    ]
                ]);
    }

    /** @test */
    public function it_can_create_a_promoter()
    {
        $promoterData = [
            'name' => 'Test Promoter',
            'username' => 'testpromoter',
            'email' => 'test@example.com',
            'phone' => '1234567890',
            'employee_id' => 'EMP001',
            'password' => 'password123',
            'state' => 'Test State',
            'district' => 'Test District',
            'address' => 'Test Address',
            'status' => 'active',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/promoters', $promoterData);

        $response->assertStatus(201)
                ->assertJson([
                    'success' => true,
                    'message' => 'Promoter created successfully'
                ]);

        $this->assertDatabaseHas('promoters', [
            'name' => 'Test Promoter',
            'username' => 'testpromoter',
            'email' => 'test@example.com',
            'employee_id' => 'EMP001'
        ]);
    }

    /** @test */
    public function it_can_update_a_promoter()
    {
        $promoter = Promoter::factory()->create([
            'name' => 'Original Name',
            'username' => 'original',
            'email' => 'original@example.com'
        ]);

        $updateData = [
            'name' => 'Updated Name',
            'username' => 'updated',
            'email' => 'updated@example.com',
            'phone' => '9876543210',
            'employee_id' => $promoter->employee_id,
            'state' => 'Updated State',
            'district' => 'Updated District',
            'address' => 'Updated Address',
            'status' => 'active',
            'is_active' => true,
        ];

        $response = $this->putJson("/api/promoters/{$promoter->id}", $updateData);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Promoter updated successfully'
                ]);

        $this->assertDatabaseHas('promoters', [
            'id' => $promoter->id,
            'name' => 'Updated Name',
            'username' => 'updated',
            'email' => 'updated@example.com'
        ]);
    }

    /** @test */
    public function it_can_delete_a_promoter()
    {
        $promoter = Promoter::factory()->create();

        $response = $this->deleteJson("/api/promoters/{$promoter->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Promoter deleted successfully'
                ]);

        $this->assertDatabaseMissing('promoters', [
            'id' => $promoter->id
        ]);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_promoter()
    {
        $response = $this->postJson('/api/promoters', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors([
                    'name',
                    'username',
                    'email',
                    'employee_id',
                    'password',
                    'status'
                ]);
    }

    /** @test */
    public function it_requires_unique_email_and_username()
    {
        $existingPromoter = Promoter::factory()->create([
            'email' => 'existing@example.com',
            'username' => 'existing'
        ]);

        $promoterData = [
            'name' => 'Test Promoter',
            'username' => 'existing', // Duplicate username
            'email' => 'existing@example.com', // Duplicate email
            'employee_id' => 'EMP002',
            'password' => 'password123',
            'status' => 'active',
        ];

        $response = $this->postJson('/api/promoters', $promoterData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email', 'username']);
    }
}
