const Auth = (() => { // IIFE: cria um módulo encapsulado e imediatamente executado; retorna um objeto com funções públicas.
    const API_URL = 'https://rope-v2-production.up.railway.app/api/auth'; // URL base da API de autenticação.

    const login = async (email, password) => { // Função assíncrona para realizar login com email e senha.
        const res = await fetch(`${API_URL}/login`, { // Faz uma requisição POST para /login.
            method: 'POST', // Método HTTP: POST — estamos enviando dados.
            credentials: 'include', // ✅ Inclui cookies/sessão na requisição (necessário quando servidor usa cookies e há CORS).
            headers: { 'Content-Type': 'application/json' }, // Cabeçalho informando que o corpo é JSON.
            body: JSON.stringify({ email, password }) // Converte objeto {email, password} para JSON no corpo da requisição.
        });

        const data = await res.json(); // Lê o corpo da resposta e converte de JSON para objeto JS.
        if (!res.ok) throw new Error(data.message || 'Erro no login'); // Se status HTTP não for 2xx, lança erro com mensagem do servidor ou padrão.

        localStorage.setItem('token', data.token); // Salva o token retornado no localStorage para uso posterior (persistência no browser).
        localStorage.setItem('userName', data.name); // Salva o nome de usuário no localStorage (para exibir na UI, por exemplo).
        return data; // Retorna os dados recebidos (útil para quem chamou login).
    };

    const register = async (name, email, password) => { // Função assíncrona para registrar um novo usuário.
        const res = await fetch(`${API_URL}/register`, { // Faz uma requisição POST para /register.
            method: 'POST', // Método HTTP: POST para criar novo recurso/usuário.
            credentials: 'include', // ✅ Também inclui cookies/sessão — útil se o backend setar cookie de sessão no registro.
            headers: { 'Content-Type': 'application/json' }, // Cabeçalho indicando JSON no corpo.
            body: JSON.stringify({ name, email, password }) // Corpo com nome, email e senha como JSON.
        });

        const data = await res.json(); // Converte resposta JSON em objeto JS.
        if (!res.ok) throw new Error(data.message || 'Erro no registro'); // Se houve erro HTTP, lança Error com a mensagem apropriada.

        localStorage.setItem('token', data.token); // Armazena token retornado após registro.
        localStorage.setItem('userName', data.name); // Armazena nome do usuário retornado.
        return data; // Retorna os dados do servidor para uso posterior.
    };

    const logout = () => { // Função síncrona para deslogar o usuário localmente.
        localStorage.removeItem('token'); // Remove token do localStorage.
        localStorage.removeItem('userName'); // Remove nome do usuário do localStorage.
        window.location.href = 'login.html'; // Redireciona para a página de login (pode ser ajustado conforme fluxo da app).
    };

    const getToken = () => localStorage.getItem('token'); // Retorna o token armazenado (ou null se não existir).
    const getUserName = () => localStorage.getItem('userName'); // Retorna o nome do usuário armazenado.
    const isAuthenticated = () => !!getToken(); // True se houver token (coerção para booleano), indicando autenticação.

    return { login, register, logout, getToken, getUserName, isAuthenticated }; // Exporta as funções públicas do módulo.
})(); // Fim do IIFE: Auth agora contém o objeto retornado com as funções acessíveis externamente.
