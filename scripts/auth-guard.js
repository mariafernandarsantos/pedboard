// Verifica se o usuário NÃO está logado
if (!localStorage.getItem('user_id')) {
    // Redireciona para o login
    window.location.href = 'login.html';
}

function logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_nome');
    window.location.href = 'login.html';
}