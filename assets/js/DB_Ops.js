async function fetchSavedBooksRequest(minPages = '', maxPages = '') {
    const params = new URLSearchParams();

    if (minPages !== '') {
        params.append('min_pages', minPages);
    }

    if (maxPages !== '') {
        params.append('max_pages', maxPages);
    }

    const queryString = params.toString();
    const url = queryString ? `DB_Ops.php?${queryString}` : 'DB_Ops.php';

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to load saved books.');
    }

    return data;
}

async function saveBookRequest(book) {
    const response = await fetch('DB_Ops.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(book)
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to save the book.');
    }

    return data;
}

async function updateBookRequest(payload) {
    const response = await fetch('DB_Ops.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to update the book.');
    }

    return data;
}

async function deleteBookRequest(id) {
    const response = await fetch(`DB_Ops.php?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json'
        }
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to delete the book.');
    }

    return data;
}