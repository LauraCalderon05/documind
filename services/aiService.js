const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:4b';
const OLLAMA_TIMEOUT = 5 * 60 * 1000;

const consultarIA = async (prompt) => {

    const controlador = new AbortController();

    const tiempoEspera = setTimeout(() => {
        controlador.abort();
    }, OLLAMA_TIMEOUT);


    try {

        const respuesta = await fetch(`${OLLAMA_URL}/api/generate`, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false
            }),

            signal: controlador.signal
        });


        if (!respuesta.ok) {

            throw new Error(
                `Error de Ollama: ${respuesta.status} ${respuesta.statusText}`
            );
        }


        const datos = await respuesta.json();

        return datos.response;


    } catch (error) {

        if (error.name === 'AbortError') {

            throw new Error(
                'La IA tardó demasiado tiempo en responder.'
            );
        }


        console.error(
            'Error al comunicarse con Ollama:',
            error
        );


        throw new Error(
            `No fue posible comunicarse con la IA: ${error.message}`
        );


    } finally {

        clearTimeout(tiempoEspera);
    }
};


/*
 * Clasifica el documento en una de las
 * categorías permitidas por el sistema.
 */
const clasificarDocumento = async (texto) => {

    const prompt = `
Eres el sistema de clasificación documental de DocuMind.

Analiza el siguiente documento y clasifícalo únicamente
en una de estas categorías:

CONTRATO
FACTURA
INFORME

Responde únicamente con una de las tres palabras.
No agregues explicaciones.

DOCUMENTO:
${texto}
`;

    const respuesta = await consultarIA(prompt);

    const categoria = respuesta
        .trim()
        .toUpperCase();

    if (!['CONTRATO', 'FACTURA', 'INFORME'].includes(categoria)) {

        throw new Error(
            `La IA devolvió una categoría no válida: ${respuesta}`
        );
    }

    return categoria;
};


/*
 * Genera un resumen del documento.
 */
const generarResumen = async (texto) => {

    const prompt = `
Eres el sistema de análisis documental de DocuMind.

Genera un resumen claro y conciso del siguiente documento.
El resumen debe contener únicamente la información más importante.

No inventes información que no aparezca en el documento.

DOCUMENTO:
${texto}
`;

    const respuesta = await consultarIA(prompt);

    return respuesta.trim();
};


/*
 * Extrae información relevante dependiendo
 * de la categoría del documento.
 */
const extraerInformacion = async (texto, categoria) => {

    let campos = '';


    if (categoria === 'CONTRATO') {

        campos = `
- Partes involucradas
- Fecha
- Duración
- Valor
- Obligaciones
`;

    } else if (categoria === 'FACTURA') {

        campos = `
- Proveedor
- Número
- Fecha
- Subtotal
- Impuestos
- Total
`;

    } else if (categoria === 'INFORME') {

        campos = `
- Título
- Periodo
- Responsable
- Conclusiones
- Indicadores
`;

    } else {

        throw new Error(
            `Categoría no válida para extracción: ${categoria}`
        );
    }


    const prompt = `
Eres el sistema de extracción de información
del sistema DocuMind.

El documento pertenece a la categoría:
${categoria}

Extrae únicamente los siguientes campos:

${campos}

REGLAS:
1. No inventes información.
2. Utiliza únicamente información presente en el documento.
3. Si un campo no aparece, escribe "No especificado".
4. Mantén cada campo claramente identificado.
5. No agregues campos diferentes a los solicitados.

DOCUMENTO:
${texto}
`;


    const respuesta = await consultarIA(prompt);

    return respuesta.trim();
};


module.exports = {
    consultarIA,
    clasificarDocumento,
    generarResumen,
    extraerInformacion
};