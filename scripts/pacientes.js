const API_URL_PACIENTES = "http://127.0.0.1:8000";

// --- CALCULAR IDADE AUTOMATICAMENTE ---
const inputNasc = document.getElementById("pac-nasc");
if (inputNasc) {
    inputNasc.addEventListener("change", function() {
        const dob = new Date(this.value);
        if(isNaN(dob)) return;
        const diff_ms = Date.now() - dob.getTime();
        const age_dt = new Date(diff_ms); 
        const age = Math.abs(age_dt.getUTCFullYear() - 1970);
        
        const inputIdade = document.getElementById("pac-idade");
        if(inputIdade) inputIdade.value = age;
    });
}

// --- SALVAR NOVO PACIENTE (POST) ---
document.addEventListener("submit", async (e) => {
    // Verifica se o formulário enviado é o de criar paciente
    if (e.target && e.target.id === "create-patient-form") {
        e.preventDefault();

        const newPatient = {
            Nome: document.getElementById("pac-nome").value,
            Idade: parseInt(document.getElementById("pac-idade").value),
            Genero: document.getElementById("pac-genero").value,
            Cidade: document.getElementById("pac-cidade").value,
            Data_Nascimento: document.getElementById("pac-nasc").value,
            Estado_Civil: document.getElementById("pac-ec").value,
            Convenio: document.getElementById("pac-conv").value,
            Tipo_Sanguineo: document.getElementById("pac-ts").value
        };

        try {
            const res = await fetch(`${API_URL_PACIENTES}/pacientes/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPatient)
            });

            if (res.ok) {
                alert("Paciente cadastrado com sucesso!");
                e.target.reset();
                document.getElementById("patient-modal-overlay").style.display = "none";
                
                // Se a função de carregar existir (estiver na página de pacientes), chama ela
                if (typeof loadPacientes === "function") loadPacientes();
            } else {
                const erro = await res.json();
                alert("Erro ao cadastrar: " + (erro.detail || JSON.stringify(erro)));
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
        }
    }
});

// --- EXIBIR PACIENTE NA TELA (CARD) ---
function addPatientToScreen(p) {
    const container = document.getElementById("pacientes-list");
    if (!container) return; 
    
    if(container.querySelector('p')) container.innerHTML = "";

    const card = document.createElement("div");
    card.className = "task-card-design"; 
    card.style.background = "#fff"; 
    card.style.color = "#333";
    card.style.border = "1px solid #e0e0e0";

    card.innerHTML = `
        <div style="margin-bottom:12px; border-bottom:1px solid #eee; padding-bottom:8px;">
            <h4 style="font-size:18px; font-weight:700; color:#111; margin-bottom:4px;">${p.Nome}</h4>
            <span style="font-size:11px; background:#eee; padding:2px 6px; border-radius:4px; color:#555;">ID: ${p.ID_Paciente}</span>
        </div>
        
        <div style="font-size:13px; line-height:1.6; color:#555;">
            <div style="display:flex; justify-content:space-between;">
                <span><strong>Idade:</strong> ${p.Idade} anos</span>
                <span><strong>Sexo:</strong> ${p.Genero}</span>
            </div>
            <p><strong>Cidade:</strong> ${p.Cidade}</p>
            <p><strong>Convênio:</strong> ${p.Convenio}</p>
        </div>

        <div style="margin-top:10px; padding-top:8px; border-top:1px solid #eee; font-size:12px; display:flex; justify-content:space-between; align-items:center;">
            <span>${p.Estado_Civil}</span>
            <span style="color:#d32f2f; font-weight:bold; background:#ffebee; padding:2px 6px; border-radius:4px;">${p.Tipo_Sanguineo}</span>
        </div>
    `;

    container.prepend(card);
}

// --- CARREGAR LISTA (GET) ---
async function loadPacientes() {
    const container = document.getElementById("pacientes-list");
    if(!container) return;

    try {
        const res = await fetch(`${API_URL_PACIENTES}/pacientes/`);
        if(res.ok) {
            const pacientes = await res.json();
            container.innerHTML = ""; 
            
            if(pacientes.length === 0) {
                container.innerHTML = "<p style='padding:20px; color:#888;'>Nenhum paciente cadastrado.</p>";
                return;
            }

            pacientes.forEach(p => addPatientToScreen(p));
        }
    } catch (error) {
        console.error("Erro ao buscar pacientes:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadPacientes);