const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const multer = require("multer");
const multerFactory = multer({ storage: multer.memoryStorage() });

router.get("/", function (request, response, next) {
  db.queryOne(`SELECT (SELECT COUNT(*) FROM Concesionarios WHERE activo = 1) as concesionarios,
    (SELECT COUNT(*) FROM Vehiculos WHERE activo = 1) as vehiculos,
    (SELECT COUNT(*) FROM Cliente WHERE 1=1) as clientes,
    (SELECT COUNT(*) FROM Reservas WHERE activo = 1) as reservas,
    (SELECT COUNT(*) FROM Usuario WHERE activo = 1) as usuarios`,

    function (error, tablas) {
      if (error) {
        return next(error);
      }
      let bdVacia =
        tablas.concesionarios === 1 && tablas.vehiculos === 0 && tablas.clientes === 0 && tablas.reservas === 0 && tablas.usuarios === 1;
      const queryEstadisticas = `
            SELECT c.id AS id_concesionario, c.nombre AS nombre_concesionario, c.ciudad, c.direccion, COUNT(r.id) AS total_reservas,
            (SELECT CONCAT(v2.marca, ' ', v2.modelo) FROM Reservas r2 JOIN Vehiculos v2 ON r2.id_vehiculo = v2.id WHERE v2.id_concesionario = c.id AND r2.activo = 1 AND v2.activo = 1 GROUP BY r2.id_vehiculo ORDER BY COUNT(*) DESC LIMIT 1) AS vehiculo_mas_usado,
              (SELECT COUNT(*) FROM Reservas r3 JOIN Vehiculos v3 ON r3.id_vehiculo = v3.id WHERE v3.id_concesionario = c.id AND r3.activo = 1 AND v3.activo = 1 GROUP BY r3.id_vehiculo ORDER BY COUNT(*) DESC LIMIT 1) AS veces_reservado
            FROM Concesionarios c LEFT JOIN Vehiculos v ON v.id_concesionario = c.id AND v.activo = 1 LEFT JOIN Reservas r ON r.id_vehiculo = v.id AND r.activo = 1 WHERE c.activo = 1 GROUP BY c.id, c.nombre, c.ciudad, c.direccion
            ORDER BY total_reservas DESC`;
      db.query(queryEstadisticas, function (errorEstadisticas, estadisticas) {
        if (errorEstadisticas) {
          return next(errorEstadisticas);
        }

        const queryEstadisticasGenerales = `
          SELECT IFNULL(SUM(r.km_recorridos), 0) AS kilometros_totales, COUNT(r.id) AS total_reservas,
       SUM(CASE WHEN HOUR(r.fecha_inicio) >= 6 AND HOUR(r.fecha_inicio) < 12 THEN 1 ELSE 0 END) AS reservas_manana,
       SUM(CASE WHEN HOUR(r.fecha_inicio) >= 12 AND HOUR(r.fecha_inicio) < 18 THEN 1 ELSE 0 END) AS reservas_tarde,
       SUM(CASE WHEN HOUR(r.fecha_inicio) >= 18 OR HOUR(r.fecha_inicio) < 6 THEN 1 ELSE 0 END) AS reservas_noche,
       SUM(CASE WHEN r.incidencias_reportadas IS NOT NULL AND r.incidencias_reportadas != '' THEN 1 ELSE 0 END) AS incidencias_totales,
       SUM(CASE WHEN r.incidencias_reportadas IS NOT NULL AND r.incidencias_reportadas != '' AND r.estado = 'finalizada' THEN 1 ELSE 0 END) AS incidencias_resueltas,
       SUM(CASE WHEN r.incidencias_reportadas IS NOT NULL AND r.incidencias_reportadas != '' AND r.estado = 'activa' THEN 1 ELSE 0 END) AS incidencias_pendientes FROM Reservas r WHERE r.activo = 1;`;

        db.queryOne(queryEstadisticasGenerales, function (errorGenerales, estadisticasGenerales) {
          if (errorGenerales) {
            return next(errorGenerales);
          }

          if (!estadisticasGenerales) {
            estadisticasGenerales = {
              kilometros_totales: 0,
              total_reservas: 0,
              reservas_manana: 0,
              reservas_tarde: 0,
              reservas_noche: 0,
              incidencias_totales: 0,
              incidencias_resueltas: 0,
              incidencias_pendientes: 0,
            };
          }
          response.render("admin-panel", {
            estadisticas: estadisticas,
            estadisticasGenerales: estadisticasGenerales,
            nombrePagina: "Panel de Administracion",
            bdVacia: bdVacia,
          });
        }
        );
      }
      );
    }
  );
});

router.post("/subir-json", multerFactory.any("vehiculosJSON", "concesionariosJSON", "usuariosJSON"), function (request, response,next) {
  try {
    if (!request.files || request.files.length === 0) {
      response.redirect("/admin");
    }

    let datosArchivos = {};

    try {
      request.files.forEach((archivo) => {
        const buffer = archivo.buffer;
        const datos = JSON.parse(buffer.toString("utf-8"));
        datosArchivos[archivo.fieldname] = datos;
      });
    } catch (error) {
      return next(error);
    }

    let hecho = 0;
    let insercciones = 0;

    if (datosArchivos.concesionariosJSON) {
      const concesionarios = datosArchivos.concesionariosJSON;
      insercciones += concesionarios.length;

      concesionarios.forEach((c) => {
        const query = `INSERT INTO concesionarios (nombre, ciudad, direccion, telefono_contacto, activo) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
            nombre = VALUES(nombre), ciudad = VALUES(ciudad), direccion = VALUES(direccion), telefono_contacto = VALUES(telefono_contacto), activo = VALUES(activo)`;
        db.query(query, [c.nombre, c.ciudad, c.direccion, c.telefono_contacto, c.activo], (error, resultado) => {
          if (error) {
            return next(error);
          }
          hecho++;
          if (hecho == insercciones) {
            if (datosArchivos.vehiculosJSON) {
              const vehiculos = datosArchivos.vehiculosJSON;
              insercciones += vehiculos.length;

              vehiculos.forEach((v) => {
                db.query(`INSERT INTO vehiculos (matricula, marca, modelo, anyo_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario, precio_hora, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
            marca = VALUES(marca), modelo = VALUES(modelo), anyo_matriculacion = VALUES(anyo_matriculacion), numero_plazas = VALUES(numero_plazas), autonomia_km = VALUES(autonomia_km), color = VALUES(color),
            imagen = VALUES(imagen), estado = VALUES(estado), id_concesionario = VALUES(id_concesionario), precio_hora = VALUES(precio_hora), activo = VALUES(activo)`, [v.matricula, v.marca, v.modelo, v.anyo_matriculacion, v.numero_plazas, v.autonomia_km, v.color, v.imagen, v.estado, v.id_concesionario, v.precio_hora, v.activo,], (error, resultado) => {
                  if (error) {
                    return next(error);
                  }
                  hecho++;
                  if (hecho == insercciones) {
                    if (datosArchivos.usuariosJSON) {
                      const usuarios = datosArchivos.usuariosJSON;
                      insercciones += usuarios.length;

                      usuarios.forEach((u) => {
                        bcrypt.hash(u.contraseña, 10, (error, contraseñaEncriptada) => {
                          if (error) {
                            return next(error);
                          }

                          const query = `INSERT INTO usuario (activo, nombre, correo, contraseña, rol, telefono, id_concesionario) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE activo = VALUES(activo),
              nombre = VALUES(nombre), correo = VALUES(correo), contraseña = VALUES(contraseña), rol = VALUES(rol), telefono = VALUES(telefono), id_concesionario = VALUES(id_concesionario)`;
                          db.query(query, [u.activo, u.nombre, u.correo, contraseñaEncriptada, u.rol, u.telefono, u.id_concesionario, u.preferencias,], (error, resultado) => {
                            if (error) {
                              return next(error);
                            }
                            hecho++;
                            if (hecho == insercciones) {
                              return response.redirect("/admin");
                            }
                          }
                          );
                        });
                      });
                    }
                  }
                }
                );
              });
            }
          }
        }
        );
      });
    }
    else if (datosArchivos.vehiculosJSON) {
      const vehiculos = datosArchivos.vehiculosJSON;
      insercciones += vehiculos.length;

      vehiculos.forEach((v) => {
        db.query(`INSERT INTO vehiculos (matricula, marca, modelo, anyo_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario, precio_hora, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
            marca = VALUES(marca), modelo = VALUES(modelo), anyo_matriculacion = VALUES(anyo_matriculacion), numero_plazas = VALUES(numero_plazas), autonomia_km = VALUES(autonomia_km), color = VALUES(color),
            imagen = VALUES(imagen), estado = VALUES(estado), id_concesionario = VALUES(id_concesionario), precio_hora = VALUES(precio_hora), activo = VALUES(activo)`, [v.matricula, v.marca, v.modelo, v.anyo_matriculacion, v.numero_plazas, v.autonomia_km, v.color, v.imagen, v.estado, v.id_concesionario, v.precio_hora, v.activo,], (error, resultado) => {
          if (error) {
            return next(error);
          }
          hecho++
          if (hecho == insercciones) {
            return response.redirect("/vehiculos");
          }
        });
      });
    }
  } catch (error) {
    return next(error);
  }
}
);

module.exports = router;
