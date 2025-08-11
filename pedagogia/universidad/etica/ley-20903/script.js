document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.toggle-btn');
    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            const clickedButton = event.currentTarget;
            const targetId = clickedButton.getAttribute('data-target');
            const targetInfo = document.getElementById(targetId);
            
            // Encuentra el contenedor de tarjetas padre para restringir la acción a la misma sección
            const parentCardContainer = clickedButton.closest('.card-container');
            const allHiddenInfosInContainer = parentCardContainer.querySelectorAll('.hidden-info');
            const allButtonsInContainer = parentCardContainer.querySelectorAll('.toggle-btn');

            // Cierra todos los demás recuadros abiertos en la misma sección
            allHiddenInfosInContainer.forEach(info => {
                if (info.id !== targetId && info.style.display === 'block') {
                    info.style.display = 'none';
                }
            });

            // Resetea el texto de los otros botones
            allButtonsInContainer.forEach(btn => {
                if (btn !== clickedButton) {
                    btn.textContent = 'Más información';
                }
            });

            // Alterna el estado del recuadro actual
            if (targetInfo.style.display === 'block') {
                targetInfo.style.display = 'none';
                clickedButton.textContent = 'Más información';
            } else {
                targetInfo.style.display = 'block';
                clickedButton.textContent = 'Menos información';
            }
        });
    });
});