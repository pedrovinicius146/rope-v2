// Configuração da API
const API_URL = 'http://localhost:3000/api';

// Classe para gerenciar autenticação
class Auth {
    static getToken() {
        return localStorage.getItem('token');
    }

    static setToken(token) {
        localStorage.setItem('token', token);
    }

    static removeToken() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static async login(email, password) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao fazer login');
        }

        this.setToken(data.data.token);
        this.setUser(data.data.user);
        return data.data;
    }

    static async register(name, email, password) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao registrar');
        }

        this.setToken(data.data.token);
        this.setUser(data.data.user);
        return data.data;
    }

    static logout() {
        this.removeToken();
        window.location.href = 'login.html';
    }

    static async fetchWithAuth(url, options = {}) {
        const token = this.getToken();
        
        if (!token) {
            throw new Error('Não autenticado');
        }

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        // Não adicionar Content-Type para FormData
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Se token inválido, fazer logout
        if (response.status === 401) {
            this.logout();
            return;
        }

        return response;
    }
}

// Exportar para uso global
window.Auth = Auth;
window.API_URL = API_URL;