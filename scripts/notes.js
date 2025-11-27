const API_URL = "http://127.0.0.1:8000";

const cardColors = ['bg-purple', 'bg-red', 'bg-green', 'bg-gold'];

function getRandomColor() {
    return cardColors[Math.floor(Math.random() * cardColors.length)];
}

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
    // Tenta pegar o container do Dashboard, se não achar, pega o da lista comum
    const container = document.getElementById("notes-list-dashboard") || document.getElementById("notes-list");
    if (!container) return;

    // Remove mensagem de "Carregando..." se existir
    if(container.innerText.includes("Carregando")) container.innerHTML = "";
    
    const card = document.createElement("div");
    // Adiciona a classe base e uma cor aleatória
    card.className = `card-nota-design ${getRandomColor()}`;

    // Mock de dados para ficar igual a imagem (Avatar e User)
    // Como a API não retorna foto, usamos a inicial do atendente (ID)
    const avatarLetter = "U"; 
    const userName = "Atendente " + note.ID_Atendente;
    const userHandle = "@usuario_" + note.ID_Atendente;

    card.innerHTML = `
        <div class="note-header-design">
            <div class="note-avatar">${avatarLetter}</div>
            <div>
                <div style="font-weight:bold; font-size:14px;">${userName}</div>
                <div style="font-size:11px; opacity:0.8;">${userHandle}</div>
            </div>
        </div>
        
        <div class="note-body-design">
            <p>${note.Descricao}</p>
        </div>

        <div class="note-footer-design">
            <span>Criado: Hoje</span>
            <div style="width:15px; height:15px; border:1px solid white; border-radius:4px;"></div>
        </div>
    `;

    // Adiciona no começo da lista
    container.prepend(card);
}

async function loadNotes() {
    try {
        const res = await fetch(`${API_URL}/notas/`);
        if (!res.ok) throw new Error("Falha ao buscar notas");
        
        const notes = await res.json();
        
        // Limpa containers antes de carregar
        const dashContainer = document.getElementById("notes-list-dashboard");
        const listContainer = document.getElementById("notes-list");
        
        if (dashContainer) dashContainer.innerHTML = "";
        if (listContainer) listContainer.innerHTML = "";

        notes.forEach(n => addNoteToScreen(n));
    } catch (error) {
        console.error("Erro ao carregar notas:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadNotes);
