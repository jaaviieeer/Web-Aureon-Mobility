"use strict";
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");
const { verificarAdmin } = require("./auth.middlewares");

router.get("/logout", function (request, response) {
  const nombreUsuario = request.session.usuario.nombre || "Usuario";

  if (request.cookies.recordar_usuario) {
    response.clearCookie("recordar_usuario");
  }

  request.session.destroy(function (err) {
    if (err) {
      return response.status(500).send("Error al cerrar sesión");
    }
    response.redirect("/");
  });
});

router.get("/panel", function (request, response, next) {
  const idUsuario = request.session.usuario.id;

  db.query(
    "SELECT * FROM Vehiculos WHERE estado = 'disponible' AND activo = 1",
    function (error, vehiculos) {
      if (error) {
        return next(error);
      }
      db.query(
        `SELECT r.*, v.marca, v.modelo, v.matricula FROM Reservas r JOIN Vehiculos v ON r.id_vehiculo =v.id WHERE r.id_usuario = ? AND r.activo = 1 AND v.activo = 1 ORDER BY r.fecha_inicio DESC`,
        [idUsuario],
        function (error, reservas) {
          if (error) {
            return next(error);
          }
          response.status(200).render("panel", {
            nombrePagina: "Mi panel",
            vehiculos: vehiculos,
            reservas: reservas,
          });
        }
      );
    }
  );
});

router.get("/api", verificarAdmin, function (request, response, next) {
  db.query(
    `SELECT * FROM Usuario WHERE activo = 1
      `,
    function (error, usuarios) {
      if (error) {
        console.error("Error en la API de usuarios: ", error.message);
        return response.status(500).json({
          success: false,
          error: "Error al obtener los usuarios",
          mensaje: error.mensaje,
        });
      }

      response.status(200).json({
        success: true,
        data: usuarios,
        total: usuarios.length,
      });
    }
  );
});

router.get("/admin/nuevo", verificarAdmin, function (request, response, next) {

  db.query(
    "SELECT * FROM Concesionarios WHERE activo = 1 ORDER BY nombre",
    function (error, concesionarios) {
      if (error) {
        return next(error);
      }
      response.status(200).render("register", {
        nombrePagina: "Nuevo usuario",
        error: null,
        nombre: "",
        correo: "",
        rol: "",
        telefono: "",
        concesionario: "",
        esEdicion: false,
        usuarioId: null,
        concesionarios: concesionarios,
      });
    }
  );
});

router.post("/admin/nuevo", verificarAdmin, function (request, response, next) {
  const { nombre, correo, contraseña, rol, telefono, concesionario } =
    request.body;

  function renderizarFormularioConError(mensajeError) {
    db.query(
      "SELECT * FROM Concesionarios WHERE activo = 1 ORDER BY nombre",
      function (error, concesionarios) {
        if (error) {
          return next(error);
        }

        return response.status(400).render("register", {
          nombrePagina: "Nuevo usuario",
          error: mensajeError,
          nombre: nombre || "",
          correo: correo || "",
          rol: rol || "",
          telefono: telefono || "",
          concesionario: concesionario || "",
          esEdicion: false,
          usuarioId: null,
          concesionarios: concesionarios,
        });
      }
    );
  }

  if (!nombre || !correo || !contraseña || !rol || !concesionario) {
    return renderizarFormularioConError(
      "Todos los campos obligatorios deben estar completos."
    );
  }

  if (contraseña.length < 8) {
    console.log("La contraseña tiene que tener como mínimo 8 caracteres");
    return renderizarFormularioConError(
      "La contraseña debe tener como mínimo 8 caracteres"
    );
  }

  if (rol !== "admin" && rol !== "empleado") {
    console.log("Los únicos roles disponibles son empleado y administrador");
    return renderizarFormularioConError("Rol inválido");
  }

  db.queryOne(
    "SELECT * FROM Usuario WHERE correo = ? AND activo = 1",
    [correo],
    function (error, usuarioExistente) {
      if (error) {
        return next(error);
      }

      if (usuarioExistente) {
        console.log(
          "No se puede registrar al usuario por estar repetido el correo"
        );
        return renderizarFormularioConError(
          "El correo electrónico ya está registrado"
        );
      }

      db.queryOne(
        "SELECT * FROM Concesionarios WHERE id = ? AND activo = 1",
        [parseInt(concesionario)],
        function (error, concesionarioExistente) {
          if (error) {
            return next(error);
          }

          if (!concesionarioExistente) {
            return renderizarFormularioConError(
              "El concesionario seleccionado no existe"
            );
          }

          const saltRounds = 10;
          bcrypt.hash(
            contraseña,
            saltRounds,
            function (error, contraseñaHasheada) {
              if (error) {
                return next(error);
              }

              db.execute(
                `INSERT INTO Usuario (activo, nombre, correo, contraseña, rol, telefono, id_concesionario) 
               VALUES (1, ?, ?, ?, ?, ?, ?)`,
                [
                  nombre,
                  correo,
                  contraseñaHasheada,
                  rol,
                  telefono || null,
                  parseInt(concesionario),
                ],
                function (error, resultado) {
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
  const usuarioId = parseInt(request.params.id);

  db.queryOne(
    "SELECT * FROM Usuario WHERE id = ? AND activo = 1",
    [usuarioId],
    function (error, usuarioEditar) {
      if (error) {
        return next(error);
      }

      if (!usuarioEditar) {
        return response.status(404).send("Usuario no encontrado");
      }

      db.query(
        "SELECT * FROM Concesionarios WHERE activo = 1 ORDER BY nombre",
        function (error, concesionarios) {
          if (error) {
            return next(error);
          }

          response.status(200).render("register", {
            nombrePagina: "Editar usuario",
            error: null,
            nombre: usuarioEditar.nombre || "",
            correo: usuarioEditar.correo || "",
            rol: usuarioEditar.rol || "",
            telefono: usuarioEditar.telefono || "",
            concesionario: usuarioEditar.id_concesionario || "",
            esEdicion: true,
            usuarioId: usuarioEditar.id,
            concesionarios: concesionarios,
          });
        }
      );
    }
  );
}
);

router.post("/admin/:id/editar", verificarAdmin, function (request, response, next) {
  const usuarioId = parseInt(request.params.id);
  const { nombre, correo, rol, telefono, concesionario } = request.body;

  function renderizarFormularioError(mensajeError) {
    db.query(
      "SELECT * FROM Concesionarios WHERE activo = 1 ORDER BY nombre",
      function (errorDb, concesionarios) {
        if (errorDb) {
          return next(errorDb);
        }

        return response.status(400).render("register", {
          nombrePagina: "Editar usuario",
          error: mensajeError,
          nombre: nombre || "",
          correo: correo || "",
          rol: rol || "",
          telefono: telefono || "",
          concesionario: concesionario || "",
          esEdicion: true,
          usuarioId: usuarioId,
          concesionarios: concesionarios,
        });
      }
    );
  }

  if (!nombre || !correo || !rol || !concesionario) {
    return renderizarFormularioError(
      "Todos los campos obligatorios deben estar completos."
    );
  }

  db.queryOne(
    "SELECT * FROM Usuario WHERE correo = ? AND id != ? AND activo = 1",
    [correo, usuarioId],
    function (error, usuarioConCorreoExistente) {
      if (error) {
        return next(error);
      }

      if (usuarioConCorreoExistente) {
        return renderizarFormularioError(
          `Ya existe otro usuario con el correo ${correo}.`
        );
      }

      db.execute(
        "UPDATE Usuario SET nombre = ?, correo = ?, rol = ?, telefono = ?, id_concesionario = ? WHERE id = ?",
        [
          nombre,
          correo,
          rol,
          telefono || null,
          parseInt(concesionario),
          usuarioId,
        ],
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

router.put("/admin/:id/eliminar", verificarAdmin, function (request, response, next) {
  const usuarioId = parseInt(request.params.id);

  if (request.session.usuario && request.session.usuario.id === usuarioId) {
    return response.status(400).json({
      success: false,
      mensaje:
        "No puedes eliminar tu propio usuario mientras tienes la sesión activa",
    });
  }

  db.queryOne(
    "SELECT COUNT(*) as total FROM Reservas WHERE id_usuario = ? AND estado = 'activa' AND activo = 1",
    [usuarioId],
    function (error, reservasActivas) {
      if (error) {
        return next(error);
      }

      if (reservasActivas.total > 0) {
        return response.status(400).json({
          success: false,
          mensaje: `No se puede eliminar el usuario porque tiene ${reservasActivas.total} reserva(s) activa(s). Por favor, cancela o completa las reservas primero.`
        });
      }

      db.execute(
        "UPDATE Usuario SET activo = 0 WHERE id = ?",
        [usuarioId],
        function (error) {
          if (error) {
            return next(error);
          }
          response.json({ success: true });
        }
      );
    }
  );
}
);

module.exports = router;
