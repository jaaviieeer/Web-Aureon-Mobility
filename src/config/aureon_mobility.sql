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

-- ========================================
-- INSERCIÓN DE DATOS INICIALES
-- ========================================

INSERT INTO Concesionarios (nombre, ciudad, direccion, telefono_contacto, activo) VALUES
('Aureon Mobility Atocha', 'Madrid', 'Calle Atocha 45', '910112233', 1),
('Aureon Mobility Gran Vía', 'Madrid', 'Gran Vía 12', '910223344', 1),
('Aureon Mobility Goya', 'Madrid', 'Calle Goya 88', '910334455', 1),
('Aureon Mobility Castellana', 'Madrid', 'Paseo de la Castellana 210', '910445566', 1),
('Aureon Mobility Príncipe Pío', 'Madrid', 'Cuesta de San Vicente 19', '910556677', 1),
('Aureon Mobility Chamberí', 'Madrid', 'Calle Fuencarral 130', '910667788', 1),
('Aureon Mobility Malasaña', 'Madrid', 'Calle Espíritu Santo 25', '910778899', 1),
('Aureon Mobility Retiro', 'Madrid', 'Calle O''Donnell 21', '910889900', 1),
('Aureon Mobility Ciudad Lineal', 'Madrid', 'Calle Alcalá 420', '910990011', 1),
('Aureon Mobility Salamanca', 'Madrid', 'Calle Serrano 78', '911001122', 1),
('Aureon Mobility Tetuán', 'Madrid', 'Calle Bravo Murillo 250', '911112233', 1),
('Aureon Mobility Delicias', 'Madrid', 'Paseo de las Delicias 130', '911223344', 1),
('Aureon Mobility Vallecas', 'Madrid', 'Avenida de la Albufera 150', '911334455', 1),
('Aureon Mobility Carabanchel', 'Madrid', 'Calle General Ricardos 200', '911445566', 1),
('Aureon Mobility Usera', 'Madrid', 'Avenida Rafaela Ybarra 30', '911556677', 1),
('Aureon Mobility Hortaleza', 'Madrid', 'Avenida de San Luis 80', '911667788', 1),
('Aureon Mobility Moncloa', 'Madrid', 'Calle Princesa 55', '911778899', 1),
('Aureon Mobility Arganzuela', 'Madrid', 'Paseo de Yeserías 10', '911889900', 1),
('Aureon Mobility Barajas', 'Madrid', 'Avenida de Logroño 310', '912001122', 1),
('Aureon Mobility Las Rosas', 'Madrid', 'Avenida de Guadalajara 90', '912112233', 1),
('Aureon Mobility Barcelona Centro', 'Barcelona', 'Carrer de Balmes 250', '931112233', 1),
('Aureon Mobility Sagrada Familia', 'Barcelona', 'Carrer Mallorca 420', '931223344', 1),
('Aureon Mobility Poblenou', 'Barcelona', 'Rambla del Poblenou 78', '931334455', 1),
('Aureon Mobility Valencia Norte', 'Valencia', 'Avenida Aragón 18', '961112233', 1),
('Aureon Mobility Valencia Centro', 'Valencia', 'Carrer Colón 55', '961223344', 1),
('Aureon Mobility Sevilla Centro', 'Sevilla', 'Avenida Constitución 32', '954112233', 1),
('Aureon Mobility Triana', 'Sevilla', 'Calle San Jacinto 80', '954223344', 1),
('Aureon Mobility Bilbao Abando', 'Bilbao', 'Gran Vía 45', '944112233', 1),
('Aureon Mobility San Mamés', 'Bilbao', 'Calle Luis Briñas 12', '944223344', 1),
('Aureon Mobility Zaragoza Centro', 'Zaragoza', 'Paseo Independencia 20', '976112233', 1),
('Aureon Mobility Valencia Sur', 'Valencia', 'Avenida Ausiàs March 120', '961334455', 1),
('Aureon Mobility Málaga Centro', 'Málaga', 'Calle Larios 15', '952112233', 1),
('Aureon Mobility Marbella', 'Málaga', 'Avenida Ricardo Soriano 60', '952223344', 1),
('Aureon Mobility Cádiz Centro', 'Cádiz', 'Avenida Andalucía 85', '956112233', 1),
('Aureon Mobility Córdoba', 'Córdoba', 'Avenida Medina Azahara 10', '957112233', 1),
('Aureon Mobility Granada', 'Granada', 'Camino de Ronda 180', '958112233', 1),
('Aureon Mobility Valladolid', 'Valladolid', 'Paseo Zorrilla 45', '983112233', 1),
('Aureon Mobility Gijón', 'Gijón', 'Avenida Constitución 22', '984112233', 1),
('Aureon Mobility Oviedo', 'Oviedo', 'Calle Uría 52', '985112233', 1),
('Aureon Mobility Santander', 'Santander', 'Calle Burgos 5', '942112233', 1),
('Aureon Mobility A Coruña', 'A Coruña', 'Calle Real 142', '981112233', 1),
('Aureon Mobility Vigo', 'Vigo', 'Avenida Gran Vía 92', '986112233', 1),
('Aureon Mobility Pamplona', 'Pamplona', 'Avenida Carlos III 40', '948112233', 1),
('Aureon Mobility Murcia', 'Murcia', 'Gran Vía Escultor Salzillo 15', '968112233', 1),
('Aureon Mobility Alicante', 'Alicante', 'Avenida Maisonnave 20', '965112233', 1);

INSERT INTO Usuario (activo, nombre, correo, contraseña, rol, telefono, id_concesionario) VALUES
(1, 'Admin', 'admin@aureon.es', '$2b$10$Xt77/eS39g.XnH2axZHfseyjgSSOwh9za6HdVN/RszR6FBBJy/RD6', 'admin', 600000000, 1), -- JorgetoNital1234!
(1,'Carlos Martín','carlos.martin@aureon.es','$2b$10$1rZqS3CqK2P4b8D4mD4P9ekuGgN1gPCoorBrKjZD0fY8xFJvQXw9y','admin',612345001,1), -- CarM!2024x
(1,'Lucía Ortega','lucia.ortega@aureon.es','$2b$10$L0JfHtz6xG0pH1tI7WJQ3uj5kzBGD5s3Cj0H9nzFj6KKmP6aE3c2K','empleado',622345002,2), -- LucO#89ms
(1,'Javier López','javier.lopez@aureon.es','$2b$10$Q3p2c7hF1uCX9dPpE8C2Be1VJbYkQw2NpycD0ZpSsjq6ZyCLlK6iO','admin',632345003,3), -- JavL*2025f
(1,'Marta Ruiz','marta.ruiz@aureon.es','$2b$10$Qj5fN7pDx3W6kTeqQ4mujeHYW9iVX0QvNxT63v/PUYfU4AArHqXDC','empleado',642345004,4), -- MarR&91Lf
(1,'Alberto Díaz','alberto.diaz@aureon.es','$2b$10$K8Vqcd9G1lNscGnwO25R1uVxI6F9pOpa/ps2XQtFD2cnhkq7PZP2e','empleado',652345005,5), -- AlbD@2030z
(1,'Sofía Gómez','sofia.gomez@aureon.es','$2b$10$TbYpP7wzjPjDN8hE.8fx1eWQYpCzRYnoWnhsV/ZP1oQHqdnKN4Rra','empleado',662345006,6), -- SofG+77Kt
(1,'Mario Sánchez','mario.sanchez@aureon.es','$2b$10$zTgJcIjk8GJazgD1uD/uxu5dG0Kgm5EwVmV8/7XhSvXbpz3C6oGMy','empleado',672345007,7), -- MarS!08Tx
(1,'Paula Herrera','paula.herrera@aureon.es','$2b$10$teZcvfW0MU//otD7P7xDZuPFDa3Yy2P5iA8f7FI9kVXj9PLvrvFIm','empleado',682345008,8), -- PauH#93qL
(1,'Raúl Torres','raul.torres@aureon.es','$2b$10$9pY2qArE3l5MN7d2cXJ53uP5iD6kVnBoYzaYk5wG3g9Zb0Ox1K6f.','admin',692345009,9), -- RauT=55Mn
(1,'Nerea Ibáñez','nerea.ibanez@aureon.es','$2b$10$rG5cOmYft2Tf3hQUXKYs1.WdU9hQzZjRbDhvPpVvy5yN/.yH9BpHa','empleado',612345010,10), -- NerI*14Pw
(1,'Rubén Santos','ruben.santos@aureon.es','$2b$10$X1xwq6jCOfzvhunR5h6Ufu9E4l0FzEo5gKhO0mvr2xqYx9cXuWAje','empleado',622345011,11), -- RubS!44xx
(1,'Irene Vega','irene.vega@aureon.es','$2b$10$k.Jl95lTfq9E1UpzxFwhPuk1j1U0NX1EHrFSTm1lUeUBqEhJ5ZCVu','empleado',632345012,12), -- IreV@2022L
(1,'Adrián Pardo','adrian.pardo@aureon.es','$2b$10$ITpnYyWm6N2CpFltQroaIu0xUPFfWrqDh45fzW5u2krgIFkfkZ8t6','empleado',642345013,13), -- AdrP$90Az
(1,'Clara Esteban','clara.esteban@aureon.es','$2b$10$JjTfiCq8fhh2MZ7eimv8NOtjoaZo6D0pu67MpFz.F/cDA7HnhyYFO','empleado',652345014,14), -- ClaE&72kr
(1,'Pablo Navarro','pablo.navarro@aureon.es','$2b$10$6qfA2yKEHKD6CjcpU9uWTuOxqH0ev4BpJTcXnZ2JiEsGuOE0Jh5ZC','empleado',662345015,15), -- PabN#22Ux
(1,'Andrea Costa','andrea.costa@aureon.es','$2b$10$gnZCwe5obvT1S15yVq0FluYB4nxC6RlkzBneS9Z6kJ4/NLLSzy.7y','empleado',672345016,16), -- AndC=67Lp
(1,'Diego Reina','diego.reina@aureon.es','$2b$10$5ZelyJOwyTXJLWgBqBBEYO2Wz8f9AQji7u29FVvukDNGwYLOhpBOe','empleado',682345017,17), -- DieR+99Tf
(1,'Helena Soto','helena.soto@aureon.es','$2b$10$Av1qg8M6XyHwR.KepVz7juwv5sbbzvSb.VUHqv8yqzSsJtX2rBTzm','empleado',692345018,18), -- HelS!08Qp
(1,'Tomás Prieto','tomas.prieto@aureon.es','$2b$10$Dfyt6DqgMqXPy6p7Oy8OQOTjcbzajY0QvhqBpclQt4vud2n0aN4Qe','empleado',612345019,19), -- TomP$47Zx
(1,'Laura Molina','laura.molina@aureon.es','$2b$10$1v4Vnqsy6qv4V5CTtIzmDODHZ9sYrFo4NChIrKMgUZSUL8gIaRX6G','empleado',622345020,20), -- LauM?31Rw
(1,'Elena Robles','elena.robles@aureon.es','$2b$10$HgA8bJ8Y5nWb4Ox1f9RaTe0FIF7RefN4HkUzRHcowf3sxutHOu.wa','empleado',632345021,31), -- EleR!31Tx
(1,'Jorge Castaño','jorge.castano@aureon.es','$2b$10$xfm6d6kJkU0DjQj5igOdVuHHmLXLfcWSpG8BCXqWNNVYizxFHC6yK','admin',642345022,32), -- JorC#52Lm
(1,'Beatriz Soler','beatriz.soler@aureon.es','$2b$10$Ls6xZPyhtyP3kqGptZGB4OaeDz5P8n0wxPdCeCpZv6Dh/SWJegytq','empleado',652345023,33), -- BeaS@77Kp
(1,'Álvaro Campos','alvaro.campos@aureon.es','$2b$10$Yp5FubkA2eToRLqps6fCje9hS81hdZ5Ad2Whi0W3xVVYzS6uXU6SO','empleado',662345024,34), -- AlvC=19Qr
(1,'Rocío del Mar','rocio.delmar@aureon.es','$2b$10$b/.S7Jhqh.wtnjMRYskCNuOlI4JNo6C8BUsxHnGcVKW8l.GgGQx0u','empleado',672345025,35), -- RocD*82Mt
(1,'Manuel Iboria','manuel.iboria@aureon.es','$2b$10$9xj6iAVeF/0S1nJAwvdSvgHsxHcfWj90pFmAqFfFfIRxh1AAjI.ZO','empleado',682345026,36), -- ManI$65Wf
(1,'Sara Domínguez','sara.dominguez@aureon.es','$2b$10$4JGrw7mYjSuIwmVnEotEl.nKpB3pfPJmI.4iHmxuaqYXg4MqMO7yu','empleado',692345027,37), -- SarD+84Yt
(1,'Óscar Montes','oscar.montes@aureon.es','$2b$10$FVp/p9beLwsS4nMY9ZqxQeIGTXmq1O1FQtFm4/W0rM5V0pEBOI0dK','empleado',612345028,38), -- OscM=41Pb
(1,'Patricia Llamas','patricia.llamas@aureon.es','$2b$10$dMnPJt0Q6VlE9Ad8Lxa.eOIPnYLQ2XPQQTkxP5F0Y5h534xNWCux2','admin',622345029,39), -- PatL@93Vc
(1,'Germán Arroyo','german.arroyo@aureon.es','$2b$10$zbD6TgzjmdDEphUuOKFg6ej5Ydd02q2EHPulmB4lX8F2UoucZi8US','empleado',632345030,40), -- GerA!28Nx
(1,'Silvia Rivas','silvia.rivas@aureon.es','$2b$10$bTWtC0S/6UcHlb9QW90w6Oxxp7zT9KoDL4sp2O/tkdJRAQqNwp1My','empleado',642345031,41), -- SilR#72Fd
(1,'Hugo Caballero','hugo.caballero@aureon.es','$2b$10$RBHMrYx43l9k.B1y5ZzUU.WwK6E0xTKEQmVw0Pdsz8jhQLwcQx09C','empleado',652345032,42), -- HugC*55Lm
(1,'Melisa Quintana','melisa.quintana@aureon.es','$2b$10$m5Qx2wE5Rfa5E5MR1mWnDOrEnxofeuF1T9HjkLuOa28/GuSZIlY3y','empleado',662345033,43), -- MelQ=38Ts
(1,'Álex Bernal','alex.bernal@aureon.es','$2b$10$eVlqXzP4M9wW95sgWmSsqeQMSxoHqCwxaE/AiWq3bwo3xAOCJPp4q','empleado',672345034,44), -- AleB?66Wx
(1,'Nuria Peñalver','nuria.penalver@aureon.es','$2b$10$grI0VnDRYqUwfIkHQZdL0u4wJ2n1DhqXEVcVuO72G4h2uK9pAxPhS','empleado',682345035,45); -- NurP+21Rq


INSERT INTO Preferencias (id_usuario, tema, contraste, tam_fuente, atajos_personalizados, activo) VALUES
(1, 'claro', 'normal', 'mediano', NULL, 1);

INSERT INTO Vehiculos (matricula, marca, modelo, anyo_matriculacion, numero_plazas, autonomia_km, color, imagen, estado, id_concesionario, precio_hora, puntuacion, activo) VALUES
('1001-TES', 'Tesla', 'Model 1', 2022, 5, 350, 'Blanco', 'tesla1.png', 'disponible', 1, 15, 4.5, 1),
('1002-TES', 'Tesla', 'Model 2', 2022, 5, 360, 'Rojo', 'tesla2.png', 'disponible', 1, 16, 4.6, 1),
('1003-TES', 'Tesla', 'Model 3', 2022, 5, 370, 'Azul', 'tesla3.png', 'disponible', 1, 17, 4.7, 1),
('2001-BYD', 'BYD', 'Seal 1', 2023, 5, 300, 'Negro', 'byd_seal1.png', 'disponible', 2, 12, 4.2, 1),
('2002-BYD', 'BYD', 'Seal 2', 2023, 5, 310, 'Blanco', 'byd_seal2.png', 'disponible', 2, 13, 4.3, 1),
('2003-BYD', 'BYD', 'Seal 3', 2023, 5, 320, 'Azul', 'byd_seal3.png', 'disponible', 2, 14, 4.4, 1),
('3001-VWW', 'Volkswagen', 'ID.1', 2021, 5, 270, 'Gris', 'VW1.png', 'disponible', 3, 13, 4.0, 1),
('3002-VWW', 'Volkswagen', 'ID.2', 2021, 5, 280, 'Negro', 'VW2.png', 'disponible', 3, 14, 4.1, 1),
('3003-VWW', 'Volkswagen', 'ID.3', 2021, 5, 290, 'Blanco', 'VW3.png', 'disponible', 3, 15, 4.2, 1),
('4001-VOL', 'Volvo', 'Volvo 1', 2022, 5, 400, 'Negro', 'volvo1.png', 'disponible', 4, 18, 4.5, 1),
('4002-VOL', 'Volvo', 'Volvo 2', 2022, 5, 410, 'Blanco', 'volvo2.png', 'disponible', 4, 19, 4.6, 1),
('4003-VOL', 'Volvo', 'Volvo 3', 2022, 5, 420, 'Gris', 'volvo3.png', 'disponible', 4, 20, 4.7, 1),
('5001-TES', 'Tesla', 'Model 4', 2022, 5, 380, 'Negro', 'tesla4.png', 'disponible', 5, 18, 4.8, 1),
('5002-TES', 'Tesla', 'Model 5', 2022, 5, 390, 'Plateado', 'tesla5.png', 'disponible', 5, 19, 4.9, 1),
('5003-TES', 'Tesla', 'Model 6', 2022, 5, 400, 'Azul', 'tesla6.png', 'disponible', 5, 20, 5.0, 1),
('6001-BYD', 'BYD', 'Seal 1', 2023, 5, 300, 'Negro', 'byd_seal1.png', 'disponible', 6, 12, 4.2, 1),
('6002-BYD', 'BYD', 'Seal 2', 2023, 5, 310, 'Blanco', 'byd_seal2.png', 'disponible', 6, 13, 4.3, 1),
('6003-BYD', 'BYD', 'Seal 3', 2023, 5, 320, 'Azul', 'byd_seal3.png', 'disponible', 6, 14, 4.4, 1),
('7001-VWW', 'Volkswagen', 'ID.4', 2021, 5, 300, 'Rojo', 'VW4.png', 'disponible', 7, 16, 4.3, 1),
('7002-VWW', 'Volkswagen', 'ID.5', 2021, 5, 310, 'Azul', 'VW5.png', 'disponible', 7, 17, 4.4, 1),
('7003-VOL', 'Volvo', 'Volvo 1', 2022, 5, 400, 'Gris', 'volvo1.png', 'disponible', 7, 18, 4.5, 1),
('8001-TES', 'Tesla', 'Model 1', 2022, 5, 350, 'Blanco', 'tesla1.png', 'disponible', 8, 15, 4.5, 1),
('8002-BYD', 'BYD', 'Seal 2', 2023, 5, 310, 'Negro', 'byd_seal2.png', 'disponible', 8, 13, 4.3, 1),
('8003-VWW', 'Volkswagen', 'ID.3', 2021, 5, 290, 'Blanco', 'VW3.png', 'disponible', 8, 15, 4.2, 1),
('9001-VOL', 'Volvo', 'Volvo 2', 2022, 5, 410, 'Blanco', 'volvo2.png', 'disponible', 9, 19, 4.6, 1),
('9002-TES', 'Tesla', 'Model 2', 2022, 5, 360, 'Rojo', 'tesla2.png', 'disponible', 9, 16, 4.6, 1),
('9003-BYD', 'BYD', 'Seal 3', 2023, 5, 320, 'Azul', 'byd_seal3.png', 'disponible', 9, 14, 4.4, 1),
('0004-VWW', 'Volkswagen', 'ID.1', 2021, 5, 270, 'Gris', 'VW1.png', 'disponible', 10, 13, 4.0, 1),
('0005-VOL', 'Volvo', 'Volvo 3', 2022, 5, 420, 'Gris', 'volvo3.png', 'disponible', 10, 20, 4.7, 1),
('0006-TES', 'Tesla', 'Model 3', 2022, 5, 370, 'Azul', 'tesla3.png', 'disponible', 10, 17, 4.7, 1),
('1004-BYD', 'BYD', 'Seal 1', 2023, 5, 300, 'Negro', 'byd_seal1.png', 'disponible', 11, 12, 4.2, 1),
('1005-TES', 'Tesla', 'Model 4', 2022, 5, 380, 'Negro', 'tesla4.png', 'disponible', 11, 18, 4.8, 1),
('1006-VWW', 'Volkswagen', 'ID.2', 2021, 5, 280, 'Negro', 'VW2.png', 'disponible', 11, 14, 4.1, 1),
('2004-VOL', 'Volvo', 'Volvo 1', 2022, 5, 400, 'Negro', 'volvo1.png', 'disponible', 12, 18, 4.5, 1),
('2005-BYD', 'BYD', 'Seal 2', 2023, 5, 310, 'Blanco', 'byd_seal2.png', 'disponible', 12, 13, 4.3, 1),
('2006-TES', 'Tesla', 'Model 5', 2022, 5, 390, 'Plateado', 'tesla5.png', 'disponible', 12, 19, 4.9, 1),
('3004-VWW', 'Volkswagen', 'ID.3', 2021, 5, 290, 'Blanco', 'VW3.png', 'disponible', 13, 15, 4.2, 1),
('3005-VOL', 'Volvo', 'Volvo 2', 2022, 5, 410, 'Blanco', 'volvo2.png', 'disponible', 13, 19, 4.6, 1),
('3006-TES', 'Tesla', 'Model 6', 2022, 5, 400, 'Azul', 'tesla6.png', 'disponible', 13, 20, 5.0, 1),
('4004-BYD', 'BYD', 'Seal 3', 2023, 5, 320, 'Azul', 'byd_seal3.png', 'disponible', 14, 14, 4.4, 1),
('4005-TES', 'Tesla', 'Model 1', 2022, 5, 350, 'Blanco', 'tesla1.png', 'disponible', 14, 15, 4.5, 1),
('4006-VWW', 'Volkswagen', 'ID.4', 2021, 5, 300, 'Rojo', 'VW4.png', 'disponible', 14, 16, 4.3, 1),
('5004-VOL', 'Volvo', 'Volvo 3', 2022, 5, 420, 'Gris', 'volvo3.png', 'disponible', 15, 20, 4.7, 1),
('5005-BYD', 'BYD', 'Seal 1', 2023, 5, 300, 'Negro', 'byd_seal1.png', 'disponible', 15, 12, 4.2, 1),
('5006-TES', 'Tesla', 'Model 2', 2022, 5, 360, 'Rojo', 'tesla2.png', 'disponible', 15, 16, 4.6, 1),
('6004-VWW', 'Volkswagen', 'ID.5', 2021, 5, 310, 'Blanco', 'VW5.png', 'disponible', 16, 17, 4.4, 1),
('6005-TES', 'Tesla', 'Model 3', 2022, 5, 370, 'Azul', 'tesla3.png', 'disponible', 16, 17, 4.7, 1),
('6006-BYD', 'BYD', 'Seal 2', 2023, 5, 310, 'Blanco', 'byd_seal2.png', 'disponible', 16, 13, 4.3, 1),
('7004-VOL', 'Volvo', 'Volvo 1', 2022, 5, 400, 'Negro', 'volvo1.png', 'disponible', 17, 18, 4.5, 1),
('7005-TES', 'Tesla', 'Model 4', 2022, 5, 380, 'Negro', 'tesla4.png', 'disponible', 17, 18, 4.8, 1),
('7006-VWW', 'Volkswagen', 'ID.2', 2021, 5, 280, 'Negro', 'VW2.png', 'disponible', 17, 14, 4.1, 1),
('8004-BYD', 'BYD', 'Seal 3', 2023, 5, 320, 'Azul', 'byd_seal3.png', 'disponible', 18, 14, 4.4, 1),
('8005-TES', 'Tesla', 'Model 5', 2022, 5, 390, 'Plateado', 'tesla5.png', 'disponible', 18, 19, 4.9, 1),
('8006-VOL', 'Volvo', 'Volvo 2', 2022, 5, 410, 'Blanco', 'volvo2.png', 'disponible', 18, 19, 4.6, 1),
('9004-VWW', 'Volkswagen', 'ID.3', 2021, 5, 290, 'Blanco', 'VW3.png', 'disponible', 19, 15, 4.2, 1),
('9005-TES', 'Tesla', 'Model 6', 2022, 5, 400, 'Azul', 'tesla6.png', 'disponible', 19, 20, 5.0, 1),
('9006-BYD', 'BYD', 'Seal 1', 2023, 5, 300, 'Negro', 'byd_seal1.png', 'disponible', 19, 12, 4.2, 1),
('0001-VOL', 'Volvo', 'Volvo 3', 2022, 5, 420, 'Gris', 'volvo3.png', 'disponible', 20, 20, 4.7, 1),
('0002-TES', 'Tesla', 'Model 1', 2022, 5, 350, 'Blanco', 'tesla1.png', 'disponible', 20, 15, 4.5, 1),
('0003-VWW', 'Volkswagen', 'ID.4', 2021, 5, 300, 'Rojo', 'VW4.png', 'disponible', 20, 16, 4.3, 1),
('5678-MNB', 'Renault', 'Zoe', 2021, 5, 300, 'Azul', 'renault_zoe.png', 'disponible', 2, 12, 4.2, 1),
('9012-KHG', 'Nissan', 'Leaf', 2020, 5, 350, 'Gris', 'nissan_leaf.png', 'disponible', 3, 10, 4.0, 1),
('3456-JDW', 'BMW', 'i3', 2022, 4, 290, 'Negro', 'bmw_i3.png', 'disponible', 4, 16, 4.5, 1),
('7890-PLQ', 'Kia', 'Niro EV', 2023, 5, 460, 'Rojo', 'kia_niro.png', 'disponible', 5, 15, 4.3, 1),
('1122-RST', 'Hyundai', 'Kona EV', 2021, 5, 420, 'Blanco', 'hyundai_kona.png', 'disponible', 6, 14, 4.1, 1),
('3344-CVX', 'Volkswagen', 'ID.4', 2023, 5, 520, 'Gris', 'vw_id4.png', 'disponible', 7, 17, 4.6, 1),
('5566-HYU', 'Peugeot', 'e-208', 2020, 5, 340, 'Amarillo', 'peugeot_208.png', 'disponible', 8, 11, 4.1, 1),
('7788-TRF', 'Opel', 'Corsa-e', 2021, 5, 360, 'Blanco', 'opel_corsa.png', 'disponible', 9, 12, 4.0, 1),
('9900-ZXC', 'Ford', 'Mustang Mach-E', 2023, 5, 490, 'Rojo', 'ford_mache.png', 'disponible', 10, 20, 4.7, 1),
('1357-QWE', 'Audi', 'Q4 e-tron', 2022, 5, 450, 'Negro', 'audi_q4.png', 'disponible', 11, 19, 4.4, 1),
('2468-ASD', 'Mercedes', 'EQA', 2021, 5, 410, 'Blanco', 'mercedes_eqa.png', 'disponible', 12, 18, 4.5, 1),
('3691-FGH', 'Skoda', 'Enyaq', 2023, 5, 500, 'Gris', 'skoda_enyaq.png', 'disponible', 13, 17, 4.3, 1),
('4826-TYU', 'Seat', 'Mii Electric', 2020, 4, 260, 'Azul', 'seat_mii.png', 'disponible', 14, 9, 3.9, 1),
('5937-BNM', 'Fiat', '500e', 2022, 4, 320, 'Rojo', 'fiat_500.png', 'disponible', 15, 10, 4.1, 1),
('6048-VFR', 'Mazda', 'MX-30', 2023, 5, 265, 'Negro', 'mazda_mx30.png', 'disponible', 16, 14, 4.0, 1),
('7159-POI', 'Honda', 'e', 2021, 4, 220, 'Blanco', 'honda_e.png', 'disponible', 17, 11, 3.8, 1),
('8260-LKM', 'Volvo', 'XC40 Recharge', 2022, 5, 450, 'Verde', 'volvo_xc40.png', 'disponible', 18, 19, 4.6, 1),
('9371-JKL', 'Citroën', 'Ë-C4', 2021, 5, 350, 'Gris', 'citroen_c4.png', 'disponible', 19, 13, 4.2, 1),
('1482-HGF', 'Mini', 'Cooper SE', 2023, 4, 230, 'Amarillo', 'mini_cooper.png', 'disponible', 20, 12, 4.0, 1),
('2593-RFG', 'Toyota', 'bZ4X', 2023, 5, 500, 'Plateado', 'toyota_bz4x.png', 'disponible', 21, 17, 4.4, 1),
('3604-TRE', 'Porsche', 'Taycan', 2022, 4, 430, 'Blanco', 'porsche_taycan.png', 'disponible', 22, 30, 4.9, 1),
('4715-EDC', 'Jaguar', 'I-Pace', 2021, 5, 470, 'Negro', 'jaguar_ipace.png', 'disponible', 23, 22, 4.6, 1),
('5826-WSX', 'BYD', 'Atto 3', 2023, 5, 420, 'Azul', 'byd_atto3.png', 'disponible', 24, 14, 4.2, 1),
('6937-YHN', 'Lucid', 'Air Pure', 2023, 5, 660, 'Gris', 'lucid_air.png', 'disponible', 25, 28, 4.8, 1),
('7048-UJM', 'Rivian', 'R1S', 2023, 7, 510, 'Verde', 'rivian_r1s.png', 'disponible', 26, 26, 4.7, 1),
('8159-IKJ', 'Cupra', 'Born', 2022, 5, 420, 'Negro', 'cupra_born.png', 'disponible', 27, 15, 4.3, 1),
('9260-OLP', 'Polestar', '2', 2023, 5, 540, 'Blanco', 'polestar_2.png', 'disponible', 28, 21, 4.6, 1),
('1371-QAZ', 'Subaru', 'Solterra', 2022, 5, 460, 'Azul', 'subaru_solterra.png', 'disponible', 29, 16, 4.2, 1),
('2482-MLP', 'Fisker', 'Ocean', 2023, 5, 630, 'Gris Oscuro', 'fisker_ocean.png', 'disponible', 30, 24, 4.5, 1);