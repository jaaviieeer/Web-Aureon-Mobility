document.addEventListener("DOMContentLoaded", function () {
  validarFormularioLogin();
});

function validarFormularioLogin() {
  const formulario = document.getElementById("formulario-login");
  const correoUsuario = document.getElementById("correo-usuario-login");
  const correoCompleto = document.getElementById("correo-completo-login");
  const contrasenya = document.getElementById("contraseña-login");
  const botonEnviar = document.getElementById("boton-login");

  const errorCorreo = document.getElementById("error-correo-login");
  const errorContrasenya = document.getElementById("error-contraseña-login");

  const toggle = document.getElementById("togglePasswordLogin");

  function juntarCorreo() {
    if (correoUsuario && correoCompleto) {
      const usuario = correoUsuario.value.trim();
      correoCompleto.value = usuario ? usuario + "@aureon.es" : "";
    }
  }

  function actualizarEstadoBoton() {
    botonEnviar.disabled = !(esCorreoValido() && esContrasenyaValida());
  }

  function esCorreoValido() {
    const valorUsuario = correoUsuario.value.trim();
    const regexUsuario = /^[a-zA-Z0-9._-]+$/;
    return (
      valorUsuario !== "" &&
      valorUsuario.length >= 3 &&
      regexUsuario.test(valorUsuario)
    );
  }

  function esContrasenyaValida() {
    const valorContrasenya = contrasenya.value;
    const regexMinimo8 = /.{8,}/;
    const regexMayuscula = /[A-Z]/;
    const regexNumero = /[0-9]/;
    const regexEspecial = /[!@#$%^&*(),.?":{}|<>]/;

    return (
      valorContrasenya !== "" &&
      regexMinimo8.test(valorContrasenya) &&
      regexMayuscula.test(valorContrasenya) &&
      regexNumero.test(valorContrasenya) &&
      regexEspecial.test(valorContrasenya)
    );
  }

  function validarCorreo() {
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
        "Solo letras, números, puntos (.), guiones (-) y guiones bajos (_)"
      );
      return false;
    } else {
      mostrarExito(correoUsuario, errorCorreo);
      return true;
    }
  }

  function validarContrasenya() {
    const valorContrasenya = contrasenya.value;
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

  if (correoUsuario) {
    correoUsuario.addEventListener("input", function () {
      juntarCorreo();
      validarCorreo();
      actualizarEstadoBoton();
    });
    correoUsuario.addEventListener("blur", validarCorreo);
  }

  if (contrasenya) {
    contrasenya.addEventListener("input", function () {
      validarContrasenya();
      actualizarEstadoBoton();
    });
    contrasenya.addEventListener("blur", validarContrasenya);
  }

  if (formulario) {
    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();

      const correoValido = validarCorreo();
      const contrasenyaValida = validarContrasenya();

      if (correoValido && contrasenyaValida) {
        formulario.submit();
      } else {
        alert("Completa todos los campos correctamente");
      }
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

  juntarCorreo();
  actualizarEstadoBoton();
}
