// scripts/modals.js

document.addEventListener("DOMContentLoaded", () => {
    // A delegação de eventos funciona mesmo para elementos carregados depois
    document.addEventListener("click", (e) => {
        
        // --- ABRIR MODAIS ---
        
        // Modal de Notas
        if (e.target.closest(".notes-add")) {
            const modal = document.getElementById("note-modal-overlay");
            if (modal) modal.style.display = "flex";
        }

        // Modal de Tarefas
        if (e.target.closest(".tasks-add") || e.target.closest(".btn-add-task")) {
            const modal = document.getElementById("task-modal-overlay");
            if (modal) modal.style.display = "flex";
        }

        // Modal de Pacientes
        if (e.target.closest(".btn-add-patient") || e.target.closest(".patients-add")) {
            const modal = document.getElementById("patient-modal-overlay");
            if (modal) modal.style.display = "flex";
        }
        
        // Modal de Registros
        if (e.target.closest(".btn-add-registro")) {
            const modal = document.getElementById("registro-modal-overlay");
            if (modal) {
                modal.style.display = "flex";
                // Tenta carregar pacientes no select se a função existir
                if (typeof carregarPacientesNoSelect === "function") {
                    carregarPacientesNoSelect();
                }
            }
        }

        // --- FECHAR MODAIS (Botão X ou Fundo Escuro) ---

        // Verifica se clicou num botão de fechar (.modal-close) OU no fundo escuro (.modal-overlay)
        if (e.target.closest(".modal-close") || e.target.classList.contains("modal-overlay")) {
            // Fecha todos os modais abertos
            document.querySelectorAll(".modal-overlay").forEach(modal => {
                modal.style.display = "none";
            });
        }
    });
});