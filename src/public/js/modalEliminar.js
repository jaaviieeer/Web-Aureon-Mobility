document.addEventListener("DOMContentLoaded", function () {
  const modalEliminar = document.getElementById("modalEliminar");
  let url = "";

  if (modalEliminar) {
    modalEliminar.addEventListener("show.bs.modal", function (event) {
      const button = event.relatedTarget;
      const id = button.getAttribute("data-id");
      const nombre = button.getAttribute("data-nombre");
      const tipo = button.getAttribute("data-tipo");
      url = button.getAttribute("data-url");
      const mensaje = button.getAttribute("data-mensaje");
      const usuarios = button.getAttribute("data-usuarios");
      const vehiculos = button.getAttribute("data-vehiculos");

      document.getElementById("tipoElemento").textContent = tipo;
      document.getElementById("nombreElemento").textContent = nombre;

      let mensajeCompleto = mensaje || "";

      if (tipo === "el concesionario" && (usuarios || vehiculos)) {
        mensajeCompleto += `\n ATENCIÓN: Se darán de baja también:\n - ${
          usuarios || 0
        } usuario(s)\n - ${vehiculos || 0} vehículo(s)`;
      }

      document.getElementById("mensajeElemento").textContent = mensajeCompleto;
      document.getElementById(
        "botonEliminar"
      ).textContent = `Si, eliminar ${tipo
        .replace("el ", "")
        .replace("la ", "")}`;
    });
  }
  document
    .getElementById("botonEliminar")
    .addEventListener("click", function () {
      if (!url) {
        console.log("Error al eliminar, url no definida");
        return;
      }
      fetch(url, { method: "PUT" })
        .then((response) => {
          if (!response.ok) {
           return response.json().then(data => {
                const err = data.error || data.mensaje || `Err, HTTP ${response.status}`;
                throw new Error(err);
           })
          }
          return response.json();
        })
        .then((resultado) => {
          console.log("Eliminado", resultado);

          if (!resultado.success) {
            throw new Error(resultado.error || "Error desconocido");
          }
          const modal = bootstrap.Modal.getInstance(modalEliminar);
          modal.hide();

          if (
            resultado.accionRealizada &&
            resultado.accionRealizada === "finalizada"
          ) {
            let modalReview = document.getElementById("modalReview");
            modalReview.setAttribute("data-idvehiculo", resultado.idVehiculo);
            modalReview = new bootstrap.Modal(modalReview);
            modalReview.show();
          } else if (
            resultado.accionRealizada &&
            resultado.accionRealizada === "cancelada"
          ) {
            cargarVehiculosDesdeAPI({}, true);
            cargarReservasDesdeAPI();
          } else {
            cargarUsuariosDesdeAPI();
            cargarConcesionariosDesdeAPI();
            cargarVehiculosDesdeAPI({}, false);
            cargarReservasDesdeAPI();
            alert("Eliminación realizada con éxito.");
          }
        })
        .catch((error) => {
          const modal = bootstrap.Modal.getInstance(modalEliminar);
          if (modal) {
            modal.hide();
          }
          alert(`Error:  ${error.message}`);
        });
    });
});
