const express = require('express');

const {
    subirDocumento,
    consultarDocumento,
    descargarDocumento,
    eliminarDocumento,
    buscarDocumentos,
    preguntarDocumento
} = require('../controllers/documentController');
const {
    requiereAutenticacion
} = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

const router = express.Router();
// Subir documento
router.post(
    '/repositorios/:idRepositorio/carpetas/:idCarpeta/documentos/subir',
    requiereAutenticacion,
    (req, res, next) => {

        upload.single('documento')(req, res, (error) => {

            if (!error) {
                return next();
            }

            console.error(
                'Error durante la subida del archivo:',
                error
            );

            let mensaje = 'No fue posible subir el archivo.';

            if (error.code === 'LIMIT_FILE_SIZE') {

                mensaje =
                    'El archivo supera el tamaño máximo permitido de 10 MB.';

            } else if (error.message) {

                mensaje = error.message;
npm
            }

            return res.status(400).render('error', {

                title: 'Error al subir documento',

                mensaje,

                volver:
                    `/repositorios/${req.params.idRepositorio}/carpetas/${req.params.idCarpeta}`

            });

        });

    },
    subirDocumento
);
// Buscar documentos por contenido
router.get(
    '/documentos/buscar',
    requiereAutenticacion,
    buscarDocumentos
);
// Preguntar sobre un documento
router.post(
    '/documentos/:idDocumento/preguntar',
    requiereAutenticacion,
    preguntarDocumento
);
// Consultar documento
router.get(
    '/documentos/:idDocumento',
    requiereAutenticacion,
    consultarDocumento
);
// Descargar documento
router.get(
    '/documentos/:idDocumento/descargar',
    requiereAutenticacion,
    descargarDocumento
);
// Eliminar documento
router.post(
    '/documentos/:idDocumento/eliminar',
    requiereAutenticacion,
    eliminarDocumento
);


module.exports = router;