function cambiarTamanoLetra(tamano) {
  document.documentElement.style.fontSize = tamano + "px";
  localStorage.setItem("tamanoLetra", tamano);
}

function modoOscuro(activado) {
  const body = document.body;
  const texto = document.getElementById("textoModoOscuro");

  if (activado) {
    localStorage.setItem("modoOscuro", "true");

    if (!document.getElementById("css-modo-oscuro")) {
      const link = document.createElement("link");
      link.id = "css-modo-oscuro";
      link.rel = "stylesheet";
      link.href = "/css/modo-oscuro.css";
      document.head.appendChild(link);
    }

    body.classList.add("modo-oscuro");


    if (texto) {
      texto.textContent = "Modo claro";
    }

    actualizarLogo();
  } else {
    localStorage.setItem("modoOscuro", "false");
    const link = document.getElementById("css-modo-oscuro");
    if (link) {
      link.remove();
    }

    body.classList.remove("modo-oscuro");


    if (texto) {
      texto.textContent = "Modo oscuro";
    }

    actualizarLogo();
  }
}

function modoAltoContraste(activado) {
  if (activado) {
    localStorage.setItem("altoContraste", "true");

    if (!document.getElementById("css-alto-contraste")) {
      const link = document.createElement("link");
      link.id = "css-alto-contraste";
      link.rel = "stylesheet";
      link.href = "/css/contraste.css";
      document.head.appendChild(link);
    }
    document.body.classList.add("alto-contraste");
  } else {
    localStorage.setItem("altoContraste", "false");
    const link = document.getElementById("css-alto-contraste");
    if (link) link.remove();

    document.body.classList.remove("alto-contraste");
  }
}

function obtenerPreferenciasActuales() {
  const altoContraste = localStorage.getItem("altoContraste") === "true";
  const modoOscuro = localStorage.getItem("modoOscuro") === "true";
  const tamanoLetra = localStorage.getItem("tamanoLetra") || "16";

  const tema = modoOscuro ? "oscuro" : "claro";
  const contraste = altoContraste ? "alto" : "normal";

  let tam_fuente = "mediano";
  if (tamanoLetra === "12") {
    tam_fuente = "pequeno";
  } else if (tamanoLetra === "20") {
    tam_fuente = "grande";
  }

  let atajos_personalizados = null;

  const atajosGuardados = localStorage.getItem("atajos_personalizados");
  if (atajosGuardados) {
    try {
      atajos_personalizados = JSON.parse(atajosGuardados);
    } catch (error) {
      atajos_personalizados = null;
    }
  }

  return { tema, contraste, tam_fuente, atajos_personalizados };
}

function aplicarPreferenciasServidor(preferencias) {
  const esModoOscuro = preferencias.tema === "oscuro";
  document.getElementById("botonModoOscuro").checked = esModoOscuro;
  modoOscuro(esModoOscuro);

  const esAltoContraste = preferencias.contraste === "alto";
  document.getElementById("botonAltoContraste").checked = esAltoContraste;
  modoAltoContraste(esAltoContraste);

  let tamano = 16;

  if (preferencias.tam_fuente === "pequeno") {
    tamano = 12;
  } else if (preferencias.tam_fuente === "grande") {
    tamano = 20;
  }

  cambiarTamanoLetra(tamano);
  actualizarLogo();
}

function aplicarPreferenciasLocales() {
  const modoOscuroActivo = localStorage.getItem("modoOscuro") === "true";
  const altoContraste = localStorage.getItem("altoContraste") === "true";
  const tamanoLetra = localStorage.getItem("tamanoLetra") || "16";

  modoOscuro(modoOscuroActivo);

  if (altoContraste) {
    modoAltoContraste(true);
  }

  cambiarTamanoLetra(parseInt(tamanoLetra));
}

function cargarPreferenciasServidor() {
  fetch("/preferencias/api")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.success && data.preferencias) {
        aplicarPreferenciasServidor(data.preferencias);
      }
    })
    .catch(function (error) {
      console.error("Error al cargar preferencias del server: ", error);
    });
}

function cargarPreferenciasIniciales() {
  fetch("/preferencias/api")
    .then(function (response) {
      if (response.status === 401) {
        return { success: false, usuarioNoAutenticado: true };
      }
      return response.json();
    })
    .then(function (data) {
      if (data.usuarioNoAutenticado) {
        console.log("Usuario no autenticado: usando preferencias locales");
        aplicarPreferenciasLocales();
      } else if (data.success && data.preferencias) {
        console.log("Usuario autenticado: usando preferencias de BD");
        aplicarPreferenciasServidor(data.preferencias);

        sincronizarLocalStorageConBD(data.preferencias);
      } else {
        console.log("Usuario sin preferencias guardadas: usando localStorage");
        aplicarPreferenciasLocales();
      }
    })
    .catch(function (error) {
      console.error(
        "Error al cargar las preferencias, usando localStorage",
        error
      );
      aplicarPreferenciasLocales();
    });
}

function sincronizarLocalStorageConBD(preferencias) {
  const modoOscuro = preferencias.tema === "oscuro";
  const altoContraste = preferencias.contraste === "alto";

  let tamanoLetra = "16";
  if (preferencias.tam_fuente === "pequeno") {
    tamanoLetra = "12";
  } else if (preferencias.tam_fuente === "grande") {
    tamanoLetra = "20";
  }

  localStorage.setItem("modoOscuro", modoOscuro.toString());
  localStorage.setItem("altoContraste", altoContraste.toString());
  localStorage.setItem("tamanoLetra", tamanoLetra);

  console.log("LocalStorage sincronizado con BD:", {
    modoOscuro,
    altoContraste,
    tamanoLetra,
  });
}

function cerrarMensaje(idMensaje) {
  const mensaje = document.getElementById(idMensaje);
  if (mensaje) {
    mensaje.classList.add("d-none");
  }
}
function guardarPreferenciasServidor() {
  const btnGuardar = document.getElementById("guardarPreferencias");
  const spinner = document.getElementById("spinnerGuardar");
  const mensajeExito = document.getElementById("mensajeGuardado");
  const mensajeError = document.getElementById("mensajeError");

  if (spinner) spinner.classList.remove("d-none");
  if (btnGuardar) btnGuardar.disabled = true;

  cerrarMensaje("mensajeGuardado");
  cerrarMensaje("mensajeError");

  const preferencias = obtenerPreferenciasActuales();

  fetch("/preferencias/api/guardar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preferencias),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.success) {
        console.log("Preferencias guardadas correctamente en la BBDD");
        if (mensajeExito) {
          mensajeExito.classList.remove("d-none");
        }
      } else {
        if (mensajeError) {
          const textoError = document.getElementById("textoError");
          if (textoError) {
            textoError.textContent =
              data.message || "Error al guardar preferencias";
          }
          mensajeError.classList.remove("d-none");
        }
      }
    })
    .catch(function (error) {
      console.error("Error al guardar las preferencias...", error);
      if (mensajeError) {
        const textoError = document.getElementById("textoError");
        if (textoError) {
          textoError.textContent = "Error de conexión en el servidor.";
        }
        mensajeError.classList.remove("d-none");
      }
    })
    .finally(function () {
      if (spinner) spinner.classList.add("d-none");
      if (btnGuardar) btnGuardar.disabled = false;
    });
}

function actualizarLogo() {
  const logoNavbar = document.getElementById("logoNavbarAureon");

  if (!logoNavbar) return;

  const esModoOscuro = document.body.classList.contains("modo-oscuro");

  if (esModoOscuro) {
    logoNavbar.src = "/img/logo/LogoAureon-FondoBlanco.png";
  } else {
    logoNavbar.src = "/img/logo/LogoAureon.png";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const chkModoOscuro = document.getElementById("botonModoOscuro");
  if (chkModoOscuro) {
    const estadoModoOscuro = localStorage.getItem("modoOscuro") === "true";
    chkModoOscuro.checked = estadoModoOscuro;

    if (estadoModoOscuro) {
      modoOscuro(true);
    }

    chkModoOscuro.addEventListener("change", function () {
      modoOscuro(this.checked);
    });
  }

  const chkContraste = document.getElementById("botonAltoContraste");
  if (chkContraste) {
    const estadoContraste = localStorage.getItem("altoContraste") === "true";
    chkContraste.checked = estadoContraste;

    if (estadoContraste) {
      modoAltoContraste(true);
    }

    chkContraste.addEventListener("change", function () {
      modoAltoContraste(this.checked);
    });
  }

  const btnLetraPequena = document.getElementById("letraPequena");
  const btnLetraNormal = document.getElementById("letraNormal");
  const btnLetraGrande = document.getElementById("letraGrande");

  if (btnLetraGrande) {
    btnLetraGrande.addEventListener("click", function () {
      cambiarTamanoLetra(20);
    });
  }
  if (btnLetraNormal) {
    btnLetraNormal.addEventListener("click", function () {
      cambiarTamanoLetra(16);
    });
  }
  if (btnLetraPequena) {
    btnLetraPequena.addEventListener("click", function () {
      cambiarTamanoLetra(12);
    });
  }

  const tamGuardado = localStorage.getItem("tamanoLetra");
  if (tamGuardado) {
    cambiarTamanoLetra(parseInt(tamGuardado));
  }

  const btnGuardarPreferencias = document.getElementById("guardarPreferencias");
  if (btnGuardarPreferencias) {
    btnGuardarPreferencias.addEventListener(
      "click",
      guardarPreferenciasServidor
    );
  }

  cargarPreferenciasIniciales();

  const modal = document.getElementById("dialogoAccesibilidad");
  if (modal) {
    modal.addEventListener("hidden.bs.modal", function () {
      cerrarMensaje("mensajeGuardado");
      cerrarMensaje("mensajeError");
    });
  }

  actualizarLogo();
});

const obtenerPreferenciasActualesOriginal = obtenerPreferenciasActuales;

obtenerPreferenciasActuales = function () {
  const preferencias = obtenerPreferenciasActualesOriginal();

  if (typeof obtenerAtajosPersonalizados === "function") {
    preferencias.atajos_personalizados = obtenerAtajosPersonalizados();
  }

  return preferencias;
};
