const express = require('express');
const session = require('express-session');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;

// Configuración de EJS
app.set('view engine', 'ejs');

// Middlewares para recibir datos de formularios y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Archivos estáticos
app.use(express.static('public'));

// Base de datos
const db = require('./config/database');

// Configuración de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));

// Hacer disponible el usuario de la sesión en todas las vistas EJS
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});

// Router de autenticación
const authRouter = require('./routers/authRouter');
const {
    requiereAutenticacion,
    requiereAdministrador
} = require('./middleware/authMiddleware');
app.use('/auth', authRouter);

// Página principal
app.get('/', (req, res) => {
    res.render('inicio', {
        title: 'Inicio'
    });
});

// Ruta temporal para comprobar que la autenticación funciona
app.get('/perfil', requiereAutenticacion, (req, res) => {

    res.send(`
        <h1>Perfil</h1>

        <p>Bienvenido, ${req.session.usuario.nombre}</p>

        <p>Correo: ${req.session.usuario.email}</p>

        <p>Rol: ${req.session.usuario.rol}</p>

        <a href="/auth/logout">Cerrar sesión</a>
    `);
});


app.get('/admin', requiereAdministrador, (req, res) => {

    res.send(`
        <h1>Panel de administrador</h1>

        <p>Bienvenido administrador, ${req.session.usuario.nombre}</p>

        <a href="/auth/logout">Cerrar sesión</a>
    `);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});