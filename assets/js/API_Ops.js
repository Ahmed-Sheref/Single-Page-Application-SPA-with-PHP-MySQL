async function searchBooksRequest(query) {
    const response = await fetch(`API_Ops.php?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });

    let data;
    try {
        data = await response.json();
    } catch (error) {
        throw new Error('Invalid JSON response from API endpoint.');
    }

    if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Failed to search books.');
    }

    return data;
}