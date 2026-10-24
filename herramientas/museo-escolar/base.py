"""Piezas comunes para generar las páginas docentes de Nuevo Mundo Mágico."""

RAIZ_DOCENTES = "propuestas/mundo-magico/docentes"
PDF_DIR = RAIZ_DOCENTES + "/pdf"

ASIGNATURAS = [
    # slug, nombre largo, nombre corto, clases, duración
    ("historia", "Historia, Geografía y Ciencias Sociales", "Historia", 5, "90 min"),
    ("lenguaje", "Lenguaje y Comunicación", "Lenguaje", 4, "90 min"),
    ("matematica", "Matemática", "Matemática", 3, "90 min"),
    ("ciencias", "Ciencias Naturales", "Ciencias", 3, "90 min"),
    ("artes", "Artes Visuales", "Artes", 4, "90 min"),
    ("tecnologia", "Tecnología", "Tecnología", 4, "45 min"),
]

FUENTE_OA = {
    "historia": "https://www.curriculumnacional.cl/curriculum/1o-6o-basico/historia-geografia-ciencias-sociales/6-basico",
    "lenguaje": "https://www.curriculumnacional.cl/curriculum/1o-6o-basico/lenguaje-comunicacion/6-basico",
    "matematica": "https://www.curriculumnacional.cl/curriculum/1o-6o-basico/matematica/6-basico",
    "ciencias": "https://www.curriculumnacional.cl/curriculum/1o-6o-basico/ciencias-naturales/6-basico",
    "artes": "https://www.curriculumnacional.cl/curriculum/1o-6o-basico/artes-visuales/6-basico",
    "tecnologia": "https://www.curriculumnacional.cl/curriculum/1o-6o-basico/tecnologia/6-basico",
}


def prefijo(ruta):
    """'../' hasta la raíz desde una carpeta del sitio."""
    return "../" * (ruta.strip("/").count("/") + 1)


def pagina(ruta, titulo, carta, h1, intro, meta, cuerpo, descripcion):
    p = prefijo(ruta)
    meta_html = "".join(f"<li><b>{k}</b>{v}</li>" for k, v in meta)
    return f"""<!DOCTYPE html>
<html lang="es" data-area="propuestas">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{titulo} | Tomás Cabrolier</title>
  <meta name="description" content="{descripcion}">
  <link rel="icon" href="{p}assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="{p}assets/css/site.css">
  <link rel="stylesheet" href="{p}assets/css/paginas.css">
  <script src="{p}assets/js/site.js"></script>
</head>
<body class="tc pagina">
  <header class="cielo cabecera-pagina">
    <div class="escena"></div>
    <div class="tc-contenedor">
      <p class="carta">{carta}</p>
      <h1>{h1}</h1>
      <p class="intro">{intro}</p>
      <ul class="meta">{meta_html}</ul>
    </div>
  </header>

  <div class="tc-contenedor lectura">
    <nav class="indice" data-indice-pagina aria-label="En esta página"></nav>
    <main class="cuerpo">
{cuerpo}
    </main>
  </div>
</body>
</html>
"""


def bloque(id_, h2, contenido, corto=None, clase=""):
    dc = f' data-corto="{corto}"' if corto else ""
    cl = f"bloque {clase}".strip()
    return f"""
      <section class="{cl}" id="{id_}">
        <h2{dc}>{h2}</h2>
{contenido}
      </section>"""


def tabla(cabeza, filas, comparar=False):
    th = "".join(f"<th>{c}</th>" for c in cabeza)
    tr = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in f) + "</tr>" for f in filas)
    cl = "tabla comparar" if comparar else "tabla"
    return f'<div class="{cl}"><table><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div>'


def lista(items, ordenada=False):
    tag = "ol" if ordenada else "ul"
    return f"<{tag}>" + "".join(f"<li>{i}</li>" for i in items) + f"</{tag}>"


def clase(n, titulo, corto, semana, duracion, oas, objetivo, inicio, desarrollo, cierre,
          recursos, evaluacion, notas=None, preparar=None):
    """Una clase planificada: datos, inicio-desarrollo-cierre, recursos, evaluación."""
    datos = f"""<dl class="plan-datos">
          <div><dt>Semana</dt><dd>{semana}</dd></div>
          <div><dt>Duración</dt><dd>{duracion}</dd></div>
          <div class="ancho"><dt>Objetivos de aprendizaje</dt><dd>{oas}</dd></div>
          <div class="ancho objetivo"><dt>Objetivo de la clase</dt><dd>{objetivo}</dd></div>
        </dl>"""
    prep = ""
    if preparar:
        prep = f'<h3>Antes de la clase</h3>{lista(preparar)}'

    def mom(nombre, par):
        minutos, html = par
        return f'<div class="momento"><p class="momento-cab"><b>{nombre}</b><span>{minutos} min</span></p>{html}</div>'

    momentos = f'<h3>Secuencia</h3><div class="momentos">{mom("Inicio", inicio)}{mom("Desarrollo", desarrollo)}{mom("Cierre", cierre)}</div>'
    rec = f"<h3>Recursos y materiales</h3>{lista(recursos)}"
    ev = f"<h3>Evaluación</h3>{evaluacion}"
    nt = f'<div class="nota idea"><span class="titulo-nota">Para tener en cuenta</span>{notas}</div>' if notas else ""
    return bloque(f"clase-{n}", f"Clase {n} · {titulo}", datos + prep + momentos + rec + ev + nt,
                  corto=f"Clase {n} · {corto}", clase="clase")


def botones_descarga(slug_pdf, extra=""):
    return f"""<div class="botones">
          <a class="boton" href="../pdf/{slug_pdf}.pdf" download>Descargar PDF</a>
          {extra}
        </div>"""
