const bcrypt = require('bcrypt');
const db = require('../config/database');

const registrarUsuario = async (req, res) => {
    try {
        const {
            nombre,
            apellido,
            email,
            password,
            telefono
        } = req.body;

        // Verificar que los campos obligatorios estén completos
        if (!nombre || !apellido || !email || !password) {
            return res.status(400).send('Todos los campos obligatorios deben estar completos');
        }

        // Verificar si el correo ya existe
        const [usuarios] = await db.promise().query(
            'SELECT id_usuario FROM usuarios WHERE email = ?',
            [email]
        );

        if (usuarios.length > 0) {
            return res.status(400).send('El correo electrónico ya está registrado');
        }

        // Encriptar contraseña
        const passwordEncriptada = await bcrypt.hash(password, 10);

        // Insertar usuario
        await db.promise().query(
            `INSERT INTO usuarios
            (nombre, apellido, email, password, telefono)
            VALUES (?, ?, ?, ?, ?)`,
            [
                nombre,
                apellido,
                email,
                passwordEncriptada,
                telefono || null
            ]
        );

        res.send('Usuario registrado correctamente');

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).send('Error interno del servidor');
    }
};

module.exports = {
    registrarUsuario
};