<?php
$host = "127.0.0.1";
$user = "root";
$password = "";
$database = "book_finder";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) 
{
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed"
    ]);
    exit;
}

$conn->set_charset("utf8mb4");
?>