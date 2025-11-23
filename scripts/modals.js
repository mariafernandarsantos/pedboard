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

    if (closeTaskBtn) {
        closeTaskBtn.addEventListener('click', closeTaskModal);
    }
    if (closeNoteBtn) {
        closeNoteBtn.addEventListener('click', closeNoteModal);
    }

    if (taskModal) {
        taskModal.addEventListener('click', (event) => {
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
    document.body.addEventListener('click', (event) => {
        if (event.target.closest('.tasks-add')) {
            event.preventDefault();
            openTaskModal();
        }

        if (event.target.closest('.notes-add')) {
            event.preventDefault();
            openNoteModal();
        }
        // Abrir modal de paciente a partir do ícone na sidebar
        if (event.target.closest('.patients-add')) {
            event.preventDefault();
            // se existir modal de paciente, abrimos; caso contrário, tentamos abrir pelo id
            const patientModal = document.getElementById('patient-modal-overlay');
            if (patientModal) patientModal.style.display = 'flex';
        }
    });

    // --- Lógica para o formulário de criação de tarefa ---
    const createTaskForm = document.getElementById('create-task-form');
    let pendingImageBase64 = null;

    // Adiciona um input file escondido para escolher imagem
    const hiddenFileInput = document.createElement('input');
    hiddenFileInput.type = 'file';
    hiddenFileInput.accept = 'image/*';
    hiddenFileInput.style.display = 'none';
    document.body.appendChild(hiddenFileInput);

    // Botão 'Adicionar imagens' dentro do modal
    document.body.addEventListener('click', (event) => {
        const btn = event.target.closest('.btn-add-image');
        if (btn) {
            event.preventDefault();
            hiddenFileInput.click();
        }
    });

    hiddenFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const commaIndex = result.indexOf(',');
            pendingImageBase64 = commaIndex >= 0 ? result.slice(commaIndex + 1) : result;
            alert('Imagem carregada para envio (será incluída na tarefa)');
        };
        reader.readAsDataURL(file);
    });

    // Urgência: configura botões no formulário (cores)
    function setupUrgencyButtons(form) {
        const container = document.createElement('div');
        container.className = 'urgency-buttons';
        container.innerHTML = `
            <label>Urgência</label>
            <div style="display:flex;gap:8px;margin-top:6px;">
                <button type="button" data-urg="1" style="background:#3b82f6;color:#fff;padding:6px 8px;border-radius:4px;border:none">Azul</button>
                <button type="button" data-urg="2" style="background:#10b981;color:#fff;padding:6px 8px;border-radius:4px;border:none">Verde</button>
                <button type="button" data-urg="3" style="background:#f59e0b;color:#fff;padding:6px 8px;border-radius:4px;border:none">Amarelo</button>
                <button type="button" data-urg="4" style="background:#ef4444;color:#fff;padding:6px 8px;border-radius:4px;border:none">Vermelho</button>
                <button type="button" data-urg="5" style="background:#7c3aed;color:#fff;padding:6px 8px;border-radius:4px;border:none">Roxo</button>
            </div>
            <input type="hidden" name="task-urgency" id="task-urgency" value="3">
        `;
        const submitBtn = form.querySelector('.btn-submit-modal');
        submitBtn.parentNode.insertBefore(container, submitBtn);

        container.addEventListener('click', (ev) => {
            const b = ev.target.closest('button[data-urg]');
            if (!b) return;
            const val = b.getAttribute('data-urg');
            const hidden = form.querySelector('#task-urgency');
            hidden.value = val;
            container.querySelectorAll('button[data-urg]').forEach(btn => btn.style.opacity = '0.6');
            b.style.opacity = '1';
        });
    }

    if (createTaskForm) {
        const beforeTimeInputs = createTaskForm.querySelector('.time-inputs');
        const extraHtml = document.createElement('div');
        extraHtml.innerHTML = `
            <label for="task-nome">Nome do atendente</label>
            <input type="text" id="task-nome" name="task-nome" required>

            <label for="task-status">Status</label>
            <select id="task-status" name="task-status">
                <option value="pendente">Pendente</option>
                <option value="atendendo">Atendendo</option>
            </select>

            <label for="task-deadline">Data e hora do prazo</label>
            <input type="datetime-local" id="task-deadline" name="task-deadline">

            <input type="hidden" id="task-atendente-id" name="task-atendente-id" value="1">
            <input type="hidden" id="task-acao-id" name="task-acao-id" value="0">
        `;
        beforeTimeInputs.parentNode.insertBefore(extraHtml, beforeTimeInputs);

        setupUrgencyButtons(createTaskForm);

        // --- Autocomplete / busca de pacientes ---
        const pacienteInput = document.getElementById('task-paciente-name');
        const pacienteIdHidden = document.getElementById('task-paciente-id');
        const suggestionsBox = document.getElementById('task-paciente-suggestions');

        let acTimeout = null;
        function clearSuggestions() { suggestionsBox.innerHTML = ''; }

        if (pacienteInput) {
            pacienteInput.addEventListener('input', (e) => {
                const q = e.target.value.trim();
                pacienteIdHidden.value = '';
                clearSuggestions();
                if (acTimeout) clearTimeout(acTimeout);
                if (!q) return;
                acTimeout = setTimeout(async () => {
                    try {
                        const res = await fetch(`http://127.0.0.1:8000/pacientes/search?query=${encodeURIComponent(q)}`);
                        if (!res.ok) return;
                        const data = await res.json();
                        // montar lista
                        suggestionsBox.innerHTML = '';
                        const list = document.createElement('div');
                        list.style.background = '#fff';
                        list.style.border = '1px solid #e0e0e0';
                        list.style.position = 'absolute';
                        list.style.zIndex = '2000';
                        list.style.width = '100%';
                        data.slice(0,8).forEach(p => {
                            const item = document.createElement('div');
                            item.textContent = `${p.Nome} (${p.ID_Paciente})`;
                            item.style.padding = '8px';
                            item.style.cursor = 'pointer';
                            item.addEventListener('click', () => {
                                pacienteInput.value = p.Nome;
                                pacienteIdHidden.value = p.ID_Paciente;
                                clearSuggestions();
                            });
                            list.appendChild(item);
                        });
                        suggestionsBox.appendChild(list);
                    } catch (err) {
                        console.error('Erro na busca de pacientes', err);
                    }
                }, 300);
            });

            // fechar sugestões ao clicar fora
            document.addEventListener('click', (ev) => {
                if (!ev.target.closest('#task-paciente-name') && !ev.target.closest('#task-paciente-suggestions')) {
                    clearSuggestions();
                }
            });
        }

        createTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const titulo = document.getElementById('task-title').value.trim();
            const descricao = document.getElementById('task-message').value.trim();
            const nome = document.getElementById('task-nome').value.trim();
            const status = document.getElementById('task-status').value;
            const urg = parseInt(document.getElementById('task-urgency').value || '3', 10);
            const dataPrazoInput = document.getElementById('task-deadline').value;
            // Prefer visible fields if present
            const idAtendenteVisible = document.getElementById('task-atendente-id-visible');
            const idAtendente = parseInt((idAtendenteVisible && idAtendenteVisible.value) || document.getElementById('task-atendente-id').value || '1', 10);
            const idAcaoVisible = document.getElementById('task-acao-id');
            const idAcao = parseInt((idAcaoVisible && idAcaoVisible.value) || '0', 10);
            const acaoDescElem = document.getElementById('task-acao-desc');
            const acaoDescricao = acaoDescElem ? acaoDescElem.value.trim() : null;

            let dataPrazo = null;
            if (dataPrazoInput) {
                dataPrazo = new Date(dataPrazoInput).toISOString();
            } else {
                const days = parseInt(document.getElementById('task-days').value || '0', 10);
                const hours = parseInt(document.getElementById('task-hours').value || '0', 10);
                const minutes = parseInt(document.getElementById('task-minutes').value || '0', 10);
                if (days || hours || minutes) {
                    const now = new Date();
                    now.setDate(now.getDate() + days);
                    now.setHours(now.getHours() + hours);
                    now.setMinutes(now.getMinutes() + minutes);
                    dataPrazo = now.toISOString();
                }
            }

            const payload = {
                Titulo: titulo,
                Nome_Atendente: nome,
                Descricao: descricao,
                Status: status,
                Urgencia: urg,
                Data_Prazo: dataPrazo,
                ID_Acao: idAcao || 0,
                ID_Paciente: parseInt(document.getElementById('task-paciente-id').value || '0', 10) || null,
                Acao_Descricao: acaoDescricao || null,
                ID_Atendente: idAtendente,
                Imagem: pendingImageBase64
            };

            try {
                const res = await fetch('http://127.0.0.1:8000/tarefas/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const err = await res.json();
                    alert('Erro criando tarefa: ' + (err.detail || res.statusText));
                    return;
                }

                const data = await res.json();
                alert('Tarefa criada com sucesso (ID: ' + data.ID_Tarefa + ')');
                closeTaskModal();
                createTaskForm.reset();
                pendingImageBase64 = null;
            } catch (err) {
                console.error(err);
                alert('Erro ao conectar com a API. Verifique se o servidor está rodando.');
            }
        });
    }

    // --- Lógica para modal de paciente ---
    const patientModal = document.getElementById('patient-modal-overlay');
    const closePatientBtn = document.getElementById('close-patient-modal');
    const createPatientForm = document.getElementById('create-patient-form');

    if (closePatientBtn) closePatientBtn.addEventListener('click', () => { if (patientModal) patientModal.style.display = 'none'; });
    if (patientModal) {
        patientModal.addEventListener('click', (ev) => { if (ev.target === patientModal) patientModal.style.display = 'none'; });
    }

    if (createPatientForm) {
        createPatientForm.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const payload = {
                Nome: document.getElementById('pac-nome').value.trim(),
                Idade: parseInt(document.getElementById('pac-idade').value || '0', 10),
                Genero: document.getElementById('pac-genero').value.trim(),
                Cidade: document.getElementById('pac-cidade').value.trim(),
                Data_Nascimento: document.getElementById('pac-nasc').value,
                Estado_Civil: document.getElementById('pac-ec').value.trim(),
                Convenio: document.getElementById('pac-conv').value.trim(),
                Tipo_Sanguineo: document.getElementById('pac-ts').value.trim()
            };

            try {
                const res = await fetch('http://127.0.0.1:8000/pacientes/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) {
                    const err = await res.json();
                    alert('Erro criando paciente: ' + (err.detail || res.statusText));
                    return;
                }
                const data = await res.json();
                alert('Paciente criado (ID: ' + data.ID_Paciente + ').');
                // preenche automaticamente o campo de paciente no modal de tarefa
                const pacienteInput = document.getElementById('task-paciente-name');
                const pacienteIdHidden = document.getElementById('task-paciente-id');
                if (pacienteInput) pacienteInput.value = data.Nome;
                if (pacienteIdHidden) pacienteIdHidden.value = data.ID_Paciente;
                if (patientModal) patientModal.style.display = 'none';
                createPatientForm.reset();
            } catch (err) {
                console.error('Erro ao criar paciente', err);
                alert('Erro ao conectar com a API.');
            }
        });
    }
});