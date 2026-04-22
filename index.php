<?php
$pageTitle = 'PageTurner — Discover Your Next Read';
include 'header.php';
?>

<main class="container app-shell">
    <section class="hero">
        <div class="hero-inner">
            <span class="hero-tag">Your Personal Reading Companion</span>
            <h1>Find books you'll <em>love</em></h1>
            <p>
                Search millions of titles, save the ones that catch your eye, track what you're reading,
                and keep personal notes — all in one place, no page reloads.
            </p>
        </div>
    </section>

    <div id="discoverView" class="page-view active">
        <section class="panel search-panel">
            <div class="panel-header">
                <h2>Discover Books</h2>
                <p>Search by title, author, or any keyword.</p>
            </div>

            <form id="searchForm" class="search-form" novalidate>
                <label for="searchInput">Title, author, or keyword</label>

                <div class="search-row">
                    <input
                        type="text"
                        id="searchInput"
                        name="q"
                        placeholder="e.g. Harry Potter, Stephen King, mystery…"
                        minlength="3"
                        required
                    >

                    <button
                        type="submit"
                        id="searchButton"
                        class="btn btn-primary search-button"
                        disabled
                    >
                        <span class="btn-icon">🔍</span> Search
                    </button>
                </div>

                <small class="field-error" id="searchInputError"></small>
            </form>

            <div id="apiMessage" class="alert hidden" role="alert"></div>

            <div id="searchResults" class="books-grid empty-state">
                <span class="empty-icon">🔎</span>
                <p>Your search results will appear here.</p>
            </div>
        </section>
    </div>

    <div id="libraryView" class="page-view hidden">
        <section class="panel filters-panel">
            <div class="panel-header">
                <h2>Filter My Library</h2>
                <p>Narrow down your saved books by page count.</p>
            </div>

            <form id="filterForm" class="filter-form" novalidate>
                <div class="field-group">
                    <label for="minPages">Min pages</label>
                    <input type="number" id="minPages" min="0" placeholder="0">
                </div>

                <div class="field-group">
                    <label for="maxPages">Max pages</label>
                    <input type="number" id="maxPages" min="0" placeholder="1000">
                </div>

                <div class="actions-row">
                    <button type="submit" class="btn btn-secondary">Apply Filter</button>
                    <button type="button" id="resetFilterBtn" class="btn btn-light">Reset</button>
                </div>
            </form>

            <div id="filterMessage" class="alert hidden" role="alert"></div>
        </section>

        <section class="panel saved-panel">
            <div class="panel-header">
                <h2>My Library</h2>
                <p>Books you've saved — track your reading progress and add personal notes.</p>
            </div>

            <div id="dbMessage" class="alert hidden" role="alert"></div>

            <div id="savedBooks" class="books-grid empty-state">
                <span class="empty-icon">📚</span>
                <p>Your saved books will appear here. Start by searching above!</p>
            </div>
        </section>
    </div>
</main>

<script src="assets/js/API_Ops.js"></script>
<script src="assets/js/DB_Ops.js"></script>
<script src="assets/js/app.js"></script>

<?php include 'footer.php'; ?>