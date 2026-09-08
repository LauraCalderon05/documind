const express = require('express');

const {
    mostrarCrearCarpeta,
    crearCarpeta,
    mostrarEditarCarpeta,
    editarCarpeta,
    eliminarCarpeta,
    accederCarpeta
} = require('../controllers/folderController');

const {
    requiereAutenticacion
} = require('../middleware/authMiddleware');

const router = express.Router();


// Crear carpeta
router.get(
    '/repositorios/:idRepositorio/carpetas/crear',
    requiereAutenticacion,
    mostrarCrearCarpeta
);

router.post(
    '/repositorios/:idRepositorio/carpetas/crear',
    requiereAutenticacion,
    crearCarpeta
);


// Editar carpeta
router.get(
    '/repositorios/:idRepositorio/carpetas/:idCarpeta/editar',
    requiereAutenticacion,
    mostrarEditarCarpeta
);

router.post(
    '/repositorios/:idRepositorio/carpetas/:idCarpeta/editar',
    requiereAutenticacion,
    editarCarpeta
);


// Eliminar carpeta
router.post(
    '/repositorios/:idRepositorio/carpetas/:idCarpeta/eliminar',
    requiereAutenticacion,
    eliminarCarpeta
);


// Acceder a una carpeta
router.get(
    '/repositorios/:idRepositorio/carpetas/:idCarpeta',
    requiereAutenticacion,
    accederCarpeta
);


module.exports = router;