const express = require('express');

const {
    listarRepositorios,
    mostrarCrearRepositorio,
    crearRepositorio,
    mostrarEditarRepositorio,
    editarRepositorio,
    eliminarRepositorio,
    accederRepositorio
} = require('../controllers/repositoryController');

const {
    requiereAutenticacion
} = require('../middleware/authMiddleware');

const router = express.Router();


// ==========================================
// LISTAR REPOSITORIOS
// ==========================================

router.get(
    '/',
    requiereAutenticacion,
    listarRepositorios
);


// ==========================================
// CREAR REPOSITORIO
// ==========================================

router.get(
    '/crear',
    requiereAutenticacion,
    mostrarCrearRepositorio
);

router.post(
    '/crear',
    requiereAutenticacion,
    crearRepositorio
);


// ==========================================
// EDITAR REPOSITORIO
// ==========================================

router.get(
    '/editar/:id',
    requiereAutenticacion,
    mostrarEditarRepositorio
);

router.post(
    '/editar/:id',
    requiereAutenticacion,
    editarRepositorio
);


// ==========================================
// ELIMINAR REPOSITORIO
// ==========================================

router.post(
    '/eliminar/:id',
    requiereAutenticacion,
    eliminarRepositorio
);


// ==========================================
// ACCEDER A REPOSITORIO
// ==========================================

router.get(
    '/:id',
    requiereAutenticacion,
    accederRepositorio
);


module.exports = router;