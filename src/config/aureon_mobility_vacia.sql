-- ========================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- Aureon Mobility - CON BAJAS LÓGICAS
-- ========================================

DROP DATABASE IF EXISTS aureon_mobility;

CREATE DATABASE aureon_mobility CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE aureon_mobility;

-- ========================================
-- TABLA: Concesionarios
-- ========================================
CREATE TABLE Concesionarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    ciudad VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono_contacto VARCHAR(50) NOT NULL,
    activo INT DEFAULT 1,  
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: Usuario (1 Concesionario --> * Usuarios)
-- ========================================
CREATE TABLE Usuario (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    activo INT DEFAULT 1,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'empleado') DEFAULT 'empleado',
    telefono BIGINT NULL,
    id_concesionario BIGINT NULL,
    FOREIGN KEY (id_concesionario) REFERENCES Concesionarios(id) ON DELETE SET NULL,
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: Preferencias (1 usuario --> 1 preferencia)
-- ========================================
CREATE TABLE Preferencias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL UNIQUE,
    tema ENUM('claro', 'oscuro') DEFAULT 'claro',
    contraste ENUM('normal', 'alto') DEFAULT 'normal',
    tam_fuente ENUM('pequeno', 'mediano', 'grande') DEFAULT 'mediano',
    atajos_personalizados JSON NULL,
    activo INT DEFAULT 1,  
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id) ON DELETE CASCADE,
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: Vehiculos (1 concesionario --> * vehiculos)
-- ========================================
CREATE TABLE Vehiculos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    matricula VARCHAR(20) NOT NULL UNIQUE,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    anyo_matriculacion INT NOT NULL,
    numero_plazas INT NOT NULL,
    autonomia_km INT NOT NULL,
    color VARCHAR(50) NOT NULL,
    imagen VARCHAR(255) DEFAULT 'default.png',
    estado ENUM('disponible', 'reservado', 'mantenimiento') DEFAULT 'disponible',
    id_concesionario BIGINT NOT NULL,
    precio_hora BIGINT NULL,
    puntuacion FLOAT NULL,
    activo INT DEFAULT 1, 
    FOREIGN KEY (id_concesionario) REFERENCES Concesionarios(id) ON DELETE CASCADE,
    INDEX idx_activo (activo),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: Cliente
-- ========================================
CREATE TABLE Cliente (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    telefono BIGINT NOT NULL,
    dni CHAR(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: Reservas
-- ========================================
CREATE TABLE Reservas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    id_vehiculo BIGINT NOT NULL,
    id_cliente BIGINT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    estado ENUM('activa', 'finalizada', 'cancelada') DEFAULT 'activa',
    km_recorridos BIGINT DEFAULT 0,
    incidencias_reportadas TEXT NULL,
    activo INT DEFAULT 1, 
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (id_vehiculo) REFERENCES Vehiculos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id) ON DELETE CASCADE,
    INDEX idx_activo (activo),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================a
-- INSERCIÓN DE ADMIN INICIAL
-- ========================================

INSERT INTO Concesionarios (nombre, ciudad, direccion, telefono_contacto, activo) VALUES
('Aureon Mobility Getafe', 'Getafe', 'Calle Madrid 123', '+34 912 345 678', 1);

INSERT INTO Usuario (activo, nombre, correo, contraseña, rol, telefono, id_concesionario) VALUES
(1, 'Admin', 'admin@aureon.es', '$2b$10$.uljud.mlswZ2U1wZ2BBDuNncp0sqbHvosAXchE1FeCLlMsS5UEla', 'admin', 600000000, 1);
