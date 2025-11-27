(function() {
    const userId = localStorage.getItem('user_id');
    
    // Se não tiver ID salvo, redireciona para o login
    if (!userId) {
        window.location.href = 'login.html';
    }
})();

// Função opcional de Logout para usar nos botões
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}