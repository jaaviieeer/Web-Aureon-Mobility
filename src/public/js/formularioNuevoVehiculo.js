document.addEventListener("DOMContentLoaded", function () {
  validarFormularioNuevoVehiculo();
  autoCompletarNuevoVehiculo();
});

function validarFormularioNuevoVehiculo() {
  const formulario = document.getElementById("formulario-nuevo-vehiculo");
  const marca = document.getElementById("marca");
  const modelo = document.getElementById("modelo");
  const matricula = document.getElementById("matricula");
  const anoMatriculacion = document.getElementById("anoMatriculacion");
  const numeroPlazas = document.getElementById("numeroPlazas");
  const autonomia = document.getElementById("autonomia");
  const color = document.getElementById("color");
  const concesionario = document.getElementById("concesionario-vehiculo");
  const precioHora = document.getElementById("precioHora");
  const errorPrecioHora = document.getElementById("error-precio-hora");
  const imagen = document.getElementById("imagen");

  const botonEnviar = document.getElementById("boton-enviar-vehiculo");
  const botonResetear = document.getElementById("boton-resetear-vehiculo");

  const errorMarca = document.getElementById("error-marca");
  const errorModelo = document.getElementById("error-modelo");
  const errorMatricula = document.getElementById("error-matricula");
  const errorAnoMatriculacion = document.getElementById(
    "error-anoMatriculacion"
  );
  const errorNumeroPlazas = document.getElementById("error-numeroPlazas");
  const errorAutonomia = document.getElementById("error-autonomia");
  const errorColor = document.getElementById("error-color");
  const errorConcesionario = document.getElementById(
    "error-concesionario-vehiculo"
  );

  function actualizarEstadoBoton() {
    if (!botonEnviar) return;

    botonEnviar.disabled = !(
      esMarcaValida() &&
      esModeloValido() &&
      esMatriculaValida() &&
      esAnoValido() &&
      esNumeroPlazasValido() &&
      esAutonomiaValida() &&
      esColorValido() &&
      esConcesionarioValido() &&
      esPrecioHoraValido()
    );
  }

  function esMarcaValida() {
    const valorMarca = marca.value.trim();
    return valorMarca.length >= 3;
  }

  function esModeloValido() {
    const valorModelo = modelo.value.trim();
    return valorModelo.length >= 2;
  }

  function esMatriculaValida() {
    const valorMatricula = matricula.value.trim();
    const regexMatricula = /^[0-9]{4}[A-Z]{3}$|^[0-9]{4}-[A-Z]{3}$/;
    return regexMatricula.test(valorMatricula.toUpperCase());
  }

  function esAnoValido() {
    const valorAno = parseInt(anoMatriculacion.value);
    const anoActual = new Date().getFullYear();
    return valorAno >= 2000 && valorAno <= anoActual;
  }

  function esNumeroPlazasValido() {
    const valorPlazas = parseInt(numeroPlazas.value);
    return valorPlazas >= 2 && valorPlazas <= 7;
  }

  function esAutonomiaValida() {
    const valorAutonomia = parseInt(autonomia.value);
    return valorAutonomia >= 100 && valorAutonomia <= 1000;
  }

  function esColorValido() {
    const valorColor = color.value.trim();
    return valorColor.length >= 3;
  }

  function esConcesionarioValido() {
    if (!concesionario) {
      return true;
    }

    const valorConcesionario = concesionario.value;
    return valorConcesionario !== "";
  }

  function esPrecioHoraValido() {
    const valor = parseFloat(precioHora.value);
    return !isNaN(valor) && valor > 0;
  }

  function validarMarca() {
    const valorMarca = marca.value.trim();
    const regexMarca = /^.+$/;

    if (valorMarca === "") {
      mostrarError(marca, errorMarca, "La marca es obligatoria");
      return false;
    } else if (valorMarca.length < 3) {
      mostrarError(marca, errorMarca, "Mínimo 3 caracteres");
      return false;
    } else if (!regexMarca.test(valorMarca)) {
      mostrarError(marca, errorMarca, "Solo letras, espacios y guiones");
      return false;
    } else {
      mostrarExito(marca, errorMarca);
      return true;
    }
  }

  function validarModelo() {
    const valorModelo = modelo.value.trim();
    const regexModelo = /^.+$/;

    if (valorModelo === "") {
      mostrarError(modelo, errorModelo, "El modelo es obligatorio");
      return false;
    } else if (valorModelo.length < 2) {
      mostrarError(modelo, errorModelo, "Mínimo 2 caracteres");
      return false;
    } else if (!regexModelo.test(valorModelo)) {
      mostrarError(
        modelo,
        errorModelo,
        "Solo letras, números, espacios y guiones"
      );
      return false;
    } else {
      mostrarExito(modelo, errorModelo);
      return true;
    }
  }

  function validarMatricula() {
    const valorMatricula = matricula.value.trim().toUpperCase();
    const regexMatricula = /^[0-9]{4}[A-Z]{3}$|^[0-9]{4}-[A-Z]{3}$/;

    if (valorMatricula === "") {
      mostrarError(matricula, errorMatricula, "La matrícula es obligatoria");
      return false;
    } else if (!regexMatricula.test(valorMatricula)) {
      mostrarError(matricula, errorMatricula, "Formato: 1234ABC o 1234-ABC");
      return false;
    } else {
      mostrarExito(matricula, errorMatricula);
      matricula.value = valorMatricula;
      return true;
    }
  }

  function validarAnoMatriculacion() {
    const valorAno = parseInt(anoMatriculacion.value);
    const anoActual = new Date().getFullYear();

    if (isNaN(valorAno)) {
      mostrarError(
        anoMatriculacion,
        errorAnoMatriculacion,
        "El año es obligatorio"
      );
      return false;
    } else if (valorAno < 2000) {
      mostrarError(
        anoMatriculacion,
        errorAnoMatriculacion,
        "Debe ser posterior a 2000"
      );
      return false;
    } else if (valorAno > anoActual) {
      mostrarError(
        anoMatriculacion,
        errorAnoMatriculacion,
        `No puede ser posterior a ${anoActual}`
      );
      return false;
    } else {
      mostrarExito(anoMatriculacion, errorAnoMatriculacion);
      return true;
    }
  }

  function validarNumeroPlazas() {
    const valorPlazas = parseInt(numeroPlazas.value);

    if (isNaN(valorPlazas)) {
      mostrarError(
        numeroPlazas,
        errorNumeroPlazas,
        "El número de plazas es obligatorio"
      );
      return false;
    } else if (valorPlazas < 2) {
      mostrarError(numeroPlazas, errorNumeroPlazas, "Mínimo 2 plazas");
      return false;
    } else if (valorPlazas > 7) {
      mostrarError(numeroPlazas, errorNumeroPlazas, "Máximo 7 plazas");
      return false;
    } else {
      mostrarExito(numeroPlazas, errorNumeroPlazas);
      return true;
    }
  }

  function validarAutonomia() {
    const valorAutonomia = parseInt(autonomia.value);

    if (isNaN(valorAutonomia)) {
      mostrarError(autonomia, errorAutonomia, "La autonomía es obligatoria");
      return false;
    } else if (valorAutonomia < 100) {
      mostrarError(autonomia, errorAutonomia, "Mínimo 100 km");
      return false;
    } else if (valorAutonomia > 1000) {
      mostrarError(autonomia, errorAutonomia, "Máximo 1000 km");
      return false;
    } else {
      mostrarExito(autonomia, errorAutonomia);
      return true;
    }
  }

  function validarColor() {
    const valorColor = color.value.trim();
    const regexColor = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

    if (valorColor === "") {
      mostrarError(color, errorColor, "El color es obligatorio");
      return false;
    } else if (valorColor.length < 3) {
      mostrarError(color, errorColor, "Mínimo 3 caracteres");
      return false;
    } else if (!regexColor.test(valorColor)) {
      mostrarError(color, errorColor, "Solo letras y espacios");
      return false;
    } else {
      mostrarExito(color, errorColor);
      return true;
    }
  }

  function validarConcesionario() {
    if (!concesionario || !errorConcesionario) return true;

    const valorConcesionario = concesionario.value;

    if (valorConcesionario === "") {
      mostrarError(
        concesionario,
        errorConcesionario,
        "Debes seleccionar un concesionario"
      );
      return false;
    } else {
      mostrarExito(concesionario, errorConcesionario);
      return true;
    }
  }

  function validarPrecioHora() {
    const valor = parseFloat(precioHora.value);
    if (precioHora.value.trim() === "") {
      mostrarError(
        precioHora,
        errorPrecioHora,
        "El precio/hora es obligatorio"
      );
      return false;
    } else if (isNaN(valor) || valor <= 0) {
      mostrarError(
        precioHora,
        errorPrecioHora,
        "Debe ser un número mayor que 0"
      );
      return false;
    } else {
      mostrarExito(precioHora, errorPrecioHora);
      return true;
    }
  }

  function mostrarError(campo, elementoError, mensaje) {
    if (!campo || !elementoError) return;
    campo.classList.add("campo-error");
    campo.classList.remove("campo-valido");
    elementoError.textContent = mensaje;
  }

  function mostrarExito(campo, elementoError) {
    if (!campo || !elementoError) return;
    campo.classList.remove("campo-error");
    campo.classList.add("campo-valido");
    elementoError.textContent = "";
  }

  if (marca) {
    marca.addEventListener("input", function () {
      validarMarca();
      actualizarEstadoBoton();
    });
    marca.addEventListener("blur", validarMarca);
  }

  if (modelo) {
    modelo.addEventListener("input", function () {
      validarModelo();
      actualizarEstadoBoton();
    });
    modelo.addEventListener("blur", validarModelo);
  }

  if (matricula) {
    matricula.addEventListener("input", function () {
      validarMatricula();
      actualizarEstadoBoton();
    });
    matricula.addEventListener("blur", validarMatricula);
  }

  if (anoMatriculacion) {
    anoMatriculacion.addEventListener("input", function () {
      validarAnoMatriculacion();
      actualizarEstadoBoton();
    });
    anoMatriculacion.addEventListener("blur", validarAnoMatriculacion);
  }

  if (numeroPlazas) {
    numeroPlazas.addEventListener("input", function () {
      validarNumeroPlazas();
      actualizarEstadoBoton();
    });
    numeroPlazas.addEventListener("blur", validarNumeroPlazas);
    numeroPlazas.addEventListener("change", function () {
      validarNumeroPlazas();
      actualizarEstadoBoton();
    });
  }

  if (autonomia) {
    autonomia.addEventListener("input", function () {
      validarAutonomia();
      actualizarEstadoBoton();
    });
    autonomia.addEventListener("blur", validarAutonomia);
  }

  if (color) {
    color.addEventListener("input", function () {
      validarColor();
      actualizarEstadoBoton();
    });
    color.addEventListener("blur", validarColor);
  }

  if (concesionario) {
    concesionario.addEventListener("change", function () {
      validarConcesionario();
      actualizarEstadoBoton();
    });

    concesionario.addEventListener("blur", validarConcesionario);
  }

  if (precioHora) {
    precioHora.addEventListener("input", function () {
      validarPrecioHora();
      actualizarEstadoBoton();
    });
    precioHora.addEventListener("blur", validarPrecioHora);
  }

  if (formulario) {
    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();

      const marcaValida = validarMarca();
      const modeloValido = validarModelo();
      const matriculaValida = validarMatricula();
      const anoValido = validarAnoMatriculacion();
      const plazasValidas = validarNumeroPlazas();
      const autonomiaValida = validarAutonomia();
      const colorValido = validarColor();
      const concesionarioValido = validarConcesionario();
      const precioHoraValido = validarPrecioHora();

      if (
        marcaValida &&
        modeloValido &&
        matriculaValida &&
        anoValido &&
        plazasValidas &&
        autonomiaValida &&
        colorValido &&
        concesionarioValido &&
        precioHoraValido
      ) {
        formulario.submit();
      } else {
        alert("Por favor, completa todos los campos correctamente");
      }
    });
  }

  if (botonResetear) {
    botonResetear.addEventListener("click", function () {
      formulario.reset();

      [
        marca,
        modelo,
        matricula,
        anoMatriculacion,
        numeroPlazas,
        autonomia,
        color,
        concesionario,
        precioHora,
      ].forEach((campo) => {
        if (campo) {
          campo.classList.remove("campo-error", "campo-valido");
        }
      });

      [
        errorMarca,
        errorModelo,
        errorMatricula,
        errorAnoMatriculacion,
        errorNumeroPlazas,
        errorAutonomia,
        errorColor,
        errorConcesionario,
        errorPrecioHora,
      ].forEach((error) => {
        if (error) {
          error.textContent = "";
        }
      });

      if (botonEnviar) {
        botonEnviar.disabled = true;
      }
    });
  }

  actualizarEstadoBoton();
}

// ========================================
// FUNCIÓN AUTOCOMPLETAR (PARA DESARROLLO)
// ========================================

function autoCompletarNuevoVehiculo() {
  const botonAutocompletar = document.getElementById(
    "boton-autocompletar-vehiculo"
  );

  if (botonAutocompletar) {
    botonAutocompletar.addEventListener("click", function () {
      document.getElementById("marca").value = "Tesla";
      document.getElementById("modelo").value = "Model 3";
      document.getElementById("matricula").value = "1234ABC";
      document.getElementById("anoMatriculacion").value = "2023";
      document.getElementById("numeroPlazas").value = "5";
      document.getElementById("autonomia").value = "500";
      document.getElementById("color").value = "Blanco";
      document.getElementById("precioHora").value = "20";

      if (document.getElementById("concesionario-vehiculo")) {
        document.getElementById("concesionario-vehiculo").value = "1";
      }

      if (document.getElementById("imagen")) {
        document.getElementById("imagen").value = "tesla3.png";
      }

      // Disparar eventos de validación
      document.getElementById("marca").dispatchEvent(new Event("input"));
      document.getElementById("modelo").dispatchEvent(new Event("input"));
      document.getElementById("matricula").dispatchEvent(new Event("input"));
      document
        .getElementById("anoMatriculacion")
        .dispatchEvent(new Event("input"));
      document.getElementById("numeroPlazas").dispatchEvent(new Event("input"));
      document.getElementById("autonomia").dispatchEvent(new Event("input"));
      document.getElementById("color").dispatchEvent(new Event("input"));
      document.getElementById("precioHora").dispatchEvent(new Event("input"));
      if (document.getElementById("concesionario-vehiculo")) {
        document
          .getElementById("concesionario-vehiculo")
          .dispatchEvent(new Event("change"));
      }
    });
  }
}
