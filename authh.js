// Configuration
const API_URL = 'http://localhost:3001/api';

// Vérifier si l'utilisateur est connecté
function isLoggedIn() {
    const user = localStorage.getItem('smartBraceletUser') || sessionStorage.getItem('smartBraceletUser');
    return user ? JSON.parse(user).loggedIn : false;
}

// Obtenir l'utilisateur connecté
function getCurrentUser() {
    const user = localStorage.getItem('smartBraceletUser') || sessionStorage.getItem('smartBraceletUser');
    return user ? JSON.parse(user) : null;
}

// Obtenir le token d'authentification
function getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

// Déconnexion
function logout() {
    localStorage.removeItem('smartBraceletUser');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('smartBraceletUser');
    sessionStorage.removeItem('authToken');
    window.location.href = 'login.html';
}

// Faire une requête authentifiée
async function fetchAuth(url, options = {}) {
    const token = getAuthToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    const response = await fetch(`${API_URL}${url}`, mergedOptions);
    return await response.json();
}

// Vérifier le rôle avant d'accéder à une page
function checkRole(allowedRoles) {
    const user = getCurrentUser();
    if (!user || !user.loggedIn) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (!allowedRoles.includes(user.role)) {
        // Rediriger vers la bonne page selon le rôle
        if (user.role === 'admin') {
            window.location.href = 'adminpanel.html';
        } else {
            window.location.href = 'personnel.html';
        }
        return false;
    }
    
    return true;
}
