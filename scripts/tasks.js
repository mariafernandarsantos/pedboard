const API_URL_TASKS = "http://127.0.0.1:8000";

// --- Cores por Urgência ---
function getUrgencyClass(level) {
    switch (parseInt(level)) {
        case 1: return 'task-urgency-1';
        case 2: return 'task-urgency-2';
        case 3: return 'task-urgency-3';
        case 4: return 'task-urgency-4';
        case 5: return 'task-urgency-5';
        default: return 'task-urgency-3';
    }
}

// --- Carregar Pacientes no Select ---
async function carregarPacientesTask() {
    const select = document.getElementById("task-paciente-select");
    if (!select) return;

    try {
        const res = await fetch(`${API_URL_TASKS.replace('/tarefas', '')}/pacientes/`);
        if (res.ok) {
            const pacientes = await res.json();
            select.innerHTML = '<option value="">Selecione um paciente (Opcional)</option>';
            pacientes.forEach(p => {
                const option = document.createElement("option");
                option.value = p.ID_Paciente;
                option.textContent = `${p.Nome}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar pacientes:", error);
    }
}

// --- Adicionar Tarefa na Tela ---
function addTaskToScreen(task) {
    const container = document.getElementById("tasks-list-area") || document.getElementById("tasks-list-dashboard");
    if (!container) return;

    const emptyMsg = container.querySelector('.empty-msg');
    if (emptyMsg) emptyMsg.remove();

    const card = document.createElement("div");
    card.className = `task-card-design ${getUrgencyClass(task.Urgencia)}`;

    const loggedUserId = parseInt(localStorage.getItem('user_id'));
    const isOwner = loggedUserId === task.ID_Atendente;

    let actionsHtml = '';
    if (isOwner) {
        actionsHtml = `
            <div style="display:flex; gap:8px; margin-top:8px; justify-content:flex-end;">
                <button class="action-btn" title="Editar" onclick='openEditTaskModal(${JSON.stringify(task)})'>✏️</button>
                <button class="action-btn" title="Excluir" onclick="deleteTask(${task.ID_Tarefa})">🗑️</button>
            </div>
        `;
    }

    let dataPrazo = "Sem prazo";
    if(task.Data_Prazo) {
        try { dataPrazo = new Date(task.Data_Prazo).toLocaleDateString('pt-BR'); } catch(e) {}
    }

    card.innerHTML = `
        <div class="task-header">
            <h4>${task.Titulo}</h4>
        </div>
        <div class="task-body">
            <p>${task.Descricao}</p>
            ${task.ID_Paciente ? `<p style="font-size:11px; margin-top:5px; background:rgba(0,0,0,0.1); padding:2px 5px; border-radius:4px; display:inline-block;">👤 Paciente ID: ${task.ID_Paciente}</p>` : ''}
        </div>
        <div class="task-footer">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>${dataPrazo}</span>
                <span style="font-size:11px; background:rgba(0,0,0,0.2); padding:2px 6px; border-radius:4px;">${task.Status}</span>
            </div>
            ${actionsHtml}
        </div>
    `;
    
    container.appendChild(card);
}

// --- Carregar Tarefas ---
async function loadTasks() {
    try {
        const res = await fetch(`${API_URL_TASKS}/tarefas/`);
        const tasks = await res.json();
        const container = document.getElementById("tasks-list-area") || document.getElementById("tasks-list-dashboard");
        
        if (container) {
            container.innerHTML = ""; 
            if (tasks.length === 0) {
                container.innerHTML = '<p class="empty-msg" style="padding:20px; color:#888;">Nenhuma tarefa encontrada.</p>';
                return;
            }
            tasks.forEach(t => addTaskToScreen(t));
        }
    } catch (error) { console.error("Erro loading tasks:", error); }
}

// --- FUNÇÃO PARA ABRIR O MODAL NO MODO "EDITAR" ---
window.openEditTaskModal = function(task) {
    // 1. Preenche os campos
    document.getElementById("task-title").value = task.Titulo;
    document.getElementById("task-message").value = task.Descricao;
    if(task.Data_Prazo) document.getElementById("task-deadline").value = task.Data_Prazo.split('T')[0];
    
    const selectPac = document.getElementById("task-paciente-select");
    if (selectPac) selectPac.value = task.ID_Paciente || "";

    // 2. Configura ID Oculto e Urgência
    const editInput = document.getElementById("task-edit-id");
    if(editInput) editInput.value = task.ID_Tarefa;
    
    const urgInput = document.getElementById("task-urgency");
    if(urgInput) urgInput.value = task.Urgencia;

    // Atualiza visual dos botões de urgência
    document.querySelectorAll(".urgency-buttons button").forEach(b => b.style.border = "none");
    const btnUrg = document.querySelector(`.urgency-buttons button[data-urg='${task.Urgencia}']`);
    if(btnUrg) btnUrg.style.border = "2px solid #333";

    // --- 3. MUDANÇA VISUAL (Troca o texto para Salvar) ---
    document.querySelector("#task-modal-overlay h2").textContent = "Editar Tarefa";
    document.querySelector("#create-task-form .btn-submit-modal").textContent = "Salvar tarefa";

    // Abre o modal
    document.getElementById("task-modal-overlay").style.display = "flex";
}

// --- FUNÇÃO PARA RESETAR O MODAL (Modo Criar) ---
function resetTaskModal() {
    const form = document.getElementById("create-task-form");
    if(form) form.reset();
    
    // Zera o ID (significa criação)
    const editInput = document.getElementById("task-edit-id");
    if(editInput) editInput.value = "0";
    
    // --- MUDANÇA VISUAL (Troca o texto para Criar) ---
    const modalTitle = document.querySelector("#task-modal-overlay h2");
    if(modalTitle) modalTitle.textContent = "Criar tarefas";
    
    const btnSubmit = document.querySelector("#create-task-form .btn-submit-modal");
    if(btnSubmit) btnSubmit.textContent = "Criar tarefa";
    
    // Reseta visual da urgência
    document.querySelectorAll(".urgency-buttons button").forEach(b => b.style.border = "none");
}

// --- EVENTOS GERAIS (Botões e Fechar) ---
document.addEventListener("click", (e) => {
    
    // Se clicar no botão "+" para ADICIONAR nova tarefa
    if (e.target.closest(".tasks-add") || e.target.closest(".btn-add-task")) {
        resetTaskModal(); // Garante que esteja limpo e com texto "Criar tarefa"
        const modal = document.getElementById("task-modal-overlay");
        if(modal) modal.style.display = "flex";
    }

    // Se clicar nos botões de urgência
    if (e.target.matches(".urgency-buttons button")) {
        const btn = e.target;
        document.getElementById("task-urgency").value = btn.getAttribute("data-urg");
        document.querySelectorAll(".urgency-buttons button").forEach(b => b.style.border = "none");
        btn.style.border = "2px solid #333";
    }
    
    // Se fechar o modal, reseta tudo para evitar bugs na próxima abertura
    if (e.target.closest("#close-task-modal") || e.target.classList.contains("modal-overlay")) {
        // Verifica se é o modal de tarefa sendo fechado
        const taskOverlay = document.getElementById("task-modal-overlay");
        if (e.target === taskOverlay || e.target.closest("#close-task-modal")) {
            resetTaskModal();
        }
    }
});

// --- ENVIAR FORMULÁRIO ---
document.addEventListener("submit", async (e) => {
    if (e.target && e.target.id === "create-task-form") {
        e.preventDefault();

        const editInput = document.getElementById("task-edit-id");
        const taskId = editInput ? editInput.value : "0";
        const userId = parseInt(localStorage.getItem('user_id'));
        const urgInput = document.getElementById("task-urgency");
        
        const selectPaciente = document.getElementById("task-paciente-select");
        const idPaciente = selectPaciente.value ? parseInt(selectPaciente.value) : null;

        const taskData = {
            Titulo: document.getElementById("task-title").value,
            Nome_Atendente: localStorage.getItem('user_nome') || "Atendente",
            Descricao: document.getElementById("task-message").value,
            Status: "Pendente",
            Urgencia: parseInt(urgInput ? urgInput.value : 3),
            Data_Prazo: document.getElementById("task-deadline").value || new Date().toISOString(),
            ID_Paciente: idPaciente,
            ID_Acao: 0, 
            ID_Atendente: userId
        };

        try {
            let res;
            if (taskId && taskId !== "0") {
                res = await fetch(`${API_URL_TASKS}/tarefas/${taskId}?user_id=${userId}`, {
                    method: 'PUT',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(taskData)
                });
            } else {
                res = await fetch(`${API_URL_TASKS}/tarefas/`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(taskData)
                });
            }

            if (res.ok) {
                alert(taskId && taskId !== "0" ? "Tarefa salva com sucesso!" : "Tarefa criada com sucesso!");
                resetTaskModal();
                document.getElementById("task-modal-overlay").style.display = "none";
                loadTasks();
            } else {
                const erro = await res.json();
                alert("Erro: " + erro.detail);
            }
        } catch (err) { console.error(err); alert("Erro de conexão"); }
    }
});

// --- DELETE ---
async function deleteTask(id) {
    if(!confirm("Excluir tarefa?")) return;
    const userId = localStorage.getItem('user_id');
    try {
        const res = await fetch(`${API_URL_TASKS}/tarefas/${id}?user_id=${userId}`, { method: 'DELETE' });
        if(res.ok) loadTasks();
        else alert("Erro ao excluir.");
    } catch(e) { console.error(e); }
}

// Inicializa
document.addEventListener("DOMContentLoaded", () => {
    carregarPacientesTask();
    loadTasks();
});