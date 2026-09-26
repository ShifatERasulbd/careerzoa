import axios from 'axios';
const BASE_URL = '/api/resumes';

async function handleResponse(response) {
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


export async function fetchResumes(){
    const payload = await requestJson('/api/resumes');
    return Array.isArray(payload) ? payload : []; // Changed 'array' to 'Array'
}

export async function fetchResume(id){
    return requestJson(`/api/resume/${id}`);
}

export async function createResume(file) {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(BASE_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData,
    });

    return handleResponse(response);
}

export async function updateResume(id, { file, isActive } = {}) {
    // If there's no file, send a clean JSON PUT request
    if (!file) {
        return requestJson(`${BASE_URL}/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ is_active: isActive ? 1 : 0 }),
        });
    }

    // Otherwise, use FormData if a file is attached
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('resume', file);

    if (isActive !== undefined) {
        formData.append('is_active', isActive ? 1 : 0);
    }

    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData,
    });

    return handleResponse(response);
}

export async function deleteResume(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    return handleResponse(response);
}

export async function fetchParsedResume(id) {
    return requestJson(`${BASE_URL}/${id}/parsed`);
}

export async function fetchAtsScore(id, jobDescription = '') {
    const { data } = await axios.post(`/api/resumes/${id}/ats-score`, {
        job_description: jobDescription,
    });
    return data;
}