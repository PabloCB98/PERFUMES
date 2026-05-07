//con este primer bloque nos aseguramos que el html se ha cargado antes de buscar nada, ya que sinó nos daría error
document.addEventListener("DOMContentLoaded", () => {
    cargarPerfumes(); // llama a la función que extrae los datos del archivo XML y los pinta
    configurarFiltros(); // me sirve para poder filtrar a través de los botones
});

//con esta función cargamos los datos del XML, la función que tenemos también ariba
function cargarPerfumes() {
    fetch('data/datos.xml') //petición fetch para leer los datos del archivo XML en cuestión
        .then(respuesta => respuesta.text()) //convierto la respuesta a texto
        .then(textoXML => {
            //utilizamos DOMParser para traducir el texto a formato XML real para que JS lo entienda correctamente
            let parser = new DOMParser(); 
            let xmlDoc = parser.parseFromString(textoXML, "application/xml");

            //buscamos el contenedor en el que irán las cajas de los perfumes
            let contenedor = document.getElementById("contenedor-perfumes");
            
            //obtenemos una lista con todas las etiquetas perfume que hay en el xml
            let perfumes = xmlDoc.getElementsByTagName("perfume");

            //bucle for, que se hace como en Java, para encontrar cada perfume uno a uno y se guardan como un array
            for (let i = 0; i<perfumes.length; i++) {
                
                let p = perfumes[i]; //le damos el nombre de p al perfume que tengamos en cada vuelta del bucle

                //en los siguientes pasos, extraemos la información
                let id = p.getAttribute("id");
                let nombre = p.getElementsByTagName("nombre")[0].textContent; //usamos el [0] porque el getElementsByTagName nos devuelve un array, aunque en este caso solo tengamos un nombre
                let marca = p.getElementsByTagName("marca")[0].textContent; //con el textContent sacamos el texto de dentro de la etiqueta, y así en cada uno de los pasos siguientes
                let tipo = p.getElementsByTagName("tipo")[0].textContent;
                let familia = p.getElementsByTagName("familia_olfativa")[0].textContent;
                let genero = p.getElementsByTagName("genero")[0].textContent;

                let notas = p.getElementsByTagName("notas")[0]; // aquí, dentro de notas hay elementos anidados, por lo que accedemos primero al padre, notas, y luego a las hijas, de igual manera que antes 
                let salida = p.getElementsByTagName("salida")[0].textContent;
                let corazon = p.getElementsByTagName("corazon")[0].textContent;
                let fondo = p.getElementsByTagName("fondo")[0].textContent;

                let precio = p.getElementsByTagName("precio")[0].textContent;
                let imagen = p.getElementsByTagName("imagen")[0].textContent.trim(); //con .trim elimino los espacios antes y después que pueda haber en el texto

                //limpiamos la descripción y la opinión
                // .replace(/\s+/g, ' ') elimina los saltos de línea extra
                let descripcion = p.getElementsByTagName("descripcion")[0].textContent.trim().replace(/\s+/g, ' ');
                let opinion = p.getElementsByTagName("opinion_personal")[0].textContent.trim().replace(/\s+/g, ' ');
                let nota = p.getElementsByTagName("mi_nota")[0].textContent;

                //para el nodoTemporada, subimos al padre del padre para poder leer la etiqueta de temporada del perfume, para filtrarlos
                let nodoTemporada = p.parentNode.parentNode;
                let temporada = nodoTemporada.getAttribute("tipo").toLowerCase(); //buscamos por tipo y lo pasamos a minúsculas, para evitar errores

                //generamos una nueva caja de tipo div  en la memoria para el perfume
                let divPerfume = document.createElement("div");
                divPerfume.id = id;

                //le metemos la temporada del perfume como un atributo de datos, que servirá para que los botones sepan cuándo ocultar y cuñando mostrar
                divPerfume.dataset.temporada = temporada;

                //añadimos un EventListener para que al clickar en la caja, se abrirá el modal
                divPerfume.addEventListener("click", () => {
                    abrirModal(nombre, marca, tipo, familia, genero,salida,corazon, fondo, descripcion, opinion, nota, precio,imagen);
                });

                // aquí creamos la imagen de cada tarjeta. También le añadimos el alt, para que si no carga la imagen, muestre ese texto
                let img = document.createElement("img");
                img.src = imagen;
                img.alt = "Foto del perfume " + nombre;

                //aquí creamos el nombre como título
                let h3 = document.createElement("h3");
                h3.textContent = nombre;

                // y aquí la marca como subtítulo
                let h4 = document.createElement("h4");
                h4.textContent = marca;

                // aquí simplemente metemos la imagen y cada texto dentro del div creado antes
                divPerfume.appendChild(img);
                divPerfume.appendChild(h3);
                divPerfume.appendChild(h4);

                // al final, metemos el div completo en el contenedor que hemos creado más arriba, el contenedor de la página web
                contenedor.appendChild(divPerfume);
            }
        })

        //por si acaso hay algún error en la carga del XML, usamos el catch para atraparlo y mostrar el texto con el error
        .catch(error => {
            console.error("Error al cargar el XML: " + error);
            document.getElementById("contenedor-perfumes").innerHTML = "<p>Error al cargar los perfumes, se debe usar Live Server</p>"
        });
    }
    
    //en esta función se configuran los filtros
    function configurarFiltros() {
        //aquí seleccionamos todos los enlaces a dentro de la clase botones-navegacion, por eso el punto
        const botones = document.querySelectorAll('.botones-navegacion a');

        //recorremos cada boton para darle la funcionalidad
        botones.forEach(boton => {
            boton.addEventListener('click', (e) => {
                e.preventDefault(); //con esto se evita que se recargue la pagina o nos mande havia arriba

                //eliminamos la clase activa a todo y se la aplicamos al botón que esté pulsado
                botones.forEach(b => b.classList.remove('activa'));
                boton.classList.add('activa');

                //leemos qué categoría queremos mostrar, si todos, si invierno o verano
                const filtroSeleccionado = boton.getAttribute('data-panel');

                //seleccionamos todas las cajas de perfumes antes creadas, arriba
                const tarjetasPerfumes = document.querySelectorAll('#contenedor-perfumes > div');

                //comparamos el filtro seleccionado con el atributo data-temporada de cada caja
                tarjetasPerfumes.forEach(tarjeta => {
                    //si marcamos todos o la temporada coincide con el filtro, se muestra
                    if (filtroSeleccionado === 'todos' || tarjeta.dataset.temporada === filtroSeleccionado) {
                        tarjeta.style.display = '';
                    }
                else {
                    //si no coincide se oculta toda la caja
                    tarjeta.style.display = 'none';
                }
                });
            });
        });
    }
    
    //Esta función es la del modal, la de la ventana emergente al pulsar en cada perfume
    //recibe los datos del perfume selecionado y se los metemos en el html del modal
    function abrirModal(nombre, marca, tipo, familia, genero, salida, corazon, fondo, desc, opinion, nota, precio, imagen) {
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
        document.getElementById('overlay').classList.add('visible'); //hacemos visible el overlay que contiene el moda. El overlay es  la capa oscura al abrirlo
    }

    //cerramos el modal cuándo hacemos click fuera de la caja, es decir, en la capa oscura
    function cerrarModal(e) {
    // comprobamos que el click es en el overlay
    if (e.target.id === 'overlay') {
        const overlay = document.getElementById('overlay');
        const modal = overlay.querySelector('.modal'); // buscamos el modal dentro

        //añadimos la clase que hace la animación de bajar con esa animacion del css, la animación de cierre
        modal.classList.add('modal-closing');

        // esperamos ese tiempo de 300 milisegundos antes de ocultarlo todo, para que se lleve a cabo la animación
        setTimeout(() => {
            overlay.classList.remove('visible'); 
            modal.classList.remove('modal-closing'); //limpiamos para la próxima apertura
        }, 300); 
    }
}
    
//esta función arregla el problema que tenía con mi boton ATRÄS, ya que antes solo tenía la función creada para cerrar al clicar fuera de la pestaña del perfume
    function cerrarPorBoton() {
        const overlay = document.getElementById('overlay');
        const modal = overlay.querySelector('.modal');

        //misma lógica que la función de antes 
        modal.classList.add('modal-closing');

        setTimeout(() => {
            overlay.classList.remove('visible');
            modal.classList.remove('modal-closing');
        }, 300);
    }


