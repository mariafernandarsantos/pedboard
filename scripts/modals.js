// scripts/modals.js

document.addEventListener("DOMContentLoaded", () => {
    // Seleciona os elementos principais dos modais
    const taskModal = document.getElementById('task-modal-overlay');
    const noteModal = document.getElementById('note-modal-overlay');
    const closeTaskBtn = document.getElementById('close-task-modal');
    const closeNoteBtn = document.getElementById('close-note-modal');

    // --- Funções para abrir e fechar ---

    function openTaskModal() {
        if (taskModal) taskModal.style.display = 'flex';
    }

    function openNoteModal() {
        if (noteModal) noteModal.style.display = 'flex';
    }

    function closeTaskModal() {
        if (taskModal) taskModal.style.display = 'none';
    }

    function closeNoteModal() {
        if (noteModal) noteModal.style.display = 'none';
    }

    // --- Event Listeners ---

    // Adiciona "ouvintes" nos botões de fechar (X)
    if (closeTaskBtn) {
        closeTaskBtn.addEventListener('click', closeTaskModal);
    }
    if (closeNoteBtn) {
        closeNoteBtn.addEventListener('click', closeNoteModal);
    }

    // Adiciona "ouvintes" para fechar clicando fora (no overlay)
    if (taskModal) {
        taskModal.addEventListener('click', (event) => {
            // Fecha apenas se o clique for no fundo (overlay) e não no conteúdo
            if (event.target === taskModal) {
                closeTaskModal();
            }
        });
    }
    if (noteModal) {
        noteModal.addEventListener('click', (event) => {
            if (event.target === noteModal) {
                closeNoteModal();
            }
        });
    }

    // --- Delegação de Eventos para botões "+" ---
    // Isso garante que os botões funcionem mesmo se
    // forem carregados depois pelo 'load-components.js'

    document.body.addEventListener('click', (event) => {
        // Verifica se o clique foi no botão de adicionar Tarefa
        if (event.target.closest('.tasks-add')) {
            event.preventDefault(); // Previne qualquer ação padrão
            openTaskModal();
        }

        // Verifica se o clique foi no botão de adicionar Nota
        if (event.target.closest('.notes-add')) {
            event.preventDefault();
            openNoteModal();
        }
    });
});