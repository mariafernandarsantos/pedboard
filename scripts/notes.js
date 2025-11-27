const API_URL = "http://127.0.0.1:8000";

console.log("✅ notes.js foi carregado");

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
        Status: "Aberto",
        ID_Atendente: 1
    };

    console.log("Enviando para a API:", newNote);

    const res = await fetch(`${API_URL}/notas/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote)
    });

    if (!res.ok) {
        const error = await res.text();
        alert("Erro ao criar nota: " + error);
        return;
    }

    const data = await res.json();

    addNoteToScreen(data);

    // Limpa formulário
    document.getElementById("create-note-form").reset();

    // Fecha modal
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

