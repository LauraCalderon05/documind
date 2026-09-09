const mammoth = require('mammoth');

const extraerTextoDOCX = async (rutaArchivo) => {
    const resultado = await mammoth.extractRawText({
        path: rutaArchivo
    });

    return resultado.value;
};

module.exports = {
    extraerTextoDOCX
};