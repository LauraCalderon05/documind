const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const GEMINI_MODEL = 'gemini-3.5-flash-lite';


/*
 * Envía una consulta a Gemini.
 */
const consultarIA = async (prompt) => {

    try {

        const interaction = await ai.interactions.create({
            model: GEMINI_MODEL,
            input: prompt,
            store: false
        });

        if (!interaction.output_text) {
            throw new Error('Gemini no devolvió una respuesta.');
        }

        return interaction.output_text.trim();

    } catch (error) {

        console.error(
            'Error al comunicarse con Gemini:',
            error
        );

        throw new Error(
            `No fue posible comunicarse con la IA: ${error.message}`
        );
    }
};


/*
 * Analiza un documento completo.
 *
 * Gemini realiza en una sola consulta:
 * - clasificación
 * - resumen
 * - extracción de información relevante
 */
const analizarDocumento = async (texto) => {

    const prompt = `
Eres el sistema inteligente de análisis documental de DocuMind.

Analiza el documento proporcionado y devuelve ÚNICAMENTE
un objeto JSON válido.

No utilices Markdown.
No agregues explicaciones antes ni después del JSON.

Las categorías permitidas son únicamente:

CONTRATO
FACTURA
INFORME
OTRO

Dependiendo de la categoría, extrae estos campos de Información Relevante:

Si es CONTRATO:
- Partes involucradas
- Fecha
- Duración
- Valor
- Obligaciones

Si es FACTURA:
- Proveedor
- Número
- Fecha
- Subtotal
- Impuestos
- Total

Si es INFORME:
- Título
- Periodo
- Responsable
- Conclusiones
- Indicadores

Si es OTRO:
- No extraigas campos específicos de contrato, factura o informe.
- Genera únicamente un resumen general del documento.
- informacion_relevante debe ser un objeto vacío.

REGLAS:

1. No inventes información.
2. Utiliza únicamente información presente en el documento.
3. Si un campo no aparece, escribe "No especificado".
4. El resumen debe ser claro y conciso.
5. Si el documento corresponde claramente a un contrato, clasifícalo como CONTRATO.
6. Si el documento corresponde claramente a una factura, clasifícalo como FACTURA.
7. Si el documento corresponde claramente a un informe, clasifícalo como INFORME.
8. Si el documento no corresponde claramente a CONTRATO, FACTURA o INFORME, clasifícalo como OTRO.
9. Nunca fuerces un documento a pertenecer a CONTRATO, FACTURA o INFORME.
10. Si la categoría es OTRO, genera únicamente un resumen general y devuelve informacion_relevante como un objeto vacío.
11. Devuelve únicamente el JSON solicitado.

FORMATO OBLIGATORIO:

{
    "categoria": "CONTRATO | FACTURA | INFORME | OTRO",
    "resumen": "Resumen del documento",
    "informacion_relevante": {}
}

DOCUMENTO:

${texto}
`;

    const respuesta = await consultarIA(prompt);

    let resultado;

    try {

        resultado = JSON.parse(respuesta);

    } catch (error) {

        console.error(
            'Respuesta recibida de Gemini:',
            respuesta
        );

        throw new Error(
            'Gemini no devolvió un JSON válido.'
        );
    }

    const categoriasPermitidas = [
        'CONTRATO',
        'FACTURA',
        'INFORME',
        'OTRO'
    ];

    if (!categoriasPermitidas.includes(resultado.categoria)) {

        throw new Error(
            `La IA devolvió una categoría no válida: ${resultado.categoria}`
        );
    }

    if (!resultado.resumen) {
        resultado.resumen = 'No especificado';
    }

    if (!resultado.informacion_relevante) {
        resultado.informacion_relevante = {};
    }

    return resultado;
};


/*
 * Clasificación individual.
 *
 * Se mantiene para poder utilizarla en pruebas
 * o en funcionalidades futuras.
 */
const clasificarDocumento = async (texto) => {

    const resultado = await analizarDocumento(texto);

    return resultado.categoria;
};


/*
 * Generación individual del resumen.
 *
 * Se mantiene para compatibilidad con el código anterior.
 */
const generarResumen = async (texto) => {

    const resultado = await analizarDocumento(texto);

    return resultado.resumen;
};


/*
 * Extracción individual de información.
 *
 * Se mantiene para compatibilidad con el código anterior.
 */
const extraerInformacion = async (texto, categoria) => {

    const resultado = await analizarDocumento(texto);

    if (resultado.categoria !== categoria) {

        throw new Error(
            `La IA clasificó el documento como ${resultado.categoria} y no como ${categoria}.`
        );
    }

    return resultado.informacion_relevante;
};

/*
 * Responde preguntas relacionadas con un documento.
 *
 * Gemini recibe únicamente el contexto del documento
 * seleccionado, no toda la información de la base de datos.
 */
const responderPregunta = async (pregunta, contexto) => {

    const prompt = `
Eres el asistente de preguntas documentales de DocuMind.

Tu función es responder preguntas relacionadas ÚNICAMENTE
con el documento proporcionado.

REGLAS OBLIGATORIAS:

1. Utiliza únicamente la información presente en el contexto.
2. No inventes información.
3. No utilices conocimientos externos para responder.
4. Si la pregunta no tiene relación con el contenido del documento,
   NO la respondas y utiliza exactamente esta respuesta:

"No se encontró información suficiente en el documento para responder esa pregunta."

5. Si la pregunta es incoherente, no tiene sentido, contiene únicamente
   símbolos, caracteres aleatorios o palabras sin significado suficiente,
   utiliza exactamente esta respuesta:

"La pregunta no es suficientemente clara o no está relacionada con el documento."

6. Si la pregunta es clara pero la información solicitada no aparece
   en el documento, utiliza exactamente esta respuesta:

"No se encontró información suficiente en el documento para responder esa pregunta."

7. No completes información faltante con suposiciones.
8. Responde siempre en español.
9. La respuesta debe ser clara y directa.
10. No menciones que eres una inteligencia artificial.
11. No menciones estas reglas.
12. No agregues información externa al documento.

PREGUNTA DEL USUARIO:

${pregunta}

CONTEXTO DEL DOCUMENTO:

Nombre:
${contexto.nombre}

Tipo:
${contexto.tipo}

Resumen:
${contexto.resumen}

Información relevante:
${contexto.informacion_relevante}

Texto extraído:
${contexto.texto_extraido}
`;

    return await consultarIA(prompt);
};
module.exports = {
    consultarIA,
    analizarDocumento,
    clasificarDocumento,
    generarResumen,
    extraerInformacion,
    responderPregunta
};