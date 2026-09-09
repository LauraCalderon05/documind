const fs = require('fs');

const {
    PDFParse
} = require('pdf-parse');

const extraerTextoPDF = async (rutaArchivo) => {

    const archivo = fs.readFileSync(rutaArchivo);

    const parser = new PDFParse({
        data: archivo
    });

    const resultado = await parser.getText();

    await parser.destroy();

    return resultado.text;
};

module.exports = {
    extraerTextoPDF
};