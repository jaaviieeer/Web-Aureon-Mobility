"use strict";
const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", function (request, response, next) {

  db.query(
    "SELECT * FROM Vehiculos WHERE estado = 'disponible' AND activo = 1 ORDER BY marca, modelo",
    function (error, vehiculos) {
      if (error) {
        return next(error);
      }

      response.status(200).render("reserva", {
        nombrePagina: "Reserva un vehiculo",
        vehiculos: [],
        error: null,
        nombre: "",
        correo: "",
        telefono: "",
        dni: "",
        vehiculoSeleccionado: "",
        "fecha-inicio": "",
        hora: "",
        "fecha-fin": "",
      });
    }
  );
});

router.post("/", function (request, response, next) {

  const {
    nombre,
    correo,
    telefono,
    dni,
    "seleccion-vehiculo": vehiculoId,
    "fecha-inicio": fechaInicio,
    hora,
    "fecha-fin": fechaFin,
  } = request.body;

  if (
    !nombre ||
    !correo ||
    !telefono ||
    !dni ||
    !vehiculoId ||
    !fechaInicio ||
    !fechaFin ||
    !hora
  ) {
    return response.status(400).send("Faltan campos obligatorios");
  }

  function renderizarFormularioConError(mensajeError) {
    db.query(
      "SELECT * FROM Vehiculos WHERE estado = 'disponible' AND activo = 1 ORDER BY marca, modelo",
      function (error, vehiculos) {
        if (error) {
          console.error("Error al cargar vehículos:", error.message);
          return next(error);
        }

        return response.status(400).render("reserva", {
          vehiculos: [],
          error: mensajeError,
          nombre: nombre || "",
          correo: correo || "",
          telefono: telefono || "",
          dni: dni || "",
          vehiculoSeleccionado: vehiculoId || "",
          "fecha-inicio": fechaInicio || "",
          hora: hora || "",
          "fecha-fin": fechaFin || "",
        });
      }
    );
  }

  const regexDNI = /^[0-9]{8}[A-Z]$/;
  const dniLimpio = dni.trim().toUpperCase();

  if (!regexDNI.test(dniLimpio)) {
    return renderizarFormularioConError(
      "El DNI debe tener 8 números y 1 letra mayúscula"
    );
  }

  const regexTelefono = /^(\+34|34)?[6-9][0-9]{8}$/;
  const telefonoLimpio = telefono.replace(/\s/g, "");

  if (!regexTelefono.test(telefonoLimpio)) {
    return renderizarFormularioConError("El teléfono debe tener 9 dígitos");
  }

  const fechaInicioSQL = `${fechaInicio} ${hora}:00`;
  const fechaFinDate = new Date(fechaFin);
  fechaFinDate.setHours(23, 59, 59);
  const fechaFinSQL = fechaFinDate.toISOString().slice(0, 19).replace("T", " ");

  console.log("Fechas SQL:", {
    inicio: fechaInicioSQL,
    fin: fechaFinSQL,
  });

  const fechaInicioDate = new Date(fechaInicioSQL);
  const fechaFinDateValidar = new Date(fechaFinSQL);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fechaInicioDate < hoy) {
    return renderizarFormularioConError(
      "No se puede reservar una fecha anterior al día actual"
    );
  }

  if (fechaFinDateValidar <= fechaInicioDate) {
    return renderizarFormularioConError(
      "La fecha de finalización debe ser posterior a la fecha de inicio"
    );
  }

  db.queryOne(
    "SELECT * FROM Cliente WHERE dni = ?",
    [dniLimpio],
    function (error, cliente) {
      if (error) {
        console.error("Error al buscar cliente:", error.message);
        return next(error);
      }

      function continuarConReserva(clienteObj) {
        const idUsuario = request.session.usuario.id;

        db.queryOne(
          `SELECT COUNT(*) as total 
           FROM Reservas 
           WHERE id_vehiculo = ? 
             AND activo = 1 
             AND estado IN ('activa', 'reservado')
             AND (
               (fecha_inicio <= ? AND fecha_fin >= ?) OR
               (fecha_inicio <= ? AND fecha_fin >= ?) OR
               (fecha_inicio >= ? AND fecha_fin <= ?)
             )`,
          [
            parseInt(vehiculoId),
            fechaInicioSQL,
            fechaInicioSQL,
            fechaFinSQL,
            fechaFinSQL,
            fechaInicioSQL,
            fechaFinSQL,
          ],
          function (error, reservaExistente) {
            if (error) {
              console.error(
                "Error al verificar disponibilidad:",
                error.message
              );
              return next(error);
            }

            if (reservaExistente.total > 0) {
              return renderizarFormularioConError(
                "El vehículo seleccionado ya está reservado en esas fechas"
              );
            }

            db.execute(
              `INSERT INTO Reservas (id_usuario, id_vehiculo, id_cliente, fecha_inicio, fecha_fin, estado, km_recorridos, incidencias_reportadas, activo) 
               VALUES (?, ?, ?, ?, ?, 'activa', 0, '', 1)`,
              [
                idUsuario,
                parseInt(vehiculoId),
                clienteObj.id,
                fechaInicioSQL,
                fechaFinSQL,
              ],
              function (error, resultado) {
                if (error) {
                  console.error("Error al crear reserva:", error.message);
                  return next(error);
                }

                db.execute(
                  "UPDATE Vehiculos SET estado = 'reservado' WHERE id = ?",
                  [parseInt(vehiculoId)],
                  function (error) {
                    if (error) {
                      console.error(
                        "Error al actualizar vehículo:",
                        error.message
                      );
                    }

                    response.redirect("/panel");
                  }
                );
              }
            );
          }
        );
      }

      if (cliente) {
        if (
          cliente.nombre !== nombre ||
          cliente.correo !== correo ||
          cliente.telefono !== telefonoLimpio
        ) {

          db.execute(
            "UPDATE Cliente SET nombre = ?, correo = ?, telefono = ? WHERE id = ?",
            [nombre, correo, telefonoLimpio, cliente.id],
            function (error) {
              if (error) {
                return next(error);
              }

              const clienteActualizado = {
                id: cliente.id,
                nombre: nombre,
                correo: correo,
                telefono: telefonoLimpio,
                dni: dniLimpio,
              };

              continuarConReserva(clienteActualizado);
            }
          );
        } else {
          continuarConReserva(cliente);
        }
      } else {
        db.execute(
          "INSERT INTO Cliente (nombre, correo, telefono, dni) VALUES (?, ?, ?, ?)",
          [nombre, correo, telefonoLimpio, dniLimpio],
          function (error, resultadoCliente) {
            if (error) {
              console.error("Error al crear cliente:", error.message);
              return next(error);
            }

            const nuevoCliente = {
              id: resultadoCliente.insertId,
              nombre: nombre,
              correo: correo,
              telefono: telefonoLimpio,
              dni: dniLimpio,
            };

            continuarConReserva(nuevoCliente);
          }
        );
      }
    }
  );
});

router.get("/api", function (request, response) {
  if (!request.session.usuario) {
    return response.status(401).json({
      success: false,
      error: "Debes iniciar sesión",
    });
  }

  const idUsuario = request.session.usuario.id;

  db.query(
    `
        SELECT 
          c.nombre as nombre_cliente,
          c.telefono,
          v.marca,
          v.modelo,
          r.fecha_inicio,
          r.fecha_fin,
          r.estado,
          r.id
        FROM Reservas r
        JOIN Cliente c ON r.id_cliente = c.id
        JOIN Vehiculos v ON r.id_vehiculo = v.id
        WHERE r.id_usuario = ?
        ORDER BY CASE r.estado
          WHEN 'activa' THEN 1
          WHEN 'cancelada' THEN 2
          WHEN 'finalizada' THEN 3
          ELSE 4
        END,
        r.fecha_inicio DESC
      `,
    [idUsuario],
    function (error, reservas) {
      if (error) {
        return response.status(500).json({
          success: false,
          error: "Error al obtener las reservas",
          mensaje: error.mensaje,
        });
      }
      response.status(200).json({
        success: true,
        data: reservas,
        total: reservas.length,
      });
    }
  );
});

router.post("/api", function (request, response) {
  if (!request.session || !request.session.usuario) {
    return response.status(401).json({
      success: false,
      error: "Debes iniciar sesión para crear una reserva",
    });
  }

  const {
    id_vehiculo,
    fecha_inicio,
    fecha_fin,
    dni,
    nombre,
    correo,
    telefono,
  } = request.body;

  if (!id_vehiculo || !fecha_inicio || !fecha_fin) {
    return response.status(400).json({
      success: false,
      error: "Faltan campos obligatorios: id_vehiculo, fecha_inicio, fecha_fin",
    });
  }

  const fechaInicio = new Date(fecha_inicio);
  const fechaFin = new Date(fecha_fin);
  let hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fechaInicio < hoy) {
    return response.status(400).json({
      success: false,
      error: "No se puede reservar una fecha anterior al día actual",
    });
  }

  if (fechaFin <= fechaInicio) {
    return response.status(400).json({
      success: false,
      error: "La fecha de finalización debe ser posterior a la fecha de inicio",
    });
  }

  db.queryOne(
    `SELECT COUNT(*) as total 
     FROM Reservas 
     WHERE id_vehiculo = ? 
       AND activo = 1 
       AND estado IN ('activa', 'reservado')
       AND (
         (fecha_inicio <= ? AND fecha_fin >= ?) OR
         (fecha_inicio <= ? AND fecha_fin >= ?) OR
         (fecha_inicio >= ? AND fecha_fin <= ?)
       )`,
    [
      parseInt(id_vehiculo),
      fecha_inicio,
      fecha_inicio,
      fecha_fin,
      fecha_fin,
      fecha_inicio,
      fecha_fin,
    ],
    function (error, reservaExistente) {
      if (error) {
        return response.status(500).json({
          success: false,
          error: "Error al verificar disponibilidad",
          mensaje: error.message,
        });
      }

      if (reservaExistente.total > 0) {
        return response.status(400).json({
          success: false,
          error: "El vehículo ya está reservado en esas fechas",
        });
      }

      db.queryOne(
        "SELECT * FROM Cliente WHERE dni = ?",
        [dni],
        function (error, cliente) {
          if (error) {
            return response.status(500).json({
              success: false,
              error: "Error al buscar cliente",
              mensaje: error.message,
            });
          }

          function crearReserva(clienteId) {
            const idUsuario = request.session.usuario.id;

            db.execute(
              `INSERT INTO Reservas (id_usuario, id_vehiculo, id_cliente, fecha_inicio, fecha_fin, estado, km_recorridos, incidencias_reportadas, activo) 
               VALUES (?, ?, ?, ?, ?, 'activa', 0, '', 1)`,
              [
                idUsuario,
                parseInt(id_vehiculo),
                clienteId,
                fecha_inicio,
                fecha_fin,
              ],
              function (error, resultado) {
                if (error) {
                  return response.status(500).json({
                    success: false,
                    error: "Error al crear reserva",
                    mensaje: error.message,
                  });
                }

                db.execute(
                  "UPDATE Vehiculos SET estado = 'reservado' WHERE id = ?",
                  [parseInt(id_vehiculo)],
                  function (error) {
                    if (error) {
                      console.error(
                        "Error al actualizar vehículo:",
                        error.message
                      );
                    }

                    db.queryOne(
                      `SELECT 
                        r.*,
                        u.nombre as nombre_usuario,
                        u.correo as correo_usuario,
                        c.dni as dni_cliente,
                        c.nombre as nombre_cliente,
                        c.telefono as telefono_cliente,
                        v.marca,
                        v.modelo,
                        v.matricula
                      FROM Reservas r
                      JOIN Usuario u ON r.id_usuario = u.id
                      JOIN Vehiculos v ON r.id_vehiculo = v.id
                      JOIN Cliente c ON r.id_cliente = c.id
                      WHERE r.id = ?`,
                      [resultado.insertId],
                      function (error, reservaCreada) {
                        if (error) {
                          console.error(
                            "Error al obtener reserva creada:",
                            error.message
                          );
                          return response.status(500).json({
                            success: false,
                            error: "Error al obtener detalles de la reserva",
                            mensaje: error.message,
                          });
                        }

                        response.status(201).json({
                          success: true,
                          mensaje: "Reserva creada exitosamente",
                          data: reservaCreada,
                        });
                      }
                    );
                  }
                );
              }
            );
          }

          if (cliente) {
            crearReserva(cliente.id);
          } else {
            db.execute(
              "INSERT INTO Cliente (nombre, correo, telefono, dni) VALUES (?, ?, ?, ?)",
              [nombre, correo, telefono, dni],
              function (error, resultadoCliente) {
                if (error) {
                  console.error("Error al crear cliente:", error.message);
                  return response.status(500).json({
                    success: false,
                    error: "Error al crear cliente",
                    mensaje: error.message,
                  });
                }

                crearReserva(resultadoCliente.insertId);
              }
            );
          }
        }
      );
    }
  );
});

router.put("/api/:id/eliminar", function (request, response) {
  const idReserva = parseInt(request.params.id);

  if (!request.session?.usuario) {
    return response.status(401).json({
      success: false,
      error: "Debes iniciar sesión",
    });
  }

  db.queryOne(
    "SELECT * FROM Reservas WHERE id = ?",
    [idReserva],
    function (error, reserva) {
      if (error) {
        return response.status(500).json({
          success: false,
          error: "Error al obtener reserva",
          mensaje: error.message,
        });
      }

      if (!reserva) {
        return response.status(404).json({
          success: false,
          error: "Reserva no encontrada",
        });
      }

      if (reserva.activo === 0) {
        return response.status(400).json({
          success: false,
          error: "La reserva ya no está activa",
        });
      }

      const idUsuario = request.session.usuario.id;
      const esAdmin = request.session.usuario.rol === "admin";

      if (reserva.id_usuario !== idUsuario && !esAdmin) {
        return response.status(403).json({
          success: false,
          error: "No tienes permiso para cancelar esta reserva",
        });
      }

      const fechaInicio = new Date(reserva.fecha_inicio);
      const ahora = new Date();

      let nuevoEstado = null;

      if (reserva.estado === "activa") {
        nuevoEstado = ahora < fechaInicio ? "cancelada" : "finalizada";
      } else {
        return response.status(400).json({
          success: false,
          error: "La reserva ya no está activa",
        });
      }

      db.execute(
        "UPDATE Reservas SET estado = ?, activo = 0 WHERE id = ?",
        [nuevoEstado, idReserva],
        function (error) {
          if (error) {
            console.error("Error al actualizar reserva:", error.message);
            return response.status(500).json({
              success: false,
              error: "Error al actualizar reserva",
              mensaje: error.message,
            });
          }
          db.execute(
            "UPDATE Vehiculos SET estado = 'disponible' WHERE id = ?",
            [reserva.id_vehiculo],
            function () {
              return response.status(200).json({
                success: true,
                mensaje: `Reserva cancelada o finalizada correctamente`,
                accionRealizada: nuevoEstado,
                idVehiculo: reserva.id_vehiculo,
              });
            }
          );
        }
      );
    }
  );
});

router.get("/api/:id", function (request, response) {
  const idReserva = parseInt(request.params.id);

  db.queryOne(
    `SELECT r.*, u.nombre as nombre_usuario, u.correo as correo_usuario, v.marca,v.modelo,v.matricula FROM Reservas r JOIN Usuario u ON r.id_usuario = u.id JOIN Vehiculos v ON r.id_vehiculo = v.id WHERE r.id = ? AND r.activo = 1`,
    [idReserva],
    function (error, reserva) {
      if (error) {
        console.error(
          "Error en la API de reserva a la hora de obtener una reserva concreta: ",
          error.message
        );
        return response.status(500).json({
          success: false,
          error: "Error al obtener la reserva",
          mensaje: error.mensaje,
        });
      }
      if (!reserva) {
        return response.status(404).json({
          success: false,
          error: "La reserva no existe o no está activa.",
        });
      }
      response.status(200).json({
        success: true,
        data: reserva,
      });
    }
  );
});

module.exports = router;
