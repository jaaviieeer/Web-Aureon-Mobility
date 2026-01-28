"use strict";
const express = require("express");
const db = require("../db");
const router = express.Router();
const { verificarAdmin } = require("./auth.middlewares");

router.get("/", function (request, response, next) {
  return response.status(200).render("vehiculos", {
    nombrePagina: "Nuestros vehiculos",
  });
});

router.get("/api", function (request, response) {
  const busqueda = request.query.search || "";
  const filtroConcesionario = request.query.filtroConcesionario;
  const autonomia = request.query.autonomia;
  const plazas = request.query.plazas;
  const concesionario = request.query.concesionario || "";
  const ciudad = request.query.ciudad || "";
  let filtroAutonomia = "";
  let autonomiaValores = [];
  let filtroPlazas = "";
  let valorPlazas = [];

  if (autonomia === "menor100") {
    filtroAutonomia = " AND v.autonomia_km < ? ";
    autonomiaValores.push(100);
  } else if (autonomia === "100a300") {
    filtroAutonomia = " AND v.autonomia_km BETWEEN ? AND ? ";
    autonomiaValores.push(100, 300);
  } else if (autonomia === "mayor300") {
    filtroAutonomia = " AND v.autonomia_km > ? ";
    autonomiaValores.push(300);
  }
  if (plazas === "2") {
    filtroPlazas = " AND v.numero_plazas = ?";
    valorPlazas.push(2);
  }
  if (plazas === "4") {
    filtroPlazas = " AND v.numero_plazas = ?";
    valorPlazas.push(4);
  }
  if (plazas === "mas4") {
    filtroPlazas = "AND v.numero_plazas > ?";
    valorPlazas.push(4);
  }

  if (filtroConcesionario === "true") {
    db.query(
      `SELECT v.matricula, v.precio_hora, v.marca, v.modelo, v.autonomia_km, v.puntuacion, v.id, v.imagen, v.estado, v.numero_plazas, c.nombre AS n_concesionario, c.ciudad AS ciudad FROM vehiculos v JOIN concesionarios c ON v.id_concesionario = c.id WHERE v.activo = 1 AND (v.marca LIKE ? OR v.modelo LIKE ?) AND v.id_concesionario = ? AND c.ciudad LIKE ? AND c.nombre LIKE ? ${filtroAutonomia}${filtroPlazas} ORDER BY v.marca, v.modelo`,
      [
        `%${busqueda}%`,
        `%${busqueda}%`,
        request.session.usuario.id_concesionario,
        `%${ciudad}%`,
        `%${concesionario}%`,
        ...autonomiaValores,
        ...valorPlazas,
      ],
      function (error, vehiculos) {
        if (error) {
          return response.status(500).json({
            success: false,
            error: "Error al obtener los vehículos",
            mensaje: error.message,
          });
        }
        response.status(200).json({
          success: true,
          data: vehiculos,
          total: vehiculos.length,
        });
      }
    );
  } else {
    db.query(
      `SELECT v.matricula, v.precio_hora, v.marca, v.modelo, v.autonomia_km, v.puntuacion, v.id, v.imagen, v.estado, v.numero_plazas, c.nombre AS n_concesionario, c.ciudad AS ciudad FROM vehiculos v JOIN concesionarios c ON v.id_concesionario = c.id WHERE v.activo = 1 AND (v.marca LIKE ? OR v.modelo LIKE ?) AND c.ciudad LIKE ? AND c.nombre LIKE ? ${filtroAutonomia}${filtroPlazas} ORDER BY v.marca, v.modelo`,
      [
        `%${busqueda}%`,
        `%${busqueda}%`,
        `%${ciudad}%`,
        `%${concesionario}%`,
        ...autonomiaValores,
        ...valorPlazas,
      ],
      function (error, vehiculos) {
        if (error) {
          return response.status(500).json({
            success: false,
            error: "Error al obtener los vehículos",
            mensaje: error.message,
          });
        }
        response.status(200).json({
          success: true,
          data: vehiculos,
          total: vehiculos.length,
        });
      }
    );
  }
});

router.get("/api/disponibles", function (request, response) {
  db.query(
    "SELECT * FROM Vehiculos WHERE activo = 1 AND id_concesionario = ? ORDER BY marca, modelo",
    [request.session.usuario.id_concesionario],
    function (error, vehiculos) {
      if (error) {
        return response.status(500).json({
          success: false,
          error: "Error al obtener los vehículos",
          mensaje: error.message,
        });
      }
      response.status(200).json({
        success: true,
        vehiculos: vehiculos,
        total: vehiculos.length,
      });
    }
  );
});

router.post("/:id/puntuar", function (request, response) {
  const idVehiculo = request.params.id;
  const puntuacion = parseInt(request.body.puntuacion);
  db.queryOne(
    "SELECT * FROM Vehiculos WHERE id = ?",
    [idVehiculo],
    function (error, vehiculo) {
      if (error) {
        return response.status(500).json({
          success: false,
          error: "Error al obtener el vehículo",
          mensaje: error.message,
        });
      }
      let nuevaPuntuacion;
      if (vehiculo.puntuacion) {
        nuevaPuntuacion = (vehiculo.puntuacion + puntuacion) / 2;
      } else {
        nuevaPuntuacion = puntuacion;
      }
      db.execute(
        "UPDATE vehiculos SET puntuacion = ? WHERE id = ?",
        [nuevaPuntuacion, idVehiculo],
        function (error) {
          if (error) {
            return response.status(500).json({
              success: false,
              error: "Error al actualizar la puntuación",
              mensaje: error.message,
            });
          }
          return response
            .status(200)
            .json({ success: true, mensaje: puntuacion });
        }
      );
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
      response.status(200).render("nuevo-vehiculo", {
        nombrePagina: "Nuevo vehiculo",
        error: null,
        marca: "",
        modelo: "",
        matricula: "",
        anoMatriculacion: "",
        numeroPlazas: "",
        autonomia: "",
        color: "",
        concesionario: "",
        imagen: "",
        precioHora: "",
        esEdicion: false,
        vehiculoId: null,
        concesionarios: concesionarios,
      });
    }
  );
});

router.post("/admin/nuevo", verificarAdmin, function (request, response, next) {
  let {
    marca,
    modelo,
    matricula,
    anoMatriculacion,
    numeroPlazas,
    autonomia,
    color,
    concesionario,
    imagen,
    precioHora,
  } = request.body;

  function renderizarFormularioError(mensajeError) {
    db.query(
      "SELECT * FROM Concesionarios WHERE activo = 1 ORDER BY nombre",
      function (error, concesionarios) {
        if (error) {
          return next(error);
        }
        return response.status(400).render("nuevo-vehiculo", {
          nombrePagina: "Nuevo vehículo",
          error: mensajeError,
          marca: marca || "",
          modelo: modelo || "",
          matricula: matricula || "",
          anoMatriculacion: anoMatriculacion || "",
          numeroPlazas: numeroPlazas || "",
          autonomia: autonomia || "",
          color: color || "",
          concesionario: concesionario || "",
          imagen: imagen || "",
          precioHora: precioHora || "",
          esEdicion: false,
          vehiculoId: null,
          concesionarios: concesionarios,
        });
      }
    );
  }

  if (
    !marca ||
    !modelo ||
    !matricula ||
    !anoMatriculacion ||
    !numeroPlazas ||
    !autonomia ||
    !color ||
    !concesionario ||
    !precioHora
  ) {
    return renderizarFormularioError(
      "Todos los campos obligatorios deben estar completos"
    );
  }
  if (!imagen || imagen === "") {
    imagen = "LogoAureon.png";
  }
  matricula = matricula.toUpperCase();

  db.queryOne(
    "SELECT * FROM Vehiculos WHERE UPPER(matricula) = UPPER(?)",
    [matricula],
    function (error, vehiculoExistente) {
      if (error) {
        return next(error);
      }

      if (vehiculoExistente) {
        db.execute(
          `UPDATE Vehiculos 
           SET marca = ?, modelo = ?, anyo_matriculacion = ?, numero_plazas = ?, 
               autonomia_km = ?, color = ?, id_concesionario = ?, imagen = ?, precio_hora = ?, activo = 1
           WHERE matricula = ?`,
          [
            marca,
            modelo,
            parseInt(anoMatriculacion),
            parseInt(numeroPlazas),
            parseInt(autonomia),
            color,
            parseInt(concesionario),
            imagen,
            precioHora ? parseFloat(precioHora) : null,
            matricula,
          ],
          function (error, resultado) {
            if (error) {
              return next(error);
            }
            console.log("Vehículo actualizado/reactivado correctamente");
            response.redirect("/vehiculos");
          }
        );
      } else {
        db.execute(
          `INSERT INTO Vehiculos 
           (marca, modelo, matricula, anyo_matriculacion, numero_plazas, 
            autonomia_km, color, id_concesionario, imagen, estado, precio_hora, activo) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'disponible', ?, 1)`,
          [
            marca,
            modelo,
            matricula,
            parseInt(anoMatriculacion),
            parseInt(numeroPlazas),
            parseInt(autonomia),
            color,
            parseInt(concesionario),
            imagen,
            precioHora ? parseFloat(precioHora) : null,
          ],
          function (error, resultado) {
            if (error) {
              return next(error);
            }
            response.redirect("/vehiculos");
          }
        );
      }
    }
  );
});

router.get(
  "/admin/:id/editar",
  verificarAdmin,
  function (request, response, next) {
    const vehiculoId = parseInt(request.params.id);

    db.queryOne(
      "SELECT * FROM Vehiculos WHERE id = ?",
      [vehiculoId],
      function (error, vehiculo) {
        if (error) {
          return next(error);
        }
        if (!vehiculo) {
          return response.status(400).json({
            success: false,
            mensaje:
              "No se puede eliminar el vehículo porque tiene reservas activas",
          });
        }
        db.query(
          "SELECT * FROM Concesionarios WHERE activo = 1 ORDER BY nombre",
          function (error, concesionarios) {
            if (error) {
              return next(error);
            }
            response.status(200).render("nuevo-vehiculo", {
              nombrePagina: "Editar vehiculo",
              error: null,
              marca: vehiculo.marca || "",
              modelo: vehiculo.modelo || "",
              matricula: vehiculo.matricula || "",
              anoMatriculacion: vehiculo.anyo_matriculacion || "",
              numeroPlazas: vehiculo.numero_plazas || "",
              autonomia: vehiculo.autonomia_km || "",
              color: vehiculo.color || "",
              concesionario: vehiculo.id_concesionario || "",
              imagen: vehiculo.imagen || "",
              precioHora: vehiculo.precio_hora || "",
              esEdicion: true,
              vehiculoId: vehiculo.id,
              concesionarios: concesionarios,
            });
          }
        );
      }
    );
  }
);

router.post(
  "/admin/:id/editar",
  verificarAdmin,
  function (request, response, next) {
    const vehiculoId = parseInt(request.params.id);

    let {
      marca,
      modelo,
      matricula,
      anoMatriculacion,
      numeroPlazas,
      autonomia,
      color,
      concesionario,
      imagen,
      precioHora,
    } = request.body;

    function renderizarFormularioError(mensajeError) {
      db.query(
        "SELECT * FROM Concesionarios WHERE activo = 1 ORDER BY nombre",
        function (error, concesionarios) {
          if (error) {
            return next(error);
          }
          return response.status(400).render("nuevo-vehiculo", {
            nombrePagina: "Editar vehículo",
            error: mensajeError,
            marca: marca || "",
            modelo: modelo || "",
            matricula: matricula || "",
            anoMatriculacion: anoMatriculacion || "",
            numeroPlazas: numeroPlazas || "",
            autonomia: autonomia || "",
            color: color || "",
            concesionario: concesionario || "",
            imagen: imagen || "",
            precioHora: precioHora || "",
            esEdicion: true,
            vehiculoId: vehiculoId,
            concesionarios: concesionarios,
          });
        }
      );
    }

    if (
      !marca ||
      !modelo ||
      !matricula ||
      !anoMatriculacion ||
      !numeroPlazas ||
      !autonomia ||
      !color ||
      !concesionario ||
      !precioHora
    ) {
      return renderizarFormularioError(
        "Todos los campos obligatorios deben estar completos."
      );
    }

    if (!imagen || imagen === "") {
      imagen = "LogoAureon.png";
    }

    db.execute(
      `UPDATE Vehiculos 
     SET marca = ?, modelo = ?, anyo_matriculacion = ?, numero_plazas = ?, 
         autonomia_km = ?, color = ?, id_concesionario = ?, imagen = ?, precio_hora = ?
     WHERE id = ?`,
      [
        marca,
        modelo,
        parseInt(anoMatriculacion),
        parseInt(numeroPlazas),
        parseInt(autonomia),
        color,
        parseInt(concesionario),
        imagen,
        precioHora ? parseFloat(precioHora) : null,
        vehiculoId,
      ],
      function (error) {
        if (error) {
          return next(error);
        }
        response.redirect("/vehiculos");
      }
    );
  }
);

router.put("/admin/:id/eliminar", verificarAdmin, function (request, response) {
  const vehiculoId = parseInt(request.params.id);

  db.query(
    "SELECT COUNT(*) as total FROM Reservas WHERE id_vehiculo = ? AND estado = 'activa'",
    [vehiculoId],
    function (error, reservasActivas) {
      if (error) {
        return next(error);
      }
      if (reservasActivas[0].total > 0) {
        return response
          .status(400)
          .send(
            "No se puede eliminar el vehículo porque tiene reservas activas"
          );
      }
      db.execute(
        "UPDATE Vehiculos SET activo = 0 WHERE id = ?",
        [vehiculoId],
        function (error, resultado) {
          if (error) {
            return next(error);
          }
          response.json({ success: true });
        }
      );
    }
  );
});

module.exports = router;
