function cargarTexto(nombreArchivo) {
  fetch(`${nombreArchivo}.txt`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Archivo no encontrado');
      }
      return response.text();
    })
    .then(data => {
      document.getElementById('contenido').innerHTML = data; // ← CAMBIO CLAVE AQUÍ
    })
    .catch(error => {
      document.getElementById('contenido').textContent = 'Error al cargar el contenido.';
      console.error(error);
    });
}
// Carrusel funcional
let currentIndex = 0;
const track = document.querySelector('.card-track');
const cards = track.querySelectorAll('.card');
const visibleCards = 3;

function slideCarousel() {
  const totalCards = cards.length;
  const cardWidth = cards[0].offsetWidth + 20; // Añade espacio/margen

  currentIndex++;

  if (currentIndex > totalCards - visibleCards) {
    currentIndex = 0;
  }

  track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}

window.addEventListener('load', () => {
  setInterval(slideCarousel, 4000);
});