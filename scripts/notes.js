const API_URL = "http://127.0.0.1:8000";

// Abrir modal 
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("notes-add")) {
        document.getElementById("note-modal-overlay").style.display = "flex";
    }
});

// Fechar modal
document.getElementById("close-note-modal").addEventListener("click", () => {
    document.getElementById("note-modal-overlay").style.display = "none";
});

// Enviar dados para o backend
document.getElementById("create-note-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const content = document.getElementById("note-message").value;

    const newNote = {
        title: "Nota",      
        content: content
    };

    const res = await fetch(`${API_URL}/notes/`, {
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
        <p>${note.content}</p>
        <small>ID: ${note.id}</small>
    `;

    container.appendChild(card);
}


async function loadNotes() {
    const res = await fetch(`${API_URL}/notes/`);
    const notes = await res.json();

    notes.forEach(n => addNoteToScreen(n));
}

document.addEventListener("DOMContentLoaded", loadNotes);
