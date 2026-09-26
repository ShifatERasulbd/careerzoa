async function ensureCsrfCookie() {
    await fetch('/sanctum/csrf-cookie', {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
}

async function requestJson(url, options = {}) {  
    const response = await fetch(url, {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(options.headers || {}),
        },
        ...options,
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
        const message = payload?.message || 'Request failed';
        const error = new Error(message);
        error.status = response.status;
        error.payload = payload;
        throw error;
    }

    return payload;
}

export async function fetchRoles() {
    const payload = await requestJson('/api/roles');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchRole(id) {
    return requestJson(`/api/roles/${id}`);
}

export async function fetchPermissions() {
    const payload = await requestJson('/api/permissions');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchPermissionsByCategory() {
    const payload = await requestJson('/api/permissions/by-category');
    return Array.isArray(payload) ? payload : [];
}

export async function createRole(data) {
    await ensureCsrfCookie();
    return requestJson('/api/roles', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateRole(id, data) {
    await ensureCsrfCookie();
    return requestJson(`/api/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteRole(id) {
    await ensureCsrfCookie();
    return requestJson(`/api/roles/${id}`, {
        method: 'DELETE',
    });
}
