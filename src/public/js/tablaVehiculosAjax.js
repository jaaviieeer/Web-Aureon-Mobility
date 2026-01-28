document.addEventListener("DOMContentLoaded", function () {
  const filtrarConcesionario = document.getElementById("vehiculos-panel");
  const concesionarioRequerido = document.getElementById("concesionarioRequerido");
  const ciudadRequerida = document.getElementById("ciudadRequerida");
  const buscador = document.getElementById("buscador");
  const plazasRequeridas = document.getElementById("plazasRequeridas");
  const autonomiaRequerida = document.getElementById("autonomiaRequerida");
  let filtroConcesionario = false;
  let filtros = {
    texto: "",
    plazas: "",
    autonomia: "",
    concesionario: "",
    ciudad: ""
  };
  if (filtrarConcesionario) {
    filtroConcesionario = true;
    concesionarioRequerido.disabled = true;
    ciudadRequerida.disabled = true;
  }
  cargarVehiculosDesdeAPI(filtros, filtroConcesionario);

  if (buscador) {
    buscador.addEventListener("input", function () {
      filtros.texto = buscador.value.trim();
      cargarVehiculosDesdeAPI(filtros, filtroConcesionario);
    });
  }

  if (plazasRequeridas) {
    plazasRequeridas.addEventListener("change", function () {
      filtros.plazas = plazasRequeridas.value;
      cargarVehiculosDesdeAPI(filtros, filtroConcesionario);
    });
  }

  if (autonomiaRequerida) {
    autonomiaRequerida.addEventListener("change", function () {
      filtros.autonomia = autonomiaRequerida.value;
      cargarVehiculosDesdeAPI(filtros, filtroConcesionario);
    });
  }

  if (concesionarioRequerido) {
    concesionarioRequerido.addEventListener("change", function () {
      filtros.concesionario = concesionarioRequerido.value;
      cargarVehiculosDesdeAPI(filtros, filtroConcesionario);
    });
  }

  if (ciudadRequerida) {
    ciudadRequerida.addEventListener("change", function () {
      filtros.ciudad = ciudadRequerida.value;
      cargarVehiculosDesdeAPI(filtros, filtroConcesionario);
    });
  }
  cargarConcesionariosYCiudades();
});

async function cargarVehiculosDesdeAPI(filtros, filtroConcesionario) {
  try {
    mostrarMensajeCargaV();

    let url = "/vehiculos/api";
    url += `?filtroConcesionario=${filtroConcesionario}`;
    if (filtros.texto && filtros.texto.length > 0) {
      url += `&search=${encodeURIComponent(filtros.texto)}`;
    }
    if (filtros.plazas) {
      url += `&plazas=${encodeURIComponent(filtros.plazas)}`;
    }
    if (filtros.autonomia) {
      url += `&autonomia=${encodeURIComponent(filtros.autonomia)}`;
    }
    if (filtros.concesionario) {
      url += `&concesionario=${encodeURIComponent(filtros.concesionario)}`;
    }
    if (filtros.ciudad) {
      url += `&ciudad=${encodeURIComponent(filtros.ciudad)}`;
    }
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error http:  ${response.status}`);
        }

        return response.json();
      })
      .then((resultado) => {
        if (!resultado.success) {
          throw new Error(resultado.error || "Error desconocido");
        }

        mostrarVehiculosEnTabla(resultado.data);
      })
      .catch((error) => {
        mostrarMensajeError(error.message);
      });
  } catch (error) {
    mostrarMensajeError(error.message);
  }
}
function mostrarVehiculosEnTabla(vehiculos) {
  const tbody = document.querySelector("#tabla-vehiculos tbody");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";

  if (vehiculos.length === 0) {
    tbody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center text-muted">
                No hay vehiculos disponibles.
            </td>
        </tr>
        `;
    return;
  }

  const usuario = obtenerUsuarioSesion();

  vehiculos.forEach((vehiculo) => {
    const fila = crearFilaVehiculo(vehiculo, usuario);
    tbody.append(fila);
  });

  reinicializarBotonesVer();
}

function crearFilaVehiculo(v, usuario) {
  const tr = document.createElement("tr");

  const puntuacion =
    v.puntuacion !== null && v.puntuacion !== undefined
      ? v.puntuacion
      : "Sin valorar";

  tr.innerHTML = `
    <td>${v.matricula}</td>
    <td>${v.marca} ${v.modelo}</td>
    <td>${v.autonomia_km}</td>
    <td>${v.numero_plazas}</td>
    <td>${puntuacion}</td>
    <td>${v.n_concesionario}</td>
    <td>${v.ciudad}</td>
    <td>
      <div class="d-flex gap-3 justify-content-end">
        <button type="button" 
                class="btn btn-info btn-sm btn-ver" 
           class="btn btn-info btn-sm btn-ver" 
                data-id="${v.id}"
                data-marca="${v.marca}" 
                data-modelo="${v.modelo}"
                data-matricula="${v.matricula}" 
                data-imagen="/img/vehiculos/${v.imagen || "default.png"}"
                data-plazas="${v.numero_plazas || "N/A"}"
                data-precio="${v.precio_hora || "N/A"}"
                data-estado="${v.estado || "N/A"}"
                data-puntuacion="${puntuacion}"
                data-autonomia="${v.autonomia_km || "N/A"}"
                data-concesionario="${v.n_concesionario || "N/A"}"
                data-bs-toggle="modal"
                data-bs-target="#modalVehiculo">
          Ver
        </button>
        
        ${usuario && usuario.rol === "admin"
      ? `
          <a href="/vehiculos/admin/${v.id}/editar" 
             class="btn btn-success btn-sm" 
             role="button"
             aria-label="Editar">
            Editar
          </a>
          <button type="button" 
                  class="btn btn-danger btn-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#modalEliminar"
                  data-id="${v.id}"
                  data-nombre="${v.marca} ${v.modelo} (${v.matricula})"
                  data-tipo="el vehículo"
                  data-url="/vehiculos/admin/${v.id}/eliminar"
                  data-mensaje="El vehículo no podrá ser reservado pero sus datos se mantendrán en la base de datos."
                  aria-label="Eliminar vehículo ${v.marca} ${v.modelo}" ${v.estado === "reservado" ? "disabled" : ""
      }>
            Eliminar
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
    return usuarioSesion;
  }

  return null;
}

function reinicializarBotonesVer() {
  const botonesVer = document.querySelectorAll(".btn-ver");

  botonesVer.forEach((boton) => {
    boton.addEventListener("click", function () {
      const datos = {
        id: this.dataset.id,
        marca: this.dataset.marca,
        modelo: this.dataset.modelo,
        matricula: this.dataset.matricula,
        imagen: this.dataset.imagen,
        plazas: this.dataset.plazas,
        precio: this.dataset.precio,
        estado: this.dataset.estado,
        puntuacion: this.dataset.puntuacion,
      };

      const modalTitulo = document.getElementById("modalTitulo");
      const modalBody = document.getElementById("modalBody");

      if (modalTitulo && modalBody) {
        modalTitulo.textContent = `${datos.marca} ${datos.modelo}`;

        let estadoBadgeClass = "bg-secondary";
        if (datos.estado === "disponible") estadoBadgeClass = "bg-success";
        else if (datos.estado === "reservado")
          estadoBadgeClass = "bg-warning text-dark";
        else if (datos.estado === "mantenimiento")
          estadoBadgeClass = "bg-danger";

        modalBody.innerHTML = `
          <div class="text-center mb-4">
            <img src="${datos.imagen}" 
                 class="img-fluid rounded shadow" 
                 alt="${datos.marca} ${datos.modelo}"
                 style="max-height: 300px; object-fit: cover;"
                 onerror="this.src='/img/vehiculos/default.png'">
          </div>
          
          <div class="row g-3">
            <div class="col-12">
              <div class="p-3 border rounded bg-light">

                <p class="mb-2">
                  <strong>Plazas:</strong> 
                  <span class="badge bg-warning ms-2">${datos.plazas}</span>
                </p>
     
                <p class="mb-2">
                  <strong>Precio/hora:</strong> 
                  <span class="badge bg-warning ms-2">${datos.precio} €</span>
                </p>
                
                <p class="mb-2">
                  <strong>Estado:</strong> 
                  <span class="badge ${estadoBadgeClass} ms-2">${datos.estado.toUpperCase()}</span>
                </p>
              </div>
            </div>
          </div>
        `;
      }
    });
  });
}
function mostrarMensajeCargaV() {
  const tbody = document.querySelector("#tabla-vehiculos tbody");

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando vehículos...</p>
        </td>
      </tr>
    `;
  }
}

function mostrarMensajeError(mensaje) {
  const tbody = document.querySelector("#tabla-vehiculos tbody");

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger">
          <p class="mt-2"> Error: ${mensaje}</p>
          <button class="btn btn-sm btn-primary mt-2" onclick="cargarVehiculosDesdeAPI()">
         Reintentar
          </button>
        </td>
      </tr>
    `;
  }
}

function cargarConcesionariosYCiudades() {

  fetch("/concesionarios/api/disponibles")
    .then(function (response) {
      return response.json();
    })
    .then(function (resultado) {
      if (!resultado.success) {
        throw new Error(resultado.error);
      }

      const selectConcesionario = document.getElementById("concesionarioRequerido");
      const selectCiudad = document.getElementById("ciudadRequerida");

      resultado.concesionarios.forEach(function (c) {
        const option = document.createElement("option");
        option.value = c;
        option.textContent = `${c}`;
        selectConcesionario.appendChild(option);
      });

      resultado.ciudades.forEach(function (c) {
        const option = document.createElement("option");
        option.value = c;
        option.textContent = `${c}`;
        selectCiudad.appendChild(option);
      });
    })
    .catch(function (error) {
      console.error("Error al cargar vehículos:", error);
    });
}
