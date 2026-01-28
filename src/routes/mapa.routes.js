"use strict";
const express = require("express");
const router = express.Router();
const db = require("../db");

const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000;

router.get("/api/concesionarios-mapa", function (request, response) {
  db.query(
    "SELECT id, nombre, ciudad, direccion, telefono_contacto FROM Concesionarios WHERE activo = 1",
    function (error, concesionarios) {
      if (error) {
        return response.status(500).json({
          success: false,
          error: "Error al obtener concesionarios",
        });
      }

      if (concesionarios.length === 0) {
        return response.json({
          success: true,
          data: [],
        });
      }

      let procesados = 0;
      const concesionariosConCoords = [];

      concesionarios.forEach(function (c, index) {
        const direccionCompleta = `${c.direccion}, ${c.ciudad}, España`;
        const cacheKey = `geocode_${direccionCompleta}`;

        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          concesionariosConCoords.push({
            ...c,
            lat: cached.data.lat,
            lon: cached.data.lon,
          });
          procesados++;

          if (procesados === concesionarios.length) {
            response.json({
              success: true,
              data: concesionariosConCoords,
            });
          }
          return;
        }

        setTimeout(function () {
          geocodificarDireccion(direccionCompleta, function (error, coords) {
            if (!error && coords) {
              concesionariosConCoords.push({
                ...c,
                lat: coords.lat,
                lon: coords.lon,
              });

              cache.set(cacheKey, {
                data: coords,
                timestamp: Date.now(),
              });
            }

            procesados++;

            if (procesados === concesionarios.length) {
              response.json({
                success: true,
                data: concesionariosConCoords,
              });
            }
          });
        }, index * 1100);
      });
    }
  );
});

function geocodificarDireccion(direccion, callback) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.append("q", direccion);
  url.searchParams.append("format", "json");
  url.searchParams.append("limit", "1");

  fetch(url.toString(), {
    method: "GET",
    headers: {
      "User-Agent": "AureonMobility/1.0",
      Accept: "application/json",
    },
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }

      return response.json();
    })
    .then(function (data) {
      if (!data || data.length === 0) {
        return callback(new Error("Dirección no encontrada"), null);
      }

      const ubicacion = data[0];
      const coords = {
        lat: parseFloat(ubicacion.lat),
        lon: parseFloat(ubicacion.lon),
      };

      callback(null, coords);
    })
    .catch(function (error) {
      callback(error, null);
    });
}

router.get("/api/distancia", function (request, response) {
  const { lat1, lon1, lat2, lon2 } = request.query;

  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return response.status(400).json({
      success: false,
      error: "Faltan coordenadas",
    });
  }

  const distancia = calcularDistanciaHaversine(
    parseFloat(lat1),
    parseFloat(lon1),
    parseFloat(lat2),
    parseFloat(lon2)
  );

  response.json({
    success: true,
    distancia: distancia.toFixed(2),
    unidad: "km",
  });
});

/**
 * La Fórmula Haversine calcula la distancia entre dos puntos en una esfera (la Tierra) usando sus coordenadas geográficas.
 */
function calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = router;
