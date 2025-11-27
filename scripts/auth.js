// scripts/auth.js
const API_URL = "http://127.0.0.1:8000";

// --- LÓGICA DE LOGIN ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede a página de recarregar

        // Pega os valores dos inputs baseados no atributo 'name' ou 'id'
        const loginUser = document.getElementById('login-user').value;
        const loginPass = document.getElementById('login-pass').value;

        // Monta o objeto JSON igual ao schema UsuarioLogin do Python
        const loginData = {
            Login_User: loginUser,
            Senha: loginPass
        };

        try {
            const response = await fetch(`${API_URL}/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            if (response.ok) {
                const result = await response.json();
                
                // --- SUCESSO: SALVA OS DADOS NO NAVEGADOR ---
                console.log("Login autorizado:", result);
                localStorage.setItem('user_id', result.user_id);
                localStorage.setItem('user_nome', result.nome);
                
                // Redireciona para o Dashboard
                window.location.href = 'Dashboard.html'; 
            } else {
                // --- ERRO: SENHA OU USUÁRIO INCORRETOS ---
                const errorData = await response.json();
                alert('Erro: ' + (errorData.detail || 'Falha no login'));
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            alert('Erro ao conectar com o servidor. Verifique se a API está rodando.');
        }
    });
}

// --- LÓGICA DE REGISTRO ---
const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('reg-nome').value;
        const login = document.getElementById('reg-login').value;
        const email = document.getElementById('reg-email').value;
        const senha = document.getElementById('reg-pass').value;

        const registerData = {
            Nome: nome,
            Login_User: login,
            Email: email,
            Senha: senha
        };

        try {
            const response = await fetch(`${API_URL}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData)
            });

            if (!response.ok) {
                 const errorData = await response.json();
                alert('Erro ao registrar: ' + (errorData.detail || 'Dados inválidos'));
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão com o servidor.');
        }
    });
}