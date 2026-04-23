<?php
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') 
{
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Method not allowed"
    ]);
    exit;
}

$query = trim($_GET['q'] ?? '');

if ($query === '') 
{
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Search query is required"
    ]);
    exit;
}

$apiUrl = "https://openlibrary.org/search.json?q=" . urlencode($query)
    . "&fields=key,title,author_name,first_publish_year,number_of_pages_median,cover_i"
    . "&limit=10";

$maxRetries = 3;
$attempt = 0;
$response = false;
$curlErrorNo = 0;
$curlError = '';
$httpCode = 0;

while ($attempt < $maxRetries) 
{
    $attempt++;

    $ch = curl_init();

    curl_setopt_array($ch, [
        CURLOPT_URL => $apiUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERAGENT => 'MyBookApp/1.0',
        CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 5,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2
    ]);

    $response = curl_exec($ch);
    $curlErrorNo = curl_errno($ch);
    $curlError = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    if ($curlErrorNo === 0 && $httpCode === 200 && $response !== false) 
    {
        break;
    }

    if ($attempt < $maxRetries) 
    {
        usleep(500000);
    }
}

if ($curlErrorNo !== 0) 
{
    http_response_code(502);

    $message = ($curlErrorNo === CURLE_OPERATION_TIMEDOUT)
        ? "Book API request timed out"
        : "Failed to connect to book API";

    echo json_encode([
        "status" => "error",
        "message" => $message,
        "curl_errno" => $curlErrorNo,
        "curl_error" => $curlError
    ]);
    exit;
}

if ($httpCode !== 200) 
{
    http_response_code(502);
    echo json_encode([
        "status" => "error",
        "message" => "Book API returned an error",
        "http_code" => $httpCode
    ]);
    exit;
}

$data = json_decode($response, true);

if (!is_array($data) || !isset($data['docs']) || !is_array($data['docs'])) 
{
    http_response_code(502);
    echo json_encode([
        "status" => "error",
        "message" => "Invalid response from book API"
    ]);
    exit;
}

$books = [];

foreach ($data['docs'] as $book) 
{
    $coverId = isset($book['cover_i']) && !empty($book['cover_i'])
        ? (string) $book['cover_i']
        : null;

    $books[] = [
        "openlibrary_id" => $book['key'] ?? null,
        "title" => $book['title'] ?? "Unknown title",
        "author_name" => isset($book['author_name']) && is_array($book['author_name']) && !empty($book['author_name'])
            ? $book['author_name'][0]
            : "Unknown author",
        "publish_year" => $book['first_publish_year'] ?? null,
        "page_count" => $book['number_of_pages_median'] ?? null,
        "cover_id" => $coverId,
        "cover_url" => $coverId
            ? "https://covers.openlibrary.org/b/id/" . $coverId . "-M.jpg"
            : null
    ];
}

echo json_encode([
    "status" => "success",
    "message" => count($books) > 0 ? "Books fetched successfully" : "No books found",
    "books" => $books
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);