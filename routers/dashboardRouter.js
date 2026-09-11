const express = require('express');

const {
    mostrarDashboard
} = require('../controllers/dashboardController');

const {
    requiereAdministrador
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
    '/dashboard',
    requiereAdministrador,
    mostrarDashboard
);

module.exports = router;