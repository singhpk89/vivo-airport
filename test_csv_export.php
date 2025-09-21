<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Testing CSV Export Logic...\n";

try {
    // Test the query that the CSV export uses
    $activities = DB::table('activity_recces')
        ->join('users', 'activity_recces.promoter_id', '=', 'users.id')
        ->select([
            'activity_recces.wall_code',
            'activity_recces.visit_date',
            'activity_recces.state',
            'activity_recces.district',
            'activity_recces.sub_district',
            'activity_recces.village',
            'activity_recces.village_code',
            'activity_recces.location',
            'activity_recces.product_type',
            'activity_recces.landmark',
            'activity_recces.latitude',
            'activity_recces.longitude',
            'users.name as promoter_name',
        ])
        ->limit(3)
        ->get();

    echo "Query successful! Found " . count($activities) . " activities.\n";

    // Test CSV generation
    $headers = [
        'Wall Code',
        'Date',
        'Time',
        'State',
        'District',
        'Sub District',
        'Village',
        'Village Code',
        'Location',
        'Product Type',
        'Landmark',
        'Latitude',
        'Longitude',
        'Promoter Name',
    ];

    echo "\nCSV Headers: " . implode(', ', $headers) . "\n";

    foreach ($activities as $activity) {
        $visitDateTime = \Carbon\Carbon::parse($activity->visit_date);
        $date = $visitDateTime->format('Y-m-d');
        $time = $visitDateTime->format('H:i:s');

        $row = [
            $activity->wall_code ?? 'N/A',
            $date,
            $time,
            $activity->state ?? 'N/A',
            $activity->district ?? 'N/A',
            $activity->sub_district ?? 'N/A',
            $activity->village ?? 'N/A',
            $activity->village_code ?? 'N/A',
            $activity->location ?? 'N/A',
            $activity->product_type ?? 'N/A',
            $activity->landmark ?? 'N/A',
            $activity->latitude ?? 'N/A',
            $activity->longitude ?? 'N/A',
            $activity->promoter_name ?? 'N/A',
        ];

        echo "Sample Row: " . implode(' | ', $row) . "\n";
    }

    echo "\n✅ CSV export logic test successful!\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
