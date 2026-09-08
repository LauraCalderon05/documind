const express = require('express');

const {
    registrarUsuario,
    iniciarSesion,
    cerrarSesion
} = require('../controllers/authController');

const router = express.Router();
// REGISTRO
// Mostrar formulario de registro
router.get('/registro', (req, res) => {

    res.render('registro', {
        title: 'Registro',
        error: null
    });

});

// Procesar registro
router.post('/registro', registrarUsuario);
// LOGIN
// Mostrar formulario de login
router.get('/login', (req, res) => {

    res.render('login', {
        title: 'Iniciar sesión',
        error: null
    });

});

// Procesar login
router.post('/login', iniciarSesion);
// LOGOUT
router.get('/logout', cerrarSesion);


module.exports = router;