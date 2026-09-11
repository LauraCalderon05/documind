CREATE DATABASE documind
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE documind;

-- =========================================================
-- TABLA: usuarios
-- =========================================================
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

-- =========================================================
-- TABLA: repositorios
-- =========================================================
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

-- =========================================================
-- TABLA: carpetas
-- =========================================================
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

-- =========================================================
-- TABLA: documentos
-- =========================================================
CREATE TABLE documentos (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    nombre_original VARCHAR(255) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    extension VARCHAR(10) NOT NULL,

    tipo_documento ENUM(
        'CONTRATO',
        'FACTURA',
        'INFORME',
        'OTRO',
        'PENDIENTE'
    ) NOT NULL DEFAULT 'PENDIENTE',

    id_repositorio INT NOT NULL,
    id_carpeta INT NULL,
    id_usuario INT NOT NULL,
    fecha_carga DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tamano BIGINT,
    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_documento_repositorio
        FOREIGN KEY (id_repositorio)
        REFERENCES repositorios(id_repositorio)
        ON DELETE CASCADE,

    CONSTRAINT fk_documento_carpeta
        FOREIGN KEY (id_carpeta)
        REFERENCES carpetas(id_carpeta)
        ON DELETE CASCADE,

    CONSTRAINT fk_documento_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);

-- =========================================================
-- TABLA: procesamientos
-- =========================================================
CREATE TABLE procesamientos (
    id_procesamiento INT AUTO_INCREMENT PRIMARY KEY,
    id_documento INT NOT NULL,

    estado ENUM(
        'PENDIENTE',
        'PROCESANDO',
        'PROCESADO',
        'ERROR'
    ) NOT NULL DEFAULT 'PENDIENTE',

    fecha_inicio DATETIME NULL,
    fecha_fin DATETIME NULL,
    mensaje VARCHAR(500),

    CONSTRAINT fk_procesamiento_documento
        FOREIGN KEY (id_documento)
        REFERENCES documentos(id_documento)
        ON DELETE CASCADE
);

-- =========================================================
-- TABLA: analisis_documentos
-- =========================================================
CREATE TABLE analisis_documentos (
    id_analisis INT AUTO_INCREMENT PRIMARY KEY,
    id_documento INT NOT NULL UNIQUE,
    texto_extraido LONGTEXT,
    resumen TEXT,
    informacion_relevante LONGTEXT,
    fecha_analisis DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_analisis_documento
        FOREIGN KEY (id_documento)
        REFERENCES documentos(id_documento)
        ON DELETE CASCADE
);

-- =========================================================
-- TABLA: errores_procesamiento
-- =========================================================
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
