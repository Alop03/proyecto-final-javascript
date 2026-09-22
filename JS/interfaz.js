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


// Selectores correspondientes al proceso de contratación
const seccionContratacion =
    document.querySelector("#contratacion")

const formularioContratacion =
    document.querySelector("#formulario-contratacion")

const inputNombreCliente =
    document.querySelector("#nombre-cliente")

const inputEmailCliente =
    document.querySelector("#email-cliente")

const inputTelefonoCliente =
    document.querySelector("#telefono-cliente")

const selectorDuracion =
    document.querySelector("#duracion-suscripcion")

const botonCancelarSeleccion =
    document.querySelector("#boton-cancelar-seleccion")

const resumenPlan =
    document.querySelector("#resumen-plan")

const resumenPrecio =
    document.querySelector("#resumen-precio")

const resumenDuracion =
    document.querySelector("#resumen-duracion")

const resumenJoyas =
    document.querySelector("#resumen-joyas")

const resumenTotal =
    document.querySelector("#resumen-total")

// Muestra el plan seleccionado y calcula el total.
function renderizarContratacion(plan, cantidadMeses) {
    const {
        nombre,
        precio,
        cantidadJoyas
    } = plan

    const precioTotal = precio * cantidadMeses

    resumenPlan.textContent = nombre

    resumenPrecio.textContent =
        `$${precio.toLocaleString("es-UY")}`

    resumenDuracion.textContent =
        cantidadMeses === 1
            ? "1 mes"
            : `${cantidadMeses} meses`

    resumenJoyas.textContent =
        crearTextoJoyas(cantidadJoyas)

    resumenTotal.textContent =
        `$${precioTotal.toLocaleString("es-UY")}`

    seccionContratacion.classList.remove("oculto")
}

// Oculta y limpia el formulario de contratación.
function limpiarContratacion() {
    formularioContratacion.reset()
    seccionContratacion.classList.add("oculto")
}

// Selectores correspondientes al historial de solicitudes
const contenedorSolicitudes =
    document.querySelector("#contenedor-solicitudes")

const cantidadSolicitudes =
    document.querySelector("#cantidad-solicitudes")

const valorSolicitudes =
    document.querySelector("#valor-solicitudes")

const botonVaciarHistorial =
    document.querySelector("#boton-vaciar-historial")

// Renderiza las solicitudes guardadas en localStorage.
function renderizarSolicitudes(solicitudes) {
    cantidadSolicitudes.textContent =
        solicitudes.length

    // Reduce calcula el valor de todas las contrataciones.
    const valorTotal = solicitudes.reduce(
        (acumulador, solicitud) =>
            acumulador + solicitud.precioTotal,
        0
    )

    valorSolicitudes.textContent =
        `$${valorTotal.toLocaleString("es-UY")}`

    botonVaciarHistorial.classList.toggle(
        "oculto",
        solicitudes.length === 0
    )

    if (solicitudes.length === 0) {
        contenedorSolicitudes.innerHTML = `
            <p class="historial-vacio">
                Todavía no realizaste ninguna solicitud.
            </p>
        `
        return
    }

    contenedorSolicitudes.innerHTML = solicitudes
        .map(solicitud => {
            const {
                idSolicitud,
                fecha,
                cliente,
                plan,
                cantidadMeses,
                precioTotal
            } = solicitud

            return `
                <article class="tarjeta-solicitud">
                    <div class="cabecera-solicitud">
                        <div>
                            <span class="numero-solicitud">
                                Solicitud #${idSolicitud}
                            </span>

                            <h3>${plan.nombre}</h3>
                        </div>

                        <span class="fecha-solicitud">
                            ${fecha}
                        </span>
                    </div>

                    <dl>
                        <div>
                            <dt>Cliente</dt>
                            <dd>${cliente.nombre}</dd>
                        </div>

                        <div>
                            <dt>Correo</dt>
                            <dd>${cliente.email}</dd>
                        </div>

                        <div>
                            <dt>Duración</dt>
                            <dd>
                                ${cantidadMeses}
                                ${
                                    cantidadMeses === 1
                                        ? "mes"
                                        : "meses"
                                }
                            </dd>
                        </div>

                        <div>
                            <dt>Total</dt>
                            <dd>
                                $${precioTotal.toLocaleString("es-UY")}
                            </dd>
                        </div>
                    </dl>

                    <div class="acciones-solicitud">
                        <button
                            type="button"
                            class="boton-modificar"
                            data-accion="modificar"
                            data-id="${idSolicitud}"
                        >
                            Modificar duración
                        </button>

                        <button
                            type="button"
                            class="boton-eliminar"
                            data-accion="eliminar"
                            data-id="${idSolicitud}"
                        >
                            Eliminar
                        </button>
                    </div>
                </article>
            `
        })
        .join("")
}

