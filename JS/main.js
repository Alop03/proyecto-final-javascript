// Pre-entrega 9: Asincronismo y manejo de errores

const CLAVE_STORAGE = "planesAnsiedark"

const planesIniciales = [
    {
        id: 1,
        nombre: "Plan Oro",
        precio: 1500,
        cantidadJoyas: 3,
        descripcion: "Selección premium"
    },
    {
        id: 2,
        nombre: "Plan Plata",
        precio: 1200,
        cantidadJoyas: 2,
        descripcion: "Joyas clásicas y versátiles"
    },
    {
        id: 3,
        nombre: "Plan Acero Quirúrgico",
        precio: 700,
        cantidadJoyas: 2,
        descripcion: "Joyas resistentes para uso diario"
    }
]

function cargarPlanes() {
    const datosGuardados = localStorage.getItem(CLAVE_STORAGE)
    const planesGuardados = JSON.parse(datosGuardados ?? "null")

    return planesGuardados ?? [...planesIniciales]
}

let planes = cargarPlanes()

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
const avisoPromocional = document.querySelector("#aviso-promocional")

let terminoBusqueda = ""

function sincronizarDatos() {
    let guardadoCorrecto = false

    try {
        const planesConvertidos = JSON.stringify(planes)
        localStorage.setItem(CLAVE_STORAGE, planesConvertidos)
        guardadoCorrecto = true
    } catch (error) {
        mostrarMensaje(
            "No pudimos guardar los cambios. Intentá nuevamente.",
            "mensaje-error"
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
            obtené un 10% de descuento en el primer mes de tu suscripción.
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
            return plan.nombre.toLowerCase().includes(terminoBusqueda)
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

    const textoMensaje = guardadoCorrecto
    ? "El nuevo plan fue agregado y guardado."
    : "El plan se agregó, pero no pudo guardarse."

const tipoMensaje = guardadoCorrecto
    ? "mensaje-exito"
    : "mensaje-error"

mostrarMensaje(textoMensaje, tipoMensaje)
}

function eliminarPlan(idPlan) {
    const indicePlan = planes.findIndex(plan => plan.id === idPlan)

    if (indicePlan !== -1) {
        const nombreEliminado =
            planes[indicePlan]?.nombre ?? "El plan seleccionado"

        planes.splice(indicePlan, 1)
        sincronizarDatos()

        mostrarMensaje(
            nombreEliminado + " fue eliminado.",
            "mensaje-exito"
        )
    }
}

function vaciarPlanes() {
    const textoMensaje = planes.length > 0
        ? "Todos los planes fueron eliminados."
        : "No había planes para eliminar."

    planes = []
   sincronizarDatos()

    mostrarMensaje(textoMensaje, "mensaje-exito")
}

botonAgregar.addEventListener("click", agregarPlan)

formularioPlan.addEventListener("submit", event => {
    event.preventDefault()
    agregarPlan()
})

buscador.addEventListener("keyup", event => {
    terminoBusqueda = event.target.value.trim().toLowerCase()
    actualizarVista()
})

contenedorPlanes.addEventListener("click", event => {
    if (event.target.classList.contains("boton-eliminar")) {
        const idPlan = Number(event.target.dataset.id)
        eliminarPlan(idPlan)
    }
})

botonVaciar.addEventListener("click", vaciarPlanes)

sincronizarDatos()
mostrarBeneficioPromocional()


