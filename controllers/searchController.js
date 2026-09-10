const db = require('../config/database');

const buscarDocumentos = async (req, res) => {

    try {

        const consulta = req.query.q?.trim();

        if (!consulta) {
            return res.render('busqueda/resultados', {
                title: 'Búsqueda',
                consulta: '',
                documentos: [],
                mensaje: 'Ingrese un término de búsqueda.'
            });
        }

        const idUsuario = req.session.usuario.id_usuario;

        const termino = `%${consulta}%`;

        const [documentos] = await db.promise().query(
            `SELECT
                d.id_documento,
                d.nombre_original,
                d.tipo_documento,
                d.fecha_carga,
                r.nombre AS nombre_repositorio,
                c.nombre AS nombre_carpeta,
                a.resumen
             FROM analisis_documentos a
             INNER JOIN documentos d
                ON a.id_documento = d.id_documento
             INNER JOIN repositorios r
                ON d.id_repositorio = r.id_repositorio
             LEFT JOIN carpetas c
                ON d.id_carpeta = c.id_carpeta
             WHERE d.id_usuario = ?
             AND d.estado = TRUE
             AND a.texto_extraido LIKE ?
             ORDER BY d.fecha_carga DESC`,
            [
                idUsuario,
                termino
            ]
        );

        res.render('busqueda/resultados', {
            title: 'Resultados de búsqueda',
            consulta,
            documentos,
            mensaje: null
        });

    } catch (error) {

        console.error(
            'Error al buscar documentos:',
            error
        );

        res.status(500).render('busqueda/resultados', {
            title: 'Búsqueda',
            consulta: req.query.q || '',
            documentos: [],
            mensaje: 'No fue posible realizar la búsqueda.'
        });
    }
};

module.exports = {
    buscarDocumentos
};