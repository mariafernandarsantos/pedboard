const API_URL_BASE = "http://127.0.0.1:8000";

const nomesAcoes = {
    1: "Cirurgia",
    2: "Exame",
    3: "Consulta"
};

const coresAcoes = {
    1: "action-bg-cirurgia", 
    2: "action-bg-exame",    
    3: "action-bg-consulta"  
};

// --- CARREGAR PACIENTES NO SELECT ---
window.carregarPacientes = async function() {
    try {
        const res = await fetch(`${API_URL_BASE}/pacientes/`);
        if(res.ok) {
            const pacientes = await res.json();
            const select = document.getElementById("reg-paciente");
            
            if(select) {
                select.innerHTML = '<option value="">Selecione um paciente...</option>';
                pacientes.forEach(p => {
                    const option = document.createElement("option");
                    option.value = p.ID_Paciente;
                    option.textContent = `${p.Nome} (ID: ${p.ID_Paciente})`;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error("Erro ao carregar lista de pacientes:", error);
    }
}

// --- SALVAR NOVO REGISTRO ---
document.addEventListener("submit", async (e) => {
    if (e.target && e.target.id === "create-registro-form") {
        e.preventDefault();

        const userId = localStorage.getItem('user_id');
        const idPaciente = document.getElementById("reg-paciente").value;
        const idAcao = document.getElementById("reg-acao").value;
        const status = document.getElementById("reg-status").value;

        if (!idPaciente || !idAcao) {
            alert("Selecione o Paciente e o Tipo de Ação.");
            return;
        }

        const newRegistro = {
            ID_Acao: parseInt(idAcao),
            ID_Paciente: parseInt(idPaciente),
            Status: status,
            ID_Atendente: parseInt(userId)
        };

        try {
            const res = await fetch(`${API_URL_BASE}/registros/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRegistro)
            });

            if (res.ok) {
                alert("Atendimento registrado!");
                e.target.reset();
                document.getElementById("registro-modal-overlay").style.display = "none";
                carregarRegistros();
            } else {
                const erro = await res.json();
                alert("Erro: " + (erro.detail || "Falha ao salvar"));
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
        }
    }
});

// ---  EXIBIR REGISTRO NA TELA ---
function addRegistroToScreen(reg) {
    const container = document.getElementById("registros-list");
    if (!container) return;

    const emptyMsg = container.querySelector('.empty-msg');
    if (emptyMsg) emptyMsg.remove();

    const card = document.createElement("div");
    
    // Cor baseada na Ação
    const corCard = coresAcoes[reg.ID_Acao] || "action-bg-cirurgia";
    card.className = `task-card-design ${corCard}`;

    const nomeDaAcao = nomesAcoes[reg.ID_Acao] || "Ação Diversa";

    // Formata Data
    let dataShow = "Hoje";
    if (reg.Data_Criacao) {
        try { dataShow = new Date(reg.Data_Criacao).toLocaleDateString('pt-BR'); } catch(e){}
    }

    // Nomes vindos do JOIN no backend
    const nomePaciente = reg.Nome || ("ID: " + reg.ID_Paciente);
    const nomeAtendente = reg.Nome_Atendente || ("ID: " + reg.ID_Atendente);

    card.innerHTML = `
        <div class="task-header">
            <h4>${nomeDaAcao}</h4>
        </div>
        <div class="task-body">
            <p style="font-size:14px; margin-bottom:6px;">
                <strong>Paciente:</strong> ${nomePaciente}
            </p>
            <p style="font-size:12px; opacity:0.9;">
                Atendido por: ${nomeAtendente}
            </p>
        </div>
        <div class="task-footer">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>${dataShow}</span>
                <span style="background:rgba(0,0,0,0.2); padding:2px 8px; border-radius:6px; font-size:11px; font-weight:bold;">
                    ${reg.Status}
                </span>
            </div>
        </div>
    `;

    // Usa appendChild para adicionar na ordem correta (um depois do outro)
    container.appendChild(card);
}

// --- CARREGAR LISTA ---
async function carregarRegistros() {
    const container = document.getElementById("registros-list");
    if(!container) return;

    try {
        const res = await fetch(`${API_URL_BASE}/registros/`);
        if (res.ok) {
            const registros = await res.json();
            
            // Limpa a lista UMA VEZ antes de começar o loop
            container.innerHTML = "";
            
            if(registros.length === 0) {
                // Adiciona classe 'empty-msg' para identificar depois
                container.innerHTML = "<p class='empty-msg' style='padding:20px; color:#888;'>Nenhum atendimento registrado.</p>";
                return;
            }

            registros.forEach(reg => addRegistroToScreen(reg));
        }
    } catch (error) {
        console.error("Erro ao buscar registros:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarPacientes();
    carregarRegistros();
});