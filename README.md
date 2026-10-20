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
  css/armonia.css     Capa común para las páginas de contenido (botones, pestañas, controles)
  js/site.js          Baraja activa, catálogo de trabajos, barra, migas de pan e índices
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
```

Digital Monster, Mar y Ola, SmartFit, SindicatoLegal e Innovatech conservan su propia estética.

## Agregar un trabajo

1. Crea su carpeta dentro del área que corresponda, con su `index.html`.
2. En el `<head>` de la página agrega estas cuatro líneas, ajustando los `../` a la profundidad de la carpeta:

   ```html
   <link rel="icon" href="../../assets/img/favicon.svg" type="image/svg+xml">
   <link rel="stylesheet" href="../../assets/css/site.css">
   <link rel="stylesheet" href="../../assets/css/armonia.css">
   <script src="../../assets/js/site.js"></script>
   ```

   El script va **sin** `defer`: así elige la baraja antes de pintar la página y no hay parpadeo.
3. Usa los colores de la baraja en vez de colores fijos, para que la página cambie con el botón:

   ```css
   body   { background: var(--fondo); color: var(--tinta); }
   .tarjeta { background: var(--superficie); box-shadow: var(--sombra-suave); border-radius: var(--radio-sm); }
   .boton { /* o usa la clase "btn": ya tiene la forma del portfolio */ }
   .aviso { background: var(--acento-suave); border-left: 4px solid var(--acento); }
   ```

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

## Cambiar un color

Edita `herramientas/barajas.py` y ejecuta `python3 herramientas/barajas.py`. El script regenera `assets/css/barajas.css` y avisa si algún texto queda con poco contraste.
