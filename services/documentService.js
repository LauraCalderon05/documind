const fs = require('fs');
const { extraerTextoPDF } = require('./pdfService');
const { extraerTextoDOCX } = require('./docxService');

const extraerTexto = async (rutaArchivo, extension) => {

    const extensionNormalizada = extension
        .toLowerCase()
        .replace('.', '');

    switch (extensionNormalizada) {

        case 'pdf':
            return await extraerTextoPDF(rutaArchivo);

        case 'docx':
            return await extraerTextoDOCX(rutaArchivo);

        case 'txt':
            return await fs.promises.readFile(
                rutaArchivo,
                'utf8'
            );

        default:
            throw new Error(
                `Extensión no soportada: ${extension}`
            );
    }
};

module.exports = {
    extraerTexto
};