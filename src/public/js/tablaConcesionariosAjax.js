document.addEventListener("DOMContentLoaded", function () {
  cargarConcesionariosDesdeAPI();
});

function cargarConcesionariosDesdeAPI() {
  try {
    mostrarMensajeCarga();

    fetch(`/concesionarios/api`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error http: ${response.status}`);
        }
        return response.json();
      })
      .then((resultado) => {

        if (!resultado.success) {
          throw new Error(resultado.error || "Error desconocido");
        }

        mostrarConcesionariosEnTabla(resultado.data);
      })
      .catch((error) => {
        mostrarMensajeError(error.message);
      });
  } catch (error) {
    mostrarMensajeError(error.message);
  }
}

function mostrarConcesionariosEnTabla(concesionarios) {
  const tbody = document.querySelector("#tabla-concesionarios tbody");
  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";

  if (concesionarios.length === 0) {
    tbody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center text-muted">
                No hay concesionarios.
            </td>
        </tr>
        `;
    return;
  }

  concesionarios.forEach((concesionario) => {
    const fila = crearFilaConcesionario(concesionario);
    tbody.append(fila);
  });
}

function crearFilaConcesionario(c) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${c.id}</td>
    <td>${c.nombre}</td>
    <td>${c.ciudad}</td>
    <td>${c.direccion}</td>
    <td>${c.telefono_contacto}</td>
    <td>
      <div class="d-flex gap-3 justify-content-end">
        <a href="/concesionarios/admin/${c.id}/editar" 
           class="btn btn-success btn-sm"
           role="button" 
           aria-label="Editar concesionario ${c.nombre}">
          Editar
        </a>
       <button type="button" class="btn btn-danger btn-sm" 
          data-bs-toggle="modal" 
          data-bs-target="#modalEliminar"
          data-id="${c.id}" 
          data-nombre="${c.nombre}"
          data-tipo="el concesionario"
          data-url="/concesionarios/admin/${c.id}/eliminar"
          data-mensaje=""
          data-usuarios="${c.totalUsuarios || 0}"
          data-vehiculos="${c.totalVehiculos || 0}"
          aria-label="Eliminar concesionario ${c.nombre}">
          Eliminar
        </button>
      </div>
    </td>
  `;

  return tr;
}

function obtenerUsuarioSesion() {
  if (typeof usuarioSesion !== "undefined") {
    return usuarioSesion;
  }

  return null;
}
function mostrarMensajeCarga() {
  const tbody = document.querySelector("#tabla-concesionarios tbody");

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando concesionarios...</p>
        </td>
      </tr>
    `;
  }
}

function mostrarMensajeError(mensaje) {
  const tbody = document.querySelector("#tabla-concesionarios tbody");

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger">
          <p class="mt-2"> Error: ${mensaje}</p>
          <button class="btn btn-sm btn-primary mt-2" onclick="cargarConcesionariossDesdeAPI()">
           Reintentar
          </button>
        </td>
      </tr>
    `;
  }
}
