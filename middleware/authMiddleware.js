const requiereAutenticacion = (req, res, next) => {

    if (!req.session.usuario) {
        return res.redirect('/auth/login');
    }

    next();
};


const requiereAdministrador = (req, res, next) => {

    if (!req.session.usuario) {
        return res.redirect('/auth/login');
    }

    if (req.session.usuario.rol !== 'ADMINISTRADOR') {
        return res.status(403).send('Acceso denegado');
    }

    next();
};


module.exports = {
    requiereAutenticacion,
    requiereAdministrador
};