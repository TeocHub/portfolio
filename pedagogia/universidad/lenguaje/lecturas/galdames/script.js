document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-button');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const hiddenContent = button.nextElementSibling;
            
            // Toggle the 'active' class on the hidden content
            hiddenContent.classList.toggle('active');
            
            // Change button text based on state
            if (hiddenContent.classList.contains('active')) {
                button.textContent = 'Ver menos';
            } else {
                button.textContent = 'Ver más';
            }
        });
    });
});