function showInfo(id) {
    // Ocultar todos los elementos de información adicional
    const allInfoElements = document.querySelectorAll('.additional-info');
    allInfoElements.forEach(element => {
        element.classList.add('hidden');
    });

    // Mostrar solo el elemento que corresponde al ID
    const infoElement = document.getElementById(`info-${id}`);
    if (infoElement) {
        infoElement.classList.remove('hidden');
    }
}

function showMoreInfo(id) {
    // Ocultar todos los sub-elementos de información adicional
    const allMoreInfoElements = document.querySelectorAll('.additional-info:not(#info-valorizacion):not(#info-enriquecimiento):not(#info-holistico):not(#info-destrezas)');
    allMoreInfoElements.forEach(element => {
        element.classList.add('hidden');
    });

    // Mostrar solo el sub-elemento que corresponde al ID
    const moreInfoElement = document.getElementById(id);
    if (moreInfoElement) {
        moreInfoElement.classList.remove('hidden');
    }
}