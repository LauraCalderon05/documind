const express = require('express');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;

// Configuración de EJS
app.set('view engine', 'ejs');

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Base de datos
const db = require('./config/database');

// Router de autenticación
const authRouter = require('./routers/authRouter');

app.use('/auth', authRouter);

// Ruta principal
app.get('/', (req, res) => {
    res.send('DocuMind funcionando');
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});