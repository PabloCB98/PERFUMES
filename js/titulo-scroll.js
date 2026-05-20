document.addEventListener('DOMContentLoaded', () => {
    const barraTitulo = document.getElementById('barra-titulo');
    const titulo = document.getElementById('titulo_principal');
    const seccionPerfumes = document.getElementById('contenedor-perfumes');

    if (!barraTitulo || !titulo || !seccionPerfumes) return;

    const leerVariableNum = nombre => {
        const valor = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
        return parseFloat(valor) || 0;
    };

    const aplicarProgreso = progreso => {
        const sizeMax = leerVariableNum('--titulo-size-max');
        const sizeMin = leerVariableNum('--titulo-size-min');
        const spaceMax = leerVariableNum('--titulo-spacing-max');
        const spaceMin = leerVariableNum('--titulo-spacing-min');

        const t = Math.min(1, Math.max(0, progreso));
        const fontSize = sizeMax - (sizeMax - sizeMin) * t;
        const letterSpacing = spaceMax - (spaceMax - spaceMin) * t;

        titulo.style.fontSize = `${fontSize}px`;
        titulo.style.letterSpacing = `${letterSpacing}px`;
        barraTitulo.classList.toggle('titulo-compacto', t >= 0.98);
    };

    const calcularProgreso = () => {
        const alturaBarra = barraTitulo.offsetHeight || 72;
        const inicioScroll = 0;
        const finScroll = seccionPerfumes.offsetTop - alturaBarra - 24;

        if (finScroll <= 80) {
            return window.scrollY > 20 ? 1 : 0;
        }

        return (window.scrollY - inicioScroll) / (finScroll - inicioScroll);
    };

    let progresoSuavizado = 0;
    let animando = false;

    const actualizarTitulo = () => {
        const objetivo = calcularProgreso();
        progresoSuavizado += (objetivo - progresoSuavizado) * 0.14;
        aplicarProgreso(progresoSuavizado);

        if (Math.abs(objetivo - progresoSuavizado) > 0.002) {
            requestAnimationFrame(actualizarTitulo);
        } else {
            progresoSuavizado = objetivo;
            aplicarProgreso(progresoSuavizado);
            animando = false;
        }
    };

    const solicitarActualizacion = () => {
        if (!animando) {
            animando = true;
            requestAnimationFrame(actualizarTitulo);
        }
    };

    window.addEventListener('scroll', solicitarActualizacion, { passive: true });
    window.addEventListener('resize', () => {
        progresoSuavizado = calcularProgreso();
        aplicarProgreso(progresoSuavizado);
    });
    window.addEventListener('load', solicitarActualizacion);

    if (typeof ResizeObserver !== 'undefined') {
        const observadorPerfumes = new ResizeObserver(solicitarActualizacion);
        observadorPerfumes.observe(seccionPerfumes);
    }

    solicitarActualizacion();
});
