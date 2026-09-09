const db = require('../config/database');
const path = require('path');
const fs = require('fs');
const {
    procesarDocumento
} = require('../services/processingService');


// Subir documento
// Subir documento
const subirDocumento = async (req, res) => {
    try {
        const idRepositorio = req.params.idRepositorio;
        const idCarpeta = req.params.idCarpeta;
        const idUsuario = req.session.usuario.id;

        if (!req.file) {
            return res.status(400).send(
                'Debes seleccionar un archivo.'
            );
        }

        // Verificar que la carpeta pertenece al usuario
        const [carpetas] = await db.promise().query(
            `SELECT c.id_carpeta, c.id_repositorio
             FROM carpetas c
             INNER JOIN repositorios r
                 ON c.id_repositorio = r.id_repositorio
             WHERE c.id_carpeta = ?
             AND c.id_repositorio = ?
             AND r.id_usuario = ?
             AND c.estado = TRUE
             AND r.estado = TRUE`,
            [
                idCarpeta,
                idRepositorio,
                idUsuario
            ]
        );

        if (carpetas.length === 0) {
            fs.unlinkSync(req.file.path);

            return res.status(404).send(
                'Carpeta no encontrada.'
            );
        }

        const archivo = req.file;

        const nombreOriginal = archivo.originalname;
        const nombreArchivo = archivo.filename;

        const rutaArchivo = path
            .relative(process.cwd(), archivo.path)
            .replace(/\\/g, '/');

        const extension = path
            .extname(nombreOriginal)
            .toLowerCase()
            .substring(1);

        // Registrar documento
        const [resultado] = await db.promise().query(
            `INSERT INTO documentos
            (
                nombre_original,
                nombre_archivo,
                ruta_archivo,
                extension,
                tipo_documento,
                id_repositorio,
                id_carpeta,
                id_usuario,
                tamano
            )
            VALUES (?, ?, ?, ?, 'PENDIENTE', ?, ?, ?, ?)`,
            [
                nombreOriginal,
                nombreArchivo,
                rutaArchivo,
                extension,
                idRepositorio,
                idCarpeta,
                idUsuario,
                archivo.size
            ]
        );

        const idDocumento = resultado.insertId;

        // Crear procesamiento pendiente
        await db.promise().query(
            `INSERT INTO procesamientos
            (id_documento, estado)
            VALUES (?, 'PENDIENTE')`,
            [idDocumento]
        );

        console.log(
            `Documento cargado correctamente: ${nombreOriginal}`
        );

        // Iniciar procesamiento del documento
        procesarDocumento(idDocumento).catch((error) => {
            console.error(
                'Error inesperado en el procesamiento:',
                error
            );
        });

        // Redirigir inmediatamente a la carpeta
        res.redirect(
            `/repositorios/${idRepositorio}/carpetas/${idCarpeta}`
        );

    } catch (error) {
        console.error(
            'Error al subir documento:',
            error
        );

        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (errorArchivo) {
                console.error(
                    'No se pudo eliminar el archivo:',
                    errorArchivo
                );
            }
        }

        res.status(500).send(
            'Error al subir el documento.'
        );
    }
};
// Listar documentos de una carpeta
const listarDocumentos = async (req, res) => {
    try {
        const idRepositorio = req.params.idRepositorio;
        const idCarpeta = req.params.idCarpeta;
        const idUsuario = req.session.usuario.id;

        // Verificar acceso a la carpeta
        const [carpetas] = await db.promise().query(
            `SELECT c.*, r.nombre AS nombre_repositorio
             FROM carpetas c
             INNER JOIN repositorios r
                 ON c.id_repositorio = r.id_repositorio
             WHERE c.id_carpeta = ?
             AND c.id_repositorio = ?
             AND r.id_usuario = ?
             AND c.estado = TRUE
             AND r.estado = TRUE`,
            [
                idCarpeta,
                idRepositorio,
                idUsuario
            ]
        );

        if (carpetas.length === 0) {
            return res.status(404).send(
                'Carpeta no encontrada.'
            );
        }

        // Consultar documentos
        const [documentos] = await db.promise().query(
            `SELECT *
             FROM documentos
             WHERE id_carpeta = ?
             AND id_repositorio = ?
             AND id_usuario = ?
             AND estado = TRUE
             ORDER BY fecha_carga DESC`,
            [
                idCarpeta,
                idRepositorio,
                idUsuario
            ]
        );

        res.render('carpetas/detalle', {
            title: carpetas[0].nombre,
            carpeta: carpetas[0],
            documentos
        });

    } catch (error) {
        console.error(
            'Error al listar documentos:',
            error
        );

        res.status(500).send(
            'Error al consultar los documentos.'
        );
    }
};
// Consultar información de un documento
// Consultar información de un documento
const consultarDocumento = async (req, res) => {
    try {
        const idDocumento = req.params.idDocumento;
        const idUsuario = req.session.usuario.id;

        const [documentos] = await db.promise().query(
            `SELECT
                d.*,
                c.nombre AS nombre_carpeta,
                r.nombre AS nombre_repositorio,
                p.estado AS estado_procesamiento,
                a.texto_extraido
             FROM documentos d
             INNER JOIN carpetas c
                 ON d.id_carpeta = c.id_carpeta
             INNER JOIN repositorios r
                 ON d.id_repositorio = r.id_repositorio
             LEFT JOIN procesamientos p
                 ON d.id_documento = p.id_documento
             LEFT JOIN analisis_documentos a
                 ON d.id_documento = a.id_documento
             WHERE d.id_documento = ?
             AND d.id_usuario = ?
             AND d.estado = TRUE`,
            [
                idDocumento,
                idUsuario
            ]
        );

        if (documentos.length === 0) {
            return res.status(404).send(
                'Documento no encontrado.'
            );
        }

        res.render('documentos/detalle', {
            title: documentos[0].nombre_original,
            documento: documentos[0]
        });

    } catch (error) {
        console.error(
            'Error al consultar documento:',
            error
        );

        res.status(500).send(
            'Error al consultar el documento.'
        );
    }
};
// Descargar documento
const descargarDocumento = async (req, res) => {
    try {
        const idDocumento = req.params.idDocumento;
        const idUsuario = req.session.usuario.id;

        const [documentos] = await db.promise().query(
            `SELECT *
             FROM documentos
             WHERE id_documento = ?
             AND id_usuario = ?
             AND estado = TRUE`,
            [
                idDocumento,
                idUsuario
            ]
        );

        if (documentos.length === 0) {
            return res.status(404).send(
                'Documento no encontrado.'
            );
        }

        const documento = documentos[0];

        const rutaCompleta = path.resolve(
            process.cwd(),
            documento.ruta_archivo
        );

        // Verificar que el archivo realmente exista
        if (!fs.existsSync(rutaCompleta)) {
            return res.status(404).send(
                'El archivo no existe en el almacenamiento.'
            );
        }

        res.download(
            rutaCompleta,
            documento.nombre_original
        );

    } catch (error) {
        console.error(
            'Error al descargar documento:',
            error
        );

        res.status(500).send(
            'Error al descargar el documento.'
        );
    }
};
// Eliminar documento
const eliminarDocumento = async (req, res) => {
    try {
        const idDocumento = req.params.idDocumento;
        const idUsuario = req.session.usuario.id;

        // Buscar el documento
        const [documentos] = await db.promise().query(
            `SELECT *
             FROM documentos
             WHERE id_documento = ?
             AND id_usuario = ?
             AND estado = TRUE`,
            [
                idDocumento,
                idUsuario
            ]
        );

        if (documentos.length === 0) {
            return res.status(404).send(
                'Documento no encontrado.'
            );
        }

        const documento = documentos[0];

        // Eliminar archivo físico
        const rutaCompleta = path.resolve(
            process.cwd(),
            documento.ruta_archivo
        );

        if (fs.existsSync(rutaCompleta)) {
            fs.unlinkSync(rutaCompleta);
        }

        // Eliminar registro de la base de datos
        const [resultado] = await db.promise().query(
            `DELETE FROM documentos
             WHERE id_documento = ?
             AND id_usuario = ?`,
            [
                idDocumento,
                idUsuario
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).send(
                'Documento no encontrado.'
            );
        }

        res.redirect(
            `/repositorios/${documento.id_repositorio}/carpetas/${documento.id_carpeta}`
        );

    } catch (error) {
        console.error(
            'Error al eliminar documento:',
            error
        );

        res.status(500).send(
            'Error al eliminar el documento.'
        );
    }
};
module.exports = {
    subirDocumento,
    listarDocumentos,
    consultarDocumento,
    descargarDocumento,
    eliminarDocumento
};