document.addEventListener("DOMContentLoaded", function () {
  validarFormularioRegistro();
  autoCompletarRegistro();
});

function validarFormularioRegistro() {
  const formulario = document.getElementById("formulario-registro");
  const nombre = document.getElementById("nombre-registro");
  const correoUsuario = document.getElementById("correo-registro");
  const correoCompleto = document.getElementById("correo-completo");
  const contrasenya = document.getElementById("contraseña-registro");
  const repetirContrasenya = document.getElementById(
    "repetir-contraseña-registro"
  );
  const telefono = document.getElementById("telefono-registro");
  const rol = document.getElementById("rol-registro");
  const concesionario = document.getElementById("concesionario-registro");
  let condiciones = document.getElementById("condiciones-registro");

  if (!condiciones) {
    condiciones = { checked: true };
  }
  const botonEnviar = document.getElementById("boton-enviar-registro");
  const botonResetear = document.getElementById("boton-resetear-registro");

  const errorNombre = document.getElementById("error-nombre-registro");
  const errorCorreo = document.getElementById("error-correo-registro");
  const errorContrasenya = document.getElementById("error-contraseña-registro");
  const errorRepetirContrasenya = document.getElementById(
    "error-repetir-contraseña-registro"
  );
  const errorTelefono = document.getElementById("error-telefono-registro");
  const errorRol = document.getElementById("error-rol-registro");
  const errorConcesionario = document.getElementById(
    "error-concesionario-registro"
  );

  const toggle = document.getElementById("togglePasswordRegistro");
  const repetirToggle = document.getElementById(
    "toggleRepetirPasswordRegistro"
  );

  function juntarCorreo() {
    if (correoUsuario && correoCompleto) {
      const usuario = correoUsuario.value.trim();
      correoCompleto.value = usuario ? usuario + "@aureon.es" : "";
    }
  }

  function actualizarEstadoBoton() {

    const contrasenyaValida = contrasenya
      ? validarContrasenya() && validarRepetirContrasenya()
      : true;

    const condicionesAceptadas = condiciones ? condiciones.checked : true;

    botonEnviar.disabled = !(
      validarNombre() &&
      validarCorreoUsuario() &&
      contrasenyaValida &&
      validarTelefono() &&
      validarRol() &&
      validarConcesionario() &&
      condicionesAceptadas
    );
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

  function validarCorreoUsuario() {
    const valorUsuario = correoUsuario.value.trim();
    const regexUsuario = /^[a-zA-Z0-9._-]+$/;

    if (valorUsuario === "") {
      mostrarError(correoUsuario, errorCorreo, "El correo es obligatorio");
      return false;
    } else if (valorUsuario.length < 3) {
      mostrarError(correoUsuario, errorCorreo, "Mínimo 3 caracteres");
      return false;
    } else if (!regexUsuario.test(valorUsuario)) {
      mostrarError(
        correoUsuario,
        errorCorreo,
        "Solo se permiten letras, números, puntos, guiones y guiones bajos"
      );
      return false;
    } else if (valorUsuario.includes("@")) {
      mostrarError(
        correoUsuario,
        errorCorreo,
        "No incluyas el @aureon.es, se añade automáticamente"
      );
      return false;
    } else {
      mostrarExito(correoUsuario, errorCorreo);
      return true;
    }
  }

  function validarContrasenya() {
    let valorContrasenya = "";
    if (contrasenya) {
      valorContrasenya = contrasenya.value;
    }
    const regexMinimo8 = /.{8,}/;
    const regexMayuscula = /[A-Z]/;
    const regexNumero = /[0-9]/;
    const regexEspecial = /[!@#$%^&*(),.?":{}|<>]/;

    if (valorContrasenya === "") {
      mostrarError(
        contrasenya,
        errorContrasenya,
        "La contraseña es obligatoria"
      );
      return false;
    } else if (!regexMinimo8.test(valorContrasenya)) {
      mostrarError(contrasenya, errorContrasenya, "Mínimo 8 caracteres");
      return false;
    } else if (!regexMayuscula.test(valorContrasenya)) {
      mostrarError(
        contrasenya,
        errorContrasenya,
        "Debe incluir al menos una mayúscula"
      );
      return false;
    } else if (!regexNumero.test(valorContrasenya)) {
      mostrarError(
        contrasenya,
        errorContrasenya,
        "Debe incluir al menos un número"
      );
      return false;
    } else if (!regexEspecial.test(valorContrasenya)) {
      mostrarError(
        contrasenya,
        errorContrasenya,
        "Debe incluir al menos un caracter especial"
      );
      return false;
    } else {
      mostrarExito(contrasenya, errorContrasenya);
      return true;
    }
  }

  function validarRepetirContrasenya() {
    let valorRepetirContrasenya = "";
    if (contrasenya) {
      valorRepetirContrasenya = repetirContrasenya.value;
    }
    let valorContrasenya = "";
    if (contrasenya) {
      valorContrasenya = contrasenya.value;
    }

    if (valorRepetirContrasenya === "") {
      mostrarError(
        repetirContrasenya,
        errorRepetirContrasenya,
        "Es obligatorio repetir la contraseña"
      );
      return false;
    } else if (valorRepetirContrasenya !== valorContrasenya) {
      mostrarError(
        repetirContrasenya,
        errorRepetirContrasenya,
        "Las contraseñas no coinciden"
      );
      return false;
    } else {
      mostrarExito(repetirContrasenya, errorRepetirContrasenya);
      return true;
    }
  }

  function validarTelefono() {
    const valorTelefono = telefono.value.trim();
    const regexTelefono = /^[0-9]{9}$/;

    if (valorTelefono === "") {
      mostrarExito(telefono, errorTelefono);
      return true;
    }

    if (!regexTelefono.test(valorTelefono)) {
      mostrarError(
        telefono,
        errorTelefono,
        "El teléfono debe tener 9 dígitos exactos."
      );
      return false;
    } else {
      mostrarExito(telefono, errorTelefono);
      return true;
    }
  }

  function validarRol() {
    if (rol.value === "") {
      mostrarError(
        rol,
        errorRol,
        "Debes definir un rol del usuario que quieres dar de alta."
      );
      return false;
    } else {
      mostrarExito(rol, errorRol);
      return true;
    }
  }
  function validarConcesionario() {
    if (concesionario.value === "") {
      mostrarError(
        concesionario,
        errorConcesionario,
        "Debes definir el concesionario que le quieres asignar al usuario."
      );
      return false;
    } else {
      mostrarExito(concesionario, errorConcesionario);
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

  if (correoUsuario) {
    correoUsuario.addEventListener("input", function () {
      juntarCorreo();
      validarCorreoUsuario();
      actualizarEstadoBoton();
    });
    correoUsuario.addEventListener("blur", validarCorreoUsuario);
  }

  if (contrasenya) {
    contrasenya.addEventListener("input", function () {
      validarContrasenya();
      validarRepetirContrasenya();
      actualizarEstadoBoton();
    });
    contrasenya.addEventListener("blur", validarContrasenya);
  }

  if (repetirContrasenya) {
    repetirContrasenya.addEventListener("input", function () {
      validarRepetirContrasenya();
      actualizarEstadoBoton();
    });
    repetirContrasenya.addEventListener("blur", validarRepetirContrasenya);
  }

  if (telefono) {
    telefono.addEventListener("input", function () {
      validarTelefono();
      actualizarEstadoBoton();
    });
    telefono.addEventListener("blur", validarTelefono);
  }

  if (rol) {
    rol.addEventListener("change", function () {
      validarRol();
      actualizarEstadoBoton();
    });
    rol.addEventListener("blur", validarRol);
  }

  if (concesionario) {
    concesionario.addEventListener("change", function () {
      validarConcesionario();
      actualizarEstadoBoton();
    });
    concesionario.addEventListener("blur", validarConcesionario);
  }

  if (condiciones) {
    condiciones.addEventListener("change", actualizarEstadoBoton);
  }

  if (formulario) {
    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();

      const nombreValido = validarNombre();
      const correoValido = validarCorreoUsuario();
      const contrasenyaValida = validarContrasenya();
      const repetirContrasenyaValida = validarRepetirContrasenya();
      const telefonoValido = validarTelefono();
      const rolValido = validarRol();
      const concesionarioValido = validarConcesionario();

      if (
        nombreValido &&
        correoValido &&
        contrasenyaValida &&
        repetirContrasenyaValida &&
        telefonoValido &&
        rolValido &&
        concesionarioValido &&
        condiciones.checked
      ) {
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
      correoUsuario.classList.remove("campo-error", "campo-valido");
      contrasenya.classList.remove("campo-error", "campo-valido");
      repetirContrasenya.classList.remove("campo-error", "campo-valido");
      telefono.classList.remove("campo-error", "campo-valido");
      rol.classList.remove("campo-error", "campo-valido");
      concesionario.classList.remove("campo-error", "campo-valido");

      errorNombre.textContent = "";
      errorCorreo.textContent = "";
      errorContrasenya.textContent = "";
      errorRepetirContrasenya.textContent = "";
      errorTelefono.textContent = "";
      errorRol.textContent = "";
      errorConcesionario.textContent = "";
      if (correoCompleto) {
        correoCompleto.value = "";
      }
      botonEnviar.disabled = true;
    });
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      const type = contrasenya.type === "password" ? "text" : "password";
      contrasenya.type = type;
      toggle.classList.toggle("bi-eye");
      toggle.classList.toggle("bi-eye-slash");

      if (type === "text") {
        toggle.setAttribute("title", "Ocultar contraseña");
        toggle.setAttribute("aria-label", "Ocultar contraseña");
      } else {
        toggle.setAttribute("title", "Mostrar contraseña");
        toggle.setAttribute("aria-label", "Mostrar contraseña");
      }
    });
  }

  if (repetirToggle) {
    repetirToggle.addEventListener("click", () => {
      const type = repetirContrasenya.type === "password" ? "text" : "password";
      repetirContrasenya.type = type;
      repetirToggle.classList.toggle("bi-eye");
      repetirToggle.classList.toggle("bi-eye-slash");

      if (type === "text") {
        repetirToggle.setAttribute("title", "Ocultar contraseña");
        repetirToggle.setAttribute("aria-label", "Ocultar contraseña");
      } else {
        repetirToggle.setAttribute("title", "Mostrar contraseña");
        repetirToggle.setAttribute("aria-label", "Mostrar contraseña");
      }
    });
  }
}

function autoCompletarRegistro() {
  const botonAutocompletar = document.getElementById(
    "boton-autocompletar-registro"
  );

  if (botonAutocompletar) {
    botonAutocompletar.addEventListener("click", function () {
      document.getElementById("nombre-registro").value = "Jorge Nitales";
      document.getElementById("correo-registro").value = "jorge.nitales";
      document.getElementById("contraseña-registro").value =
        "JorgetoNital1234!";
      document.getElementById("repetir-contraseña-registro").value =
        "JorgetoNital1234!";
      document.getElementById("telefono-registro").value = "646734676";
      document.getElementById("rol-registro").value = "admin";
      document.getElementById("concesionario-registro").value = "1";
      document.getElementById("condiciones-registro").checked = true;

      document
        .getElementById("nombre-registro")
        .dispatchEvent(new Event("input"));
      document
        .getElementById("correo-registro")
        .dispatchEvent(new Event("input"));
      document
        .getElementById("contraseña-registro")
        .dispatchEvent(new Event("input"));
      document
        .getElementById("repetir-contraseña-registro")
        .dispatchEvent(new Event("input"));
      document
        .getElementById("telefono-registro")
        .dispatchEvent(new Event("input"));
      document
        .getElementById("rol-registro")
        .dispatchEvent(new Event("change"));
      document
        .getElementById("concesionario-registro")
        .dispatchEvent(new Event("change"));
      document
        .getElementById("condiciones-registro")
        .dispatchEvent(new Event("change"));
    });
  }
}
