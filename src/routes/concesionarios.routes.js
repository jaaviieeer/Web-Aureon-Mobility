"use strict";
const express = require("express");
const db = require("../db");
const router = express.Router();
const { verificarAdmin } = require("./auth.middlewares");

router.get("/api", function (request, response) {
  db.query(
    `SELECT 
      c.id, 
      c.nombre, 
      c.ciudad, 
      c.direccion, 
      c.telefono_contacto,
      c.activo,
      (SELECT COUNT(*) FROM Usuario WHERE id_concesionario = c.id AND activo = 1) as totalUsuarios,
      (SELECT COUNT(*) FROM Vehiculos WHERE id_concesionario = c.id AND activo = 1) as totalVehiculos
    FROM Concesionarios c
    WHERE c.activo = 1
    ORDER BY c.nombre, c.ciudad`,
    function (error, concesionarios) {
      if (error) {
        return response.status(500).json({
          success: false,
          error: "Error al obtener los concesionarios",
          mensaje: error.message,
        });
      }
      response.status(200).json({
        success: true,
        data: concesionarios,
        total: concesionarios.length,
      });
    }
  );
});

router.get("/admin/nuevo", verificarAdmin, function (request, response, next) {

  response.status(200).render("nuevo-concesionario", {
    nombrePagina: "Nuevo concesionario",
    error: null,
    nombre: "",
    ciudad: "",
    direccion: "",
    telefono: "",
    esEdicion: false,
    concesionarioId: null,
  });
});

router.post("/admin/nuevo", verificarAdmin, function (request, response, next) {
  const { nombre, ciudad, direccion, telefono } = request.body;

  function renderizarFormularioConError(mensajeError) {
    return response.render("nuevo-concesionario", {
      nombrePagina: "Nuevo Concesionario",
      error: mensajeError,
      nombre: nombre || "",
      ciudad: ciudad || "",
      direccion: direccion || "",
      telefono: telefono || "",
      esEdicion: false,
      concesionarioId: null,
    });
  }

  if (!nombre || !ciudad || !direccion || !telefono) {
    return renderizarFormularioConError("Todos los campos son obligatorios");
  }

  db.queryOne(
    "SELECT * FROM Concesionarios WHERE direccion = ? AND activo = 1",
    [direccion],
    function (error, concesionarioConDireccion) {
      if (error) {
        return next(error);
      }

      if (concesionarioConDireccion) {
        return renderizarFormularioConError(
          `Ya existe un concesionario activo en la dirección: ${direccion}`
        );
      }

      db.queryOne(
        "SELECT * FROM Concesionarios WHERE nombre = ? AND ciudad = ? AND activo = 1",
        [nombre, ciudad],
        function (error, concesionarioExistente) {
          if (error) {
            return next(error);
          }

          if (concesionarioExistente) {
            return renderizarFormularioConError(
              `Ya existe un concesionario activo con el nombre "${nombre}" en ${ciudad}`
            );
          }

          db.queryOne(
            "SELECT * FROM Concesionarios WHERE telefono_contacto = ? AND activo = 1",
            [telefono],
            function (error, concesionarioConTelefono) {
              if (error) {
                return next(error);
              }

              if (concesionarioConTelefono) {
                return renderizarFormularioConError(
                  `Ya existe un concesionario activo con el teléfono: ${telefono}`
                );
              }

              db.execute(
                "INSERT INTO Concesionarios (activo, nombre, ciudad, direccion, telefono_contacto) VALUES (?, ?, ?, ?, ?)",
                [1, nombre, ciudad, direccion, telefono],
                function (error) {
                  if (error) {
                    return next(error);
                  }
                  response.redirect("/admin/");
                }
              );
            }
          );
        }
      );
    }
  );
});

router.get("/admin/:id/editar", verificarAdmin, function (request, response, next) {
  const concesionarioId = parseInt(request.params.id);

  db.queryOne(
    "SELECT * FROM Concesionarios WHERE id = ? AND activo = 1",
    [concesionarioId],
    function (error, concesionario) {
      if (error) {
        return next(error);
      }

      if (!concesionario) {
        return response.status(404).send("Concesionario no encontrado");
      }

      response.status(200).render("nuevo-concesionario", {
        nombrePagina: "Editar concesionario",
        error: null,
        nombre: concesionario.nombre || "",
        ciudad: concesionario.ciudad || "",
        direccion: concesionario.direccion || "",
        telefono: concesionario.telefono_contacto || "",
        esEdicion: true,
        concesionarioId: concesionario.id,
      });
    }
  );
}
);

router.post("/admin/:id/editar", verificarAdmin, function (request, response, next) {
  const concesionarioId = parseInt(request.params.id);
  const { nombre, ciudad, direccion, telefono } = request.body;

  function renderizarFormularioConError(mensajeError) {
    return response.render("nuevo-concesionario", {
      nombrePagina: "Editar Concesionario",
      error: mensajeError,
      nombre: nombre,
      ciudad: ciudad,
      direccion: direccion,
      telefono: telefono,
      esEdicion: true,
      concesionarioId: concesionarioId,
    });
  }

  if (!nombre || !ciudad || !direccion || !telefono) {
    return renderizarFormularioConError("Todos los campos son obligatorios");
  }

  db.queryOne(
    "SELECT * FROM Concesionarios WHERE direccion = ? AND id != ? AND activo = 1",
    [direccion, concesionarioId],
    function (error, concesionarioConDireccion) {
      if (error) {
        return next(error);
      }

      if (concesionarioConDireccion) {
        return renderizarFormularioConError(
          `Ya existe otro concesionario activo en la dirección: ${direccion}`
        );
      }

      db.queryOne(
        "SELECT * FROM Concesionarios WHERE nombre = ? AND ciudad = ? AND id != ? AND activo = 1",
        [nombre, ciudad, concesionarioId],
        function (error, concesionarioExistente) {
          if (error) {
            return next(error);
          }

          if (concesionarioExistente) {
            return renderizarFormularioConError(
              `Ya existe otro concesionario activo con el nombre "${nombre}" en ${ciudad}`
            );
          }

          db.queryOne(
            "SELECT * FROM Concesionarios WHERE telefono_contacto = ? AND id != ? AND activo = 1",
            [telefono, concesionarioId],
            function (error, concesionarioConTelefono) {
              if (error) {
                return next(error);
              }

              if (concesionarioConTelefono) {
                return renderizarFormularioConError(
                  `Ya existe otro concesionario activo con el teléfono: ${telefono}`
                );
              }

              db.execute(
                "UPDATE Concesionarios SET nombre = ?, ciudad = ?, direccion = ?, telefono_contacto = ? WHERE id = ?",
                [nombre, ciudad, direccion, telefono, concesionarioId],
                function (error) {
                  if (error) {
                    return next(error);
                  }

                  response.redirect("/admin/");
                }
              );
            }
          );
        }
      );
    }
  );
}
);

router.put("/admin/:id/eliminar", verificarAdmin, function (request, response, next) {
  const concesionarioId = parseInt(request.params.id);
  const adminConcesionarioId = request.session.usuario.id_concesionario;

  if (adminConcesionarioId === concesionarioId) {
    return response.status(403).json({
      success: false,
      error: "No puedes dar de baja tu propio concesionario",
    });
  }

  db.queryOne(
    `SELECT 
      (SELECT COUNT(*) FROM Usuario WHERE id_concesionario = ? AND activo = 1) as totalUsuarios,
      (SELECT COUNT(*) FROM Vehiculos WHERE id_concesionario = ? AND activo = 1) as totalVehiculos,
      (SELECT COUNT(DISTINCT u.id) FROM Usuario u 
       JOIN Reservas r ON u.id = r.id_usuario 
       WHERE u.id_concesionario = ? AND u.activo = 1 AND r.activo = 1) as usuariosConReservas
    `,
    [concesionarioId, concesionarioId, concesionarioId],
    function (error, totales) {
      if (error) {
        return response.status(500).json({
          success: false,
          error: "Error al verificar dependencias",
          mensaje: error.message,
        });
      }
      console.log(totales.usuariosConReservas);
      if (totales.usuariosConReservas === 0) {
        db.execute(
          "UPDATE Concesionarios SET activo = 0 WHERE id = ?",
          [concesionarioId],
          function (error) {
            if (error) {
              return response.status(500).json({
                success: false,
                error: "Error al dar de baja el concesionario",
                mensaje: error.message,
              });
            }

            db.execute(
              "UPDATE Usuario SET activo = 0 WHERE id_concesionario = ?",
              [concesionarioId],
              function (error) {
                if (error) {
                  console.error(
                    "Error al dar de baja usuarios:",
                    error.message
                  );
                }

                db.execute(
                  "UPDATE Vehiculos SET activo = 0 WHERE id_concesionario = ?",
                  [concesionarioId],
                  function (error) {
                    if (error) {
                      console.error(
                        "Error al dar de baja vehículos:",
                        error.message
                      );
                    }
                    response.status(200).json({
                      success: true,
                      mensaje: "Concesionario dado de baja correctamente",
                      usuariosBaja: totales.totalUsuarios,
                      vehiculosBaja: totales.totalVehiculos,
                    });
                  }
                );
              }
            );
          }
        );
      }
      else {
        return response.status(500).json({
          success: false,
          error: "El concesionario tiene reservas activas",
          mensaje: "El concesionario tiene reservas activas",
        });
      }
    }
  );
}
);

router.get("/api/disponibles", function (request, response) {
  db.query(
    "SELECT * FROM Concesionarios WHERE activo = 1 ORDER BY nombre",
    function (error, c) {
      if (error) {
        return response.status(500).json({
          success: false,
          error: "Error al obtener los concesionarios",
          mensaje: error.message,
        });
      }
      let concesionarios = [];
      let ciudades = [];
      c.forEach(concesionario => {
        concesionarios.push(concesionario.nombre);
        if (!ciudades.includes(concesionario.ciudad)) {
          ciudades.push(concesionario.ciudad);
        }
      });
      console.log(concesionarios);
      response.status(200).json({
        success: true,
        concesionarios: concesionarios,
        ciudades: ciudades,
      });
    }
  );
});

module.exports = router;
