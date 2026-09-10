document.addEventListener('DOMContentLoaded', () => {

    const botonChat = document.getElementById('boton-chat-documento');
    const ventanaChat = document.getElementById('ventana-chat-documento');
    const botonCerrar = document.getElementById('cerrar-chat-documento');

    const formulario = document.getElementById('formulario-chat-documento');
    const campoPregunta = document.getElementById('pregunta-documento');
    const mensajes = document.getElementById('mensajes-chat-documento');
    const indicador = document.getElementById('indicador-chat-documento');

    if (!botonChat || !ventanaChat || !formulario) {
        return;
    }

    // Abrir chat
    botonChat.addEventListener('click', () => {

        ventanaChat.classList.add('chat-visible');

        botonChat.classList.add('chat-oculto');

        campoPregunta.focus();

    });

    // Cerrar chat
    botonCerrar.addEventListener('click', () => {

        ventanaChat.classList.remove('chat-visible');

        botonChat.classList.remove('chat-oculto');

    });

    // Enviar pregunta
    formulario.addEventListener('submit', async (evento) => {

        evento.preventDefault();

        const pregunta = campoPregunta.value.trim();

        if (!pregunta) {

            mostrarMensaje(
                'No puedes enviar una pregunta vacía.',
                'error'
            );

            campoPregunta.focus();

            return;
        }

        // Mostrar pregunta del usuario
        mostrarMensaje(
            pregunta,
            'usuario'
        );

        campoPregunta.value = '';

        campoPregunta.disabled = true;

        mostrarIndicador(true);

        try {

            const respuesta = await fetch(
                formulario.action,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        pregunta
                    })
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok || !datos.exitoso) {

                mostrarMensaje(
                    datos.mensaje ||
                    'No fue posible procesar la pregunta.',
                    'error'
                );

                return;
            }

            // Mostrar respuesta de la IA
            mostrarMensaje(
                datos.respuesta,
                'ia'
            );

        } catch (error) {

            console.error(
                'Error al comunicarse con el servidor:',
                error
            );

            mostrarMensaje(
                'No fue posible comunicarse con DocuMind. Inténtalo nuevamente.',
                'error'
            );

        } finally {

            mostrarIndicador(false);

            campoPregunta.disabled = false;

            campoPregunta.focus();

        }

    });

    // Mostrar un mensaje dentro del chat
    function mostrarMensaje(texto, tipo) {

        const mensaje = document.createElement('div');

        mensaje.classList.add(
            'mensaje-chat',
            `mensaje-${tipo}`
        );

        const contenido = document.createElement('div');

        contenido.classList.add(
            'mensaje-contenido'
        );

        contenido.textContent = texto;

        mensaje.appendChild(contenido);

        mensajes.appendChild(mensaje);

        desplazarChat();

    }

    // Mostrar/ocultar indicador de procesamiento
    function mostrarIndicador(mostrar) {

        if (mostrar) {

            indicador.classList.add(
                'indicador-visible'
            );

        } else {

            indicador.classList.remove(
                'indicador-visible'
            );

        }

        desplazarChat();

    }

    // Desplazar el chat hasta el último mensaje
    function desplazarChat() {

        mensajes.scrollTop =
            mensajes.scrollHeight;

    }

    // Limpiar el chat cuando se abandona la página
    window.addEventListener('pagehide', () => {

        mensajes.innerHTML = '';

        campoPregunta.value = '';

    });

});