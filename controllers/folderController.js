const db = require('../config/database');

// Mostrar formulario para crear una carpeta
const mostrarCrearCarpeta = async (req, res) => {
    try {
        const idRepositorio = req.params.idRepositorio;
        const idUsuario = req.session.usuario.id;

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

        res.render('carpetas/crear', {
            title: 'Crear carpeta',
            repositorio: repositorios[0]
        });

    } catch (error) {
        console.error('Error al mostrar formulario:', error);
        res.status(500).send('Error al cargar el formulario');
    }
};


// Crear carpeta
const crearCarpeta = async (req, res) => {
    try {
        const idRepositorio = req.params.idRepositorio;
        const idUsuario = req.session.usuario.id;
        const { nombre, descripcion } = req.body;

        if (!nombre || nombre.trim() === '') {
            return res.status(400).send('El nombre de la carpeta es obligatorio');
        }

        const [repositorios] = await db.promise().query(
            `SELECT id_repositorio
             FROM repositorios
             WHERE id_repositorio = ?
             AND id_usuario = ?
             AND estado = TRUE`,
            [idRepositorio, idUsuario]
        );

        if (repositorios.length === 0) {
            return res.status(404).send('Repositorio no encontrado');
        }

        await db.promise().query(
            `INSERT INTO carpetas
            (nombre, descripcion, id_repositorio)
            VALUES (?, ?, ?)`,
            [
                nombre.trim(),
                descripcion || null,
                idRepositorio
            ]
        );

        res.redirect(`/repositorios/${idRepositorio}`);

    } catch (error) {
        console.error('Error al crear carpeta:', error);
        res.status(500).send('Error al crear la carpeta');
    }
};


// Mostrar formulario para editar una carpeta
const mostrarEditarCarpeta = async (req, res) => {
    try {
        const idRepositorio = req.params.idRepositorio;
        const idCarpeta = req.params.idCarpeta;
        const idUsuario = req.session.usuario.id;

        const [carpetas] = await db.promise().query(
            `SELECT c.*, r.nombre AS nombre_repositorio
             FROM carpetas c
             INNER JOIN repositorios r
                 ON c.id_repositorio = r.id_repositorio
             WHERE c.id_carpeta = ?
             AND c.id_repositorio = ?
             AND r.id_usuario = ?
             AND c.estado = TRUE
             AND r.estado = TRUE`,
            [idCarpeta, idRepositorio, idUsuario]
        );

        if (carpetas.length === 0) {
            return res.status(404).send('Carpeta no encontrada');
        }

        res.render('carpetas/editar', {
            title: 'Editar carpeta',
            carpeta: carpetas[0]
        });

    } catch (error) {
        console.error('Error al consultar carpeta:', error);
        res.status(500).send('Error al consultar la carpeta');
    }
};


// Editar carpeta
const editarCarpeta = async (req, res) => {
    try {
        const idRepositorio = req.params.idRepositorio;
        const idCarpeta = req.params.idCarpeta;
        const idUsuario = req.session.usuario.id;

        const { nombre, descripcion } = req.body;

        if (!nombre || nombre.trim() === '') {
            return res.status(400).send('El nombre de la carpeta es obligatorio');
        }

        const [resultado] = await db.promise().query(
            `UPDATE carpetas c
             INNER JOIN repositorios r
                 ON c.id_repositorio = r.id_repositorio
             SET c.nombre = ?,
                 c.descripcion = ?
             WHERE c.id_carpeta = ?
             AND c.id_repositorio = ?
             AND r.id_usuario = ?
             AND c.estado = TRUE
             AND r.estado = TRUE`,
            [
                nombre.trim(),
                descripcion || null,
                idCarpeta,
                idRepositorio,
                idUsuario
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).send('Carpeta no encontrada');
        }

        res.redirect(`/repositorios/${idRepositorio}`);

    } catch (error) {
        console.error('Error al editar carpeta:', error);
        res.status(500).send('Error al editar la carpeta');
    }
};


// Eliminar carpeta
const eliminarCarpeta = async (req, res) => {
    try {
        const idRepositorio = req.params.idRepositorio;
        const idCarpeta = req.params.idCarpeta;
        const idUsuario = req.session.usuario.id;

        const [resultado] = await db.promise().query(
            `DELETE c
             FROM carpetas c
             INNER JOIN repositorios r
                 ON c.id_repositorio = r.id_repositorio
             WHERE c.id_carpeta = ?
             AND c.id_repositorio = ?
             AND r.id_usuario = ?
             AND c.estado = TRUE
             AND r.estado = TRUE`,
            [idCarpeta, idRepositorio, idUsuario]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).send('Carpeta no encontrada');
        }

        res.redirect(`/repositorios/${idRepositorio}`);

    } catch (error) {
        console.error('Error al eliminar carpeta:', error);
        res.status(500).send('Error al eliminar la carpeta');
    }
};


// Acceder a una carpeta
const accederCarpeta = async (req, res) => {
    try {
        const idRepositorio = req.params.idRepositorio;
        const idCarpeta = req.params.idCarpeta;
        const idUsuario = req.session.usuario.id;

        const [carpetas] = await db.promise().query(
            `SELECT c.*, r.nombre AS nombre_repositorio
             FROM carpetas c
             INNER JOIN repositorios r
                 ON c.id_repositorio = r.id_repositorio
             WHERE c.id_carpeta = ?
             AND c.id_repositorio = ?
             AND r.id_usuario = ?
             AND c.estado = TRUE
             AND r.estado = TRUE`,
            [idCarpeta, idRepositorio, idUsuario]
        );

        if (carpetas.length === 0) {
            return res.status(404).send('Carpeta no encontrada');
        }

        res.render('carpetas/detalle', {
            title: carpetas[0].nombre,
            carpeta: carpetas[0]
        });

    } catch (error) {
        console.error('Error al acceder a la carpeta:', error);
        res.status(500).send('Error al acceder a la carpeta');
    }
};


module.exports = {
    mostrarCrearCarpeta,
    crearCarpeta,
    mostrarEditarCarpeta,
    editarCarpeta,
    eliminarCarpeta,
    accederCarpeta
};