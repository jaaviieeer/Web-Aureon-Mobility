"use strict";

function verificarAutenticacion(request, response, next) {
  if (request.session && request.session.usuario) {
    return next();
  }

  response.redirect("/login");
}

function verificarAdmin(request, response, next) {
  if (!request.session || !request.session.usuario) {
    return response.status(401).render("login", {
      nombrePagina: "Iniciar Sesión",
      error: "Debes iniciar sesión para acceder a esta página",
      correo: "",
    });
  }

  if (request.session.usuario.rol !== "admin") {
    return response.status(403).render("error403", {
      nombrePagina: "Acceso Denegado",
      mensaje:
        "No tienes permisos para acceder a esta página. Se requiere rol de administrador.",
    });
  }

  next();
}


module.exports = {
  verificarAutenticacion,
  verificarAdmin,
};
