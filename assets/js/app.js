const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchInputError = document.getElementById('searchInputError');
const searchResults = document.getElementById('searchResults');
const apiMessage = document.getElementById('apiMessage');

const filterForm = document.getElementById('filterForm');
const minPagesInput = document.getElementById('minPages');
const maxPagesInput = document.getElementById('maxPages');
const resetFilterBtn = document.getElementById('resetFilterBtn');
const filterMessage = document.getElementById('filterMessage');

const savedBooks = document.getElementById('savedBooks');
const dbMessage = document.getElementById('dbMessage');

const discoverView = document.getElementById('discoverView');
const libraryView = document.getElementById('libraryView');
const navLinks = document.querySelectorAll('[data-view-target]');

const MIN_SEARCH_LENGTH = 3;
const MAX_NOTE_LENGTH = 500;
const ALLOWED_STATUSES = ['not_read', 'reading', 'read'];

document.addEventListener('DOMContentLoaded', function () {
    bindEvents();
    updateSearchValidationState();

    const initialView = getViewFromUrl();
    switchView(initialView, false);

    if (initialView === 'library') {
        loadSavedBooks();
    }
});

window.addEventListener('popstate', function () {
    const currentView = getViewFromUrl();
    switchView(currentView, false);

    if (currentView === 'library') {
        loadSavedBooks(minPagesInput.value.trim(), maxPagesInput.value.trim());
    }
});

function bindEvents() {
    navLinks.forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();

            const targetView = link.dataset.viewTarget;
            switchView(targetView, true);

            if (targetView === 'library') {
                loadSavedBooks(minPagesInput.value.trim(), maxPagesInput.value.trim());
            }
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            updateSearchValidationState();
        });

        searchInput.addEventListener('keyup', function () {
            updateSearchValidationState();
        });
    }

    if (searchForm) {
        searchForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const validation = validateSearchInput();

            if (!validation.valid) {
                updateSearchValidationState();
                searchInput.focus();
                return;
            }

            hideMessage(apiMessage);

            const originalText = searchButton.innerHTML;
            searchButton.disabled = true;
            searchButton.innerHTML = '<span class="btn-icon">⏳</span> Searching...';

            try {
                const data = await searchBooksRequest(validation.cleanedValue);
                renderSearchResults(data.books || []);

                if (!data.books || data.books.length === 0) {
                    showMessage(apiMessage, 'No books found for your search.', 'warning');
                } else {
                    showMessage(apiMessage, data.message || 'Books loaded successfully.', 'success');
                }
            } catch (error) {
                renderEmptyState(searchResults, '🔎', 'Could not load search results.');
                showMessage(apiMessage, error.message || 'Something went wrong while searching.', 'error');
            } finally {
                searchButton.innerHTML = originalText;
                updateSearchValidationState();
            }
        });
    }

    if (filterForm) {
        filterForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const validation = validateFilterInputs();

            if (!validation.valid) {
                showMessage(filterMessage, validation.message, 'error');
                return;
            }

            hideMessage(filterMessage);
            await loadSavedBooks(validation.minPages, validation.maxPages);

            if (validation.minPages !== '' || validation.maxPages !== '') {
                showMessage(filterMessage, 'Filter applied successfully.', 'success');
            }
        });
    }

    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', async function () {
            minPagesInput.value = '';
            maxPagesInput.value = '';
            hideMessage(filterMessage);
            await loadSavedBooks();
        });
    }
}

function getViewFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');

    if (view === 'library') {
        return 'library';
    }

    return 'discover';
}

function switchView(viewName, pushState = true) {
    if (viewName === 'library') {
        discoverView.classList.remove('active');
        discoverView.classList.add('hidden');

        libraryView.classList.remove('hidden');
        libraryView.classList.add('active');
    } else {
        libraryView.classList.remove('active');
        libraryView.classList.add('hidden');

        discoverView.classList.remove('hidden');
        discoverView.classList.add('active');
    }

    navLinks.forEach(function (link) {
        if (link.dataset.viewTarget === viewName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    if (pushState) {
        const url = viewName === 'library' ? '?view=library' : '?view=discover';
        window.history.pushState({}, '', url);
    }
}

function updateSearchValidationState() {
    if (!searchInput || !searchButton || !searchInputError) {
        return;
    }

    const cleanedValue = searchInput.value.replace(/\s+/g, ' ').trim();
    const length = cleanedValue.length;

    if (length === 0) {
        searchInput.classList.remove('input-invalid');
        searchInputError.textContent = '';
        searchButton.disabled = true;
        return;
    }

    if (length < MIN_SEARCH_LENGTH) {
        searchInput.classList.add('input-invalid');
        searchInputError.textContent = 'The minimum number of charcters is 3';
        searchButton.disabled = true;
        return;
    }

    searchInput.classList.remove('input-invalid');
    searchInputError.textContent = '';
    searchButton.disabled = false;
}

function validateSearchInput() {
    const cleanedValue = searchInput.value.replace(/\s+/g, ' ').trim();

    if (cleanedValue.length < MIN_SEARCH_LENGTH) {
        return {
            valid: false,
            cleanedValue: cleanedValue
        };
    }

    return {
        valid: true,
        cleanedValue: cleanedValue
    };
}

function validateFilterInputs() {
    const minPages = minPagesInput.value.trim();
    const maxPages = maxPagesInput.value.trim();

    if (minPages !== '' && Number(minPages) < 0) {
        return {
            valid: false,
            message: 'Min pages cannot be negative.'
        };
    }

    if (maxPages !== '' && Number(maxPages) < 0) {
        return {
            valid: false,
            message: 'Max pages cannot be negative.'
        };
    }

    if (minPages !== '' && maxPages !== '' && Number(minPages) > Number(maxPages)) {
        return {
            valid: false,
            message: 'Min pages cannot be greater than max pages.'
        };
    }

    return {
        valid: true,
        minPages: minPages,
        maxPages: maxPages
    };
}

async function loadSavedBooks(minPages = '', maxPages = '') {
    hideMessage(dbMessage);

    try {
        const data = await fetchSavedBooksRequest(minPages, maxPages);
        renderSavedBooks(data.books || []);
    } catch (error) {
        renderEmptyState(savedBooks, '📚', 'Could not load saved books.');
        showMessage(dbMessage, error.message || 'Failed to load saved books.', 'error');
    }
}

function renderSearchResults(books) {
    if (!Array.isArray(books) || books.length === 0) {
        renderEmptyState(searchResults, '🔎', 'Your search results will appear here.');
        return;
    }

    searchResults.classList.remove('empty-state');
    searchResults.innerHTML = books.map(function (book) {
        return buildSearchBookCard(book);
    }).join('');

    const saveButtons = searchResults.querySelectorAll('[data-save-book]');

    saveButtons.forEach(function (button) {
        button.addEventListener('click', async function () {
            const payload = {
                openlibrary_id: button.dataset.openlibraryId || '',
                title: button.dataset.title || '',
                author_name: button.dataset.authorName || '',
                publish_year: button.dataset.publishYear || '',
                page_count: button.dataset.pageCount || '',
                cover_id: button.dataset.coverId || '',
                status: 'not_read',
                user_note: ''
            };

            const validation = validateBookPayload(payload);

            if (!validation.valid) {
                showMessage(apiMessage, validation.message, 'error');
                return;
            }

            const originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = 'Saving...';

            try {
                await saveBookRequest(validation.cleanedPayload);
                showMessage(apiMessage, 'Book saved successfully.', 'success');
                button.classList.remove('btn-primary');
                button.classList.add('btn-saved');
                button.innerHTML = '✓ Saved';
                await loadSavedBooks(minPagesInput.value.trim(), maxPagesInput.value.trim());
            } catch (error) {
                button.disabled = false;
                button.innerHTML = originalText;
                showMessage(apiMessage, error.message || 'Failed to save this book.', 'error');
                button.innerHTML = 'Book Already Saved';
            }
        });
    });
}

function renderSavedBooks(books) {
    if (!Array.isArray(books) || books.length === 0) {
        renderEmptyState(savedBooks, '📚', 'Your saved books will appear here. Start by searching above!');
        return;
    }

    savedBooks.classList.remove('empty-state');
    savedBooks.innerHTML = books.map(function (book) {
        return buildSavedBookCard(book);
    }).join('');

    const savedForms = savedBooks.querySelectorAll('.saved-book-form');

    savedForms.forEach(function (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            const id = Number(form.dataset.id);
            const status = form.querySelector('[name="status"]').value;
            const userNote = form.querySelector('[name="user_note"]').value.trim();

            if (!ALLOWED_STATUSES.includes(status)) {
                showMessage(dbMessage, 'Please choose a valid reading status.', 'error');
                return;
            }

            if (userNote.length > MAX_NOTE_LENGTH) {
                showMessage(dbMessage, 'Note must be 500 characters or less.', 'error');
                return;
            }

            const updateButton = form.querySelector('[data-update-book]');
            const originalText = updateButton.textContent;
            updateButton.disabled = true;
            updateButton.textContent = 'Updating...';

            try {
                await updateBookRequest({
                    id: id,
                    status: status,
                    user_note: userNote
                });

                showMessage(dbMessage, 'Book updated successfully.', 'success');
                await loadSavedBooks(minPagesInput.value.trim(), maxPagesInput.value.trim());
            } catch (error) {
                showMessage(dbMessage, error.message || 'Failed to update this book.', 'error');
            } finally {
                updateButton.disabled = false;
                updateButton.textContent = originalText;
            }
        });
    });

    const deleteButtons = savedBooks.querySelectorAll('[data-delete-book]');

    deleteButtons.forEach(function (button) {
        button.addEventListener('click', async function () {
            const id = button.dataset.deleteBook;
            const title = button.dataset.title || 'this book';

            const confirmed = window.confirm('Are you sure you want to delete "' + title + '"?');

            if (!confirmed) {
                return;
            }

            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = 'Deleting...';

            try {
                await deleteBookRequest(id);
                showMessage(dbMessage, 'Book deleted successfully.', 'success');
                await loadSavedBooks(minPagesInput.value.trim(), maxPagesInput.value.trim());
            } catch (error) {
                showMessage(dbMessage, error.message || 'Failed to delete this book.', 'error');
            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    });
}

function validateBookPayload(payload) {
    const cleanedPayload = {
        openlibrary_id: String(payload.openlibrary_id || '').trim(),
        title: String(payload.title || '').trim(),
        author_name: String(payload.author_name || 'Unknown author').trim(),
        publish_year: normalizeOptionalNumber(payload.publish_year),
        page_count: normalizeOptionalNumber(payload.page_count),
        cover_id: String(payload.cover_id || '').trim(),
        status: 'not_read',
        user_note: ''
    };

    if (!cleanedPayload.openlibrary_id) {
        return {
            valid: false,
            message: 'This book cannot be saved because its ID is missing.'
        };
    }

    if (!cleanedPayload.title) {
        return {
            valid: false,
            message: 'This book cannot be saved because its title is missing.'
        };
    }

    return {
        valid: true,
        cleanedPayload: cleanedPayload
    };
}

function normalizeOptionalNumber(value) {
    const cleaned = String(value ?? '').trim();

    if (cleaned === '' || Number.isNaN(Number(cleaned))) {
        return '';
    }

    return Number(cleaned);
}

function buildSearchBookCard(book) {
    const title = escapeHtml(book.title || 'Unknown title');
    const author = escapeHtml(book.author_name || 'Unknown author');
    const publishYear = book.publish_year ? escapeHtml(String(book.publish_year)) : 'N/A';
    const pageCount = book.page_count ? escapeHtml(String(book.page_count)) : 'N/A';

    return `
        <article class="book-card">
            ${buildCover(book.cover_url, title)}
            <div class="book-info">
                <h3 class="book-title">${title}</h3>
                <p class="book-author">${author}</p>

                <div class="book-meta-row">
                    <span class="book-meta-item">
                        <span class="meta-label">Year:</span> ${publishYear}
                    </span>
                    <span class="book-meta-item">
                        <span class="meta-label">Pages:</span> ${pageCount}
                    </span>
                </div>
            </div>

            <div class="book-actions">
                <button
                    type="button"
                    class="btn btn-primary btn-save"
                    data-save-book="1"
                    data-openlibrary-id="${escapeAttribute(book.openlibrary_id || '')}"
                    data-title="${escapeAttribute(book.title || '')}"
                    data-author-name="${escapeAttribute(book.author_name || '')}"
                    data-publish-year="${escapeAttribute(String(book.publish_year ?? ''))}"
                    data-page-count="${escapeAttribute(String(book.page_count ?? ''))}"
                    data-cover-id="${escapeAttribute(String(book.cover_id ?? ''))}"
                >
                    Save Book
                </button>
            </div>
        </article>
    `;
}

function buildSavedBookCard(book) {
    const title = escapeHtml(book.title || 'Unknown title');
    const author = escapeHtml(book.author_name || 'Unknown author');
    const publishYear = book.publish_year ? escapeHtml(String(book.publish_year)) : 'N/A';
    const pageCount = book.page_count ? escapeHtml(String(book.page_count)) : 'N/A';
    const note = escapeHtml(book.user_note || '');
    const status = ALLOWED_STATUSES.includes(book.status) ? book.status : 'not_read';

    return `
        <article class="book-card book-card--saved">
            ${buildCover(book.cover_url, title)}
            <div class="book-info">
                <span class="book-status-badge ${getStatusClass(status)}">${formatStatus(status)}</span>
                <h3 class="book-title">${title}</h3>
                <p class="book-author">${author}</p>

                <div class="book-meta-row">
                    <span class="book-meta-item">
                        <span class="meta-label">Year:</span> ${publishYear}
                    </span>
                    <span class="book-meta-item">
                        <span class="meta-label">Pages:</span> ${pageCount}
                    </span>
                </div>
            </div>

            <form class="saved-book-form" data-id="${escapeAttribute(String(book.id))}">
                <div class="field-group">
                    <label>Status</label>
                    <select name="status">
                        ${buildStatusOptions(status)}
                    </select>
                </div>

                <div class="field-group grow">
                    <label>Note</label>
                    <textarea name="user_note" placeholder="Add a personal note...">${note}</textarea>
                </div>

                <div class="actions-row">
                    <button type="submit" class="btn btn-secondary" data-update-book>Update</button>
                    <button
                        type="button"
                        class="btn btn-danger"
                        data-delete-book="${escapeAttribute(String(book.id))}"
                        data-title="${escapeAttribute(book.title || 'this book')}"
                    >
                        Delete
                    </button>
                </div>
            </form>
        </article>
    `;
}

function buildStatusOptions(selectedStatus) {
    return ALLOWED_STATUSES.map(function (status) {
        const selected = status === selectedStatus ? 'selected' : '';
        return `<option value="${status}" ${selected}>${formatStatus(status)}</option>`;
    }).join('');
}

function formatStatus(status) {
    if (status === 'not_read') return 'Not Read';
    if (status === 'reading') return 'Reading';
    if (status === 'read') return 'Read';
    return status;
}

function getStatusClass(status) {
    if (status === 'reading') return 'status-reading';
    if (status === 'read') return 'status-read';
    return 'status-not_read';
}

function buildCover(coverUrl, title) {
    if (coverUrl) {
        return `<img class="book-cover" src="${escapeAttribute(coverUrl)}" alt="${escapeAttribute(title)} cover">`;
    }

    return `<div class="book-cover book-cover--placeholder">📘</div>`;
}

function renderEmptyState(container, icon, message) {
    container.classList.add('empty-state');
    container.innerHTML = `
        <span class="empty-icon">${escapeHtml(icon)}</span>
        <p>${escapeHtml(message)}</p>
    `;
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = 'alert ' + type;
    element.classList.remove('hidden');
}

function hideMessage(element) {
    element.textContent = '';
    element.className = 'alert hidden';
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeAttribute(value) {
    return escapeHtml(value);
}