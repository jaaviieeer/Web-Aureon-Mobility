const ATAJOS_PREDETERMINADOS = {
  navegacion: {
    irInicio: "Alt+H",
    irVehiculos: "Alt+V",
    irReservas: "Alt+R",
  },
  accesibilidad: {
    toggleModoOscuro: "Alt+D",
    toggleAltoContraste: "Alt+C",
    aumentarFuente: "Ctrl++",
    reducirFuente: "Ctrl+-",
  },
  acciones: {
    guardar: "Ctrl+S",
    buscar: "Ctrl+F",
  },
};

const TAMANOS_LETRA_DISPONIBLES = [12, 16, 20];
let atajosActuales = JSON.parse(JSON.stringify(ATAJOS_PREDETERMINADOS));

/*
Convierte un evento de teclado en una cadena de texto
Ejemplo: Presionas: Ctrl+Alt+K --> "Ctrl+Alt+K"
*/
function eventoATecla(evento) {
  const partes = [];
  if (evento.ctrlKey) partes.push("Ctrl");
  if (evento.altKey) partes.push("Alt");
  if (evento.shiftKey) partes.push("Shift");
  if (evento.metaKey) partes.push("Meta");

  const teclasEspeciales = {
    " ": "Espacio",
    Enter: "Enter",
    Escape: "Escape",
    Tab: "Tab",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
    "+": "+",
    "-": "-",
    "=": "+",
  };

  let tecla = teclasEspeciales[evento.key] || evento.key.toUpperCase();

  if (!["Control", "Alt", "Shift", "Meta"].includes(evento.key)) {
    partes.push(tecla);
  }

  return partes.join("+");
}

/**
 * Compara si una combinación de teclas coincide con un atajo guardado
 */
function coincideAtajo(evento, atajo) {
  // Convertimos el evento a texto
  const teclaPresionada = eventoATecla(evento);
  return teclaPresionada === atajo;
}

/**
 * Busca qué accion corresponde a una combinación de teclas, recorremos todas las categorías de teclas (navegación, accesibilidad, acciones)
 * y recorre todas las acciones posibles dentro de su ccategoría para comprobar si coincide con alguna. Si coincide devuelve la categoria y la acción
 * que debe llevar a cabo
 */
function buscarAccion(evento) {
  for (const categoria in atajosActuales) {
    for (const accion in atajosActuales[categoria]) {
      if (coincideAtajo(evento, atajosActuales[categoria][accion])) {
        return { categoria, accion };
      }
    }
  }

  return null;
}

/**
 * Función que define qué debemos de hacer cuando ejecutamos un atajo
 */
const accionesAtajos = {
  irInicio: function () {
    window.location.href = "/";
  },
  irVehiculos: function () {
    window.location.href = "/vehiculos";
  },
  irReservas: function () {
    window.location.href = "/reservas";
  },

  toggleModoOscuro: function () {
    const checkbox = document.getElementById("botonModoOscuro");
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      modoOscuro(checkbox.checked);
    }
  },

  toggleAltoContraste: function () {
    const checkbox = document.getElementById("botonAltoContraste");
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      modoAltoContraste(checkbox.checked);
    }
  },

  aumentarFuente: function () {
    const tamanoActual = parseInt(localStorage.getItem("tamanoLetra") || "16");
    const indiceActual = TAMANOS_LETRA_DISPONIBLES.indexOf(tamanoActual);

    let nuevoIndice = indiceActual;
    if (indiceActual === -1) {
      nuevoIndice = TAMANOS_LETRA_DISPONIBLES.findIndex(
        (t) => t >= tamanoActual
      );
      if (nuevoIndice === -1)
        nuevoIndice = TAMANOS_LETRA_DISPONIBLES.length - 1;
    }

    if (nuevoIndice < TAMANOS_LETRA_DISPONIBLES.length - 1) {
      const nuevoTamano = TAMANOS_LETRA_DISPONIBLES[nuevoIndice + 1];
      cambiarTamanoLetra(nuevoTamano);
    }
  },

  reducirFuente: function () {
    const tamanoActual = parseInt(localStorage.getItem("tamanoLetra") || "16");
    const indiceActual = TAMANOS_LETRA_DISPONIBLES.indexOf(tamanoActual);

    let nuevoIndice = indiceActual;
    if (indiceActual === -1) {
      nuevoIndice = TAMANOS_LETRA_DISPONIBLES.findIndex(
        (t) => t <= tamanoActual
      );
      if (nuevoIndice === -1) nuevoIndice = 0;
    }

    if (nuevoIndice > 0) {
      const nuevoTamano = TAMANOS_LETRA_DISPONIBLES[nuevoIndice - 1];
      cambiarTamanoLetra(nuevoTamano);
    }
  },

  guardar: function () {
    const btnGuardar = document.getElementById("guardarPreferencias");
    if (btnGuardar && !btnGuardar.disabled) {
      btnGuardar.click();
    }
  },

  buscar: function () {
    const buscador = document.querySelector(
      ".buscador-vehiculos input, input[type='search'],input[placeholder*='Buscar'], input[placeholder*='buscar']"
    );
    if (buscador) {
      buscador.focus();
      buscador.select();
    }
  },
};

/**
 * Función que he decidido utilizar para escuchar los atajos del teclado. Se ejecuta cada vez que el usuario ejecuta una tecla
 */
function manejarAtajoGlobal(evento) {
  const elementoActivo = document.activeElement;
  const esInput =
    elementoActivo.tagName === "INPUT" ||
    elementoActivo.tagName === "TEXTAREA" ||
    elementoActivo.isContentEditable;

  if (evento.key === "Escape") {
    const modalAbierto = document.querySelector(".modal.show");
    if (modalAbierto) {
      const btnCerrar = modalAbierto.querySelector(
        ".btn-close, [data-bs-dismiss='modal']"
      );

      if (btnCerrar) {
        btnCerrar.click();
        evento.preventDefault();
      }

      return;
    }
  }

  if (
    elementoActivo.classList &&
    elementoActivo.classList.contains("atajo-input")
  ) {
    return;
  }

  const resultado = buscarAccion(evento);

  if (resultado) {
    const { categoria, accion } = resultado;

    if (esInput && categoria === "navegacion") {
      return;
    }

    if (accionesAtajos[accion]) {
      evento.preventDefault();
      accionesAtajos[accion]();
      console.log(`Atajo ejecutado: ${accion}`);
    }
  }
}

function inicializarConfiguracionAtajos() {
  const inputsAtajos = document.querySelectorAll(".atajo-input");

  inputsAtajos.forEach((input) => {
    const nombreAtajo = input.dataset.atajo;

    cargarValorAtajo(input, nombreAtajo);

    input.addEventListener("keydown", function (evento) {
      evento.preventDefault();

      if (["Control", "Alt", "Shift", "Meta"].includes(evento.key)) {
        return;
      }

      const combinacion = eventoATecla(evento);

      input.value = combinacion;
      actualizarAtajoActual(nombreAtajo, combinacion);

      guardarAtajosEnLocalStorage();
    });

    input.addEventListener("dblclick", function () {
      input.value = "";
      actualizarAtajoActual(nombreAtajo, "");
      guardarAtajosEnLocalStorage();
    });
  });

  const btnRestaurar = document.getElementById("btnRestaurarAtajos");
  if (btnRestaurar) {
    btnRestaurar.addEventListener("click", function () {
      atajosActuales = JSON.parse(JSON.stringify(ATAJOS_PREDETERMINADOS));
      guardarAtajosEnLocalStorage();

      inputsAtajos.forEach((input) => {
        const nombreAtajo = input.dataset.atajo;
        cargarValorAtajo(input, nombreAtajo);
      });

      alert("Atajos restaurados a los valores predeterminados");
    });
  }
}

function cargarValorAtajo(input, nombreAtajo) {
  for (const categoria in atajosActuales) {
    if (atajosActuales[categoria][nombreAtajo]) {
      input.value = atajosActuales[categoria][nombreAtajo];
      return;
    }
  }
}
function actualizarAtajoActual(nombreAtajo, combinacion) {
  for (const categoria in atajosActuales) {
    if (atajosActuales[categoria].hasOwnProperty(nombreAtajo)) {
      atajosActuales[categoria][nombreAtajo] = combinacion;
      return;
    }
  }
}
function guardarAtajosEnLocalStorage() {
  localStorage.setItem("atajos_personalizados", JSON.stringify(atajosActuales));
}

function cargarAtajosDesdeLocalStorage() {
  const atajosGuardados = localStorage.getItem("atajos_personalizados");

  if (atajosGuardados) {
    try {
      atajosActuales = JSON.parse(atajosGuardados);
    } catch (error) {
      console.error("Erro al cargar los atajos", error);
      atajosActuales = JSON.parse(JSON.stringify(ATAJOS_PREDETERMINADOS));
    }
  }
}

function inicializarNavegacionMejorada() {
  const focusVisibleCheckBox = document.getElementById("focusVisibleEnhanced");

  if (focusVisibleCheckBox) {
    const estadoGuardado = localStorage.getItem("focusVisibleEnhanced");
    focusVisibleCheckBox.checked = estadoGuardado !== "false";

    aplicarFocusVisible(focusVisibleCheckBox.checked);

    focusVisibleCheckBox.addEventListener("change", function () {
      aplicarFocusVisible(this.checked);
      localStorage.setItem("focusVisibleEnhanced", this.checked);
    });
  }

  const skipLinksCheckbox = document.getElementById("skipLinks");
  if (skipLinksCheckbox) {
    const estadoGuardado = localStorage.getItem("skipLinks");
    skipLinksCheckbox.checked = estadoGuardado !== "false";

    if (skipLinksCheckbox.checked) {
      crearSkipLinks();
    }

    skipLinksCheckbox.addEventListener("change", function () {
      if (this.checked) {
        crearSkipLinks();
      } else {
        eliminarSkipLinks();
      }

      localStorage.setItem("skipLinks", this.checked);
    });
  }

  const tabTrapCheckbox = document.getElementById("tabTrap");
  if (tabTrapCheckbox) {
    const estadoGuardado = localStorage.getItem("tabTrap");
    tabTrapCheckbox.checked = estadoGuardado === "true";

    if (tabTrapCheckbox.checked) {
      habilitarTabTrap();
    }

    tabTrapCheckbox.addEventListener("change", function () {
      if (this.checked) {
        habilitarTabTrap();
      } else {
        deshabilitarTabTrap();
      }
      localStorage.setItem("tabTrap", this.checked);
    });
  }
}

function aplicarFocusVisible(activado) {
  if (activado) {
    document.body.classList.add("focus-visible-enhanced");
  } else {
    document.body.classList.remove("focus-visible-enhanced");
  }
}

function crearSkipLinks() {
  if (document.getElementById("skip-links")) return;

  const skipLinksContainer = document.createElement("div");
  skipLinksContainer.id = "skip-links";
  skipLinksContainer.className = "skip-links";
  skipLinksContainer.innerHTML = `
    <a href="#main-content" class="skip-link">Saltar al contenido principal</a>
    <a href="#navigation" class="skip-link">Saltar a la navegación</a>
  `;

  document.body.insertBefore(skipLinksContainer, document.body.firstChild);

  const mainContent = document.querySelector("main, .main-content, .container");
  if (mainContent && !mainContent.id) {
    mainContent.id = "main-content";
  }

  const nav = document.querySelector("nav");
  if (nav && !nav.id) {
    nav.id = "navigation";
  }
}

function eliminarSkipLinks() {
  const skipLinks = document.getElementById("skip-links");
  if (skipLinks) {
    skipLinks.remove();
  }
}

let tabTrapHandler = null;

function habilitarTabTrap() {
  tabTrapHandler = function (evento) {
    const modal = document.querySelector(".modal.show");
    if (!modal) return;

    if (evento.key === "Tab") {
      const elementosFocuseables = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const primerElemento = elementosFocuseables[0];
      const ultimoElemento =
        elementosFocuseables[elementosFocuseables.length - 1];

      if (evento.shiftKey) {
        if (document.activeElement === primerElemento) {
          ultimoElemento.focus();
          evento.preventDefault();
        }
      } else {
        if (document.activeElement === ultimoElemento) {
          primerElemento.focus();
          evento.preventDefault();
        }
      }
    }
  };

  document.addEventListener("keydown", tabTrapHandler);
}

function deshabilitarTabTrap() {
  if (tabTrapHandler) {
    document.removeEventListener("keydown", tabTrapHandler);
    tabTrapHandler = null;
  }
}

function ontenerAtajosPersonalizados() {
  return atajosActuales;
}
document.addEventListener("DOMContentLoaded", function () {
  cargarAtajosDesdeLocalStorage();

  document.addEventListener("keydown", manejarAtajoGlobal);

  const modal = document.getElementById("dialogoAccesibilidad");
  if (modal) {
    modal.addEventListener("shown.bs.modal", function () {
      inicializarConfiguracionAtajos();
    });
  }

  inicializarNavegacionMejorada();
});
