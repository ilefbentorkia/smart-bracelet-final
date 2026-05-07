// js/admin.js - Fonctions communes pour toutes les pages admin

const API_URL = 'http://localhost:3001/api';

function getToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

async function fetchAPI(url, options = {}) {
    try {
        const res = await fetch(`${API_URL}${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
                ...options.headers
            }
        });
        if (res.status === 401) {
            logout();
            return null;
        }
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return null;
    }
}

function logout() {
    if (confirm('Déconnexion ?')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'login.html';
    }
}

// Mettre à jour les infos admin dans le header
function updateAdminInfo() {
    const userStr = localStorage.getItem('smartBraceletUser') || sessionStorage.getItem('smartBraceletUser');
    if (userStr) {
        const user = JSON.parse(userStr);
        const adminNameEl = document.getElementById('adminName');
        const adminUserNameEl = document.getElementById('adminUserName');
        const adminAvatarEl = document.getElementById('adminAvatar');
        if (adminNameEl) adminNameEl.innerHTML = user.name || 'Admin';
        if (adminUserNameEl) adminUserNameEl.innerHTML = user.name || 'Admin';
        if (adminAvatarEl) adminAvatarEl.innerHTML = user.name?.charAt(0) || 'A';
    }
}

// Initialisation commune
document.addEventListener('DOMContentLoaded', () => {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    updateAdminInfo();
});
