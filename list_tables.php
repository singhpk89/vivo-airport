<?php

$pdo = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
$stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");

echo "Database Tables:\n";
echo "================\n";
while ($row = $stmt->fetch()) {
    echo "- " . $row['name'] . "\n";
}

// Also check for role/permission related tables specifically
echo "\nRole/Permission Tables:\n";
echo "======================\n";
$stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%role%' OR name LIKE '%permission%'");
while ($row = $stmt->fetch()) {
    echo "- " . $row['name'] . "\n";
}
