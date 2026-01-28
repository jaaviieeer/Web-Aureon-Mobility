"use strict";

const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "aureon_mobility",
  connectionLimit: 10,
});

function verficarConexion(callback) {
  pool.query("SELECT 1+1 AS resultado", function (error, rows) {
    if (error) {
      if (callback) {
        return callback(error, false);
      }
    }

    if (callback) {
      return callback(null, true);
    }

    return true;
  });
}

function query(sql, params, callback) {
  if (typeof params === "function") {
    callback = params;
    params = [];
  }

  pool.query(sql, params, function (error, rows) {
    if (error) {
      return callback(error, null);
    }

    callback(null, rows);
  });
}

function execute(sql, params, callback) {
  if (typeof params === "function") {
    callback = params;
    params = [];
  }

  pool.execute(sql, params, function (error, result) {
    if (error) {
      return callback(error, false);
    }

    callback(null, result);
  });
}

function queryOne(sql, params, callback) {
  if (typeof params === "function") {
    callback = params;
    params = [];
  }

  pool.query(sql, params, function (error, rows) {
    if (error) {
      return callback(error, null);
    }

    callback(null, rows[0] || null);
  });
}

function cerrarConexion() {
  pool.end(function (error) {
    if (error) {
      return callback(error);
    }

    if (callback) {
        callback(null);
    }
  });
}

module.exports = {
  pool,
  verficarConexion,
  query,
  execute,
  queryOne,
  cerrarConexion,
};
