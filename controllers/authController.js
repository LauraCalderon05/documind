const bcrypt = require('bcrypt');
const db = require('../config/database');
// REGISTRO DE USUARIO
const registrarUsuario = async (req, res) => {
    try {
        const {
            nombre,
            apellido,
            email,
            password,
            telefono
        } = req.body;
        // Verificar campos obligatorios
        if (!nombre || !apellido || !email || !password) {
            return res.status(400).render('registro', {
                title: 'Registro',
                error: 'Todos los campos obligatorios deben estar completos'
            });
        }
        // Verificar si el correo ya existe
        const [usuarios] = await db.promise().query(
            'SELECT id_usuario FROM usuarios WHERE email = ?',
            [email]
        );
        if (usuarios.length > 0) {

            return res.status(400).render('registro', {
                title: 'Registro',
                error: 'El correo electrónico ya está registrado'
            });
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
        // Registro exitoso
        res.redirect('/auth/login');
    } catch (error) {

        console.error(
            'Error al registrar usuario:',
            error
        );
        // Mostrar error dentro del formulario
        res.status(500).render('registro', {
            title: 'Registro',
            error: 'Ocurrió un error al registrar el usuario. Inténtalo nuevamente.'
        });
    }
};
// INICIO DE SESIÓN
const iniciarSesion = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;
        // Verificar campos obligatorios
        if (!email || !password) {

            return res.status(400).render('login', {
                title: 'Iniciar sesión',
                error: 'El correo y la contraseña son obligatorios'
            });
        }
        // Buscar usuario por correo
        const [usuarios] = await db.promise().query(
            `SELECT *
             FROM usuarios
             WHERE email = ?`,
            [email]
        );
        // Usuario no encontrado
        if (usuarios.length === 0) {
            return res.status(401).render('login', {
                title: 'Iniciar sesión',
                error: 'El correo electrónico o la contraseña son incorrectos'
            });
        }
        const usuario = usuarios[0];
        // Verificar estado del usuario
        if (!usuario.estado) {

            return res.status(403).render('login', {
                title: 'Iniciar sesión',
                error: 'Esta cuenta se encuentra deshabilitada'
            });
        }
        // Comparar contraseña
        const passwordCorrecta = await bcrypt.compare(
            password,
            usuario.password
        );
        // Contraseña incorrecta
        if (!passwordCorrecta) {

            return res.status(401).render('login', {
                title: 'Iniciar sesión',
                error: 'El correo electrónico o la contraseña son incorrectos'
            });
        }
        // Crear sesión
        req.session.usuario = {
            id: usuario.id_usuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            rol: usuario.rol
        };


        console.log(
            `Usuario autenticado: ${usuario.email}`
        );
        // Redireccionar después del inicio de sesión
        res.redirect('/');


    } catch (error) {

        console.error(
            'Error al iniciar sesión:',
            error
        );
        // Mostrar error dentro del formulario
        res.status(500).render('login', {
            title: 'Iniciar sesión',
            error: 'Ocurrió un error al iniciar sesión. Inténtalo nuevamente.'
        });
    }
};
// CERRAR SESIÓN
const cerrarSesion = (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            console.error(
                'Error al cerrar sesión:',
                error
            );


            // En este caso no tenemos un formulario
            // al cual regresar, así que mostramos un mensaje.
            return res.status(500).send(
                'No se pudo cerrar la sesión'
            );
        }


        // Sesión cerrada correctamente
        res.redirect('/');
    });
};

// EXPORTAR CONTROLADORES
module.exports = {
    registrarUsuario,
    iniciarSesion,
    cerrarSesion
};