<?php
require_once 'config/db_config.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') 
{
    $minPages = isset($_GET['min_pages']) ? (int) $_GET['min_pages'] : null;
    $maxPages = isset($_GET['max_pages']) ? (int) $_GET['max_pages'] : null;

    if (($minPages !== null && $minPages < 0) || ($maxPages !== null && $maxPages < 0)) 
    {
        echo json_encode([
            "status" => "error",
            "message" => "Page numbers must be positive"
        ]);
        exit;
    }

    if ($minPages !== null && $maxPages !== null && $minPages > $maxPages) 
    {
        echo json_encode([
            "status" => "error",
            "message" => "min_pages cannot be greater than max_pages"
        ]);
        exit;
    }

    $books = [];

    if ($minPages !== null && $maxPages !== null) 
    {
        $stmt = $conn->prepare("
            SELECT * 
            FROM saved_books
            WHERE page_count BETWEEN ? AND ?
            ORDER BY created_at DESC
        ");

        $stmt->bind_param("ii", $minPages, $maxPages);
        $stmt->execute();

        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) 
        {
            $row['cover_url'] = !empty($row['cover_id'])
                ? "https://covers.openlibrary.org/b/id/" . $row['cover_id'] . "-M.jpg"
                : null;

            $books[] = $row;
        }

        $stmt->close();
    } 
    else 
    {
        $sql = "SELECT * FROM saved_books ORDER BY created_at DESC";
        $result = $conn->query($sql);

        while ($row = $result->fetch_assoc()) 
        {
            $row['cover_url'] = !empty($row['cover_id'])
                ? "https://covers.openlibrary.org/b/id/" . $row['cover_id'] . "-M.jpg"
                : null;

            $books[] = $row;
        }
    }

    echo json_encode([
        "status" => "success",
        "message" => "Books fetched successfully",
        "books" => $books
    ]);
    exit;
}
if ($method === 'POST') 
{
    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input) 
    {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid or missing JSON body"
        ]);
        exit;
    }

    $openlibrary_id = trim($input['openlibrary_id'] ?? '');
    $title = trim($input['title'] ?? '');
    $author_name = trim($input['author_name'] ?? '');
    $publish_year = isset($input['publish_year']) && $input['publish_year'] !== '' ? (int)$input['publish_year'] : null;
    $page_count = isset($input['page_count']) && $input['page_count'] !== '' ? (int)$input['page_count'] : null;
    $cover_id = trim($input['cover_id'] ?? '');
    $status = trim($input['status'] ?? 'not_read');
    $user_note = trim($input['user_note'] ?? '');

    $allowedStatuses = ['not_read', 'reading', 'read'];

    if ($openlibrary_id === '' || $title === '') 
    {
        echo json_encode([
            "status" => "error",
            "message" => "openlibrary_id and title are required"
        ]);
        exit;
    }

    if (!in_array($status, $allowedStatuses, true)) 
    {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid status value"
        ]);
        exit;
    }

    if ($publish_year !== null && $publish_year < 0) 
    {
        echo json_encode([
            "status" => "error",
            "message" => "publish_year must be a positive number"
        ]);
        exit;
    }

    if ($page_count !== null && $page_count < 0) 
    {
        echo json_encode([
            "status" => "error",
            "message" => "page_count must be a positive number"
        ]);
        exit;
    }

    $stmt = $conn->prepare("
        INSERT INTO saved_books
        (openlibrary_id, title, author_name, publish_year, page_count, cover_id, status, user_note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if (!$stmt) 
    {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to prepare statement"
        ]);
        exit;
    }

    $stmt->bind_param(
        "sssiisss",
        $openlibrary_id,
        $title,
        $author_name,
        $publish_year,
        $page_count,
        $cover_id,
        $status,
        $user_note
    );

    try 
    {
        $stmt->execute();

        echo json_encode([
            "status" => "success",
            "message" => "Book created successfully",
            "book_id" => $stmt->insert_id
        ]);
    } 
    catch (mysqli_sql_exception $e) 
    {
        if ($e->getCode() == 1062) 
        {
            echo json_encode([
                "status" => "error",
                "message" => "This book is already saved"
            ]);
        } 
        else 
        {
            echo json_encode([
                "status" => "error",
                "message" => "Failed to create book",
                "mysql_error" => $e->getMessage()
            ]);
        }
    }

    $stmt->close();
    exit;
}
if ($method === 'PUT') 
{
    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input) 
    {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid or missing JSON body"
        ]);
        exit;
    }

    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $status = trim($input['status'] ?? '');
    $user_note = trim($input['user_note'] ?? '');

    $allowedStatuses = ['not_read', 'reading', 'read'];

    if ($id <= 0) 
    {
        echo json_encode([
            "status" => "error",
            "message" => "Valid book id is required"
        ]);
        exit;
    }

    if ($status === '' || !in_array($status, $allowedStatuses, true)) 
    {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid status value"
        ]);
        exit;
    }

    $stmt = $conn->prepare("
        UPDATE saved_books
        SET status = ?, user_note = ?
        WHERE id = ?
    ");

    if (!$stmt) 
    {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to prepare statement"
        ]);
        exit;
    }

    $stmt->bind_param("ssi", $status, $user_note, $id);

    try 
    {
        $stmt->execute();

        if ($stmt->affected_rows > 0) 
        {
            echo json_encode([
                "status" => "success",
                "message" => "Book updated successfully"
            ]);
        } 
    } 
    catch (mysqli_sql_exception $e) 
    {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to update book",
            "mysql_error" => $e->getMessage()
        ]);
    }

    $stmt->close();
    exit;
}
if ($method === 'DELETE') 
{
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($id <= 0) 
    {
        echo json_encode([
            "status" => "error",
            "message" => "Valid book id is required"
        ]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM saved_books WHERE id = ?");

    if (!$stmt) 
    {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to prepare statement"
        ]);
        exit;
    }

    $stmt->bind_param("i", $id);

    try 
    {
        $stmt->execute();

        if ($stmt->affected_rows > 0) 
        {
            echo json_encode([
                "status" => "success",
                "message" => "Book deleted successfully"
            ]);
        } 
        else 
        {
            echo json_encode([
                "status" => "error",
                "message" => "Book not found"
            ]);
        }
    } 
    catch (mysqli_sql_exception $e) 
    {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to delete book",
            "mysql_error" => $e->getMessage()
        ]);
    }

    $stmt->close();
    exit;
}

echo json_encode([
    "status" => "error",
    "message" => "Method not allowed"
]);