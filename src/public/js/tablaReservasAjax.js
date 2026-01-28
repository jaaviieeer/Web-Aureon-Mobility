document.addEventListener("DOMContentLoaded", function () {
  cargarReservasDesdeAPI();
});

function cargarReservasDesdeAPI() {
  try {
    mostrarMensajeCarga();

    fetch(`/reservas/api`)
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

        mostrarReservasEnTabla(resultado.data);
      })
      .catch((error) => {
        mostrarMensajeError(error.message);
      });
  } catch (error) {
    mostrarMensajeError(error.message);
  }
}
function mostrarReservasEnTabla(reservas) {
  const tbody = document.querySelector("#tabla-reservas tbody");
  if (!tbody) {
    console.error("No se ha encontrado el tbody de la tabla.");
    return;
  }

  tbody.innerHTML = "";

  if (reservas.length === 0) {
    tbody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center text-muted">
                No hay reservas registradas.
            </td>
        </tr>
        `;
    return;
  }

  reservas.forEach((reserva) => {
    const fila = crearFilaReserva(reserva);
    tbody.append(fila);
  });
}

function crearFilaReserva(r) {
  const tr = document.createElement("tr");

  function formatearFecha(fechaISO) {
    if (!fechaISO) return "-";

    const fecha = new Date(fechaISO);

    return fecha.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  tr.innerHTML = `
         <td>${r.id}</td>
       <td>${r.marca} ${r.modelo}</td>
       <td>${r.estado}</td>
       <td>${r.nombre_cliente}</td>
       <td>${r.telefono}</td>
     <td>${formatearFecha(r.fecha_inicio)}</td>
    <td>${formatearFecha(r.fecha_fin)}</td>
    <td>
                <div class="d-flex gap-3 justify-content-end">
                ${
                  r.estado !== "cancelada" && r.estado !== "finalizada"
                    ? `
                    <button type="button" class="btn btn-danger btn-sm" data-bs-toggle="modal"
                      data-bs-target="#modalEliminar" data-id="${r.id}"
                      data-tipo="la reserva"
                      data-url="/reservas/api/${r.id}/eliminar"
                      data-mensaje="La reserva se cancelará o finalizará."
                      aria-label="Finalizar o cancelar reserva">
                      Finalizar/Cancelar
                    </button>
                    `
                    : ""
                }
                </div>
              </td>
    `;

  return tr;
}
function obtenerUsuarioSesion() {
  if (typeof usuarioSesion !== "undefined") {
    console.log("Usuario en sesión: ", usuarioSesion);
    return usuarioSesion;
  }

  return null;
}

function mostrarMensajeCarga() {
  const tbody = document.querySelector("#tabla-reservas tbody");

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando reservas...</p>
        </td>
      </tr>
    `;
  }
}

function mostrarMensajeError(mensaje) {
  const tbody = document.querySelector("#tabla-reservas tbody");

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger">
          <p class="mt-2">Error: ${mensaje}</p>
          <button class="btn btn-sm btn-primary mt-2" onclick="cargarReservasDesdeAPI()">
            Reintentar
          </button>
        </td>
      </tr>
    `;
  }
}
