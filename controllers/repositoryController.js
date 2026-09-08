const db = require('../config/database');
// LISTAR REPOSITORIOS
const listarRepositorios = async (req, res) => {

    try {

        const idUsuario = req.session.usuario.id;

        const [repositorios] = await db.promise().query(
            `SELECT *
             FROM repositorios
             WHERE id_usuario = ?
             AND estado = TRUE
             ORDER BY fecha_creacion DESC`,
            [idUsuario]
        );

        res.render('repositorios/index', {
            title: 'Mis repositorios',
            repositorios
        });

    } catch (error) {

        console.error('Error al listar repositorios:', error);

        res.status(500).send(
            'Error al consultar los repositorios'
        );
    }
};
// MOSTRAR FORMULARIO DE CREACIÓN
const mostrarCrearRepositorio = (req, res) => {

    res.render('repositorios/crear', {
        title: 'Crear repositorio'
    });

};
// CREAR REPOSITORIO
const crearRepositorio = async (req, res) => {

    try {

        const {
            nombre,
            descripcion
        } = req.body;

        const idUsuario = req.session.usuario.id;

        if (!nombre || nombre.trim() === '') {

            return res.status(400).send(
                'El nombre del repositorio es obligatorio'
            );
        }

        await db.promise().query(
            `INSERT INTO repositorios
            (nombre, descripcion, id_usuario)
            VALUES (?, ?, ?)`,
            [
                nombre.trim(),
                descripcion || null,
                idUsuario
            ]
        );

        res.redirect('/repositorios');

    } catch (error) {

        console.error('Error al crear repositorio:', error);

        res.status(500).send(
            'Error al crear el repositorio'
        );
    }
};
// MOSTRAR FORMULARIO DE EDICIÓN
const mostrarEditarRepositorio = async (req, res) => {

    try {

        const idRepositorio = req.params.id;
        const idUsuario = req.session.usuario.id;

        const [repositorios] = await db.promise().query(
            `SELECT *
             FROM repositorios
             WHERE id_repositorio = ?
             AND id_usuario = ?
             AND estado = TRUE`,
            [
                idRepositorio,
                idUsuario
            ]
        );

        if (repositorios.length === 0) {

            return res.status(404).send(
                'Repositorio no encontrado'
            );
        }

        res.render('repositorios/editar', {
            title: 'Editar repositorio',
            repositorio: repositorios[0]
        });

    } catch (error) {

        console.error('Error al consultar repositorio:', error);

        res.status(500).send(
            'Error al consultar el repositorio'
        );
    }
};
// EDITAR REPOSITORIO
const editarRepositorio = async (req, res) => {

    try {

        const idRepositorio = req.params.id;

        const {
            nombre,
            descripcion
        } = req.body;

        const idUsuario = req.session.usuario.id;

        if (!nombre || nombre.trim() === '') {

            return res.status(400).send(
                'El nombre del repositorio es obligatorio'
            );
        }

        const [resultado] = await db.promise().query(
            `UPDATE repositorios
             SET nombre = ?,
                 descripcion = ?
             WHERE id_repositorio = ?
             AND id_usuario = ?
             AND estado = TRUE`,
            [
                nombre.trim(),
                descripcion || null,
                idRepositorio,
                idUsuario
            ]
        );

        if (resultado.affectedRows === 0) {

            return res.status(404).send(
                'Repositorio no encontrado'
            );
        }

        res.redirect('/repositorios');

    } catch (error) {

        console.error('Error al editar repositorio:', error);

        res.status(500).send(
            'Error al editar el repositorio'
        );
    }
};
// ELIMINAR REPOSITORIO
const eliminarRepositorio = async (req, res) => {

    try {

        const idRepositorio = req.params.id;
        const idUsuario = req.session.usuario.id;

        const [resultado] = await db.promise().query(
            `DELETE FROM repositorios
             WHERE id_repositorio = ?
             AND id_usuario = ?`,
            [
                idRepositorio,
                idUsuario
            ]
        );

        if (resultado.affectedRows === 0) {

            return res.status(404).send(
                'Repositorio no encontrado'
            );
        }

        res.redirect('/repositorios');

    } catch (error) {

        console.error(
            'Error al eliminar repositorio:',
            error
        );

        res.status(500).send(
            'Error al eliminar el repositorio'
        );
    }
};
// ACCEDER A UN REPOSITORIO
const accederRepositorio = async (req, res) => {
    try {
        const idRepositorio = req.params.id;
        const idUsuario = req.session.usuario.id;

        // Consultar el repositorio y comprobar que pertenece al usuario
        const [repositorios] = await db.promise().query(
            `SELECT *
             FROM repositorios
             WHERE id_repositorio = ?
             AND id_usuario = ?
             AND estado = TRUE`,
            [idRepositorio, idUsuario]
        );

        if (repositorios.length === 0) {
            return res.status(404).send('Repositorio no encontrado');
        }

        // Consultar las carpetas del repositorio
        const [carpetas] = await db.promise().query(
            `SELECT *
             FROM carpetas
             WHERE id_repositorio = ?
             AND estado = TRUE
             ORDER BY fecha_creacion DESC`,
            [idRepositorio]
        );

        res.render('repositorios/detalle', {
            title: repositorios[0].nombre,
            repositorio: repositorios[0],
            carpetas
        });

    } catch (error) {
        console.error('Error al acceder al repositorio:', error);
        res.status(500).send('Error al acceder al repositorio');
    }
};

// EXPORTAR
module.exports = {
    listarRepositorios,
    mostrarCrearRepositorio,
    crearRepositorio,
    mostrarEditarRepositorio,
    editarRepositorio,
    eliminarRepositorio,
    accederRepositorio
};