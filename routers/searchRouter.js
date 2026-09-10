const express = require('express');

const router = express.Router();

const {
    buscarDocumentos
} = require('../controllers/searchController');

const {
    requiereAutenticacion
} = require('../middleware/authMiddleware');

router.get(
    '/buscar',
    requiereAutenticacion,
    buscarDocumentos
);

module.exports = router;