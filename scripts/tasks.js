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

    const title = document.getElementById("task-title").value;

    const newTask = {
        title: title,
        completed: false
    };

    const res = await fetch(`${API_URL}/tasks/`, {
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
        <strong>${task.title}</strong>
        <p>Status: ${task.completed ? "Concluída" : "Pendente"}</p>
        <small>ID: ${task.id}</small>
    `;

    container.appendChild(card);
}

async function loadTasks() {
    const res = await fetch(`${API_URL}/tasks/`);
    const tasks = await res.json();

    tasks.forEach(t => addTaskToScreen(t));
}

document.addEventListener("DOMContentLoaded", loadTasks);
