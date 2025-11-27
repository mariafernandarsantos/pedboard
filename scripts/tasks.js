const API_URL_TASKS = "http://127.0.0.1:8000";

// Cores diferentes para tarefas
const taskColors = ['bg-blue', 'bg-red', 'bg-lime', 'bg-gold', 'bg-pink'];

function getTaskColor(status) {
    // Você pode fazer a cor depender do status se quiser
    // if (status === 'Pendente') return 'bg-gold';
    // if (status === 'Atrasado') return 'bg-red';
    return taskColors[Math.floor(Math.random() * taskColors.length)];
}

// --- Eventos Globais (Delegação) ---
document.addEventListener("click", (e) => {
    // Abrir Modal
    if (e.target.closest(".tasks-add") || e.target.closest(".btn-add-task")) {
        const modal = document.getElementById("task-modal-overlay");
        if(modal) modal.style.display = "flex";
    }
    
    // Fechar Modal
    if (e.target.closest("#close-task-modal") || e.target.id === "task-modal-overlay") {
        const modal = document.getElementById("task-modal-overlay");
        if(modal) modal.style.display = "none";
    }
});

// --- Enviar Tarefa ---
document.addEventListener("submit", async (e) => {
    if (e.target && e.target.id === "create-task-form") {
        e.preventDefault();

        // Pegando os dados do formulário NOVO (padrão Dashboard)
        const titulo = document.getElementById("task-title").value;
        const pacienteInput = document.getElementById("task-paciente-name").value; // Ex: "1" ou "Nome"
        const descricao = document.getElementById("task-message").value;
        const prazo = document.getElementById("task-deadline").value;
        const urgencia = document.getElementById("task-urgency").value;
        const userId = localStorage.getItem('user_id') || 1;

        // Tenta converter o pacienteInput para ID (se for número)
        // Num sistema real, você usaria um <select> ou busca de ID oculta
        let pacienteId = parseInt(pacienteInput);
        if (isNaN(pacienteId)) pacienteId = 0; // Se não digitou número, envia 0 (ou trate buscar por nome)

        const newTask = {
            Titulo: titulo,
            Nome_Atendente: localStorage.getItem('user_nome') || "Atendente",
            Descricao: descricao,
            Status: "Pendente",
            Urgencia: parseInt(urgencia),
            Data_Prazo: prazo ? new Date(prazo).toISOString() : new Date().toISOString(),
            ID_Acao: 0, 
            ID_Atendente: parseInt(userId),
            // Imagem: "" // Opcional
        };

        try {
            const res = await fetch(`${API_URL_TASKS}/tarefas/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTask)
            });

            if (res.ok) {
                alert("Tarefa criada com sucesso!");
                e.target.reset();
                document.getElementById("task-modal-overlay").style.display = "none";
                loadTasks(); // Recarrega a lista se a função existir na tela
            } else {
                const erro = await res.json();
                alert("Erro ao criar tarefa: " + (erro.detail || JSON.stringify(erro)));
            }
        } catch (err) {
            console.error(err);
            alert("Erro de conexão.");
        }
    }
});

function addTaskToScreen(task) {
    const container = document.getElementById("tasks-list-dashboard") || document.getElementById("tasks-list-area");
    if (!container) return;

    if(container.innerText.includes("Carregando")) container.innerHTML = "";

    const card = document.createElement("div");
    card.className = `card-tarefa-design ${getTaskColor(task.Status)}`;

    card.innerHTML = `
        <div>
            <div class="task-title-design">${task.Titulo}</div>
            <div class="task-desc-design">
                ${task.Descricao}
            </div>
            <div style="font-size:11px; display:flex; align-items:center; gap:5px; margin-bottom:10px;">
                <span>🖼️</span> 2 Imagens
            </div>
        </div>

        <div class="task-footer-design">
            Status: ${task.Status}
        </div>
    `;
    
    container.prepend(card);
}

async function loadTasks() {
    try {
        const res = await fetch(`${API_URL_TASKS}/tarefas/`);
        const tasks = await res.json();
        
        const dashContainer = document.getElementById("tasks-list-dashboard");
        const listContainer = document.getElementById("tasks-list-area");

        if (dashContainer) dashContainer.innerHTML = "";
        if (listContainer) listContainer.innerHTML = "";

        tasks.forEach(t => addTaskToScreen(t));
    } catch (error) {
        console.error("Erro ao carregar tarefas", error);
    }
}

document.addEventListener("DOMContentLoaded", loadTasks);