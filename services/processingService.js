const path = require('path');

const db = require('../config/database');

const {
    extraerTexto
} = require('./documentService');

const {
    analizarDocumento
} = require('./aiService');


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


        // 4. Extraer el texto del documento
        const texto = await extraerTexto(
            rutaCompleta,
            documento.extension
        );
        // 5. Verificar que el documento tenga texto
        if (!texto || texto.trim().length === 0) {
            throw new Error(
                'El documento no contiene texto suficiente para ser analizado.'
            );
        }

        // 5. Analizar el documento con Gemini
        const resultadoIA = await analizarDocumento(texto);


        // 6. Actualizar la categoría del documento
        await db.promise().query(
            `UPDATE documentos
             SET tipo_documento = ?
             WHERE id_documento = ?`,
            [
                resultadoIA.categoria,
                idDocumento
            ]
        );


        // 7. Guardar texto, resumen e información relevante
        await db.promise().query(
            `INSERT INTO analisis_documentos
                (
                    id_documento,
                    texto_extraido,
                    resumen,
                    informacion_relevante
                )
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                texto_extraido = VALUES(texto_extraido),
                resumen = VALUES(resumen),
                informacion_relevante = VALUES(informacion_relevante),
                fecha_analisis = CURRENT_TIMESTAMP`,
            [
                idDocumento,
                texto,
                resultadoIA.resumen,
                JSON.stringify(
                    resultadoIA.informacion_relevante
                )
            ]
        );


        // 8. Cambiar estado a PROCESADO
        await db.promise().query(
            `UPDATE procesamientos
             SET estado = 'PROCESADO',
                 fecha_fin = NOW(),
                 mensaje = 'Documento procesado y analizado correctamente.'
             WHERE id_documento = ?`,
            [idDocumento]
        );


        return {
            exitoso: true,
            texto,
            categoria: resultadoIA.categoria,
            resumen: resultadoIA.resumen,
            informacion_relevante:
                resultadoIA.informacion_relevante
        };


    } catch (error) {

        console.error(
            'Error al procesar documento:',
            error
        );


        // 9. Cambiar estado a ERROR
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


        // 10. Registrar el error
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