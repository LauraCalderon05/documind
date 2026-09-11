const db = require('../config/database');

const mostrarDashboard = async (req, res) => {

    try {

        // 1. Número de usuarios
        const [usuarios] = await db.promise().query(
            `SELECT COUNT(*) AS total
             FROM usuarios
             WHERE estado = TRUE`
        );

        // 2. Número de repositorios
        const [repositorios] = await db.promise().query(
            `SELECT COUNT(*) AS total
             FROM repositorios
             WHERE estado = TRUE`
        );

        // 3. Número de documentos
        const [documentos] = await db.promise().query(
            `SELECT COUNT(*) AS total
             FROM documentos
             WHERE estado = TRUE`
        );

        // 4. Documentos procesados
        const [procesados] = await db.promise().query(
            `SELECT COUNT(*) AS total
             FROM procesamientos p
             INNER JOIN documentos d
                 ON p.id_documento = d.id_documento
             WHERE p.estado = 'PROCESADO'
             AND d.estado = TRUE`
        );

        // 5. Documentos pendientes
        const [pendientes] = await db.promise().query(
            `SELECT COUNT(*) AS total
             FROM procesamientos p
             INNER JOIN documentos d
                 ON p.id_documento = d.id_documento
             WHERE p.estado = 'PENDIENTE'
             AND d.estado = TRUE`
        );

        // 6. Documentos con errores
        const [errores] = await db.promise().query(
            `SELECT COUNT(*) AS total
             FROM procesamientos p
             INNER JOIN documentos d
                 ON p.id_documento = d.id_documento
             WHERE p.estado = 'ERROR'
             AND d.estado = TRUE`
        );

        // 7. Cantidad de documentos por categoría
        const [categorias] = await db.promise().query(
            `SELECT
                tipo_documento AS categoria,
                COUNT(*) AS cantidad
             FROM documentos
             WHERE estado = TRUE
             GROUP BY tipo_documento
             ORDER BY cantidad DESC`
        );

        // 8. Cantidad de documentos por formato
        const [formatos] = await db.promise().query(
            `SELECT
                UPPER(extension) AS formato,
                COUNT(*) AS cantidad
             FROM documentos
             WHERE estado = TRUE
             GROUP BY extension
             ORDER BY cantidad DESC`
        );

        res.render('dashboard', {
            title: 'Dashboard',
            estadisticas: {
                usuarios: usuarios[0].total,
                repositorios: repositorios[0].total,
                documentos: documentos[0].total,
                procesados: procesados[0].total,
                pendientes: pendientes[0].total,
                errores: errores[0].total
            },
            categorias,
            formatos
        });

    } catch (error) {

        console.error(
            'Error al cargar el dashboard:',
            error
        );

        res.status(500).send(
            'No fue posible cargar el dashboard.'
        );
    }
};

module.exports = {
    mostrarDashboard
};