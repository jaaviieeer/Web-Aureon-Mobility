document.addEventListener("DOMContentLoaded", function () {
  validarFormularioReserva();
  autoCompletarReserva();
  cargarVehiculosDisponibles();
});

function validarFormularioReserva() {
  const formulario = document.getElementById("formulario-reserva");
  const nombre = document.getElementById("nombre");
  const correo = document.getElementById("correo");
  const dni = document.getElementById("dni");
  const telefono = document.getElementById("telefono");
  const fechaInicio = document.getElementById("fecha-inicio");
  const fechaFin = document.getElementById("fecha-fin");
  const hora = document.getElementById("hora");
  const vehiculo = document.getElementById("seleccion-vehiculo");
  const botonEnviar = document.getElementById("boton-enviar");
  const botonResetear = document.getElementById("boton-resetear");
  const imagenVehiculo = document.getElementById("imagenVehiculo");
  const nombreVehiculo = document.getElementById("nombreVehiculo");

  const errorNombre = document.getElementById("error-nombre");
  const errorCorreo = document.getElementById("error-correo");
  const errorDni = document.getElementById("error-dni");
  const errorTelefono = document.getElementById("error-telefono");
  const errorFechaInicio = document.getElementById("error-fecha-inicio");
  const errorFechaFin = document.getElementById("error-fecha-fin");
  const errorHora = document.getElementById("error-hora");
  const errorVehiculo = document.getElementById("error-vehiculo");

  vehiculo.disabled = true;
  vehiculo.style.cursor = "not-allowed";
  vehiculo.style.opacity = "0.6";

  function fechasCompletas() {
    return (
      fechaInicio.value !== "" && fechaFin.value !== "" && hora.value != ""
    );
  }

  function actualizarEstadoSelect() {
    if (fechasCompletas() && esFechaInicioValida() && esFechaFinValida()) {
      vehiculo.disabled = false;
      vehiculo.style.cursor = "pointer";
      vehiculo.style.opacity = "1";
    } else {
      vehiculo.disabled = true;
      vehiculo.style.cursor = "not-allowed";
      vehiculo.style.opacity = "0.6";
      vehiculo.value = "0";
    }
  }

  function actualizarEstadoBoton() {
    botonEnviar.disabled = !(
      esNombreValido() &&
      esCorreoValido() &&
      esTelefonoValido() &&
      esFechaInicioValida() &&
      esFechaFinValida() &&
      esVehiculoValido() &&
      esDniValido()
    );
  }

  function esNombreValido() {
    const valorNombre = nombre.value.trim();
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    return valorNombre.length >= 3 && regexNombre.test(valorNombre);
  }

  function esCorreoValido() {
    const valorCorreo = correo.value.trim();
    const regexEmail = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{1,3}$/;
    return valorCorreo !== "" && regexEmail.test(valorCorreo);
  }

  function esTelefonoValido() {
    const valorTelefono = telefono.value.trim();

    const regexTelefono = /^(\+34|34)?[6-9][0-9]{8}$/;

    return valorTelefono !== "" && regexTelefono.test(valorTelefono);
  }

  function esDniValido() {
    const valorDni = dni.value.trim().toUpperCase();

    const regexDNI = /^[0-9]{8}[A-Z]$/;

    return valorDni !== "" && regexDNI.test(valorDni);
  }

  function esFechaInicioValida() {
    const valorFecha = fechaInicio.value;
    if (valorFecha === "") return false;
    const fechaSeleccionada = new Date(valorFecha);
    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);
    fechaSeleccionada.setHours(0, 0, 0, 0);
    return fechaSeleccionada >= fechaHoy;
  }

  function esFechaFinValida() {
    const valorFechaInicio = fechaInicio.value;
    const valorFechaFin = fechaFin.value;

    if (valorFechaFin === "") return false;

    const fechaInicioDate = new Date(valorFechaInicio);
    const fechaFinDate = new Date(valorFechaFin);

    fechaInicioDate.setHours(0, 0, 0, 0);
    fechaFinDate.setHours(0, 0, 0, 0);

    return fechaFinDate >= fechaInicioDate;
  }

  function esHoraValida() {
    return hora.value !== "";
  }

  function esVehiculoValido() {
    return vehiculo.value !== "0" && vehiculo.value !== "";
  }

  function validarNombre() {
    const valorNombre = nombre.value.trim();
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

    if (valorNombre === "") {
      mostrarError(nombre, errorNombre, "El nombre es obligatorio");
      return false;
    } else if (valorNombre.length < 3) {
      mostrarError(nombre, errorNombre, "Mínimo 3 caracteres");
      return false;
    } else if (!regexNombre.test(valorNombre)) {
      mostrarError(nombre, errorNombre, "Solo letras y espacios");
      return false;
    } else {
      mostrarExito(nombre, errorNombre);
      return true;
    }
  }

  function validarCorreo() {
    const valorCorreo = correo.value.trim();
    const regexEmail = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{1,3}$/;

    if (valorCorreo === "") {
      mostrarError(correo, errorCorreo, "El correo es obligatorio");
      return false;
    } else if (!regexEmail.test(valorCorreo)) {
      mostrarError(
        correo,
        errorCorreo,
        "El formato debe ser usuario@dominio.com"
      );
      return false;
    } else {
      mostrarExito(correo, errorCorreo);
      return true;
    }
  }

  function validarTelefono() {
    const valorTelefono = telefono.value.trim();

    const regexTelefono = /^(\+34|34)?[6-9][0-9]{8}$/;

    if (valorTelefono === "") {
      mostrarError(telefono, errorTelefono, "El teléfono es obligatorio.");
      return false;
    }
    const telefonoLimpio = valorTelefono.replace(/\s/g, "");
    if (!regexTelefono.test(telefonoLimpio)) {
      mostrarError(telefono, errorTelefono, "Formato: 9 digitos");
      return false;
    } else {
      mostrarExito(telefono, errorTelefono);
      return true;
    }
  }

  function validarDni() {
    const valorDni = dni.value.trim();

    const regexDNI = /^[0-9]{8}[A-Z]$/;

    if (valorDni === "") {
      mostrarError(dni, errorDni, "El DNI es obligatorio");
      return false;
    } else if (!regexDNI.test(valorDni)) {
      mostrarError(dni, errorDni, "Formato: 8 números y 1 letra mayúscula");
      return false;
    } else {
      mostrarExito(dni, errorDni);
      return true;
    }
  }

  function validarFechaInicio() {
    const valorFecha = fechaInicio.value;
    const fechaSeleccionada = new Date(valorFecha);
    const fechaHoy = new Date();

    fechaHoy.setHours(0, 0, 0, 0);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    if (valorFecha === "") {
      mostrarError(
        fechaInicio,
        errorFechaInicio,
        "La fecha de inicio es obligatoria"
      );
      return false;
    } else if (fechaSeleccionada < fechaHoy) {
      mostrarError(
        fechaInicio,
        errorFechaInicio,
        "No puede ser anterior a hoy"
      );
      return false;
    } else {
      mostrarExito(fechaInicio, errorFechaInicio);
      return true;
    }
  }

  function validarFechaFin() {
    const valorFechaInicio = fechaInicio.value;
    const valorFechaFin = fechaFin.value;

    if (valorFechaFin === "") {
      mostrarError(fechaFin, errorFechaFin, "La fecha de fin es obligatoria");
      return false;
    }

    if (valorFechaInicio === "") {
      mostrarError(
        fechaFin,
        errorFechaFin,
        "Primero selecciona la fecha de inicio"
      );
      return false;
    }

    const fechaInicioDate = new Date(valorFechaInicio);
    const fechaFinDate = new Date(valorFechaFin);

    fechaInicioDate.setHours(0, 0, 0, 0);
    fechaFinDate.setHours(0, 0, 0, 0);

    if (fechaFinDate < fechaInicioDate) {
      mostrarError(
        fechaFin,
        errorFechaFin,
        "Debe ser posterior a la fecha de inicio"
      );
      return false;
    }

    const diferenciaEnMs = fechaFinDate - fechaInicioDate;
    const diferenciaEnDias = diferenciaEnMs / (1000 * 60 * 60 * 24);
    const maxDias = 365 * 10;

    if (diferenciaEnDias > maxDias) {
      mostrarError(
        fechaFin,
        errorFechaFin,
        "La reserva no puede superar 10 años"
      );
      return false;
    }

    mostrarExito(fechaFin, errorFechaFin);
    return true;
  }

  function validarHora() {
    const valorHora = hora.value;

    if (valorHora === "") {
      mostrarError(hora, errorHora, "La hora es obligatoria");
      return false;
    } else {
      mostrarExito(hora, errorHora);
      return true;
    }
  }

  function validarVehiculo() {
    const valorVehiculo = vehiculo.value;

    if (valorVehiculo === "0" || valorVehiculo === "") {
      mostrarError(vehiculo, errorVehiculo, "Debe seleccionar un vehículo");
      return false;
    } else {
      mostrarExito(vehiculo, errorVehiculo);
      return true;
    }
  }

  function mostrarError(campo, elementoError, mensaje) {
    campo.classList.add("campo-error");
    campo.classList.remove("campo-valido");
    elementoError.textContent = mensaje;
  }

  function mostrarExito(campo, elementoError) {
    campo.classList.remove("campo-error");
    campo.classList.add("campo-valido");
    elementoError.textContent = "";
  }

  function actualizarBarraProgreso() {
    const totalCampos = 8;
    let camposValidos = 0;

    if (esNombreValido()) camposValidos++;
    if (esCorreoValido()) camposValidos++;
    if (esTelefonoValido()) camposValidos++;
    if (esDniValido()) camposValidos++;
    if (esFechaInicioValida()) camposValidos++;
    if (esFechaFinValida()) camposValidos++;
    if (esHoraValida()) camposValidos++;
    if (esVehiculoValido()) camposValidos++;

    const porcentajeCompleto = Math.round((camposValidos / totalCampos) * 100);

    const progressFill = document.getElementById("progress-fill");
    const progressText = document.getElementById("progress-text");

    if (progressFill && progressText) {
      progressFill.style.width = porcentajeCompleto + "%";
      progressText.textContent = porcentajeCompleto + "%";

      if (porcentajeCompleto >= 50) {
        progressFill.classList.add("high-progress");
      } else {
        progressFill.classList.remove("high-progress");
      }

      if (porcentajeCompleto === 100) {
        progressText.textContent = "¡Formulario listo para enviar!";
      }
    }
  }

  if (nombre) {
    nombre.addEventListener("input", function () {
      validarNombre();
      actualizarEstadoBoton();
      actualizarBarraProgreso();
    });
    nombre.addEventListener("blur", function () {
      validarNombre();
      actualizarEstadoBoton();
      actualizarBarraProgreso();
    });
  }

  if (correo) {
    correo.addEventListener("input", function () {
      validarCorreo();
      actualizarEstadoBoton();
      actualizarBarraProgreso();
    });
    correo.addEventListener("blur", function () {
      validarCorreo();
      actualizarEstadoBoton();
      actualizarBarraProgreso();
    });
  }

  if (telefono) {
    telefono.addEventListener("input", function () {
      validarTelefono();
      actualizarEstadoBoton();
      actualizarBarraProgreso();
    });
    telefono.addEventListener("blur", function () {
      validarTelefono();
      actualizarEstadoBoton();
      actualizarBarraProgreso();
    });
  }

  if (dni) {
    dni.addEventListener("input", function () {
      this.value = this.value.toUpperCase();
      validarDni();
      actualizarEstadoBoton();
      actualizarBarraProgreso();
    });
    dni.addEventListener("blur", function () {
      this.value = this.value.trim().toUpperCase();
      validarDni();
      actualizarEstadoBoton();
      actualizarBarraProgreso();
    });
  }

  if (fechaInicio) {
    fechaInicio.addEventListener("change", function () {
      validarFechaInicio();
      validarFechaFin();
      actualizarEstadoSelect();
      actualizarEstadoBoton();
      actualizarBarraProgreso();
    });
  }

  if (fechaFin) {
    fechaFin.addEventListener("change", function () {
      validarFechaFin();
      actualizarEstadoSelect();
      actualizarEstadoBoton();
      actualizarBarraProgreso();
    });
  }

  if (hora) {
    hora.addEventListener("change", function () {
      validarHora();
      actualizarEstadoSelect();
      actualizarEstadoBoton();
      actualizarBarraProgreso();
    });
  }
  if (vehiculo) {
    vehiculo.addEventListener("change", function () {
      validarVehiculo();
      actualizarEstadoBoton();
      actualizarBarraProgreso();
    });
  }

  if (formulario) {
    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();

      const nombreValido = validarNombre();
      const correoValido = validarCorreo();
      const telefonoValido = validarTelefono();
      const dniValido = validarDni();
      const fechaInicioValida = validarFechaInicio();
      const fechaFinValida = validarFechaFin();
      const horaValida = validarHora();
      const vehiculoValido = validarVehiculo();

      if (
        nombreValido &&
        correoValido &&
        telefonoValido &&
        dniValido &&
        fechaInicioValida &&
        fechaFinValida &&
        horaValida &&
        vehiculoValido
      ) {
        const datosFormulario = new FormData(formulario);
        enviarReservaAjax(datosFormulario);
      } else {
        alert("Por favor, completa todos los campos correctamente.");
      }
    });
  }

  if (botonResetear) {
    botonResetear.addEventListener("click", function () {
      formulario.reset();
      actualizarBarraProgreso();

      imagenVehiculo.src = "/img/logo/LogoAureon.png";
      nombreVehiculo.textContent = "¡Empieza a mover tu flota de vehículos!";

      [
        nombre,
        correo,
        telefono,
        dni,
        fechaInicio,
        fechaFin,
        hora,
        vehiculo,
      ].forEach((campo) => {
        if (campo) {
          campo.classList.remove("campo-error", "campo-valido");
        }
      });

      [
        errorNombre,
        errorCorreo,
        errorTelefono,
        errorDni,
        errorFechaInicio,
        errorFechaFin,
        errorHora,
        errorVehiculo,
      ].forEach((error) => {
        if (error) {
          error.textContent = "";
        }
      });

      vehiculo.disabled = true;
      vehiculo.style.cursor = "not-allowed";
      vehiculo.style.opacity = "0.6";
      botonEnviar.disabled = true;
    });
  }
}
function autoCompletarReserva() {
  const botonAutocompletar = document.getElementById("boton-autocompletar");

  if (botonAutocompletar) {
    botonAutocompletar.addEventListener("click", function () {
      document.getElementById("nombre").value = "Jorge Nitales";
      document.getElementById("correo").value = "jorgenitales@ucm.es";
      document.getElementById("telefono").value = "633432843";
      document.getElementById("dni").value = "12345678Z";

      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      const fechaFormateada = manana.toISOString().split("T")[0];

      document.getElementById("fecha-inicio").value = fechaFormateada;

      const pasadoManana = new Date();
      pasadoManana.setDate(pasadoManana.getDate() + 2);
      const fechaFinFormateada = pasadoManana.toISOString().split("T")[0];

      document.getElementById("fecha-fin").value = fechaFinFormateada;
      document.getElementById("hora").value = "10:00";
      document.getElementById("condiciones").checked = true;

      document.getElementById("nombre").dispatchEvent(new Event("input"));
      document.getElementById("correo").dispatchEvent(new Event("input"));
      document.getElementById("telefono").dispatchEvent(new Event("input"));
      document.getElementById("dni").dispatchEvent(new Event("input"));
      document
        .getElementById("fecha-inicio")
        .dispatchEvent(new Event("change"));
      document.getElementById("fecha-fin").dispatchEvent(new Event("change"));
      document.getElementById("hora").dispatchEvent(new Event("change"));

      const selectVehiculo = document.getElementById("seleccion-vehiculo");
      if (selectVehiculo && selectVehiculo.options.length > 1) {
        selectVehiculo.value = selectVehiculo.options[1].value;
        selectVehiculo.dispatchEvent(new Event("change"));
      }
    });
  }
}

function enviarReservaAjax(datosFormulario) {
  const datos = {
    nombre: datosFormulario.get("nombre"),
    correo: datosFormulario.get("correo"),
    telefono: datosFormulario.get("telefono"),
    dni: datosFormulario.get("dni"),
    id_vehiculo: parseInt(datosFormulario.get("seleccion-vehiculo")),
    fecha_inicio: construirFechaInicio(
      datosFormulario.get("fecha-inicio"),
      datosFormulario.get("hora")
    ),
    fecha_fin: datosFormulario.get("fecha-fin"),
  };

  console.log("Enviando reserva con AJAX...", datos);

  mostrarLoaderReserva();

  fetch("/reservas/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  })
    .then(function (response) {
      return response.json().then(function (resultado) {
        return { response: response, resultado: resultado };
      });
    })
    .then(function (data) {
      ocultarLoaderReserva();

      if (!data.response.ok || !data.resultado.success) {
        alert(
          "No se puede reservar el vehículo en esas fechas porque ya está reservado."
        );
        mostrarMensajeErrorReserva(
          "No se puede reservar el vehículo en esas fechas porque ya está reservado."
        );
        return;
      }

      mostrarMensajeExito(
        data.resultado.mensaje || "Reserva creada exitosamente"
      );

      document.getElementById("formulario-reserva").reset();
      document.getElementById("imagenVehiculo").src =
        "/img/logo/LogoAureon.png";
      document.getElementById("nombreVehiculo").textContent =
        "¡Empieza a mover tu flota de vehículos!";

      const campos = [
        "nombre",
        "correo",
        "telefono",
        "dni",
        "fecha-inicio",
        "fecha-fin",
        "hora",
        "seleccion-vehiculo",
      ];

      campos.forEach(function (id) {
        const campo = document.getElementById(id);
        if (campo) {
          campo.classList.remove("campo-error", "campo-valido");
        }
      });

      const errores = [
        "error-nombre",
        "error-correo",
        "error-telefono",
        "error-dni",
        "error-fecha-inicio",
        "error-fecha-fin",
        "error-hora",
        "error-vehiculo",
      ];

      errores.forEach(function (id) {
        const error = document.getElementById(id);
        if (error) {
          error.textContent = "";
        }
      });

      const vehiculo = document.getElementById("seleccion-vehiculo");
      const botonEnviar = document.getElementById("boton-enviar");

      if (vehiculo) {
        vehiculo.disabled = true;
        vehiculo.style.cursor = "not-allowed";
        vehiculo.style.opacity = "0.6";
      }

      if (botonEnviar) {
        botonEnviar.disabled = true;
      }

      const progressFill = document.getElementById("progress-fill");
      const progressText = document.getElementById("progress-text");

      if (progressFill && progressText) {
        progressFill.style.width = "0%";
        progressText.textContent = "0%";
        progressFill.classList.remove("high-progress");
      }

      cargarVehiculosDisponibles();
    })
    .catch(function (error) {
      ocultarLoaderReserva();
      mostrarMensajeErrorReserva(error.message);
    });
}

function construirFechaInicio(fecha, hora) {
  if (!fecha) return null;

  const horaFinal = hora || "00:00";

  return `${fecha}T${horaFinal}:00`;
}

function construirFechaFin(fecha, hora, duracion) {
  if (!fecha) return null;

  const horaFinal = hora || "00:00";
  const fechaInicio = new Date(`${fecha}T${horaFinal}:00`);

  fechaInicio.setHours(fechaInicio.getHours() + (duracion || 1));

  return fechaInicio.toISOString().slice(0, 19).replace("T", " ");
}

function mostrarLoaderReserva() {
  const botonEnviar = document.getElementById("boton-enviar");
  if (botonEnviar) {
    botonEnviar.disabled = true;
    botonEnviar.innerHTML =
      '<span class="spinner-border spinner-border-sm"></span> Creando reserva...';
  }
}

function ocultarLoaderReserva() {
  const botonEnviar = document.getElementById("boton-enviar");
  if (botonEnviar) {
    botonEnviar.disabled = false;
    botonEnviar.innerHTML = "Enviar";
  }
}

function mostrarMensajeExito(mensaje) {
  const formulario = document.getElementById("formulario-reserva");

  const mensajeDiv = document.createElement("div");
  mensajeDiv.className = "alert alert-success alert-dismissible fade show mt-3";
  mensajeDiv.setAttribute("role", "alert");
  mensajeDiv.innerHTML = `
    <strong>¡Éxito!</strong> ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  formulario.parentElement.insertBefore(mensajeDiv, formulario);
}

function mostrarMensajeErrorReserva(mensaje) {
  const formulario = document.getElementById("formulario-reserva");

  if (!formulario) {
    alert("ERROR (no se encontró formulario): " + mensaje);
    return;
  }

  const mensajeDiv = document.createElement("div");

  mensajeDiv.className = "alert alert-danger alert-dismissible fade show mt-3";

  mensajeDiv.setAttribute("role", "alert");

  mensajeDiv.innerHTML = `
    <strong>Error:</strong> ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  try {
    formulario.parentElement.insertBefore(mensajeDiv, formulario);
  } catch (error) {
    return;
  }

  const alertaInsertada =
    formulario.parentElement.querySelector(".alert-danger");
}
function cargarVehiculosDisponibles() {

  fetch("/vehiculos/api/disponibles")
    .then(function (response) {
      return response.json();
    })
    .then(function (resultado) {
      if (!resultado.success) {
        throw new Error(resultado.error);
      }

      const select = document.getElementById("seleccion-vehiculo");

      select.innerHTML = '<option value="0">Selecciona vehículo</option>';

      resultado.vehiculos.forEach(function (v) {
        const option = document.createElement("option");
        option.value = v.id;
        option.setAttribute("data-marca", v.marca);
        option.setAttribute("data-modelo", v.modelo);
        option.setAttribute("data-imagen", `/img/vehiculos/${v.imagen}`);
        option.textContent = `${v.marca} ${v.modelo} - ${v.matricula}`;
        select.appendChild(option);
      });

      console.log(`${resultado.data.length} vehículos disponibles cargados`);
    })
    .catch(function (error) {
      console.error("Error al cargar vehículos:", error);
    });
}
