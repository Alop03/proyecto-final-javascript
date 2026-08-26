// Pre-entrega 10: APIs, peticiones y librerías

const CLAVE_STORAGE = "planesAnsiedarkAPI"

let planes = []
let terminoBusqueda = ""

const contenedorPlanes = document.querySelector("#contenedor-planes")
const formularioPlan = document.querySelector("#formulario-plan")
const inputNombre = document.querySelector("#nombre-plan")
const inputPrecio = document.querySelector("#precio-plan")
const inputCantidadJoyas = document.querySelector("#cantidad-joyas")
const inputDescripcion = document.querySelector("#descripcion-plan")
const botonAgregar = document.querySelector("#boton-agregar")
const botonVaciar = document.querySelector("#boton-vaciar")
const buscador = document.querySelector("#buscador")
const mensaje = document.querySelector("#mensaje")
const estadoCarga = document.querySelector("#estado-carga")
const avisoPromocional = document.querySelector("#aviso-promocional")

function notificar(texto, tipo) {
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

function obtenerPlanesGuardados() {
    const datosGuardados = localStorage.getItem(CLAVE_STORAGE)

    return JSON.parse(datosGuardados ?? "null")
}

async function cargarPlanes() {
    estadoCarga.textContent = "Cargando planes disponibles..."

    try {
        const respuesta = await fetch("./DATA/planes.json")

        if (!respuesta.ok) {
            throw new Error("No se pudo obtener el archivo de planes")
        }

        const planesRecibidos = await respuesta.json()
        const planesGuardados = obtenerPlanesGuardados()

        planes = planesGuardados ?? planesRecibidos

        sincronizarDatos()

        notificar(
            "Planes cargados correctamente.",
            "exito"
        )
    } catch (error) {
        planes = obtenerPlanesGuardados() ?? []
        actualizarVista()

        notificar(
            "No pudimos cargar los planes. Intentá nuevamente.",
            "error"
        )
    } finally {
        estadoCarga.textContent = ""
    }
}

function sincronizarDatos() {
    let guardadoCorrecto = false

    try {
        const planesConvertidos = JSON.stringify(planes)
        localStorage.setItem(CLAVE_STORAGE, planesConvertidos)
        guardadoCorrecto = true
    } catch (error) {
        notificar(
            "No pudimos guardar los cambios.",
            "error"
        )
    } finally {
        actualizarVista()
    }

    return guardadoCorrecto
}

function renderizarPlanes(listaPlanes) {
    contenedorPlanes.innerHTML = ""

    if (listaPlanes.length === 0) {
        contenedorPlanes.innerHTML = `
            <p class="sin-resultados">
                No encontramos planes para mostrar.
            </p>
        `
        return
    }

    listaPlanes.forEach(plan => {
        const {
            id,
            nombre,
            precio,
            cantidadJoyas,
            descripcion
        } = plan

        const textoJoyas = cantidadJoyas === 1
            ? "1 joya mensual"
            : `${cantidadJoyas} joyas mensuales`

        contenedorPlanes.innerHTML += `
            <article class="tarjeta-plan">
                <h3>${nombre}</h3>

                <p class="precio">
                    $${precio.toLocaleString("es-UY")} por mes
                </p>

                <p>${textoJoyas}</p>
                <p class="descripcion">${descripcion}</p>

                <button
                    type="button"
                    class="boton-eliminar"
                    data-id="${id}">
                    Eliminar
                </button>
            </article>
        `
    })
}

function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto
    mensaje.className = "mensaje " + tipo
}

function mostrarBeneficioPromocional() {
    setTimeout(() => {
        avisoPromocional.innerHTML = `
            <strong>Beneficio especial:</strong>
            obtené un 10% de descuento en el primer mes.
        `

        avisoPromocional.classList.add(
            "aviso-promocional-visible"
        )
    }, 3000)
}

function obtenerPlanesFiltrados() {
    return terminoBusqueda === ""
        ? planes
        : planes.filter(plan => {
            return plan.nombre
                .toLowerCase()
                .includes(terminoBusqueda)
        })
}

function actualizarVista() {
    const planesFiltrados = obtenerPlanesFiltrados()
    renderizarPlanes(planesFiltrados)
}

function limpiarFormulario() {
    formularioPlan.reset()
    inputNombre.focus()
}

function agregarPlan() {
    const nombre = inputNombre.value.trim()
    const precio = Number(inputPrecio.value)
    const cantidadJoyas = Number(inputCantidadJoyas.value)
    const descripcion = inputDescripcion.value.trim()

    if (
        nombre === "" ||
        descripcion === "" ||
        precio <= 0 ||
        cantidadJoyas <= 0
    ) {
        mostrarMensaje(
            "Completá todos los campos con datos válidos.",
            "mensaje-error"
        )

        notificar(
            "Revisá los datos ingresados.",
            "error"
        )

        return
    }

    const ids = planes.map(plan => plan.id)
    const nuevoId = Math.max(...ids, 0) + 1

    const nuevoPlan = {
        id: nuevoId,
        nombre,
        precio,
        cantidadJoyas,
        descripcion
    }

    planes.push(nuevoPlan)

    const guardadoCorrecto = sincronizarDatos()

    buscador.value = ""
    terminoBusqueda = ""

    limpiarFormulario()
    actualizarVista()

    mostrarMensaje(
        "El nuevo plan fue agregado.",
        "mensaje-exito"
    )

    const textoNotificacion = guardadoCorrecto
        ? "Plan agregado y guardado."
        : "El plan no pudo guardarse."

    const tipoNotificacion = guardadoCorrecto
        ? "exito"
        : "error"

    notificar(textoNotificacion, tipoNotificacion)
}

function eliminarPlan(idPlan) {
    const indicePlan = planes.findIndex(
        plan => plan.id === idPlan
    )

    if (indicePlan !== -1) {
        const nombreEliminado =
            planes[indicePlan]?.nombre ?? "El plan seleccionado"

        planes.splice(indicePlan, 1)
        sincronizarDatos()

        notificar(
            nombreEliminado + " fue eliminado.",
            "exito"
        )
    }
}

function vaciarPlanes() {
    const textoNotificacion = planes.length > 0
        ? "Todos los planes fueron eliminados."
        : "No había planes para eliminar."

    planes = []
    sincronizarDatos()

    notificar(textoNotificacion, "exito")
}

botonAgregar.addEventListener("click", agregarPlan)

formularioPlan.addEventListener("submit", event => {
    event.preventDefault()
    agregarPlan()
})

buscador.addEventListener("keyup", event => {
    terminoBusqueda = event.target.value
        .trim()
        .toLowerCase()

    actualizarVista()
})

contenedorPlanes.addEventListener("click", event => {
    if (event.target.classList.contains("boton-eliminar")) {
        const idPlan = Number(event.target.dataset.id)
        eliminarPlan(idPlan)
    }
})

botonVaciar.addEventListener("click", vaciarPlanes)

cargarPlanes()
mostrarBeneficioPromocional()

