"use strict";
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const app = express();
const path = require("path");
const db = require("./db");
const morgan = require("morgan");
const port = 3000;
const ficherosEstaticos = path.join(__dirname, "public");
const {
  verificarAutenticacion,
  verificarAdmin,
} = require("./routes/auth.middlewares");

const vehiculosRouter = require("./routes/vehiculos.routes");
const reservasRouter = require("./routes/reservas.routes");
const adminRouter = require("./routes/admin.routes");
const rutasGeneralesRouter = require("./routes/routes");
const usuariosRouter = require("./routes/usuarios.routes");
const concesionariosRouter = require("./routes/concesionarios.routes");
const preferenciasRouter = require("./routes/preferencias.routes");
const mapaRouter = require("./routes/mapa.routes");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(ficherosEstaticos));
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: "que_nadie_se_entere_del_secreto",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 10 },
  })
);

app.use(function (request, response, next) {
  response.locals.usuario = request.session.usuario || null;
  next();
});

app.use(function (request, response, next) {
  if (request.session.usuario) {
    return next();
  }

  if (request.cookies.recordar_usuario) {
    try {
      const datosUsuario = JSON.parse(request.cookies.recordar_usuario);

      db.queryOne(
        "SELECT * FROM Usuario WHERE id = ?",
        [datosUsuario.id],
        function (error, usuario) {
          if (error) {
            response.clearCookie("recordar_usuario");
            return next();
          }

          if (usuario) {
            request.session.usuario = {
              id: usuario.id,
              nombre: usuario.nombre,
              rol: usuario.rol,
              correo: usuario.correo,
              id_concesionario: usuario.id_concesionario,
            };

            response.locals.usuario = request.session.usuario;
            console.log(
              "Se le ha restaurado la sesión al usuario: ",
              usuario.nombre
            );
          } else {
            response.clearCookie("recordar_usuario");
            console.log("Ay la cookie, que se me ha eliminado.");
          }

          next();
        }
      );
    } catch (error) {
      response.clearCookie("recordar_usuario");
      next();
    }
  } else {
    next();
  }
});

app.use("/", rutasGeneralesRouter);

app.use("/vehiculos", vehiculosRouter);

app.use("/reservas", verificarAutenticacion, reservasRouter);

app.use("/concesionarios", concesionariosRouter);

app.use("/admin", verificarAdmin, adminRouter);

app.use("/usuarios", verificarAutenticacion, usuariosRouter);

app.use("/preferencias", verificarAutenticacion, preferenciasRouter);

app.use("/mapa", mapaRouter);

app.use(function (request, response, next) {
  response.status(404).render("error404", {
    url: request.url,
    usuario: request.session.usuario || null,
    nombrePagina: "Error 404",
  });
});

app.use(function (error, request, response, next) {
  response.status(500).render("error500", {
    mensaje: error.message,
    pila: error.stack,
    usuario: request.session.usuario || null,
    nombrePagina: "Error 500",
  });
});

app.listen(port, function (err) {
  if (err) {
    console.error("No se pudo inicializar el servidor: " + err.message);
  } else {
    console.log("\n");
    console.log("   █████╗ ██╗   ██╗██████╗ ███████╗ ██████╗ ███╗   ██╗");
    console.log("  ██╔══██╗██║   ██║██╔══██╗██╔════╝██╔═══██╗████╗  ██║");
    console.log("  ███████║██║   ██║██████╔╝█████╗  ██║   ██║██╔██╗ ██║");
    console.log("  ██╔══██║██║   ██║██╔══██╗██╔══╝  ██║   ██║██║╚██╗██║");
    console.log("  ██║  ██║╚██████╔╝██║  ██║███████╗╚██████╔╝██║ ╚████║");
    console.log("  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝");
    console.log("");
    console.log(
      "  ███╗   ███╗ ██████╗ ██████╗ ██╗██╗     ██╗████████╗██╗   ██╗"
    );
    console.log(
      "  ████╗ ████║██╔═══██╗██╔══██╗██║██║     ██║╚══██╔══╝╚██╗ ██╔╝"
    );
    console.log(
      "  ██╔████╔██║██║   ██║██████╔╝██║██║     ██║   ██║    ╚████╔╝ "
    );
    console.log(
      "  ██║╚██╔╝██║██║   ██║██╔══██╗██║██║     ██║   ██║     ╚██╔╝  "
    );
    console.log(
      "  ██║ ╚═╝ ██║╚██████╔╝██████╔╝██║███████╗██║   ██║      ██║   "
    );
    console.log(
      "  ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚═╝╚══════╝╚═╝   ╚═╝      ╚═╝   "
    );
    console.log("\n");
    console.log("=".repeat(70));
    console.log("Servidor Express iniciado correctamente");
    console.log(`Puerto: ${port}`);
    console.log(`URL: http://localhost:${port}`);
    console.log("=".repeat(70));
    console.log("\n");
  }
});
