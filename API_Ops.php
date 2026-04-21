<?php
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'GET')
{
    echo json_encode([
        "status" => "error",
        "message" => "Method not allowed"
    ]);
    exit;
}

$query = trim($_GET['q'] ?? '');

if ($query === '')
{
    echo json_encode([
        "status" => "error",
        "message" => "Search query is required"
    ]);
    exit;
}

$apiUrl = "https://openlibrary.org/search.json?q=" . urlencode($query)
    . "&fields=key,title,author_name,first_publish_year,number_of_pages_median,cover_i"
    . "&limit=10";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);

if (curl_errno($ch))
{
    echo json_encode([
        "status" => "error",
        "message" => "Failed to connect to book API",
        "curl_error" => curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200)
{
    echo json_encode([
        "status" => "error",
        "message" => "Book API returned an error"
    ]);
    exit;
}

$data = json_decode($response, true);

if (!isset($data['docs']) || !is_array($data['docs']))
{
    echo json_encode([
        "status" => "error",
        "message" => "Invalid response from book API"
    ]);
    exit;
}

$books = [];

foreach ($data['docs'] as $book)
{
    $coverId = isset($book['cover_i']) ? (string)$book['cover_i'] : null;

    $books[] = [
        "openlibrary_id" => $book['key'] ?? null,
        "title" => $book['title'] ?? "Unknown title",
        "author_name" => $book['author_name'][0] ?? "Unknown author",
        "publish_year" => $book['first_publish_year'] ?? null,
        "page_count" => $book['number_of_pages_median'] ?? null,
        "cover_id" => $coverId,
        "cover_url" => $coverId ? "https://covers.openlibrary.org/b/id/" . $coverId . "-M.jpg" : null
    ];
}

echo json_encode([
    "status" => "success",
    "message" => count($books) ? "Books fetched successfully" : "No books found",
    "books" => $books
]);