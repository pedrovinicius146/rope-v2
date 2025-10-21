document.addEventListener('DOMContentLoaded', () => {
    const userNameEl = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    if (!Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Exibir nome do usuário
    userNameEl.textContent = Auth.getUserName();

    // Logout
    logoutBtn.addEventListener('click', Auth.logout);
});
