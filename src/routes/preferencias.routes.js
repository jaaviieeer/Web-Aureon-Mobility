const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/api", function (request, response) {
  const usuarioId = request.session.usuario.id;

  db.queryOne(
    "SELECT tema, contraste, tam_fuente, atajos_personalizados FROM Preferencias WHERE id_usuario = ? AND activo = 1",
    [usuarioId],
    function (error, preferencias) {
      if (error) {
        return response.status(500).json({
          success: false,
          message: "Error al obtener preferencias: " + error.message,
        });
      }

      if (!preferencias) {
        db.execute(
          "INSERT INTO Preferencias (id_usuario, tema, contraste, tam_fuente, activo) VALUES (?, 'claro' , 'normal', 'mediano', 1)",
          [usuarioId],
          function (errorInsert, resultado) {
            if (errorInsert) {
              console.error(
                "Error al crear preferencias:",
                errorInsert.message
              );
              return response.status(500).json({
                success: false,
                message: "Error al crear preferencias",
              });
            }

            const preferenciasDefault = {
              tema: "claro",
              contraste: "normal",
              tam_fuente: "mediano",
              atajos_personalizados: null,
            };

            request.session.preferencias = preferenciasDefault;

            return response.json({
              success: true,
              preferencias: preferenciasDefault,
            });
          }
        );
      } else {
        if (
          preferencias.atajos_personalizados &&
          typeof preferencias.atajos_personalizados === "string"
        ) {
          try {
            preferencias.atajos_personalizados = JSON.parse(
              preferencias.atajos_personalizados
            );
          } catch (error) {
            preferencias.atajos_personalizados = null;
          }
        }
        request.session.preferencias = preferencias;

        console.log("Preferencias obtenidas:", preferencias);
        return response.json({
          success: true,
          preferencias: preferencias,
        });
      }
    }
  );
});

router.post("/api/guardar", function (request, response) {
  const usuarioId = request.session.usuario.id;
  const { tema, contraste, tam_fuente, atajos_personalizados } = request.body;

  if (!tema || !contraste || !tam_fuente) {
    return response.status(400).json({
      success: false,
      message: "Datos incompletos",
    });
  }

  const temasValidos = ["claro", "oscuro"];
  const contrastesValidos = ["normal", "alto"];
  const tamanosValidos = ["pequeno", "mediano", "grande"];

  if (
    !temasValidos.includes(tema) ||
    !contrastesValidos.includes(contraste) ||
    !tamanosValidos.includes(tam_fuente)
  ) {
    return response.status(400).json({
      success: false,
      message: "Valores inválidos",
    });
  }

  const atajosJSON = atajos_personalizados
    ? JSON.stringify(atajos_personalizados)
    : null;

  db.queryOne(
    "SELECT id FROM Preferencias WHERE id_usuario = ? AND activo = 1",
    [usuarioId],
    function (error, preferenciaExistente) {
      if (error) {
        return response.status(500).json({
          success: false,
          message: "Error al verificar preferencias",
        });
      }

      if (preferenciaExistente) {

        db.execute(
          "UPDATE Preferencias SET tema = ?, contraste = ?, tam_fuente = ?, atajos_personalizados=? WHERE id_usuario = ? AND activo = 1",
          [tema, contraste, tam_fuente, atajosJSON, usuarioId],
          function (errorUpdate) {
            if (errorUpdate) {
              console.error(
                "Error al actualizar preferencias:",
                errorUpdate.message
              );
              return response.status(500).json({
                success: false,
                message: "Error al actualizar preferencias",
              });
            }

            request.session.preferencias = {
              tema,
              contraste,
              tam_fuente,
              atajos_personalizados,
            };

            return response.json({
              success: true,
              message: "Preferencias guardadas correctamente",
            });
          }
        );
      } else {
        db.execute(
          "INSERT INTO Preferencias (id_usuario,tema, contraste, tam_fuente, atajos_personalizados, activo) VALUES (?,?, ?, ?,?, 1)",
          [usuarioId, tema, contraste, tam_fuente, atajosJSON],
          function (errorInsert, resultado) {
            if (errorInsert) {
              console.error(
                "Error al crear preferencias:",
                errorInsert.message
              );
              return response.status(500).json({
                success: false,
                message: "Error al crear preferencias",
              });
            }

            request.session.preferencias = {
              tema,
              contraste,
              tam_fuente,
              atajos_personalizados,
            };

            return response.json({
              success: true,
              message: "Preferencias guardadas correctamente",
            });
          }
        );
      }
    }
  );
});

module.exports = router;
