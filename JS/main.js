// Pre-entrega final: portal de contratación de Ansiedark

const CLAVE_COMPARACION = "comparacionAnsiedark"
const CLAVE_PLAN_SELECCIONADO = "planSeleccionadoAnsiedark"

// Estado principal de la aplicación
let planes = []
let idsComparados = []
let terminoBusqueda = ""

// Recupera del Storage los planes seleccionados para comparar.
function obtenerComparacionGuardada() {
    try {
        const datosGuardados =
            localStorage.getItem(CLAVE_COMPARACION)

        return JSON.parse(datosGuardados) || []
    } catch (error) {
        return []
    }
}

// Guarda la comparación actual en localStorage.
function guardarComparacion() {
    localStorage.setItem(
        CLAVE_COMPARACION,
        JSON.stringify(idsComparados)
    )
}

// Obtiene los planes que coinciden con la búsqueda.
function obtenerPlanesFiltrados() {
    return terminoBusqueda === ""
        ? planes
        : planes.filter(plan =>
            plan.nombre
                .toLowerCase()
                .includes(terminoBusqueda)
        )
}

// Busca los objetos completos seleccionados para comparar.
function obtenerPlanesComparados() {
    return idsComparados
        .map(idPlan =>
            planes.find(plan => plan.id === idPlan)
        )
        .filter(plan => plan !== undefined)
}

// Actualiza el catálogo y el comparador.
function actualizarVista() {
    const planesFiltrados = obtenerPlanesFiltrados()
    const planesComparados = obtenerPlanesComparados()

    renderizarPlanes(
        planesFiltrados,
        idsComparados
    )

    renderizarComparador(planesComparados)
}

// Agrega o elimina un plan del comparador.
function alternarComparacion(idPlan) {
    const planYaSeleccionado =
        idsComparados.includes(idPlan)

    if (planYaSeleccionado) {
        idsComparados = idsComparados.filter(
            idComparado => idComparado !== idPlan
        )

        mostrarNotificacion(
            "El plan fue retirado de la comparación."
        )
    } else {
        if (idsComparados.length >= 2) {
            mostrarNotificacion(
                "Podés comparar un máximo de dos planes.",
                "error"
            )
            return
        }

        idsComparados.push(idPlan)

        mostrarNotificacion(
            "Plan agregado a la comparación."
        )
    }

    guardarComparacion()
    actualizarVista()
}

// Guarda el plan elegido para continuar la contratación.
function elegirPlan(idPlan) {
    const planSeleccionado = planes.find(
        plan => plan.id === idPlan
    )

    if (!planSeleccionado) {
        mostrarNotificacion(
            "No pudimos encontrar el plan seleccionado.",
            "error"
        )
        return
    }

    localStorage.setItem(
        CLAVE_PLAN_SELECCIONADO,
        JSON.stringify(planSeleccionado)
    )

    mostrarNotificacion(
        `${planSeleccionado.nombre} fue seleccionado.`
    )
}

// Carga el catálogo desde el archivo JSON.
async function cargarPlanes() {
    estadoCarga.textContent =
        "Cargando planes disponibles..."

    try {
        const respuesta = await fetch(
            "./DATA/planes.json"
        )

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo obtener el catálogo"
            )
        }

        planes = await respuesta.json()

        const comparacionGuardada =
            obtenerComparacionGuardada()

        // Conserva solamente identificadores que todavía existen.
        idsComparados = comparacionGuardada.filter(
            idPlan =>
                planes.some(plan => plan.id === idPlan)
        )

        guardarComparacion()
        actualizarVista()

        mostrarNotificacion(
            "Planes cargados correctamente."
        )
    } catch (error) {
        contenedorPlanes.innerHTML = `
            <p class="mensaje-error-carga">
                No pudimos cargar los planes.
                Actualizá la página para intentarlo nuevamente.
            </p>
        `

        mostrarNotificacion(
            "Ocurrió un error al cargar los planes.",
            "error"
        )
    } finally {
        estadoCarga.textContent = ""
    }
}

// Filtra el catálogo mientras el usuario escribe.
buscador.addEventListener("input", evento => {
    terminoBusqueda =
        evento.target.value.trim().toLowerCase()

    actualizarVista()
})

// Gestiona las acciones realizadas en las tarjetas.
contenedorPlanes.addEventListener("click", evento => {
    const botonComparar =
        evento.target.closest(".boton-comparar")

    if (!botonComparar) {
        return
    }

    const idPlan = Number(botonComparar.dataset.id)
    alternarComparacion(idPlan)
})

// Gestiona la elección desde el comparador.
contenidoComparador.addEventListener("click", evento => {
    const botonElegir =
        evento.target.closest(".boton-elegir")

    if (!botonElegir) {
        return
    }

    const idPlan = Number(botonElegir.dataset.id)
    elegirPlan(idPlan)
})

// Inicializa el portal.
cargarPlanes()
