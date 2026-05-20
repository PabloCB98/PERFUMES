document.addEventListener('DOMContentLoaded', () => {
    const btnAbrir = document.getElementById('btn-abrir-menu');
    const btnCerrar = document.getElementById('btn-cerrar-menu');
    const menu = document.getElementById('menu-lateral');
    const overlay = document.getElementById('menu-overlay');

    if (!btnAbrir || !btnCerrar || !menu || !overlay) return;

    const abrirMenu = () => {
        menu.classList.add('menu-lateral--abierto');
        menu.setAttribute('aria-hidden', 'false');
        overlay.hidden = false;
        requestAnimationFrame(() => overlay.classList.add('menu-overlay--visible'));
        btnAbrir.classList.add('btn-menu--activo');
        btnAbrir.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-abierto');
        btnCerrar.focus();
    };

    const cerrarMenu = () => {
        menu.classList.remove('menu-lateral--abierto');
        menu.setAttribute('aria-hidden', 'true');
        overlay.classList.remove('menu-overlay--visible');
        btnAbrir.classList.remove('btn-menu--activo');
        btnAbrir.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-abierto');
        btnAbrir.focus();

        setTimeout(() => {
            if (!menu.classList.contains('menu-lateral--abierto')) {
                overlay.hidden = true;
            }
        }, 300);
    };

    btnAbrir.addEventListener('click', () => {
        if (menu.classList.contains('menu-lateral--abierto')) {
            cerrarMenu();
        } else {
            abrirMenu();
        }
    });

    btnCerrar.addEventListener('click', cerrarMenu);
    overlay.addEventListener('click', cerrarMenu);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && menu.classList.contains('menu-lateral--abierto')) {
            cerrarMenu();
        }
    });

    // Pestañas: solo estructura visual por ahora (cambiar clase activa)
    const pestanas = document.querySelectorAll('.menu-lateral__pestana');
    pestanas.forEach(pestana => {
        pestana.addEventListener('click', () => {
            pestanas.forEach(p => p.classList.remove('menu-lateral__pestana--activa'));
            pestana.classList.add('menu-lateral__pestana--activa');
        });
    });
});
