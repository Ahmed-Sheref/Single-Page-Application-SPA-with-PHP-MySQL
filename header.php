<?php
if (!isset($pageTitle)) {
    $pageTitle = 'PageTurner';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle); ?></title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Lora:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <header class="site-header">
        <div class="container header-content">
            <div class="brand-wrap">
                <span class="brand">
                    <span class="brand-icon">📖</span>
                    PageTurner
                </span>
            </div>

            <nav class="site-nav" aria-label="Primary navigation">
                <a href="?view=discover" class="nav-link active" data-view-target="discover">Discover</a>
                <a href="?view=library" class="nav-link" data-view-target="library">My Library</a>
            </nav>
        </div>
    </header>