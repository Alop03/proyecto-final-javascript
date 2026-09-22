// Selectores principales de la interfaz
const contenedorPlanes = document.querySelector("#contenedor-planes")
const estadoCarga = document.querySelector("#estado-carga")
const buscador = document.querySelector("#buscador")
const seccionComparador = document.querySelector("#comparador")
const contenidoComparador = document.querySelector("#contenido-comparador")
const cantidadComparados = document.querySelector("#cantidad-comparados")

// Muestra notificaciones sin utilizar alertas nativas.
function mostrarNotificacion(texto, tipo = "exito") {
    const color = tipo === "error" ? "#b42318" : "#237a3b"

    Toastify({
        text: texto,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: color
        }
    }).showToast()
}

// Devuelve el texto correspondiente a la cantidad de joyas.
function crearTextoJoyas(cantidadJoyas) {
    return cantidadJoyas === 1
        ? "1 joya por mes"
        : `${cantidadJoyas} joyas por mes`
}

// Renderiza los planes recibidos desde el archivo JSON.
function renderizarPlanes(listaPlanes, idsComparados) {
    if (listaPlanes.length === 0) {
        contenedorPlanes.innerHTML = `
            <p class="sin-resultados">
                No encontramos planes con ese nombre.
            </p>
        `
        return
    }

    contenedorPlanes.innerHTML = listaPlanes
        .map(plan => {
            const {
                id,
                nombre,
                precio,
                cantidadJoyas,
                descripcion
            } = plan

            const estaSeleccionado = idsComparados.includes(id)

            return `
                <article class="tarjeta-plan">
                    <span class="etiqueta-plan">
                        Suscripción mensual
                    </span>

                    <h3>${nombre}</h3>

                    <p class="precio">
                        $${precio.toLocaleString("es-UY")}
                        <span>/mes</span>
                    </p>

                    <p class="cantidad-joyas">
                        ${crearTextoJoyas(cantidadJoyas)}
                    </p>

                    <p class="descripcion">
                        ${descripcion}
                    </p>

                    <button
                        type="button"
                        class="boton-comparar ${
                            estaSeleccionado
                                ? "boton-comparar-activo"
                                : ""
                        }"
                        data-id="${id}"
                    >
                        ${
                            estaSeleccionado
                                ? "Quitar comparación"
                                : "Comparar plan"
                        }
                    </button>
                </article>
            `
        })
        .join("")
}

// Renderiza los planes seleccionados dentro del comparador.
function renderizarComparador(planesComparados) {
    cantidadComparados.textContent =
        `${planesComparados.length} de 2 seleccionados`

    if (planesComparados.length === 0) {
        seccionComparador.classList.add("oculto")
        contenidoComparador.innerHTML = ""
        return
    }

    seccionComparador.classList.remove("oculto")

    const tarjetasComparacion = planesComparados
        .map(plan => {
            const {
                id,
                nombre,
                precio,
                cantidadJoyas,
                descripcion
            } = plan

            return `
                <article class="plan-comparado">
                    <h3>${nombre}</h3>

                    <dl>
                        <div>
                            <dt>Precio mensual</dt>
                            <dd>
                                $${precio.toLocaleString("es-UY")}
                            </dd>
                        </div>

                        <div>
                            <dt>Joyas incluidas</dt>
                            <dd>
                                ${crearTextoJoyas(cantidadJoyas)}
                            </dd>
                        </div>

                        <div>
                            <dt>Características</dt>
                            <dd>${descripcion}</dd>
                        </div>
                    </dl>

                    <button
                        type="button"
                        class="boton-elegir"
                        data-id="${id}"
                    >
                        Elegir este plan
                    </button>
                </article>
            `
        })
        .join("")

    const ayuda = planesComparados.length === 1
        ? `
            <p class="ayuda-comparador">
                Seleccioná otro plan para comparar sus detalles.
            </p>
        `
        : ""

    contenidoComparador.innerHTML = ayuda + tarjetasComparacion
}