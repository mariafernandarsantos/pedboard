const API_URL = "http://127.0.0.1:8000";

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("notes-add")) {
        document.getElementById("note-modal-overlay").style.display = "flex";
    }
});

document.getElementById("close-note-modal").addEventListener("click", () => {
    document.getElementById("note-modal-overlay").style.display = "none";
});

document.getElementById("create-note-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newNote = {
        Nome: document.getElementById("note-title").value,
        Descricao: document.getElementById("note-message").value,
        ID_Atendente: 0
    };

    const res = await fetch(`${API_URL}/notas/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote)
    });

    const data = await res.json();

    addNoteToScreen(data);
    document.getElementById("note-modal-overlay").style.display = "none";
});

function addNoteToScreen(note) {
    const container = document.getElementById("notes-list");
    
    const card = document.createElement("div");
    card.classList.add("note-card");

    card.innerHTML = `
        <h3>${note.Nome}</h3>
        <p>${note.Descricao}</p>
        <p><strong>Status:</strong> ${note.Status}</p>
        <small><strong>ID Nota:</strong> ${note.ID_Nota}</small><br>
        <small><strong>ID Atendente:</strong> ${note.ID_Atendente}</small>
    `;

    container.appendChild(card);
}

async function loadNotes() {
    const res = await fetch(`${API_URL}/notas/`);
    const notes = await res.json();

    notes.forEach(n => addNoteToScreen(n));
}

document.addEventListener("DOMContentLoaded", loadNotes);
