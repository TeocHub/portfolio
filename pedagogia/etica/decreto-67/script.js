document.addEventListener('DOMContentLoaded', function() {
    // Lógica para los botones de las tarjetas
    const cardButtons = document.querySelectorAll('.expand-btn');

    cardButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentContent = button.nextElementSibling;
            
            // Cierra todas las demás tarjetas
            cardButtons.forEach(otherButton => {
                const otherContent = otherButton.nextElementSibling;
                if (otherContent !== currentContent && otherContent.classList.contains('show')) {
                    otherContent.classList.remove('show');
                    otherButton.textContent = 'Más detalles';
                }
            });

            // Abre o cierra la tarjeta actual
            currentContent.classList.toggle('show');
            if (currentContent.classList.contains('show')) {
                button.textContent = 'Menos detalles';
            } else {
                button.textContent = 'Más detalles';
            }
        });
    });

    // Lógica para el acordeón
    const accordionTitles = document.querySelectorAll('.accordion-title');

    accordionTitles.forEach(title => {
        title.addEventListener('click', () => {
            // Oculta el contenido de todos los demás acordeones
            const allAccordionItems = document.querySelectorAll('.accordion-item');
            const currentContent = title.nextElementSibling;

            allAccordionItems.forEach(item => {
                const otherContent = item.querySelector('.accordion-content');
                if (otherContent !== currentContent && otherContent.classList.contains('show')) {
                    otherContent.classList.remove('show');
                }
            });

            // Muestra u oculta el contenido del acordeón actual
            currentContent.classList.toggle('show');
        });
    });
});