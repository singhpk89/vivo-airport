/**
 * Test Script for Promoter Management UI
 *
 * This script can be run in the browser console to test the Promoter functionality
 * after logging in as admin@example.com
 */

// Test token (replace with actual token from backend)
const testToken = '2|ahY5vfXt9Oj0uK2IwdkeqXPGTspeSopJHkGQrZPf31f90317';

// Function to set authentication token for testing
function setTestToken() {
    localStorage.setItem('auth_token', testToken);
    console.log('✅ Test token set in localStorage');
}

// Function to test API endpoints
async function testPromoterAPI() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        console.error('❌ No auth token found. Please run setTestToken() first');
        return;
    }

    console.log('🧪 Testing Promoter API endpoints...');

    try {
        // Test GET /api/promoters
        console.log('📋 Testing GET /api/promoters...');
        const response = await fetch('/api/promoters', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ GET /api/promoters successful:', data);
        } else {
            console.error('❌ GET /api/promoters failed:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error details:', errorText);
        }

        // Test POST /api/promoters (create)
        console.log('➕ Testing POST /api/promoters (create)...');
        const createResponse = await fetch('/api/promoters', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test Promoter UI',
                username: 'testpromoterui',
                email: 'testui@example.com',
                phone: '1234567890',
                employee_id: 'EMP-UI-001',
                password: 'password123',
                state: 'Test State',
                district: 'Test District',
                address: 'Test Address',
                status: 'active',
                is_active: true,
            })
        });

        if (createResponse.ok) {
            const createData = await createResponse.json();
            console.log('✅ POST /api/promoters successful:', createData);

            // Store the created promoter ID for update/delete tests
            if (createData.data && createData.data.id) {
                window.testPromoterId = createData.data.id;
                console.log(`📝 Stored test promoter ID: ${window.testPromoterId}`);
            }
        } else {
            console.error('❌ POST /api/promoters failed:', createResponse.status, createResponse.statusText);
            const errorText = await createResponse.text();
            console.error('Error details:', errorText);
        }

        // Test PUT /api/promoters/{id} (update) if we have a test promoter
        if (window.testPromoterId) {
            console.log('✏️ Testing PUT /api/promoters/{id} (update)...');
            const updateResponse = await fetch(`/api/promoters/${window.testPromoterId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Updated Test Promoter UI',
                    username: 'testpromoterui',
                    email: 'testui@example.com',
                    phone: '9876543210',
                    employee_id: 'EMP-UI-001',
                    state: 'Updated State',
                    district: 'Updated District',
                    address: 'Updated Address',
                    status: 'active',
                    is_active: true,
                })
            });

            if (updateResponse.ok) {
                const updateData = await updateResponse.json();
                console.log('✅ PUT /api/promoters/{id} successful:', updateData);
            } else {
                console.error('❌ PUT /api/promoters/{id} failed:', updateResponse.status, updateResponse.statusText);
                const errorText = await updateResponse.text();
                console.error('Error details:', errorText);
            }

            // Test DELETE /api/promoters/{id}
            console.log('🗑️ Testing DELETE /api/promoters/{id}...');
            const deleteResponse = await fetch(`/api/promoters/${window.testPromoterId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (deleteResponse.ok) {
                const deleteData = await deleteResponse.json();
                console.log('✅ DELETE /api/promoters/{id} successful:', deleteData);
            } else {
                console.error('❌ DELETE /api/promoters/{id} failed:', deleteResponse.status, deleteResponse.statusText);
                const errorText = await deleteResponse.text();
                console.error('Error details:', errorText);
            }
        }

    } catch (error) {
        console.error('❌ API test failed with error:', error);
    }
}

// Function to test validation errors
async function testValidationErrors() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        console.error('❌ No auth token found. Please run setTestToken() first');
        return;
    }

    console.log('🧪 Testing validation errors...');

    try {
        // Test POST with missing required fields
        const response = await fetch('/api/promoters', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Missing required fields
                name: '',
                email: 'invalid-email'
            })
        });

        if (response.status === 422) {
            const errorData = await response.json();
            console.log('✅ Validation errors correctly returned:', errorData);
        } else {
            console.error('❌ Expected 422 validation error but got:', response.status);
        }
    } catch (error) {
        console.error('❌ Validation test failed:', error);
    }
}

// Instructions
console.log(`
📋 PROMOTER UI TEST SUITE
========================

To test the Promoter Management functionality:

1. First, set the test authentication token:
   setTestToken()

2. Test the API endpoints:
   testPromoterAPI()

3. Test validation errors:
   testValidationErrors()

4. Navigate to the Promoter Management page and test the UI:
   - Click "Add Promoter" button
   - Fill out the form and submit
   - Click Edit button on a row
   - Click Delete button on a row

Make sure you're logged in as admin@example.com for proper menu access.
`);
