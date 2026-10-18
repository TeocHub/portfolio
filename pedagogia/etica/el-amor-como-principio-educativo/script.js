// script.js
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    const contentSections = document.querySelector('.content-sections');
    
    // Ocultar todos los contenidos al cargar la página
    document.querySelectorAll('.content-card').forEach(card => {
        card.style.display = 'none';
    });

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = card.id + '-content';
            const targetContent = document.getElementById(targetId);

            // Ocultar todos los contenidos
            document.querySelectorAll('.content-card').forEach(c => {
                c.style.display = 'none';
            });
            
            // Mostrar el contenido del botón clickeado
            if (targetContent) {
                targetContent.style.display = 'block';
                // Hacer scroll a la sección de contenido
                contentSections.style.display = 'block'; // Asegurar que el contenedor sea visible
                window.scrollTo({
                    top: contentSections.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});