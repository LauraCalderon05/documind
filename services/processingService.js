const path = require('path');

const db = require('../config/database');

const {
    extraerTexto
} = require('./documentService');


const procesarDocumento = async (idDocumento) => {

    try {

        // 1. Obtener información del documento
        const [documentos] = await db.promise().query(
            `SELECT *
             FROM documentos
             WHERE id_documento = ?
             AND estado = TRUE`,
            [idDocumento]
        );

        if (documentos.length === 0) {
            throw new Error('Documento no encontrado.');
        }

        const documento = documentos[0];


        // 2. Cambiar estado a PROCESANDO
        await db.promise().query(
            `UPDATE procesamientos
             SET estado = 'PROCESANDO',
                 fecha_inicio = NOW(),
                 fecha_fin = NULL,
                 mensaje = NULL
             WHERE id_documento = ?`,
            [idDocumento]
        );


        // 3. Obtener la ruta física del archivo
        const rutaCompleta = path.resolve(
            process.cwd(),
            documento.ruta_archivo
        );

        // 4. Extraer el texto
        const texto = await extraerTexto(
            rutaCompleta,
            documento.extension
        );


        // 5. Guardar el texto extraído
        await db.promise().query(
            `INSERT INTO analisis_documentos
                (id_documento, texto_extraido)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE
                texto_extraido = VALUES(texto_extraido),
                fecha_analisis = CURRENT_TIMESTAMP`,
            [
                idDocumento,
                texto
            ]
        );


        // 6. Cambiar estado a PROCESADO
        await db.promise().query(
            `UPDATE procesamientos
             SET estado = 'PROCESADO',
                 fecha_fin = NOW(),
                 mensaje = 'Texto extraído correctamente.'
             WHERE id_documento = ?`,
            [idDocumento]
        );


        return {
            exitoso: true,
            texto
        };

    } catch (error) {

        console.error(
            'Error al procesar documento:',
            error
        );


        // 7. Cambiar estado a ERROR
        await db.promise().query(
            `UPDATE procesamientos
             SET estado = 'ERROR',
                 fecha_fin = NOW(),
                 mensaje = ?
             WHERE id_documento = ?`,
            [
                error.message,
                idDocumento
            ]
        );


        // 8. Registrar el error
        await db.promise().query(
            `INSERT INTO errores_procesamiento
                (id_documento, mensaje)
             VALUES (?, ?)`,
            [
                idDocumento,
                error.message
            ]
        );


        return {
            exitoso: false,
            error: error.message
        };
    }
};


module.exports = {
    procesarDocumento
};