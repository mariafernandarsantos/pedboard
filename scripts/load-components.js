document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Injetar a Sidebar ---
    const sidebarHTML = `
    <nav class="sidebar">
        <div class="sidebar-header" style="text-align:center; margin-bottom:20px;">
            <h2 style="font-size:18px; color:#333;">PedBoard</h2>
        </div>

        <ul class="sidebar-menu">
            <li>
                <a href="Dashboard.html" title="Dashboard">
                    <img src="scripts/icons/dashboard.svg" alt="Dashboard" class="icon">
                </a>
            </li>
            <li>
                <a href="notas.html" title="Notas">
                    <img src="scripts/icons/notes.svg" alt="Notas" class="icon">
                </a>
            </li>
            <li>
                <a href="tarefas.html" title="Tarefas">
                    <img src="scripts/icons/tasks.svg" alt="Tarefas" class="icon">
                </a>
            </li>
            <li>
                <a href="registros.html" title="Registros">
                    <img src="scripts/icons/folder.svg" alt="Registros" class="icon">
                </a>
            </li>
            <li>
                <a href="graficos.html" title="Gráficos">
                    <img src="scripts/icons/chart.svg" alt="Gráficos" class="icon">
                </a>
            </li>
            <li>
                <a href="calendario.html" title="Calendário">
                    <img src="scripts/icons/calendar.svg" alt="Calendário" class="icon">
                </a>
            </li>
            <li>
                <a href="config.html" title="Configurações">
                    <img src="scripts/icons/settings.svg" alt="Configurações" class="icon">
                </a>
            </li>
        </ul>

        <div style="margin-top: auto; padding-top: 20px; text-align: center;">
             <button onclick="logout()" style="background:none; border:none; cursor:pointer;" title="Sair">
                <img src="scripts/icons/logout.svg" alt="Sair" class="icon">
             </button>
        </div>
    </nav>
    `;

    // Cria o elemento da sidebar e adiciona ao body
    const sidebarContainer = document.createElement("div");
    sidebarContainer.innerHTML = sidebarHTML;
    document.body.prepend(sidebarContainer);

    // --- 2. Injetar Componentes via data-include (se houver) ---
    const includes = document.querySelectorAll('[data-include]');
    includes.forEach(async el => {
        const file = el.getAttribute('data-include');
        try {
            const res = await fetch(`components/${file}.html`);
            if (res.ok) {
                el.innerHTML = await res.text();
            }
        } catch (e) {
            console.error(`Erro ao carregar componente ${file}:`, e);
        }
    });
});