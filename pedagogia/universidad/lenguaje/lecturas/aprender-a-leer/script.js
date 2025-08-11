function toggleContent(elementId) {
    const content = document.getElementById(elementId);
    const button = content.previousElementSibling;

    // 1. Ocultar todas las demás secciones
    const allHiddenContents = document.querySelectorAll('.hidden-content.active');
    allHiddenContents.forEach(item => {
        if (item.id !== elementId) {
            item.classList.remove('active');
            item.previousElementSibling.textContent = 'Más información';
        }
    });

    // 2. Alternar la visibilidad de la sección actual
    content.classList.toggle('active');

    // 3. Cambiar el texto del botón actual
    if (content.classList.contains('active')) {
        button.textContent = "Menos información";
    } else {
        button.textContent = "Más información";
    }
}