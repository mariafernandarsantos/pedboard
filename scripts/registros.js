const API_BASE_REGISTROS = "http://127.0.0.1:8000";

// --- Carregar Pacientes no Select (Modal) ---
async function carregarPacientesNoSelect() {
    try {
        const res = await fetch(`${API_BASE_REGISTROS}/pacientes/`);
        if(res.ok) {
            const pacientes = await res.json();
            const select = document.getElementById("registro-paciente-select");
            if(!select) return; // Evita erro se o modal não estiver na tela

            select.innerHTML = '<option value="">Selecione um paciente...</option>';
            pacientes.forEach(p => {
                const option = document.createElement("option");
                option.value = p.ID_Paciente;
                option.textContent = `${p.Nome_Paciente} (ID: ${p.ID_Paciente})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar pacientes:", error);
    }
}

// --- Carregar Lista de Registros (Tela Principal) ---
async function carregarRegistrosNaTela() {
    const container = document.getElementById("registros-list-area");
    if (!container) return; // Só executa se estiver na página registros.html

    try {
        const res = await fetch(`${API_BASE_REGISTROS}/registros/`);
        if (res.ok) {
            const registros = await res.json();
            container.innerHTML = ""; // Limpa lista

            if (registros.length === 0) {
                container.innerHTML = "<p>Nenhum registro encontrado.</p>";
                return;
            }

            registros.forEach(reg => {
                const card = document.createElement("div");
                card.style.background = "#fff";
                card.style.padding = "16px";
                card.style.borderRadius = "12px";
                card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                card.style.border = "1px solid #f0f0f0";
                
                card.innerHTML = `
                    <h3 style="font-size:16px; margin-bottom:8px;">Atendimento #${reg.ID_Registro}</h3>
                    <p><strong>Paciente ID:</strong> ${reg.ID_Paciente}</p>
                    <p><strong>Ação ID:</strong> ${reg.ID_Acao}</p>
                    <p><strong>Data:</strong> ${reg.Data_Criacao}</p>
                    <span style="display:inline-block; margin-top:8px; padding:4px 8px; border-radius:4px; font-size:12px; background:${getColorStatus(reg.Status)}; color:#fff;">${reg.Status}</span>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Erro ao buscar registros:", error);
    }
}

function getColorStatus(status) {
    if(status === 'Agendado') return '#3b82f6'; // Azul
    if(status === 'Realizado') return '#10b981'; // Verde
    if(status === 'Cancelado') return '#ef4444'; // Vermelho
    return '#6b7280';
}

// --- Eventos ---
document.addEventListener("click", (e) => {
    // Abrir Modal
    if (e.target.closest(".btn-add-registro")) {
        const modal = document.getElementById("registro-modal-overlay");
        if(modal) {
            modal.style.display = "flex";
            carregarPacientesNoSelect();
        }
    }
    // Fechar Modal
    if (e.target.closest("#close-registro-modal") || e.target.id === "registro-modal-overlay") {
        const modal = document.getElementById("registro-modal-overlay");
        if(modal) modal.style.display = "none";
    }
});

// Enviar Formulário
document.addEventListener("submit", async (e) => {
    if (e.target && e.target.id === "create-registro-form") {
        e.preventDefault();
        
        // Pega o ID do usuário logado
        const userId = localStorage.getItem('user_id') || 1; 

        const newRegistro = {
            ID_Acao: parseInt(document.getElementById("registro-acao-id").value),
            ID_Paciente: parseInt(document.getElementById("registro-paciente-select").value),
            Status: document.getElementById("registro-status").value,
            ID_Atendente: parseInt(userId)
        };

        try {
            const res = await fetch(`${API_BASE_REGISTROS}/registros/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRegistro)
            });

            if (res.ok) {
                alert("Atendimento criado!");
                e.target.reset();
                document.getElementById("registro-modal-overlay").style.display = "none";
                carregarRegistrosNaTela(); // Atualiza a lista no fundo
            } else {
                alert("Erro ao criar atendimento.");
            }
        } catch (error) {
            console.error(error);
        }
    }
});

document.addEventListener("DOMContentLoaded", carregarRegistrosNaTela);