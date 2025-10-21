const Auth = (() => {
    const API_URL = 'https://rope-v2-backend.up.railway.app/api/auth';

    const login = async (email, password) => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            credentials: 'include', // ✅ necessário para CORS com cookies/sessão
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro no login');

        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.name);
        return data;
    };

    const register = async (name, email, password) => {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            credentials: 'include', // ✅ idem no registro
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro no registro');

        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.name);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        window.location.href = 'login.html';
    };

    const getToken = () => localStorage.getItem('token');
    const getUserName = () => localStorage.getItem('userName');
    const isAuthenticated = () => !!getToken();

    return { login, register, logout, getToken, getUserName, isAuthenticated };
})();
