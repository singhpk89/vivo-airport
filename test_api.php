<?php

// Test script to check the import endpoint
$url = 'https://lic.test/api/route-plans/import/validate';

// Create a simple test CSV content
$csvContent = "state,district,sub_district,village,village_code,width,height,area,wall_count,status\n";
$csvContent .= "Maharashtra,Mumbai,Bandra,Bandra Village,MH001,10.0,8.0,80.0,2,active\n";

// Create a temporary file
$tempFile = tempnam(sys_get_temp_dir(), 'test_import_');
file_put_contents($tempFile, $csvContent);

// Create CURLFile for upload
$cfile = new CURLFile($tempFile, 'text/csv', 'test.csv');

// Setup cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, ['file' => $cfile]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

// Clean up
unlink($tempFile);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";
if ($error) {
    echo "cURL Error: $error\n";
}
