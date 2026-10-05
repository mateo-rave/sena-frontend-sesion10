const CLAVE_TAREAS = "tareas";
const CLAVE_BUSQUEDA = "busqueda";

const tareasIniciales = [
    { id: 1, titulo: "Repasar JavaScript", prioridad: "Alta", completada: false },
    { id: 2, titulo: "Organizar apuntes", prioridad: "Media", completada: true },
    { id: 3, titulo: "Practicar async y await", prioridad: "Alta", completada: false },
    { id: 4, titulo: "Subir la evidencia a GitHub", prioridad: "Baja", completada: false }
];

let tareas = [];
let textoBusqueda = "";
let temporizadorBusqueda = null;

const formulario = document.querySelector("#formularioTarea");
const nuevaTarea = document.querySelector("#nuevaTarea");
const prioridad = document.querySelector("#prioridad");
const buscador = document.querySelector("#buscador");
const listaTareas = document.querySelector("#listaTareas");
const contador = document.querySelector("#contador");
const estadoInicial = document.querySelector("#estadoInicial");

function guardarTareas() {
    try {
        localStorage.setItem(CLAVE_TAREAS, JSON.stringify(tareas));
    } catch (error) {
        console.error("No se pudieron guardar las tareas:", error.message);
    }
}

function recuperarTareas() {
    try {
        const datosGuardados = localStorage.getItem(CLAVE_TAREAS);

        if (!datosGuardados) {
            return tareasIniciales.map(tarea => ({ ...tarea }));
        }

        const datos = JSON.parse(datosGuardados);
        return Array.isArray(datos) ? datos : [];
    } catch (error) {
        console.error("No se pudieron leer las tareas:", error.message);
        return [];
    }
}

function filtrarTareas() {
    const busqueda = textoBusqueda.toLowerCase().trim();

    return tareas.filter(({ titulo }) =>
        titulo.toLowerCase().includes(busqueda)
    );
}

function pintarTareas() {
    const resultado = filtrarTareas();

    contador.textContent = `${resultado.length} tarea${resultado.length === 1 ? "" : "s"}`;

    if (resultado.length === 0) {
        listaTareas.innerHTML = `<div class="vacio">No encontré tareas con ese texto.</div>`;
        return;
    }

    listaTareas.innerHTML = resultado.map(({ id, titulo, prioridad, completada }) => `
        <article class="tarea ${completada ? "completada" : ""}" data-id="${id}">
            <div class="tarea-info">
                <strong>${titulo}</strong>
                <small>Prioridad: ${prioridad}</small>
            </div>

            <div class="acciones">
                <button class="btn-secundario" type="button" data-accion="cambiar">
                    ${completada ? "Reabrir" : "Completar"}
                </button>
                <button class="btn-eliminar" type="button" data-accion="eliminar">Eliminar</button>
            </div>
        </article>
    `).join("");
}

function recuperarBusqueda() {
    try {
        return localStorage.getItem(CLAVE_BUSQUEDA) ?? "";
    } catch (error) {
        console.error("No se pudo recuperar la búsqueda:", error.message);
        return "";
    }
}

function guardarBusqueda() {
    try {
        localStorage.setItem(CLAVE_BUSQUEDA, textoBusqueda);
    } catch (error) {
        console.error("No se pudo guardar la búsqueda:", error.message);
    }
}

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function cargarDatosIniciales() {
    try {
        await esperar(1000);
        tareas = recuperarTareas();
        textoBusqueda = recuperarBusqueda();
        buscador.value = textoBusqueda;
    } catch (error) {
        console.error("Error durante la carga inicial:", error.message);
        throw new Error("No fue posible cargar la información.");
    }
}

async function iniciarAplicacion() {
    estadoInicial.hidden = false;
    listaTareas.hidden = true;
    estadoInicial.className = "cargando";
    estadoInicial.textContent = "Cargando tareas...";

    try {
        await cargarDatosIniciales();
        pintarTareas();
        estadoInicial.hidden = true;
        listaTareas.hidden = false;
    } catch (error) {
        estadoInicial.className = "error";
        estadoInicial.textContent = error.message;
    }
}

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const titulo = nuevaTarea.value.trim();

    if (!titulo) return;

    tareas.push({
        id: Date.now(),
        titulo,
        prioridad: prioridad.value,
        completada: false
    });

    guardarTareas();
    nuevaTarea.value = "";
    pintarTareas();
});

listaTareas.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button");
    const tarjeta = evento.target.closest(".tarea");

    if (!boton || !tarjeta) return;

    const id = Number(tarjeta.dataset.id);
    const accion = boton.dataset.accion;

    if (accion === "eliminar") {
        tareas = tareas.filter(tarea => tarea.id !== id);
    }

    if (accion === "cambiar") {
        tareas = tareas.map(tarea =>
            tarea.id === id
                ? { ...tarea, completada: !tarea.completada }
                : tarea
        );
    }

    guardarTareas();
    pintarTareas();
});

buscador.addEventListener("input", (evento) => {
    clearTimeout(temporizadorBusqueda);

    temporizadorBusqueda = setTimeout(() => {
        textoBusqueda = evento.target.value;
        guardarBusqueda();
        pintarTareas();
    }, 400);
});

iniciarAplicacion();
