document.addEventListener('DOMContentLoaded', () => {
    const storiesContainer = document.getElementById('stories-container');

    const stories = [
        {
            title: "Bajo la Tormenta",
            synopsis: "El renacimiento de un personaje que ya todos conocen, pero desde una perspectiva «distinta», buscando dar un nuevo comienzo, y quizá, nuevas historias.",
            image: "wattpad-portadas/Bajo_la_Tormenta.png",
            wattpadUrl: "https://www.wattpad.com/story/393607212"
        },
        /*{
            title: "Cuando casi Fuimos",
            synopsis: "",
            image: "wattpad-portadas/Cuando casi Fuimos.png",
            wattpadUrl: "https://www.wattpad.com/story/"
        },*/
        {
            title: "Desequilibrio",
            synopsis: "¿Has sentido como que te desvías? ¿No te sientes tú? ¿Reaccionas de formas fuera de lo normal? Esa desviación de vista te desequilibra. Este joven se cayó.",
            image: "wattpad-portadas/Desquilibrio.png",
            wattpadUrl: "https://.wattpad.com/story/391934569"
        },
        {
            title: "Lost Media",
            synopsis: "Mi mejor amiga fue borrada de la memoria de todos. Y no sé si soy el siguiente.",
            image: "wattpad-portadas/Lost Media.png",
            wattpadUrl: "https://www.wattpad.com/story/399853618"
        },
        {
            title: "Es la Muerte",
            synopsis: "",
            image: "wattpad-portadas/Muerte.png",
            wattpadUrl: "https://www.wattpad.com/story/399847206"
        },
        {
            title: "Natu: La historia de un inmortal",
            synopsis: "En un futuro lejano, Natu, un inmortal solitario, se aventura a la bulliciosa ciudad en busca de compañía, desatando un encuentro inesperado con su oscuro pasado.",
            image: "wattpad-portadas/Natu.png",
            wattpadUrl: "https://www.wattpad.com/story/359579112"
        },
        {
            title: "Normalidad",
            synopsis: "Joel ha vivido su vida junto a Iván de forma normal, con cenas, citas y lo que implica tener que llevar los gastos de una pareja que vive juntos, tanto que hasta los problemas se vuelven parte de esa normalidad, haciendo que uno se olvide de ellos.",
            image: "wattpad-portadas/Normalidad.png",
            wattpadUrl: "https://www.wattpad.com/story/331861567"
        },
        /*{
            title: "",
            synopsis: "",
            image: "wattpad-portadas/Silbidos.png",
            wattpadUrl: "https://www.wattpad.com/story/"
        },*/
        {
            title: "Travesía a lo Desconocido",
            synopsis: "¿Y si los cuentos que tu abuelo te contaba fueran más que solo historias? Romina se enfrenta a esta pregunta tras descubrir a su abuelo muerto. Junto a su amigo Elion, descubre Folgan, un mundo que solo existía en las historias de su infancia. En Folgan, Romina desentrañará verdades inimaginables y asumirá la responsabilidad de proteger a todos los que ama.",
            image: "wattpad-portadas/Travesía a lo Desconocido.png",
            wattpadUrl: "https://www.wattpad.com/story/342387679"
        },
        {
            title: "Última Carta",
            synopsis: "Al final se decidió por escribirle una última carta, y es esta.",
            image: "wattpad-portadas/Última Carta.png",
            wattpadUrl: "https://www.wattpad.com/story/332387378"
        }
    ];

    stories.forEach(story => {
        const storyCard = document.createElement('div');
        storyCard.classList.add('story-card');

        storyCard.innerHTML = `
            <img src="${story.image}" alt="Portada de ${story.title}">
            <div class="story-content">
                <div>
                    <h3>${story.title}</h3>
                    <p>${story.synopsis}</p>
                </div>
                <a href="${story.wattpadUrl}" class="read-button" target="_blank">Leer en Wattpad</a>
            </div>
        `;

        storiesContainer.appendChild(storyCard);
    });
});