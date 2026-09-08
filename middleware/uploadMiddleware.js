const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Carpeta donde se almacenarán los documentos
const carpetaDocumentos = path.join(
    __dirname,
    '..',
    'storage',
    'documentos'
);

// Crear la carpeta si no existe
if (!fs.existsSync(carpetaDocumentos)) {
    fs.mkdirSync(carpetaDocumentos, {
        recursive: true
    });
}


// Configuración del almacenamiento
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, carpetaDocumentos);
    },

    filename: (req, file, cb) => {

        const extension = path.extname(file.originalname).toLowerCase();

        const nombreBase = path
            .basename(file.originalname, extension)
            .replace(/[^a-zA-Z0-9_-]/g, '_');

        const nombreUnico =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}-${nombreBase}${extension}`;

        cb(null, nombreUnico);
    }

});


// Extensiones permitidas
const extensionesPermitidas = [
    '.pdf',
    '.docx',
    '.txt'
];


// Tipos MIME permitidos
const tiposPermitidos = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
];


// Validación del archivo
const fileFilter = (req, file, cb) => {

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    const extensionValida =
        extensionesPermitidas.includes(extension);

    const tipoValido =
        tiposPermitidos.includes(file.mimetype);

    if (!extensionValida) {
        return cb(
            new Error('Tipo de extensión no permitido. Solo se aceptan PDF, DOCX y TXT.')
        );
    }

    if (!tipoValido) {
        return cb(
            new Error('El tipo de archivo no es válido.')
        );
    }

    cb(null, true);
};


// Configuración final de Multer
const upload = multer({

    storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter

});


module.exports = upload;