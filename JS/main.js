// Proyecto final: portal de contratación de Ansiedark

const CLAVE_COMPARACION = "comparacionAnsiedark"
const CLAVE_PLAN_SELECCIONADO = "planSeleccionadoAnsiedark"
const CLAVE_SOLICITUDES = "solicitudesAnsiedark"

// Estado principal de la aplicación
let planes = []
let idsComparados = []
let terminoBusqueda = ""
let idPlanSeleccionado = null

// Recupera un valor almacenado y evita errores de conversión.
function obtenerDatosGuardados(clave, valorAlternativo) {
    try {
        const datosGuardados = localStorage.getItem(clave)

        return JSON.parse(datosGuardados) || valorAlternativo
    } catch (error) {
        return valorAlternativo
    }
}

// Guarda la comparación actual en localStorage.
function guardarComparacion() {
    localStorage.setItem(
        CLAVE_COMPARACION,
        JSON.stringify(idsComparados)
    )
}

// Guarda el plan seleccionado durante la contratación.
function guardarPlanSeleccionado() {
    localStorage.setItem(
        CLAVE_PLAN_SELECCIONADO,
        JSON.stringify(idPlanSeleccionado)
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

// Busca el objeto correspondiente al plan elegido.
function obtenerPlanSeleccionado() {
    return planes.find(
        plan => plan.id === idPlanSeleccionado
    )
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

// Inicia el proceso de contratación con el plan elegido.
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

    idPlanSeleccionado = idPlan
    guardarPlanSeleccionado()

    const cantidadMeses =
        Number(selectorDuracion.value) || 1

    renderizarContratacion(
        planSeleccionado,
        cantidadMeses
    )

    seccionContratacion.scrollIntoView({
        behavior: "smooth"
    })

    mostrarNotificacion(
        `${planSeleccionado.nombre} fue seleccionado.`
    )
}

// Cancela la selección sin borrar el catálogo.
function cancelarSeleccion() {
    idPlanSeleccionado = null

    localStorage.removeItem(
        CLAVE_PLAN_SELECCIONADO
    )

    limpiarContratacion()

    mostrarNotificacion(
        "La selección fue eliminada."
    )
}

// Construye la solicitud con los datos ingresados.
function crearSolicitud(planSeleccionado) {
    const cantidadMeses =
        Number(selectorDuracion.value)

    const {
        id,
        nombre,
        precio,
        cantidadJoyas
    } = planSeleccionado

    return {
        idSolicitud: Date.now(),
        fecha: new Date().toLocaleDateString("es-UY"),
        cliente: {
            nombre: inputNombreCliente.value.trim(),
            email: inputEmailCliente.value.trim(),
            telefono:
                inputTelefonoCliente.value.trim() ||
                "No informado"
        },
        plan: {
            id,
            nombre,
            precio,
            cantidadJoyas
        },
        cantidadMeses,
        precioTotal: precio * cantidadMeses
    }
}

// Guarda una nueva solicitud en localStorage.
function guardarSolicitud(solicitud) {
    const solicitudesGuardadas =
        obtenerDatosGuardados(CLAVE_SOLICITUDES, [])

    solicitudesGuardadas.push(solicitud)

    localStorage.setItem(
        CLAVE_SOLICITUDES,
        JSON.stringify(solicitudesGuardadas)
    )
}

// Confirma la contratación con SweetAlert2.
async function confirmarContratacion(evento) {
    evento.preventDefault()

    if (!formularioContratacion.checkValidity()) {
        formularioContratacion.reportValidity()
        return
    }

    const planSeleccionado =
        obtenerPlanSeleccionado()

    if (!planSeleccionado) {
        mostrarNotificacion(
            "Elegí un plan antes de continuar.",
            "error"
        )
        return
    }

    const solicitud =
        crearSolicitud(planSeleccionado)

    const {
        cliente,
        plan,
        cantidadMeses,
        precioTotal
    } = solicitud

    const resultado = await Swal.fire({
        title: "Confirmar suscripción",
        html: `
            <p><strong>Cliente:</strong> ${cliente.nombre}</p>
            <p><strong>Plan:</strong> ${plan.nombre}</p>
            <p><strong>Duración:</strong> ${cantidadMeses} meses</p>
            <p>
                <strong>Total:</strong>
                $${precioTotal.toLocaleString("es-UY")}
            </p>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Volver",
        confirmButtonColor: "#6f1d46",
        cancelButtonColor: "#786a71"
    })

    if (!resultado.isConfirmed) {
        return
    }

    guardarSolicitud(solicitud)

    idPlanSeleccionado = null

    localStorage.removeItem(
        CLAVE_PLAN_SELECCIONADO
    )

    limpiarContratacion()

    await Swal.fire({
        title: "¡Suscripción confirmada!",
        text:
            `Tu número de solicitud es ` +
            `#${solicitud.idSolicitud}.`,
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#6f1d46"
    })
}

// Restaura una contratación que estaba en proceso.
function restaurarPlanSeleccionado() {
    const datoGuardado =
        obtenerDatosGuardados(
            CLAVE_PLAN_SELECCIONADO,
            null
        )

    // Admite el formato anterior y el identificador actual.
    idPlanSeleccionado =
        typeof datoGuardado === "object"
            ? datoGuardado?.id
            : datoGuardado

    const planSeleccionado =
        obtenerPlanSeleccionado()

    if (planSeleccionado) {
        renderizarContratacion(
            planSeleccionado,
            Number(selectorDuracion.value) || 1
        )
    } else {
        idPlanSeleccionado = null

        localStorage.removeItem(
            CLAVE_PLAN_SELECCIONADO
        )
    }
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
            obtenerDatosGuardados(
                CLAVE_COMPARACION,
                []
            )

        // Conserva solamente identificadores válidos.
        idsComparados = comparacionGuardada.filter(
            idPlan =>
                planes.some(plan => plan.id === idPlan)
        )

        guardarComparacion()
        actualizarVista()
        restaurarPlanSeleccionado()

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

// Gestiona las acciones realizadas en el catálogo.
contenedorPlanes.addEventListener("click", evento => {
    const botonComparar =
        evento.target.closest(".boton-comparar")

    if (!botonComparar) {
        return
    }

    const idPlan = Number(botonComparar.dataset.id)
    alternarComparacion(idPlan)
})

// Gestiona la elección realizada en el comparador.
contenidoComparador.addEventListener("click", evento => {
    const botonElegir =
        evento.target.closest(".boton-elegir")

    if (!botonElegir) {
        return
    }

    const idPlan = Number(botonElegir.dataset.id)
    elegirPlan(idPlan)
})

// Actualiza el total cuando cambia la duración.
selectorDuracion.addEventListener("change", () => {
    const planSeleccionado =
        obtenerPlanSeleccionado()

    if (planSeleccionado) {
        renderizarContratacion(
            planSeleccionado,
            Number(selectorDuracion.value) || 1
        )
    }
})

// Permite cancelar y elegir otro plan.
botonCancelarSeleccion.addEventListener(
    "click",
    cancelarSeleccion
)

// Procesa la confirmación final.
formularioContratacion.addEventListener(
    "submit",
    confirmarContratacion
)

// Inicializa el portal.
cargarPlanes()