
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const apiBase = 'http://127.0.0.1:8000'; 

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const Login_User = document.getElementById('login-user').value.trim();
            const Senha = document.getElementById('login-pass').value;

            try {
                const res = await fetch(`${apiBase}/login/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ Login_User, Senha })
                });

                if (!res.ok) {
                    const err = await res.json();
                    alert('Erro: ' + (err.detail || res.statusText));
                    return;
                }

                const data = await res.json();
                // Salva user_id no localStorage para associar tarefas
                if (data.user_id) localStorage.setItem('user_id', data.user_id);
                window.location.href = 'Dashboard.html';
            } catch (err) {
                console.error(err);
                alert('Não foi possível conectar à API. Verifique se o servidor está rodando.');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const Nome = document.getElementById('reg-nome').value.trim();
            const Login_User = document.getElementById('reg-login').value.trim();
            const Email = document.getElementById('reg-email').value.trim();
            const Senha = document.getElementById('reg-pass').value;

            try {
                const res = await fetch(`${apiBase}/register/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ Nome, Login_User, Email, Senha })
                });

                if (!res.ok) {
                    const err = await res.json();
                    alert('Erro: ' + (err.detail || res.statusText));
                    return;
                }

                alert('Registro criado com sucesso! Você será redirecionado para login.');
                window.location.href = 'login.html';
            } catch (err) {
                console.error(err);
                alert('Não foi possível conectar à API. Verifique se o servidor está rodando.');
            }
        });
    }
});
