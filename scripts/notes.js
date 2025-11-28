const API_URL = "http://127.0.0.1:8000";
const noteColors = ['note-bg-purple', 'note-bg-red', 'note-bg-olive', 'note-bg-brown'];

function getRandomNoteColor() {
    return noteColors[Math.floor(Math.random() * noteColors.length)];
}

// --- FUNÇÃO PARA ADICIONAR NOTA NA TELA ---
function addNoteToScreen(note) {
    const container = document.getElementById("notes-list");
    if (!container) return;

    // Remove aviso de "carregando" se existir
    const loadingMsg = container.querySelector('p');
    if (loadingMsg && loadingMsg.innerText.includes("Carregando")) loadingMsg.remove();

    const card = document.createElement("div");
    card.className = `note-card-design ${getRandomNoteColor()}`;

    // Dados de exibição
    const userName = note.Nome_Atendente || "Usuário";
    const userHandle = "@" + (note.Login_Atendente || "user");
    const userInitial = userName.charAt(0).toUpperCase();
    let dataFormatada = "Hoje";
    
    if(note.Data_Criacao) {
        try {
            const parts = note.Data_Criacao.split('-');
            if(parts.length === 3) dataFormatada = `${parts[2]}/${parts[1]}/${parts[0]}`;
        } catch(e) {}
    }

    // --- VERIFICAÇÃO DE PROPRIEDADE ---
    // Pega o ID do usuário logado no localStorage
    const loggedUserId = parseInt(localStorage.getItem('user_id'));
    const isOwner = loggedUserId === note.ID_Atendente;

    // HTML dos botões de ação (só cria se for o dono)
    let actionsHtml = '';
    if (isOwner) {
        actionsHtml = `
            <div class="note-actions">
                <button class="action-btn btn-edit-note" title="Editar" onclick="openEditModal(${note.ID_Nota}, '${note.Nome}', '${note.Descricao}', '${note.Status}')">
                    ✏️ </button>
                <button class="action-btn btn-delete-note" title="Excluir" onclick="deleteNote(${note.ID_Nota})">
                    🗑️
                </button>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="note-header">
            <div class="note-avatar-placeholder">${userInitial}</div>
            <div class="note-user-info">
                <span class="note-user-name">${userName}</span>
                <span class="note-user-handle">${userHandle}</span>
            </div>
        </div>
        <div class="note-body">
            <strong style="display:block; margin-bottom:5px; font-size:14px;">${note.Nome}</strong>
            <p>${note.Descricao}</p>
        </div>
        <div class="note-footer">
            <span>Criado: ${dataFormatada}</span>
            <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <span style="font-size:10px; background:rgba(0,0,0,0.2); padding:2px 6px; border-radius:4px; margin-bottom:4px;">${note.Status}</span>
                ${actionsHtml}
            </div>
        </div>
    `;

    container.appendChild(card); 
}

// --- FUNÇÃO DE DELETAR ---
async function deleteNote(id) {
    if(!confirm("Tem certeza que deseja excluir esta nota?")) return;

    const userId = localStorage.getItem('user_id');
    
    try {
        const res = await fetch(`${API_URL}/notas/${id}?user_id=${userId}`, {
            method: 'DELETE'
        });

        if(res.ok) {
            alert("Nota excluída!");
            loadNotes(); // Recarrega a lista
        } else {
            const err = await res.json();
            alert("Erro: " + err.detail);
        }
    } catch (e) {
        console.error(e);
        alert("Erro de conexão.");
    }
}

// --- FUNÇÃO DE ABRIR MODAL PARA EDIÇÃO ---
window.openEditModal = function(id, titulo, msg, status) {
    // Preenche o formulário com os dados da nota
    document.getElementById("note-title").value = titulo;
    document.getElementById("note-message").value = msg;
    document.getElementById("note-status").value = status;
    
    // Define o ID no input hidden (importante para saber que é edição)
    document.getElementById("note-att-id").value = id;

    // Muda o título do modal e texto do botão visualmente
    document.querySelector("#note-modal-overlay h2").textContent = "Editar Nota";
    document.querySelector("#create-note-form .btn-submit-modal").textContent = "Salvar Alterações";

    // Abre o modal
    document.getElementById("note-modal-overlay").style.display = "flex";
}

// --- SUBMIT DO FORMULÁRIO (CRIAR OU EDITAR) ---
document.addEventListener("submit", async (e) => {
    if (e.target && e.target.id === "create-note-form") {
        e.preventDefault();

        const title = document.getElementById("note-title").value;
        const msg = document.getElementById("note-message").value;
        const status = document.getElementById("note-status").value;
        const noteId = document.getElementById("note-att-id").value; // ID oculto
        const userId = parseInt(localStorage.getItem('user_id'));

        const noteData = {
            Nome: title,
            Descricao: msg,
            Status: status,
            ID_Atendente: userId
        };

        try {
            let res;
            
            // SE TIVER ID NO CAMPO OCULTO, É EDIÇÃO (PUT)
            if (noteId && noteId !== "0") {
                res = await fetch(`${API_URL}/notas/${noteId}?user_id=${userId}`, {
                    method: 'PUT',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(noteData)
                });
            } 
            // SE NÃO, É CRIAÇÃO (POST)
            else {
                res = await fetch(`${API_URL}/notas/`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(noteData)
                });
            }

            if (res.ok) {
                alert(noteId !== "0" ? "Nota atualizada!" : "Nota criada!");
                
                // Reseta formulário e modal
                e.target.reset();
                document.getElementById("note-att-id").value = "0"; // Volta para modo criar
                document.querySelector("#note-modal-overlay h2").textContent = "Criar notas";
                document.querySelector("#create-note-form .btn-submit-modal").textContent = "Criar nota";
                document.getElementById("note-modal-overlay").style.display = "none";
                
                loadNotes(); // Recarrega lista
            } else {
                const erro = await res.json();
                alert("Erro: " + erro.detail);
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
        }
    }
});

// --- CARREGAR NOTAS ---
async function loadNotes() {
    try {
        const res = await fetch(`${API_URL}/notas/`);
        if (!res.ok) throw new Error("Erro API");
        const notes = await res.json();

        const container = document.getElementById("notes-list");
        if(container) container.innerHTML = ""; 

        if (notes.length === 0 && container) {
            container.innerHTML = '<p style="padding:20px; color:#888;">Nenhuma nota encontrada.</p>';
            return;
        }
        notes.forEach(n => addNoteToScreen(n));
    } catch (error) {
        console.error("Erro:", error);
    }
}

// Listener para fechar modal e resetar form se cancelar
document.addEventListener("click", (e) => {
    if (e.target.closest("#close-note-modal")) {
        // Reseta o formulário para o estado "Criar" ao fechar
        document.getElementById("create-note-form").reset();
        document.getElementById("note-att-id").value = "0";
        document.querySelector("#note-modal-overlay h2").textContent = "Criar notas";
        document.querySelector("#create-note-form .btn-submit-modal").textContent = "Criar nota";
    }
});

document.addEventListener("DOMContentLoaded", loadNotes);