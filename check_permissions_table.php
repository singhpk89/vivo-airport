<?php

require_once 'vendor/autoload.php';

// Check the permissions table structure
$pdo = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');

echo "Checking permissions table structure...\n";

$stmt = $pdo->query("PRAGMA table_info(permissions)");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Columns in permissions table:\n";
foreach ($columns as $column) {
    echo "- {$column['name']} ({$column['type']})\n";
}

echo "\nSample permission record:\n";
$stmt = $pdo->query("SELECT * FROM permissions LIMIT 1");
$sample = $stmt->fetch(PDO::FETCH_ASSOC);
if ($sample) {
    print_r($sample);
} else {
    echo "No permissions found\n";
}
