require('dotenv').config();

const {
    analizarDocumento
} = require('./services/aiService');


const probarIA = async () => {

    try {

        console.log('--- PRUEBA DE ANÁLISIS DOCUMENTAL ---');

        console.time('Tiempo');

        const resultado = await analizarDocumento(`

CONTRATO DE PRESTACIÓN DE SERVICIOS

Entre Andes S.A.S. y Juan Pérez se celebra
un contrato de prestación de servicios.

La duración del contrato será de doce meses.

El valor total del contrato será de
$5.000.000.

Las partes se comprometen a cumplir las
obligaciones establecidas en el contrato.

        `);

        console.timeEnd('Tiempo');

        console.log('\n--- RESULTADO ---');
        console.log(
            JSON.stringify(resultado, null, 4)
        );

    } catch (error) {

        console.error('\nError:', error.message);
    }
};


probarIA();