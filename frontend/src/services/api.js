// LifeTag Central API Service Client
const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('lifetag_token');
export const setAuthToken = (token) => localStorage.setItem('lifetag_token', token);
export const removeAuthToken = () => localStorage.removeItem('lifetag_token');

async function request(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Do not set Content-Type if uploading FormData
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }
    return data;
}

export const api = {
    // Auth
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/auth/me'),
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

    // Profile
    getProfile: () => request('/profile'),
    updateProfile: (profileData) => request('/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
    uploadAvatar: (formData) => request('/profile/avatar', { method: 'POST', body: formData }),

    // Medical
    getMedical: () => request('/medical'),
    getCatalogs: () => request('/medical/catalogs'),
    updateMedical: (data) => request('/medical', { method: 'PUT', body: JSON.stringify(data) }),
    addCondition: (data) => request('/medical/conditions', { method: 'POST', body: JSON.stringify(data) }),
    removeCondition: (id) => request(`/medical/conditions/${id}`, { method: 'DELETE' }),
    addAllergy: (data) => request('/medical/allergies', { method: 'POST', body: JSON.stringify(data) }),
    removeAllergy: (id) => request(`/medical/allergies/${id}`, { method: 'DELETE' }),
    addMedication: (data) => request('/medical/medications', { method: 'POST', body: JSON.stringify(data) }),
    removeMedication: (id) => request(`/medical/medications/${id}`, { method: 'DELETE' }),

    // Contacts
    getContacts: () => request('/contacts'),
    addContact: (data) => request('/contacts', { method: 'POST', body: JSON.stringify(data) }),
    updateContact: (id, data) => request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteContact: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),
    setPrimaryContact: (id) => request(`/contacts/${id}/primary`, { method: 'PUT' }),

    // Privacy
    getPrivacy: () => request('/privacy'),
    updatePrivacy: (settings) => request('/privacy', { method: 'PUT', body: JSON.stringify(settings) }),

    // QR Management
    getActiveTag: () => request('/qr/active'),
    regenerateQR: (label) => request('/qr/regenerate', { method: 'POST', body: JSON.stringify({ label }) }),
    revokeQR: (id) => request(`/qr/revoke/${id}`, { method: 'PUT' }),
    listTags: () => request('/qr/list'),

    // Public Emergency (No Login Required)
    getEmergencyProfile: (token) => request(`/emergency/${token}`),
    shareLocation: (token, coords) => request(`/emergency/${token}/location`, { method: 'POST', body: JSON.stringify(coords) }),
    triggerAlert: (token, payload) => request(`/emergency/${token}/alert`, { method: 'POST', body: JSON.stringify(payload) }),

    // Analytics
    getDashboardAnalytics: () => request('/analytics/dashboard')
};
