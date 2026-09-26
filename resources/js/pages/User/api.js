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
    const isFormData = options.body instanceof FormData;

    const response = await fetch(url, {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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

export async function fetchUsers() {
    const payload = await requestJson('/api/users');
    return Array.isArray(payload) ? payload : [];
}

export async function fetchUser(id) {
    return requestJson(`/api/users/${id}`);
}

export async function createUser(data) {
    await ensureCsrfCookie();

    const isMultipart = data?.avatar instanceof File;
    const body = isMultipart
        ? (() => {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value === undefined || value === null || value === '') return;
                formData.append(key, value);
            });
            return formData;
        })()
        : JSON.stringify(data);

    return requestJson('/api/users', {
        method: 'POST',
        body,
    });
}

export async function updateUser(id, data) {
    await ensureCsrfCookie();

    const isMultipart = data?.avatar instanceof File;

    if (isMultipart) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return;
            formData.append(key, value);
        });
        formData.append('_method', 'PUT');

        return requestJson(`/api/users/${id}`, {
            method: 'POST',
            body: formData,
        });
    }

    return requestJson(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteUser(id) {
    await ensureCsrfCookie();
    return requestJson(`/api/users/${id}`, {
        method: 'DELETE',
    });
}
