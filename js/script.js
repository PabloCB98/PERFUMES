// Estado global de filtros (temporada + búsqueda por texto)
let filtroTemporadaActivo = 'todos';
let textoBusquedaActivo = '';
let refrescarSugerenciasBusqueda = null;
let limpiarBusquedaActiva = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarPerfumes();
});

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function obtenerTarjetas() {
    return document.querySelectorAll('#contenedor-perfumes .tarjeta-perfume');
}

function coincideConBusqueda(tarjeta, consulta) {
    if (!consulta) return true;

    const termino = normalizarTexto(consulta);
    const nombre = normalizarTexto(tarjeta.dataset.nombre || '');
    const marca = normalizarTexto(tarjeta.dataset.marca || '');

    return nombre.includes(termino) || marca.includes(termino);
}

function coincideConTemporada(tarjeta, temporada) {
    return temporada === 'todos' || tarjeta.dataset.temporada === temporada;
}

function hayFiltroBusquedaActivo() {
    return textoBusquedaActivo.trim().length > 0;
}

function actualizarIndicadoresBusqueda(visibles) {
    const avisoBusqueda = document.getElementById('aviso-busqueda');
    const avisoTexto = document.getElementById('aviso-busqueda-texto');
    const btnLupa = document.getElementById('btn-toggle-busqueda');
    const btnLimpiarInput = document.getElementById('btn-limpiar-input');
    const inputBusqueda = document.getElementById('busqueda-perfumes');
    const filtroActivo = hayFiltroBusquedaActivo();

    if (btnLupa) {
        btnLupa.classList.toggle('busqueda-activa', filtroActivo);
        btnLupa.title = filtroActivo ? 'Filtro activo — pulsa Ver todos para salir' : 'Buscar...';
    }

    if (btnLimpiarInput && inputBusqueda) {
        const panelAbierto = document.getElementById('panel-busqueda')?.classList.contains('visible');
        btnLimpiarInput.hidden = !(panelAbierto && inputBusqueda.value.trim());
    }

    if (avisoBusqueda && avisoTexto) {
        if (filtroActivo) {
            avisoBusqueda.hidden = false;
            avisoTexto.textContent =
                visibles === 1
                    ? `Mostrando 1 perfume para «${textoBusquedaActivo}»`
                    : `Mostrando ${visibles} perfumes para «${textoBusquedaActivo}»`;
        } else {
            avisoBusqueda.hidden = true;
            avisoTexto.textContent = '';
        }
    }
}

function aplicarFiltrosAlGrid() {
    const tarjetas = obtenerTarjetas();
    const mensajeVacio = document.getElementById('mensaje-vacio-grid');
    let visibles = 0;

    tarjetas.forEach(tarjeta => {
        const mostrar =
            coincideConTemporada(tarjeta, filtroTemporadaActivo) &&
            coincideConBusqueda(tarjeta, textoBusquedaActivo);

        tarjeta.style.display = mostrar ? '' : 'none';
        tarjeta.classList.toggle('tarjeta-oculta', !mostrar);

        if (mostrar) visibles++;
    });

    if (mensajeVacio) {
        mensajeVacio.hidden = !(hayFiltroBusquedaActivo() && visibles === 0);
    }

    actualizarIndicadoresBusqueda(visibles);
}

function activarFiltroTemporada(temporada) {
    const botones = document.querySelectorAll('.botones-navegacion a[data-panel]');
    botones.forEach(boton => {
        boton.classList.toggle('activa', boton.getAttribute('data-panel') === temporada);
    });
    filtroTemporadaActivo = temporada;
    aplicarFiltrosAlGrid();
}

function cargarPerfumes() {
    fetch('data/datos.xml')
        .then(respuesta => respuesta.text())
        .then(textoXML => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(textoXML, 'application/xml');
            const contenedor = document.getElementById('contenedor-perfumes');
            const perfumes = xmlDoc.getElementsByTagName('perfume');

            for (let i = 0; i < perfumes.length; i++) {
                const p = perfumes[i];

                const id = p.getAttribute('id');
                const nombre = p.getElementsByTagName('nombre')[0].textContent;
                const marca = p.getElementsByTagName('marca')[0].textContent;
                const tipo = p.getElementsByTagName('tipo')[0].textContent;
                const familia = p.getElementsByTagName('familia_olfativa')[0].textContent;
                const genero = p.getElementsByTagName('genero')[0].textContent;
                const salida = p.getElementsByTagName('salida')[0].textContent;
                const corazon = p.getElementsByTagName('corazon')[0].textContent;
                const fondo = p.getElementsByTagName('fondo')[0].textContent;
                const precio = p.getElementsByTagName('precio')[0].textContent;
                const imagen = p.getElementsByTagName('imagen')[0].textContent.trim();
                const descripcion = p
                    .getElementsByTagName('descripcion')[0]
                    .textContent.trim()
                    .replace(/\s+/g, ' ');
                const opinion = p
                    .getElementsByTagName('opinion_personal')[0]
                    .textContent.trim()
                    .replace(/\s+/g, ' ');
                const nota = p.getElementsByTagName('mi_nota')[0].textContent;

                const nodoTemporada = p.parentNode.parentNode;
                const temporada = nodoTemporada.getAttribute('tipo').toLowerCase();

                const divPerfume = document.createElement('div');
                divPerfume.id = id;
                divPerfume.className = 'tarjeta-perfume';
                divPerfume.dataset.temporada = temporada;
                divPerfume.dataset.nombre = nombre;
                divPerfume.dataset.marca = marca;

                divPerfume.addEventListener('click', () => {
                    abrirModal(
                        nombre,
                        marca,
                        tipo,
                        familia,
                        genero,
                        salida,
                        corazon,
                        fondo,
                        descripcion,
                        opinion,
                        nota,
                        precio,
                        imagen
                    );
                });

                const img = document.createElement('img');
                img.src = imagen;
                img.alt = 'Foto del perfume ' + nombre;
                img.loading = 'lazy';

                const h3 = document.createElement('h3');
                h3.textContent = nombre;

                const h4 = document.createElement('h4');
                h4.textContent = marca;

                divPerfume.appendChild(img);
                divPerfume.appendChild(h3);
                divPerfume.appendChild(h4);
                contenedor.appendChild(divPerfume);
            }

            configurarBusqueda();
            configurarFiltros();
            aplicarFiltrosAlGrid();
        })
        .catch(error => {
            console.error('Error al cargar el XML: ' + error);
            document.getElementById('contenedor-perfumes').innerHTML =
                '<p class="mensaje-error-carga">Error al cargar los perfumes. Debes usar Live Server.</p>';
        });
}

function configurarFiltros() {
    const botones = document.querySelectorAll('.botones-navegacion a[data-panel]');

    botones.forEach(boton => {
        boton.addEventListener('click', e => {
            e.preventDefault();

            if (hayFiltroBusquedaActivo() && limpiarBusquedaActiva) {
                limpiarBusquedaActiva();
            }

            filtroTemporadaActivo = boton.getAttribute('data-panel');
            botones.forEach(b => b.classList.remove('activa'));
            boton.classList.add('activa');
            aplicarFiltrosAlGrid();
            if (refrescarSugerenciasBusqueda) refrescarSugerenciasBusqueda();
        });
    });
}

function configurarBusqueda() {
    const btnLupa = document.getElementById('btn-toggle-busqueda');
    const panelBusqueda = document.getElementById('panel-busqueda');
    const inputBusqueda = document.getElementById('busqueda-perfumes');
    const resultadosBusqueda = document.getElementById('resultados-busqueda');
    const listaResultados = document.getElementById('lista-resultados-busqueda');
    const sinResultados = document.getElementById('sin-resultados-busqueda');

    if (!btnLupa || !panelBusqueda || !inputBusqueda) return;

    const cerrarPanelBusqueda = () => {
        panelBusqueda.classList.remove('visible', 'con-resultados');
        panelBusqueda.setAttribute('aria-hidden', 'true');
        btnLupa.classList.remove('activa');
        btnLupa.setAttribute('aria-expanded', 'false');
        if (resultadosBusqueda) resultadosBusqueda.hidden = true;
    };

    const abrirPanelBusqueda = () => {
        panelBusqueda.classList.add('visible');
        panelBusqueda.setAttribute('aria-hidden', 'false');
        btnLupa.classList.add('activa');
        btnLupa.setAttribute('aria-expanded', 'true');
        inputBusqueda.focus();
    };

    const btnLimpiarInput = document.getElementById('btn-limpiar-input');
    const btnQuitarBusqueda = document.getElementById('btn-quitar-busqueda');

    const limpiarBusqueda = () => {
        inputBusqueda.value = '';
        textoBusquedaActivo = '';
        if (resultadosBusqueda) resultadosBusqueda.hidden = true;
        if (listaResultados) listaResultados.innerHTML = '';
        if (sinResultados) sinResultados.hidden = true;
        panelBusqueda.classList.remove('con-resultados');
        cerrarPanelBusqueda();
        aplicarFiltrosAlGrid();
        obtenerTarjetas().forEach(t => t.classList.remove('tarjeta-resaltada'));
    };

    limpiarBusquedaActiva = limpiarBusqueda;

    const enlazarLimpiar = boton => {
        if (boton) boton.addEventListener('click', e => {
            e.stopPropagation();
            limpiarBusqueda();
        });
    };

    enlazarLimpiar(btnLimpiarInput);
    enlazarLimpiar(btnQuitarBusqueda);

    const obtenerCoincidencias = consulta => {
        const termino = consulta.trim();
        if (!termino) return [];

        return Array.from(obtenerTarjetas()).filter(tarjeta =>
            coincideConBusqueda(tarjeta, termino)
        );
    };

    const etiquetaTemporada = temporada => {
        if (temporada === 'verano') return 'Verano';
        if (temporada === 'invierno') return 'Invierno';
        return temporada;
    };

    const seleccionarPerfumeDesdeBusqueda = (tarjeta, consulta) => {
        const consultaFinal = consulta || tarjeta.dataset.nombre;
        inputBusqueda.value = consultaFinal;

        if (!coincideConTemporada(tarjeta, filtroTemporadaActivo)) {
            activarFiltroTemporada('todos');
        }

        textoBusquedaActivo = consultaFinal;
        aplicarFiltrosAlGrid();
        cerrarPanelBusqueda();

        tarjeta.classList.add('tarjeta-resaltada');
        setTimeout(() => tarjeta.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
        setTimeout(() => tarjeta.classList.remove('tarjeta-resaltada'), 2200);
    };

    const renderizarSugerencias = coincidencias => {
        if (!listaResultados || !resultadosBusqueda || !sinResultados) return;

        listaResultados.innerHTML = '';
        resultadosBusqueda.hidden = false;
        panelBusqueda.classList.add('con-resultados');

        if (coincidencias.length === 0) {
            sinResultados.hidden = false;
            return;
        }

        sinResultados.hidden = true;

        coincidencias.forEach(tarjeta => {
            const item = document.createElement('li');
            item.className = 'resultado-item';
            item.setAttribute('role', 'option');
            item.dataset.id = tarjeta.id;

            const miniatura = tarjeta.querySelector('img')?.cloneNode(true);
            if (miniatura) {
                miniatura.className = 'resultado-item__img';
                item.appendChild(miniatura);
            }

            const info = document.createElement('div');
            info.className = 'resultado-item__info';

            const nombre = document.createElement('span');
            nombre.className = 'resultado-item__nombre';
            nombre.textContent = tarjeta.dataset.nombre;

            const marca = document.createElement('span');
            marca.className = 'resultado-item__marca';
            marca.textContent = tarjeta.dataset.marca;

            const temporada = document.createElement('span');
            temporada.className = 'resultado-item__temporada';
            temporada.textContent = etiquetaTemporada(tarjeta.dataset.temporada);

            info.appendChild(nombre);
            info.appendChild(marca);
            info.appendChild(temporada);
            item.appendChild(info);

            item.addEventListener('click', () => {
                seleccionarPerfumeDesdeBusqueda(tarjeta, inputBusqueda.value.trim());
            });

            listaResultados.appendChild(item);
        });
    };

    const actualizarSugerenciasBusqueda = () => {
        const consulta = inputBusqueda.value.trim();
        if (!consulta) {
            if (resultadosBusqueda) resultadosBusqueda.hidden = true;
            if (listaResultados) listaResultados.innerHTML = '';
            if (sinResultados) sinResultados.hidden = true;
            panelBusqueda.classList.remove('con-resultados');
            return;
        }
        renderizarSugerencias(obtenerCoincidencias(consulta));
    };

    refrescarSugerenciasBusqueda = actualizarSugerenciasBusqueda;

    const confirmarBusqueda = () => {
        const consulta = inputBusqueda.value.trim();
        if (!consulta) {
            limpiarBusqueda();
            return;
        }

        const coincidencias = obtenerCoincidencias(consulta);

        if (coincidencias.length === 0) {
            textoBusquedaActivo = consulta;
            aplicarFiltrosAlGrid();
            renderizarSugerencias([]);
            return;
        }

        // Si hay resultados en otra temporada, mostramos TODOS para no ocultarlos
        const hayFueraDeTemporada = coincidencias.some(
            t => !coincideConTemporada(t, filtroTemporadaActivo)
        );
        if (hayFueraDeTemporada && filtroTemporadaActivo !== 'todos') {
            activarFiltroTemporada('todos');
        }

        textoBusquedaActivo = consulta;
        aplicarFiltrosAlGrid();
        cerrarPanelBusqueda();

        const destino = document.getElementById('contenedor-perfumes');
        if (destino) {
            destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    btnLupa.addEventListener('click', e => {
        e.stopPropagation();
        if (panelBusqueda.classList.contains('visible')) {
            cerrarPanelBusqueda();
            return;
        }
        abrirPanelBusqueda();
    });

    inputBusqueda.addEventListener('input', () => {
        actualizarIndicadoresBusqueda(
            Array.from(obtenerTarjetas()).filter(t => t.style.display !== 'none').length
        );

        if (!inputBusqueda.value.trim()) {
            if (hayFiltroBusquedaActivo()) {
                limpiarBusqueda();
            } else {
                if (resultadosBusqueda) resultadosBusqueda.hidden = true;
                if (listaResultados) listaResultados.innerHTML = '';
                panelBusqueda.classList.remove('con-resultados');
            }
            return;
        }

        if (hayFiltroBusquedaActivo()) {
            textoBusquedaActivo = '';
            aplicarFiltrosAlGrid();
        }
        actualizarSugerenciasBusqueda();
    });

    inputBusqueda.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            confirmarBusqueda();
        }
    });

    inputBusqueda.addEventListener('search', () => {
        if (!inputBusqueda.value) limpiarBusqueda();
    });

    document.addEventListener('click', e => {
        if (!panelBusqueda.classList.contains('visible')) return;
        const clickEnPanel = panelBusqueda.contains(e.target);
        const clickEnLupa = btnLupa.contains(e.target);
        if (!clickEnPanel && !clickEnLupa) cerrarPanelBusqueda();
    });

    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;

        if (panelBusqueda.classList.contains('visible')) {
            cerrarPanelBusqueda();
            btnLupa.focus();
            return;
        }

        if (hayFiltroBusquedaActivo()) {
            limpiarBusqueda();
        }
    });
}

function abrirModal(
    nombre,
    marca,
    tipo,
    familia,
    genero,
    salida,
    corazon,
    fondo,
    desc,
    opinion,
    nota,
    precio,
    imagen
) {
    document.getElementById('modal-nombre').textContent = nombre;
    document.getElementById('modal-marca').textContent = marca;
    document.getElementById('modal-tipo').textContent = tipo + ' · ' + familia + ' · ' + genero;
    document.getElementById('modal-salida').textContent = 'Salida: ' + salida;
    document.getElementById('modal-corazon').textContent = 'Corazón: ' + corazon;
    document.getElementById('modal-fondo').textContent = 'Fondo: ' + fondo;
    document.getElementById('modal-descripcion').textContent = desc;
    document.getElementById('modal-opinion').textContent = '❝ ' + opinion + ' ❞';
    document.getElementById('modal-nota').textContent = 'Mi nota: ' + nota;
    document.getElementById('modal-precio').textContent = 'Precio: ' + precio + '€';
    document.getElementById('modal-imagen').src = imagen;
    document.getElementById('overlay').classList.add('visible');
}

function cerrarModal(e) {
    if (e.target.id === 'overlay') {
        const overlay = document.getElementById('overlay');
        const modal = overlay.querySelector('.modal');
        modal.classList.add('modal-closing');
        setTimeout(() => {
            overlay.classList.remove('visible');
            modal.classList.remove('modal-closing');
        }, 300);
    }
}

function cerrarPorBoton() {
    const overlay = document.getElementById('overlay');
    const modal = overlay.querySelector('.modal');
    modal.classList.add('modal-closing');
    setTimeout(() => {
        overlay.classList.remove('visible');
        modal.classList.remove('modal-closing');
    }, 300);
}
