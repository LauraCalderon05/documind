require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const probarGemini = async () => {

    try {

        console.log('--- PRUEBA GEMINI ---');
        console.time('Tiempo');

        const interaction = await ai.interactions.create({
            model: 'gemini-3.5-flash-lite',
            input: 'Responde únicamente: OK',
            store: false
        });

        console.timeEnd('Tiempo');

        console.log('Respuesta:', interaction.output_text);

    } catch (error) {

        console.error('Error:', error.message);

    }
};

probarGemini();