CREATE DATABASE documind
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE documind;
SELECT * FROM usuarios;
SELECT * FROM repositorios;
SELECT * FROM carpetas;
SHOW DATABASES;

update usuarios
set rol = 'ADMINISTRADOR'
where id_usuario = 4;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol ENUM('USUARIO', 'ADMINISTRADOR') NOT NULL DEFAULT 'USUARIO',
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE repositorios (
    id_repositorio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    id_usuario INT NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_repositorio_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);
CREATE TABLE carpetas (
    id_carpeta INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    id_repositorio INT NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_carpeta_repositorio
        FOREIGN KEY (id_repositorio)
        REFERENCES repositorios(id_repositorio)
        ON DELETE CASCADE
);
CREATE TABLE documentos (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    nombre_original VARCHAR(255) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    extension VARCHAR(10) NOT NULL,
    tipo_documento ENUM('CONTRATO', 'FACTURA', 'INFORME', 'PENDIENTE') 
        NOT NULL DEFAULT 'PENDIENTE',
    id_repositorio INT NOT NULL,
    id_carpeta INT NULL,
    id_usuario INT NOT NULL,
    fecha_carga DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tamano BIGINT,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_documento_repositorio
        FOREIGN KEY (id_repositorio)
        REFERENCES repositorios(id_repositorio),

    CONSTRAINT fk_documento_carpeta
        FOREIGN KEY (id_carpeta)
        REFERENCES carpetas(id_carpeta)
        ON DELETE SET NULL,
    CONSTRAINT fk_documento_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);
CREATE TABLE procesamientos (
    id_procesamiento INT AUTO_INCREMENT PRIMARY KEY,
    id_documento INT NOT NULL,
    estado ENUM('PENDIENTE', 'PROCESANDO', 'PROCESADO', 'ERROR') 
        NOT NULL DEFAULT 'PENDIENTE',
    fecha_inicio DATETIME NULL,
    fecha_fin DATETIME NULL,
    mensaje VARCHAR(500),

    CONSTRAINT fk_procesamiento_documento
        FOREIGN KEY (id_documento)
        REFERENCES documentos(id_documento)
        ON DELETE CASCADE
);
CREATE TABLE analisis_documentos (
    id_analisis INT AUTO_INCREMENT PRIMARY KEY,
    id_documento INT NOT NULL,
    texto_extraido LONGTEXT,
    resumen TEXT,
    informacion_relevante LONGTEXT,
    fecha_analisis DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_analisis_documento
        FOREIGN KEY (id_documento)
        REFERENCES documentos(id_documento)
        ON DELETE CASCADE
);
CREATE TABLE errores_procesamiento (
    id_error INT AUTO_INCREMENT PRIMARY KEY,
    id_documento INT NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_error DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_error_documento
        FOREIGN KEY (id_documento)
        REFERENCES documentos(id_documento)
        ON DELETE CASCADE
);
INSERT INTO usuarios
(nombre, apellido, email, password, telefono, rol)
VALUES
('Administrador', 'DocuMind', 'admin@documind.local', 'TEMPORAL', '3000000000', 'ADMINISTRADOR'),
('Usuario', 'Prueba', 'usuario@documind.local', 'TEMPORAL', '3000000001', 'USUARIO');
INSERT INTO repositorios
(nombre, descripcion, id_usuario)
VALUES
('Repositorio Empresarial', 'Repositorio principal para documentos de prueba', 1),
('Documentos de Prueba', 'Repositorio destinado a pruebas del sistema', 2);
INSERT INTO carpetas
(nombre, descripcion, id_repositorio)
VALUES
('Contratos', 'Documentos contractuales', 1),
('Facturas', 'Documentos de facturación', 1),
('Informes', 'Informes empresariales', 1);
select * from repositorios;
ALTER TABLE documentos
DROP FOREIGN KEY fk_documento_repositorio;
ALTER TABLE documentos
ADD CONSTRAINT fk_documento_repositorio
    FOREIGN KEY (id_repositorio)
    REFERENCES repositorios(id_repositorio)
    ON DELETE CASCADE;
    ALTER TABLE documentos
DROP FOREIGN KEY fk_documento_carpeta;
select * from documentos;
select * from procesamientos;
ALTER TABLE documentos
ADD CONSTRAINT fk_documento_carpeta
    FOREIGN KEY (id_carpeta)
    REFERENCES carpetas(id_carpeta)
    ON DELETE CASCADE;