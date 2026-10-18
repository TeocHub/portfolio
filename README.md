# Portfolio de Tomás Cabrolier

Publicado en https://teochub.github.io/portfolio/

## Estructura

```
index.html            Portada (la tirada de arcanos)
assets/
  css/site.css        Sistema visual: colores, tipografías, barra, pie, índices
  css/armonia.css     Capa que unifica la tipografía de las páginas de contenido
  js/site.js          Catálogo de trabajos + barra, migas de pan, pie e índices
  img/                Favicon, foto y logos
pedagogia/            Pedagogía (V, El Hierofante)
  etica/ lenguaje/ historia/ tics/ matematicas/ fisica-quimica/
  practica/           Intervenciones en aula y textos de estudio
  tesis/
  recursos/           Bases curriculares y guía PAES
letras/               Letras (II, La Sacerdotisa): historias y calculadora editorial
codigo/               Código y juegos (I, El Mago): índice
esoterico/            Esotérico (XVIII, La Luna): índice
digital-monster/      Digital Monster (0, El Loco): sitio con marca propia
sitios/               Sitios web (VII, El Carro): Mar y Ola, SmartFit, SindicatoLegal
```

## Agregar un trabajo

1. Crea su carpeta dentro del área que corresponda, con su `index.html`.
2. En el `<head>` de la página agrega estas cuatro líneas, ajustando los `../` a la profundidad de la carpeta:

   ```html
   <link rel="icon" href="../../assets/img/favicon.svg" type="image/svg+xml">
   <link rel="stylesheet" href="../../assets/css/site.css">
   <link rel="stylesheet" href="../../assets/css/armonia.css">
   <script src="../../assets/js/site.js" defer></script>
   ```

   Con eso la página recibe la barra, las migas de pan, el pie y las tipografías del portfolio.
   Las páginas con marca propia (como Mar y Ola) no llevan `armonia.css`.
3. Abre `assets/js/site.js`, busca el área en `CATALOGO` y añade una línea:

   ```js
   { t: "Título", d: "Una frase que diga qué es.", url: "pedagogia/etica/mi-trabajo/", tipo: "Lectura guiada" }
   ```

   La ruta va siempre desde la raíz. Sin `url`, el trabajo aparece como pendiente.
   Los índices y los contadores de la portada se actualizan solos.

## Colores por área

| Área | Color |
| --- | --- |
| Pedagogía | `#2D7A57` |
| Letras | `#B03A4C` |
| Código y juegos | `#2468B5` |
| Esotérico | `#7448B8` |
| Digital Monster | `#C47B12` |
| Sitios web | `#1B8580` |

Base: índigo `#1C1F3F`, dorado `#D9B65A`, papel `#EEF1F6`, tinta `#1A1C2E`.
Tipografías: Bricolage Grotesque (títulos) y Literata (texto).
