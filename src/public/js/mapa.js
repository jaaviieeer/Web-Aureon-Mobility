var mapa;
var marcadores = [];
var ubicacionUsuario = null;
var concesionarios = [];

document.addEventListener("DOMContentLoaded", function () {
  inicializarMapa();
  obtenerUbicacionUsuario();
  cargarConcesionarios();
});

function inicializarMapa() {
  document.getElementById("mapa-loading").classList.add("d-none");
  document.getElementById("mapa-concesionarios").classList.remove("d-none");
  // Creamos el mapa y centramos la vista en mi Españita
  mapa = L.map("mapa-concesionarios").setView([40.4168, -3.7038], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(mapa);
}

function obtenerUbicacionUsuario() {
  if (!navigator.geolocation) {
    document.getElementById("texto-ubicacion").textContent =
      "Tu navegador no soporta geolocalización,";
    document.getElementById("alert-ubicacion").className =
      "alert alert-warning alert-ubicacion shadow-sm";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (position) {
      ubicacionUsuario = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };

      document.getElementById("texto-ubicacion").textContent =
        "Ubicación obtenida, mostrando distancias!";
      document.getElementById("alert-ubicacion").className =
        "alert alert-success";

      var iconoUsuario = L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      L.marker([ubicacionUsuario.lat, ubicacionUsuario.lon], {
        icon: iconoUsuario,
      })
        .addTo(mapa)
        .bindPopup("<b> Tu ubicación </b>")
        .openPopup();

      mapa.setView([ubicacionUsuario.lat, ubicacionUsuario.lon], 10);

      if (concesionarios.length > 0) {
        mostrarListaConcesionarios(concesionarios);
      }
    },
    function (error) {
      document.getElementById("texto-ubicacion").textContent =
        "Hubo un error al obtener la ubicación. Mostrando todos los concesionarios.";
      document.getElementById("alert-ubicacion").className =
        "alert alert-warning";
    }
  );
}

function cargarConcesionarios() {
  fetch("/mapa/api/concesionarios-mapa")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Error HTTP: " + response.status);
      }

      return response.json();
    })
    .then(function (resultado) {
      if (!resultado.success) {
        throw new Error("Error desconocido: " + resultado.status);
      }

      concesionarios = resultado.data;

      if (concesionarios.length === 0) {
        document.getElementById("lista-concesionarios").innerHTML =
          '<p class="text-center text-muted p-4">No hay concesionarios disponibles</p>';
      }

      mostrarMarcadoresMapa(concesionarios);
      mostrarListaConcesionarios(concesionarios);
    })
    .catch(function (error) {
      document.getElementById("lista-concesionarios").innerHTML =
        '<div class="alert alert-danger m-3"> Error al cargar concesionarios: ' +
        error.message +
        "</div>";
    });
}

function mostrarMarcadoresMapa(concesionarios) {
  marcadores.forEach(function (m) {
    m.remove();
  });

  marcadores = [];

  if (concesionarios.length === 0) {
    return;
  }

  var bounds = L.latLngBounds();

  var iconoConcesionario = L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  concesionarios.forEach(function (c) {
    var marcador = L.marker([c.lat, c.lon], {
      icon: iconoConcesionario,
    })
      .addTo(mapa)
      .bindPopup(
        '<div class="text-center">' +
          "<h6><strong>" +
          c.nombre +
          "</strong></h6>" +
          c.direccion +
          "</p>" +
          c.ciudad +
          "</p>" +
          c.telefono_contacto +
          "</p>" +
          "</div>"
      );

    marcadores.push(marcador);
    bounds.extend([c.lat, c.lon]);

    marcador.on("click", function () {
      resaltarConcesionario(c.id);
    });
  });

  if (ubicacionUsuario) {
    bounds.extend([ubicacionUsuario.lat, ubicacionUsuario.lon]);
  }

  mapa.fitBounds(bounds, { padding: [50, 50] });
}
function mostrarListaConcesionarios(concesionarios) {
  var container = document.getElementById("lista-concesionarios");

  if (ubicacionUsuario) {
    concesionarios.forEach(function (c) {
      c.distancia = calcularDistancia(
        ubicacionUsuario.lat,
        ubicacionUsuario.lon,
        c.lat,
        c.lon
      );
    });
    concesionarios.sort(function (a, b) {
      return a.distancia - b.distancia;
    });
  }

  var html = "";

  concesionarios.forEach(function (c) {
    html +=
      '<div class="concesionario-item p-2 border-bottom" ' +
      'data-id="' +
      c.id +
      '" ' +
      'onclick="centrarEnConcesionario(' +
      c.id +
      ')" ' +
      'style="cursor: pointer;">' +
      '<h6 class="mb-2">' +
      c.nombre;

    if (c.distancia) {
      html +=
        " <span> a " +
        c.distancia.toFixed(1) +
        " km de tu posición." +
        "</span>" +
        "</h6>" +
        "</div>";
    }
  });

  container.innerHTML = html;
}

function centrarEnConcesionario(id) {
  var concesionario = concesionarios.find(function (c) {
    return c.id === id;
  });

  if (!concesionario) {
    return;
  }

  mapa.setView([concesionario.lat, concesionario.lon], 15);

  var marcador = marcadores.find(function (m) {
    var latLng = m.getLatLng();
    return latLng.lat === concesionario.lat && latLng.lon === concesionario.lon;
  });

  if (marcador) {
    marcador.openPopup();
  }

  resaltarConcesionario(id);
}

function resaltarConcesionario(id) {
  document.querySelectorAll(".concesionario-item").forEach(function (item) {
    item.style.backgroundColor = "";
  });

  var item = document.querySelector(
    '.concesionario-item[data-id="' + id + '"]'
  );
  if (item) {
    item.style.backgroundColor = "#e7f1ff";
    item.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = ((lat2 - lat1) * Math.PI) / 180;
  var dLon = ((lon2 - lon1) * Math.PI) / 180;

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
