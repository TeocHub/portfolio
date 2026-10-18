document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const modal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');
    const buttons = document.querySelectorAll('.expand-btn');

    // Manejar el clic en los botones "Ver más"
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            const domainKey = button.getAttribute('data-domain');
            const filePath = `content/domain${domainKey}.txt`;
            
            try {
                // Hacer la petición al archivo .txt
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`No se pudo cargar el archivo: ${response.statusText}`);
                }
                const textContent = await response.text();
                
                // Dividir el contenido en líneas
                const lines = textContent.split('\n');
                let title = '';
                let bodyContent = '';

                // Extraer el título y el cuerpo
                if (lines[0].startsWith('###')) {
                    title = lines[0].substring(4).trim(); // Elimina "### " y espacios
                    bodyContent = lines.slice(1).join('\n'); // El resto es el cuerpo
                } else {
                    title = `Contenido del Dominio ${domainKey}`;
                    bodyContent = textContent;
                }
                
                // Formatear el cuerpo del texto a HTML
                const htmlContent = formatTextToHtml(bodyContent);

                // Insertar el contenido en el modal
                modalTitle.textContent = title;
                modalBody.innerHTML = htmlContent;
                
                modal.style.display = 'block';

            } catch (error) {
                console.error('Error al cargar el contenido:', error);
                modalTitle.textContent = 'Error';
                modalBody.innerHTML = `<p>Ocurrió un error al cargar la información.</p>`;
                modal.style.display = 'block';
            }
        });
    });

    // Función simple para convertir el texto plano a HTML
    function formatTextToHtml(text) {
        let lines = text.split('\n').filter(line => line.trim() !== '');
        let htmlContent = '';
        let inList = false;

        lines.forEach(line => {
            if (line.startsWith('- ')) {
                if (!inList) { htmlContent += '<ul>'; inList = true; }
                htmlContent += `<li>${line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`;
            } else {
                if (inList) { htmlContent += '</ul>'; inList = false; }
                htmlContent += `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
            }
        });

        if (inList) { htmlContent += '</ul>'; }
        return htmlContent;
    }


    // Manejar el clic en el botón de cerrar
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Manejar el clic fuera del modal para cerrarlo
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});