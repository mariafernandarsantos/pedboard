document.addEventListener("DOMContentLoaded", () => {
    
    // Usamos Delegação de Eventos para garantir que funcione em qualquer página
    document.addEventListener("click", (e) => {
        
        // --- ABRIR MODAIS ---

        // Abrir Modal de Notas (botão com classe .notes-add)
        if (e.target.closest(".notes-add")) {
            const modal = document.getElementById("note-modal-overlay");
            if (modal) modal.style.display = "flex";
        }

        // Abrir Modal de Tarefas (botão com classe .tasks-add ou .btn-add-task)
        if (e.target.closest(".tasks-add") || e.target.closest(".btn-add-task")) {
            const modal = document.getElementById("task-modal-overlay");
            if (modal) modal.style.display = "flex";
        }

        // Abrir Modal de Pacientes (botão com classe .btn-add-patient ou .patients-add)
        if (e.target.closest(".btn-add-patient") || e.target.closest(".patients-add")) {
            const modal = document.getElementById("patient-modal-overlay");
            if (modal) modal.style.display = "flex";
        }

        // Abrir Modal de Atendimentos/Registros (botão com classe .btn-add-registro)
        if (e.target.closest(".btn-add-registro")) {
            const modal = document.getElementById("registro-modal-overlay");
            if (modal) {
                modal.style.display = "flex";
                // Se a função de carregar pacientes existir (no arquivo atendimentos.js), chama ela
                if (typeof carregarPacientes === "function") {
                    carregarPacientes();
                }
            }
        }

        // --- FECHAR MODAIS ---
        
        // Fecha se clicar no botão "X" (.modal-close) OU no fundo escuro (.modal-overlay)
        if (e.target.closest(".modal-close") || (e.target.classList.contains("modal-overlay"))) {
            document.querySelectorAll(".modal-overlay").forEach(modal => {
                modal.style.display = "none";
            });
            
        }
    });
});