require('dotenv').config();

const {
    generarResumen
} = require('./services/aiService');

const probarIA = async () => {

    try {

        console.log('--- PRUEBA DE RESUMEN ---');

        const resumen = await generarResumen(
            'Andes S.A.S. firma un contrato con Juan Pérez por doce meses.'
        );

        console.log(resumen);

    } catch (error) {

        console.error('Error:', error.message);
    }
};

probarIA();