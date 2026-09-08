const express = require('express');

const {
    subirDocumento,
    consultarDocumento,
    descargarDocumento,
    eliminarDocumento
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
    upload.single('documento'),
    subirDocumento
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