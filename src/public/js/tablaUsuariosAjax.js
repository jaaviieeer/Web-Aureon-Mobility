document.addEventListener("DOMContentLoaded", function () {
  cargarUsuariosDesdeAPI();
});

function cargarUsuariosDesdeAPI() {
  try {
    mostrarMensajeCarga();

    fetch(`/usuarios/api`)
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

        mostrarUsuariosEnTabla(resultado.data);
      })
      .catch((error) => {
        mostrarMensajeError(error.message);
      });
  } catch (error) {
    mostrarMensajeError(error.message);
  }
}

function mostrarUsuariosEnTabla(usuarios) {
  const tbody = document.querySelector("#tabla-usuarios tbody");
  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";

  if (usuarios.length === 0) {
    tbody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center text-muted">
                No hay usuarios.
            </td>
        </tr>
        `;
    return;
  }

  const usuario = obtenerUsuarioSesion();

  usuarios.forEach((usuario) => {
    const fila = crearFilaUsuario(usuario);
    tbody.append(fila);
  });
}

function crearFilaUsuario(u, usuario) {
  const tr = document.createElement("tr");
  const usuarioSesion = obtenerUsuarioSesion();
  const esUsuarioActual = usuarioSesion && parseInt(usuarioSesion.id) === u.id;
  const botonEliminar = esUsuarioActual
    ? `<button type="button" class="btn btn-danger btn-sm" disabled 
         title="No puedes eliminar tu propio usuario">
         Eliminar
       </button>`
    : `<button type="button" class="btn btn-danger btn-sm" data-bs-toggle="modal"
         data-bs-target="#modalEliminar" data-id="${u.id}"
         data-nombre="${u.nombre}" data-tipo="al usuario"
         data-url="/usuarios/admin/${u.id}/eliminar"
         data-mensaje="El usuario no podrá acceder al sistema pero sus datos se mantendrán en la base de datos."
         aria-label="Dar de baja al usuario ${u.nombre}">
         Eliminar
       </button>`;

  tr.innerHTML = `
         <td>${u.id}</td>
       <td>${u.nombre}</td>
       <td>${u.correo}</td>
       <td>${u.rol}</td>
       <td>${u.telefono}</td>
    <td>${u.id_concesionario} </td>
    <div class="d-flex gap-3 justify-content-end">
                                            <a href="/usuarios/admin/${u.id}/editar" class="btn btn-success btn-sm"
                                                role="button" aria-label="Editar usuario ${u.nombre}">Editar</a>
                                            ${botonEliminar}
                                </div>
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
  const tbody = document.querySelector("#tabla-usuarios tbody");

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando usuarios...</p>
        </td>
      </tr>
    `;
  }
}

function mostrarMensajeError(mensaje) {
  const tbody = document.querySelector("#tabla-usuarios tbody");

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger">
          <p class="mt-2"> Error: ${mensaje}</p>
          <button class="btn btn-sm btn-primary mt-2" onclick="cargarUsuariosDesdeAPI()">
            Reintentar
          </button>
        </td>
      </tr>
    `;
  }
}
