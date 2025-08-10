document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const allDetailedInfo = document.querySelectorAll('.detailed-info');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            
            const isHidden = targetContent.classList.contains('hidden');

            // Cierra todas las secciones de información detallada
            allDetailedInfo.forEach(info => {
                info.classList.add('hidden');
                // Restablece el texto de los botones a "Ver más"
                const relatedButton = document.querySelector(`.toggle-btn[data-target="${info.id}"]`);
                if (relatedButton) {
                    relatedButton.textContent = 'Ver más';
                }
            });

            // Si la sección que se hizo clic estaba oculta, la muestra ahora
            if (isHidden) {
                targetContent.classList.remove('hidden');
                button.textContent = 'Ver menos';
                targetContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});