# Portfolio de Tomás Cabrolier

Publicado en https://teochub.github.io/portfolio/

## Las dos barajas

El portfolio tiene dos estéticas, como mis dos mazos de tarot, y el botón de la barra cambia entre ellas en todo el sitio:

- **Luz**: cielo, sol y colores de chicle, con trazo grueso de tinta y sombras de pegatina.
- **Sombra**: tinta verde-negra, latón y cobre, filetes finos y relojería.

La primera visita usa la preferencia clara u oscura del dispositivo; después se recuerda la elección.

Tipografías: Fraunces (títulos, con sus ejes `SOFT` y `WONK` distintos en cada baraja) y Atkinson Hyperlegible (texto).

## Estructura

```
index.html            Portada (la tirada de arcanos)
assets/
  css/barajas.css     Colores de las dos barajas (generado por herramientas/barajas.py)
  css/site.css        Barra, pie, arcanos, portada e índices
  css/paginas.css     Plantilla común de las subpáginas: cabecera, índice lateral y componentes
  css/armonia.css     Capa de compatibilidad para el panel de Código 4D (app de proyección)
  js/site.js          Baraja activa, catálogo, barra, índice de la página, pestañas y recorridos
  js/autores.js       Directorio y comparador de autores de las guías de lectura
  js/haikus.js        Generador de haikus (desde Google Sheets o desde un CSV)
  img/                Favicon, foto y logos
herramientas/
  barajas.py          Genera barajas.css y revisa el contraste de cada par de colores
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
propuestas/           Propuestas (XVII, La Estrella): proyectos para construir con otros
```

Digital Monster, Mar y Ola, SmartFit, SindicatoLegal e Innovatech conservan su propia estética.
El panel de Código 4D mantiene su diseño de pantalla de proyección, pero usa los colores y la forma de botones del portfolio.

## Agregar un trabajo

Todas las subpáginas usan la misma plantilla: así se leen, se recorren y se ven igual.
No hace falta CSS propio; si algo no existe en la plantilla, agrégalo a `paginas.css` para que lo usen todas.

1. Crea su carpeta dentro del área que corresponda, con su `index.html`. Ajusta los `../` a la profundidad de la carpeta:

   ```html
   <!DOCTYPE html>
   <html lang="es" data-area="pedagogia">   <!-- pedagogia, letras, codigo, esoterico, sitios o propuestas -->
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Título | Tomás Cabrolier</title>
     <link rel="icon" href="../../assets/img/favicon.svg" type="image/svg+xml">
     <link rel="stylesheet" href="../../assets/css/site.css">
     <link rel="stylesheet" href="../../assets/css/paginas.css">
     <script src="../../assets/js/site.js"></script>
   </head>
   <body class="tc pagina">
     <header class="cielo cabecera-pagina">
       <div class="escena"></div>
       <div class="tc-contenedor">
         <p class="carta">Guía · Lenguaje</p>
         <h1>Título</h1>
         <p class="intro">Una o dos frases que digan qué es.</p>
         <ul class="meta"><li><b>Curso</b>6.º básico</li></ul>
       </div>
     </header>
     <div class="tc-contenedor lectura">
       <nav class="indice" data-indice-pagina aria-label="En esta página"></nav>
       <main class="cuerpo">
         <section class="bloque" id="primera-parte">
           <h2 data-corto="Nombre corto">Primera parte</h2>
           …
         </section>
       </main>
     </div>
   </body>
   </html>
   ```

   El script va **sin** `defer`: así elige la baraja antes de pintar la página y no hay parpadeo.
   El índice lateral se arma solo con los `h2` de cada `.bloque` (usa `data-corto` si el título es largo).

2. Arma el contenido con los componentes de `paginas.css`:

   | Para | Usa |
   | --- | --- |
   | Tarjetas | `ul.fichas > li.ficha` (`.dos` para dos columnas; `.acento` o `.resalte` para destacar) |
   | Más detalle dentro de una tarjeta | `details.mas` |
   | Secciones plegables | `.desplegables > details.desplegable` (`summary > span` con `small` opcional) |
   | Pestañas | `.pestanas[data-pestanas]` con `role="tablist"`, `role="tab"` y `role="tabpanel"` |
   | Avisos e ideas | `.nota`, `.nota.idea`, `.nota.aviso` (con `.titulo-nota`) |
   | Cifras | `.datos > .dato` (`.cifra` y `.que`) |
   | Tablas | `.tabla > table` (`.comparar` para comparar columnas) |
   | Conceptos | `dl.glosario > .termino` (`dt` y `dd`) |
   | Secuencias reales | `ol.pasos`, `.linea-tiempo` |
   | Gráficos simples | `.barras` (cada barra con `--v` y `--max`) o `.grafico` con Chart.js |
   | Herramientas y formularios | `.herramienta`, `.campos > .campo`, `.resultado` |
   | Botones | `.boton` (`.secundario`, `.chico`), agrupados en `.botones` |
   | Actividad por pasos | `[data-recorrido] > section.paso-recorrido[data-titulo]`: barra de avance, botones y revisión de campos `required` |
   | Otros | `.figura`, `.columnas`, `.etiquetas`, `.cita`, `.haiku`, `.podcast` |

3. Si necesitas color, usa los tokens de la baraja en vez de colores fijos, para que la página cambie con el botón:

   | Token | Para qué |
   | --- | --- |
   | `--fondo`, `--fondo-2` | Fondo de la página y franjas alternas |
   | `--superficie`, `--superficie-2` | Tarjetas y recuadros |
   | `--tinta`, `--tinta-2`, `--tinta-3` | Texto principal, secundario y tenue |
   | `--linea`, `--trazo` | Bordes suaves y el trazo de la baraja |
   | `--acento`, `--acento-relleno`, `--acento-suave` | Color del área: texto, bloques y fondos suaves |
   | `--resalte` | Sol (Luz) o latón (Sombra) |
   | `--h1` … `--h4` (y `-relleno`, `-suave`) | Colores secundarios: sol/latón, chicle/cobre, cielo/acero, lila/amatista |

   Para un gráfico de Chart.js, escribe los colores como texto: `backgroundColor: "var(--acento)"`. El portfolio los convierte y los actualiza al cambiar de baraja.

4. Abre `assets/js/site.js`, busca el área en `CATALOGO` y añade una línea:

   ```js
   { t: "Título", d: "Una frase que diga qué es.", url: "pedagogia/etica/mi-trabajo/", tipo: "Lectura guiada" }
   ```

   La ruta va siempre desde la raíz. Sin `url`, el trabajo aparece como pendiente.
   Los índices y los contadores de la portada se actualizan solos.

## La Rueda (páginas de cada área)

Las páginas de área (Pedagogía, Letras, Código, Esotérico, Sitios y los ramos) no muestran listas: muestran una rueda.
Cada trabajo del catálogo es un medallón; se gira arrastrando, con las flechas o tocando un medallón, y el que queda frente a la aguja se lee al lado.
Un segundo toque lo abre. El centro tira la rueda al azar. La página recuerda el último medallón al volver.

- Cada grupo del catálogo (`grupos[].titulo`) es una franja de color con su nombre grabado en el borde.
- El ícono sale del `tipo` (`ICONO_TIPO` en `site.js`), del ramo (`ICONO_HUB`) o del título (`ICONO_TITULO`). Si agregas un tipo nuevo, dale un ícono ahí.
- Las historias de Letras (`estante`) se muestran con su portada.
- Con menos de seis trabajos, la rueda deja huecos punteados para los que vengan.

## Cambiar un color

Edita `herramientas/barajas.py` y ejecuta `python3 herramientas/barajas.py`. El script regenera `assets/css/barajas.css` y avisa si algún texto queda con poco contraste.
