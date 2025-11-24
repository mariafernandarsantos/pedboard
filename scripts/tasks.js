const API_URL = "http://127.0.0.1:8000";

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("tasks-add")) {
        document.getElementById("task-modal-overlay").style.display = "flex";
    }
});

document.getElementById("close-task-modal").addEventListener("click", () => {
    document.getElementById("task-modal-overlay").style.display = "none";
});

document.getElementById("create-task-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newTask = {
        Titulo: document.getElementById("task-title").value,
        Nome_Atendente: "Atendente 0",
        Descricao: document.getElementById("task-message").value,
        Status: "Aberto",  
        Urgencia: parseInt(document.getElementById("task-urgency").value),
        Data_Prazo: null,
        ID_Acao: 0,
        ID_Atendente: 0
    };

    const res = await fetch(`${API_URL}/tarefas/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
    });

    const data = await res.json();
    addTaskToScreen(data);

    document.getElementById("task-modal-overlay").style.display = "none";
});

function addTaskToScreen(task) {
    const container = document.getElementById("tasks-list-area");

    const card = document.createElement("div");
    card.classList.add("task-card");
    card.innerHTML = `
        <h3>${task.Titulo}</h3>
        <p>${task.Descricao}</p>
        <p><strong>Status:</strong> ${task.Status}</p>
        <p><strong>Urgência:</strong> ${task.Urgencia}</p>
        <small>ID: ${task.ID_Tarefa}</small>
    `;

    container.appendChild(card);
}

async function loadTasks() {
    const res = await fetch(`${API_URL}/tarefas/`);
    const tasks = await res.json();

    tasks.forEach(t => addTaskToScreen(t));
}

document.addEventListener("DOMContentLoaded", loadTasks);
