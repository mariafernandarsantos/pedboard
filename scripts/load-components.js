(async function loadComponents() {
  try {
    console.log('[pedboard] iniciando loader de componentes');

    // carregar e injetar sidebar fragment
    const res = await fetch('components/sidebar.html', { cache: 'no-store' });
    if (!res.ok) throw new Error('Erro carregando components/sidebar.html: ' + res.status);
    const sidebarHtml = await res.text();
    document.body.insertAdjacentHTML('afterbegin', sidebarHtml);
    console.log('[pedboard] sidebar injetada');

    const includes = Array.from(document.querySelectorAll('[data-include]'));
    for (const el of includes) {
      const name = el.dataset.include;
      if (!name) continue;
      const path = `components/${name}.html`;
      try {
        const r = await fetch(path, { cache: 'no-store' });
        if (!r.ok) { console.warn('[pedboard] componente não encontrado:', path); continue; }
        const html = await r.text();
        el.insertAdjacentHTML('afterbegin', html);
        console.log('[pedboard] componente injetado:', path);
      } catch (err) {
        console.warn('[pedboard] erro ao injetar', path, err);
      }
    }

    // carregar controller da sidebar e inicializar
    await new Promise(resolve => {
      const s = document.createElement('script');
      s.src = 'scripts/sidebar.js';
      s.onload = () => { console.log('[pedboard] loaded scripts/sidebar.js'); resolve(); };
      s.onerror = () => { console.warn('[pedboard] failed to load scripts/sidebar.js'); resolve(); };
      document.body.appendChild(s);
    });

    if (typeof window.PedboardInitSidebar === 'function') {
      window.PedboardInitSidebar();
    } else {
      console.warn('[pedboard] PedboardInitSidebar não disponível');
    }

  } catch (err) {
    console.error('[pedboard] load-components erro:', err);
  }
})();