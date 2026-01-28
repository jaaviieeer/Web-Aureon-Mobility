document.addEventListener("DOMContentLoaded", function () {
  validarFormularioConcesionario();
  autoCompletarConcesionario();
});

function validarFormularioConcesionario() {
  const formulario = document.getElementById("formulario-nuevo-concesionario");
  const nombre = document.getElementById("nombre-concesionario");
  const ciudad = document.getElementById("ciudad-concesionario");
  const direccion = document.getElementById("direccion-concesionario");
  const telefono = document.getElementById("telefono-concesionario");
  const botonEnviar = document.getElementById("boton-enviar-concesionario");
  const botonResetear = document.getElementById("boton-resetear-concesionario");

  const errorNombre = document.getElementById("error-nombre-concesionario");
  const errorCiudad = document.getElementById("error-ciudad-concesionario");
  const errorDireccion = document.getElementById(
    "error-direccion-concesionario"
  );
  const errorTelefono = document.getElementById("error-telefono-concesionario");

  if (botonEnviar) {
    actualizarEstadoBoton();
  }

  function actualizarEstadoBoton() {
    botonEnviar.disabled = !(
      esNombreValido() &&
      esCiudadValida() &&
      esDireccionValida() &&
      esTelefonoValido()
    );
  }

  function esNombreValido() {
    const valorNombre = nombre.value.trim();
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]+$/;
    return (
      valorNombre.length >= 3 &&
      valorNombre.length <= 100 &&
      regexNombre.test(valorNombre)
    );
  }

  function esCiudadValida() {
    const valorCiudad = ciudad.value.trim();
    const regexCiudad = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/; 
    return (
      valorCiudad.length >= 2 &&
      valorCiudad.length <= 60 &&
      regexCiudad.test(valorCiudad)
    );
  }

  function esDireccionValida() {
    const valorDireccion = direccion.value.trim();
    const regexDireccion = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜçÇ0-9\s,.-]+$/;
    return (
      valorDireccion.length >= 5 &&
      valorDireccion.length <= 150 &&
      regexDireccion.test(valorDireccion)
    );
  }

  function esTelefonoValido() {
    const valorTelefono = telefono.value.trim().replace(/\s/g, "");
    const regexTelefono = /^(\+34|34)?[6-9][0-9]{8}$/;
    return regexTelefono.test(valorTelefono);
  }

  function validarNombre() {
    const valorNombre = nombre.value.trim();
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]+$/;

    if (valorNombre === "") {
      mostrarError(nombre, errorNombre, "El nombre es obligatorio");
      return false;
    } else if (valorNombre.length < 3) {
      mostrarError(nombre, errorNombre, "Mínimo 3 caracteres");
      return false;
    } else if (valorNombre.length > 100) {
      mostrarError(nombre, errorNombre, "Máximo 100 caracteres");
      return false;
    } else if (!regexNombre.test(valorNombre)) {
      mostrarError(nombre, errorNombre, "Solo letras, números y espacios");
      return false;
    } else {
      mostrarExito(nombre, errorNombre);
      return true;
    }
  }

  function validarCiudad() {
    const valorCiudad = ciudad.value.trim();
    const regexCiudad = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

    if (valorCiudad === "") {
      mostrarError(ciudad, errorCiudad, "La ciudad es obligatoria");
      return false;
    } else if (valorCiudad.length < 2) {
      mostrarError(ciudad, errorCiudad, "Mínimo 2 caracteres");
      return false;
    } else if (valorCiudad.length > 60) {
      mostrarError(ciudad, errorCiudad, "Máximo 60 caracteres");
      return false;
    } else if (!regexCiudad.test(valorCiudad)) {
      mostrarError(ciudad, errorCiudad, "Solo letras y espacios");
      return false;
    } else {
      mostrarExito(ciudad, errorCiudad);
      return true;
    }
  }

  function validarDireccion() {
    const valorDireccion = direccion.value.trim();
    const regexDireccion = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜçÇ0-9\s,.-]+$/;

    if (valorDireccion === "") {
      mostrarError(direccion, errorDireccion, "La dirección es obligatoria");
      return false;
    } else if (valorDireccion.length < 5) {
      mostrarError(direccion, errorDireccion, "Mínimo 5 caracteres");
      return false;
    } else if (valorDireccion.length > 150) {
      mostrarError(direccion, errorDireccion, "Máximo 150 caracteres");
      return false;
    } else if (!regexDireccion.test(valorDireccion)) {
      mostrarError(
        direccion,
        errorDireccion,
        "Caracteres no válidos en dirección"
      );
      return false;
    } else {
      mostrarExito(direccion, errorDireccion);
      return true;
    }
  }

  function validarTelefono() {
    const valorTelefono = telefono.value.trim().replace(/\s/g, "");
    const regexTelefono = /^(\+34|34)?[6-9][0-9]{8}$/;

    if (valorTelefono === "") {
      mostrarError(telefono, errorTelefono, "El teléfono es obligatorio");
      return false;
    } else if (!regexTelefono.test(valorTelefono)) {
      mostrarError(
        telefono,
        errorTelefono,
        "Formato inválido. Debe ser +34 seguido de 9 dígitos (6-9)"
      );
      return false;
    } else {
      mostrarExito(telefono, errorTelefono);
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

  if (nombre) {
    nombre.addEventListener("input", function () {
      validarNombre();
      actualizarEstadoBoton();
    });
    nombre.addEventListener("blur", validarNombre);
  }

  if (ciudad) {
    ciudad.addEventListener("input", function () {
      validarCiudad();
      actualizarEstadoBoton();
    });
    ciudad.addEventListener("blur", validarCiudad);
  }

  if (direccion) {
    direccion.addEventListener("input", function () {
      validarDireccion();
      actualizarEstadoBoton();
    });
    direccion.addEventListener("blur", validarDireccion);
  }

  if (telefono) {
    telefono.addEventListener("input", function () {
      validarTelefono();
      actualizarEstadoBoton();
    });
    telefono.addEventListener("blur", validarTelefono);
  }

  if (formulario) {
    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();

      const nombreValido = validarNombre();
      const ciudadValida = validarCiudad();
      const direccionValida = validarDireccion();
      const telefonoValido = validarTelefono();

      if (nombreValido && ciudadValida && direccionValida && telefonoValido) {
        formulario.submit();
      } else {
        alert("Completa todos los campos correctamente");
      }
    });
  }

  if (botonResetear) {
    botonResetear.addEventListener("click", function () {
      formulario.reset();
      nombre.classList.remove("campo-error", "campo-valido");
      ciudad.classList.remove("campo-error", "campo-valido");
      direccion.classList.remove("campo-error", "campo-valido");
      telefono.classList.remove("campo-error", "campo-valido");

      errorNombre.textContent = "";
      errorCiudad.textContent = "";
      errorDireccion.textContent = "";
      errorTelefono.textContent = "";
      botonEnviar.disabled = true;
    });
  }
}

function autoCompletarConcesionario() {
  const botonAutocompletar = document.getElementById(
    "boton-autocompletar-concesionario"
  );

  if (botonAutocompletar) {
    botonAutocompletar.addEventListener("click", function () {
      document.getElementById("nombre-concesionario").value =
        "AutoPremium Barcelona";
      document.getElementById("ciudad-concesionario").value = "Barcelona";
      document.getElementById("direccion-concesionario").value =
        "Gran Via de les Corts Catalanes 250";
      document.getElementById("telefono-concesionario").value = "+34932456789";

      document
        .getElementById("nombre-concesionario")
        .dispatchEvent(new Event("input"));
      document
        .getElementById("ciudad-concesionario")
        .dispatchEvent(new Event("input"));
      document
        .getElementById("direccion-concesionario")
        .dispatchEvent(new Event("input"));
      document
        .getElementById("telefono-concesionario")
        .dispatchEvent(new Event("input"));
    });
  }
}
