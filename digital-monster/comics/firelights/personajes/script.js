document.addEventListener('DOMContentLoaded', () => {

    const listaPersonajes = document.getElementById('lista-personajes');
    const contenidoPersonaje = document.getElementById('contenido-personaje');
    const mensajeBienvenida = document.getElementById('mensaje-bienvenida');

    // Función para convertir texto con formato simple (Markdown) a HTML
    function convertirMarcadoAHtml(texto) {
        // Negrita: **texto** -> <strong>texto</strong>
        texto = texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Cursiva: *texto* -> <em>texto</em>
        texto = texto.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Subrayado: _texto_ -> <u>texto</u>
        texto = texto.replace(/_(.*?)_/g, '<u>$1</u>');
        
        // Enlaces: [texto](url) -> <a href="url">texto</a>
        texto = texto.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        
        // Saltos de línea (si los necesitas)
        texto = texto.replace(/\n/g, '<br>');
        
        return texto;
    }

    // Agrega un "escuchador de eventos" a la lista de personajes
    listaPersonajes.addEventListener('click', (evento) => {
        evento.preventDefault(); 
        
        let elementoClickeado = evento.target;
        let nombrePersonaje = null;
        
        while (elementoClickeado && !nombrePersonaje) {
            nombrePersonaje = elementoClickeado.dataset.personaje;
            elementoClickeado = elementoClickeado.parentElement;
        }

        if (nombrePersonaje) {
            cargarDatosPersonaje(nombrePersonaje);
        }
    });

    // Función principal para cargar y mostrar los datos del personaje
    function cargarDatosPersonaje(nombrePersonaje) {
        mensajeBienvenida.style.display = 'none';
        contenidoPersonaje.style.display = 'block';

        fetch(`${nombrePersonaje}/${nombrePersonaje}.txt`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo cargar el archivo del personaje.');
                }
                return response.json();
            })
            .then(data => {
                document.title = `Personaje | ${data.nombre}`;
                document.getElementById('nombre-personaje').textContent = data.nombre;

                const imagen = document.getElementById('personaje-imagen');
                imagen.src = `${nombrePersonaje}/${data.imagen}`;
                imagen.alt = `Imagen de ${data.nombre}`;

                if (data.imagen_fondo) {
                    document.body.style.backgroundImage = `url('${nombrePersonaje}/${data.imagen_fondo}')`;
                } else {
                    document.body.style.backgroundImage = 'none';
                }

                // Utiliza la nueva función para procesar el texto de la descripción
                const descripcionHtml = convertirMarcadoAHtml(data.descripcion);
                document.getElementById('descripcion-personaje').innerHTML = descripcionHtml;

                const infoboxContainer = document.getElementById('infobox-container');
                let infoboxHTML = `
                    <h2>Información de ${data.nombre}</h2>
                    <table>
                        <tbody>
                `;

                for (const key in data.tabla_info) {
                    let valor = data.tabla_info[key];
                    if (Array.isArray(valor)) {
                        valor = `<ul>${valor.map(item => `<li>${item}</li>`).join('')}</ul>`;
                    }
                    infoboxHTML += `
                        <tr>
                            <th>${key}</th>
                            <td>${valor}</td>
                        </tr>
                    `;
                }

                infoboxHTML += `
                        </tbody>
                    </table>
                `;

                infoboxContainer.innerHTML = infoboxHTML;
            })
            .catch(error => {
                console.error('Error al cargar los datos del personaje:', error);
                document.getElementById('nombre-personaje').textContent = 'Error: Personaje no encontrado';
            });
    }
});