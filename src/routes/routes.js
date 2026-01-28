"use strict";

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");

router.get("/", function (request, response) {
  response.status(200).render("index", { nombrePagina: "Aureon Mobility" });
});

router.get("/login", function (request, response) {
  response.status(200).render("login", {
    nombrePagina: "Inicia sesion",
    error: null,
    correo: "",
  });
});

router.post("/login", function (request, response, next) {
  const { correo, contraseña, recordarme } = request.body;

  if (!correo || !contraseña) {
    return response.render("login", {
      nombrePagina: "Inicia sesion",
      error: "Por favor, completa todos los campos",
      correo: correo || "",
    });
  }

  if (!correo.endsWith("@aureon.es")) {
    return response.render("login", {
      nombrePagina: "Inicia sesion",
      error: "Debe usar un correo corporativo (@aureon.es)",
      correo: correo || "",
    });
  }

  db.queryOne(
    "SELECT * FROM Usuario WHERE correo = ? AND activo = 1",
    [correo],
    function (error, usuario) {
      if (error) {
        return next(error);
      }

      if (!usuario) {
        return response.render("login", {
          nombrePagina: "Inicia sesion",
          error: "El correo o la contraseña son incorrectos.",
          correo: correo,
        });
      }

      bcrypt.compare(
        contraseña,
        usuario.contraseña,
        function (error, contraseñaValida) {
          if (error) {
            return next(error);
          }

          if (!contraseñaValida) {
            console.log("La contraseña dada para ese correo no es correcta...");
            return response.render("login", {
              nombrePagina: "Inicia sesion",
              error: "El correo o la contraseña son incorrectos.",
              correo: correo,
            });
          }

          request.session.usuario = {
            id: usuario.id,
            nombre: usuario.nombre,
            rol: usuario.rol,
            correo: usuario.correo,
            id_concesionario: usuario.id_concesionario,
          };

          if (recordarme === "on") {
            const unMes = 30 * 24 * 60 * 60 * 1000;

            response.cookie(
              "recordar_usuario",
              JSON.stringify({
                id: usuario.id,
                correo: usuario.correo,
                nombre: usuario.nombre,
                rol: usuario.rol,
              }),
              {
                maxAge: unMes,
                httpOnly: true,
                secure: false,
              }
            );
            request.session.cookie.maxAge = unMes;
          } else {
            request.session.cookie.maxAge = 1000 * 60 * 10;
          }

          response.redirect("/");
        }
      );
    }
  );
});

module.exports = router;
