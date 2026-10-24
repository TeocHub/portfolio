"""Genera las páginas docentes del Mundo Mágico Miniatura Escolar: portada con plano, planificador, guías y datos.js.

Uso, desde la raíz del portfolio:  python3 herramientas/museo-escolar/museo_paginas.py

Dónde se edita cada cosa:
  museo_niveles.py  Clases de 1.°, 2.°, 3.°, 4.°, 5.°, 7.° y 8.° (ramo, fase, minutos, objetivo, inicio, desarrollo, cierre…)
  museo_detalle.py  Detalle adicional de algunas clases de 7.° y 8.°
  sexto.json        Clases de 6.° (vienen de la primera versión del proyecto); museo_datos.py les aplica ajustes
  museo_datos.py    Salas del plano, minutos por defecto de cada nivel y la tabla de lo que cada edad puede hacer
  museo_paginas.py  Portada docente, planificador y guías (este archivo)
  guias.py          Guías de 5.° a 8.° heredadas; las de 1.° a 4.° están en museo_paginas.py
Los PDF de las guías se regeneran imprimiendo cada pestaña de la página de guías.
"""
import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from base import pagina, bloque, tabla
from museo_datos import SALAS, CAPACIDADES, datos
import guias as G
from guias import guia, enc, L, R, vacias

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
D = "propuestas/mundo-magico/docentes"


def escribir(ruta, html):
    d = os.path.join(REPO, ruta)
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w").write(html)
    print("escrito", ruta)


def con_scripts(html, prefijo):
    return html.replace("</body>", f'  <script src="{prefijo}datos.js"></script>\n  <script src="{prefijo}museo.js"></script>\n</body>')


# ================================================================= Plano del museo (SVG)
SALAS_PLANO = {
    # nivel: (x, y, w, h)
    3: (20, 20, 170, 150), 7: (190, 20, 190, 150), 4: (380, 20, 190, 150), 2: (570, 20, 170, 150),
    1: (20, 170, 170, 330), 5: (190, 170, 380, 180), 8: (570, 170, 170, 330), 6: (190, 350, 380, 150),
}


def plano():
    s_by = {s["nivel"]: s for s in SALAS}
    g = []
    for n, (x, y, w, h) in SALAS_PLANO.items():
        s = s_by[n]
        cx = x + w / 2
        extra = ""
        if n == 5:
            # la mesa de la Gran Maqueta: 5 tramos
            mx, my, mw = cx - 150, y + 112, 300
            extra = (f'<rect class="mesa" x="{mx}" y="{my}" width="{mw}" height="22"/>' +
                     "".join(f'<line class="mesa-div" x1="{mx + mw * k / 5}" y1="{my}" x2="{mx + mw * k / 5}" y2="{my + 22}"/>' for k in range(1, 5)) +
                     f'<text class="plano-nota" x="{cx}" y="{my + 40}">Gran Maqueta · 4,3 m · cinco tramos</text>')
            ty = y + 48
        elif n == 1:
            extra = (f'<rect class="escenario" x="{x + 22}" y="{y + 210}" width="{w - 44}" height="54"/>'
                     f'<text class="plano-nota" x="{cx}" y="{y + 242}">Escenario</text>'
                     f'<text class="plano-nota izq" x="{x + 10}" y="{y + 292}">Entrada</text>')
            ty = y + 52
        else:
            ty = y + h / 2 - 8
        nombre = s["sala"]
        if len(nombre) > 15 and w < 300:
            pal = nombre.split(" ")
            corte = min(range(1, len(pal)), key=lambda k: abs(len(" ".join(pal[:k])) - len(" ".join(pal[k:]))))
            l1, l2 = " ".join(pal[:corte]), " ".join(pal[corte:])
            tit = f'<text class="sala-t" x="{cx}" y="{ty - 8}">{l1}</text><text class="sala-t" x="{cx}" y="{ty + 14}">{l2}</text>'
            ty += 10
        else:
            tit = f'<text class="sala-t" x="{cx}" y="{ty + 2}">{nombre}</text>'
        g.append(f'''<g class="sala" data-sala="{n}" tabindex="0" role="button" aria-pressed="false" aria-label="{s['num']}, {s['sala']}, {n}.° básico">
      <rect class="sala-fondo" x="{x}" y="{y}" width="{w}" height="{h}"/>
      <text class="sala-n" x="{cx}" y="{ty - (40 if len(nombre) > 15 and w < 300 else 22)}">{s['num']}</text>
      {tit}
      <text class="sala-c" x="{cx}" y="{ty + 26}">{n}.° básico</text>
      {extra}
    </g>''')
    # puertas: huecos en los muros
    puertas = [(20, 425, 0, 40), (190, 80, 0, 30), (380, 80, 0, 30), (570, 80, 0, 30), (630, 170, 40, 0),
               (570, 245, 0, 40), (570, 410, 0, 40), (190, 410, 0, 40), (80, 170, 40, 0), (300, 170, 40, 0), (360, 350, 40, 0)]
    pu = "".join(f'<line class="puerta" x1="{x}" y1="{y}" x2="{x + dx}" y2="{y + dy}"/>' for x, y, dx, dy in puertas)
    ruta = ('<path class="ruta" d="M6 445 H60 V95 H655 V200 L520 290 H650 V430 H330 H105 V470 H6" marker-end="url(#flecha)"/>')
    return f'''<svg class="plano-museo" viewBox="-14 0 774 520" role="group" aria-label="Plano del museo: ocho salas, una por nivel. Elige una para ver qué construye ese curso.">
  <defs><marker id="flecha" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="flecha"/></marker></defs>
  {''.join(g)}
  <rect class="muro" x="20" y="20" width="720" height="480"/>
  {pu}
  <path class="entrada" d="M-6 445 H14" marker-end="url(#flecha)"/>
</svg>'''


# ================================================================= Matriz de capacidades
def matriz():
    ic = {0: '<span class="punto vacio" title="No corresponde"></span>', 1: '<span class="punto medio" title="Con apoyo"></span>',
          2: '<span class="punto lleno" title="Autónomo"></span>'}
    th = "".join(f'<th scope="col">{n}.°</th>' for n in range(1, 9))
    tr = "".join(f'<tr><th scope="row">{nom}</th>' + "".join(f"<td>{ic[v]}</td>" for v in vals) + "</tr>" for nom, vals in CAPACIDADES)
    return f'''<div class="matriz"><table><thead><tr><td></td>{th}</tr></thead><tbody>{tr}</tbody></table>
  <p class="matriz-ley"><span class="punto lleno"></span> lo hace solo <span class="punto medio"></span> con apoyo del docente <span class="punto vacio"></span> no se le pide</p></div>'''


# ================================================================= Portada docente
PLACAS = [
    ("Los estudiantes hacen el museo", "El docente guía y cuida; los estudiantes investigan, deciden y construyen. Si una maqueta se ve demasiado perfecta, probablemente la hizo un adulto, y eso no se evalúa."),
    ("Cada sala nace de su currículum", "No se agregan contenidos. Cada nivel trabaja objetivos que ya le corresponden en Historia, Lenguaje, Artes y los demás ramos. El museo ordena lo que el colegio ya enseña."),
    ("Cada edad aporta lo que puede", "1.° pinta y canta; 2.° modela y lee una tarjeta; desde 4.° explican con un guion; 7.° y 8.° organizan el museo. A un curso no se le pide lo que no corresponde a su edad."),
    ("Más de una voz en cada sala", "Toda sala muestra al menos una mirada además de la oficial. Cuando el tema toca a pueblos originarios, se usan fuentes de ambas partes, y las familias se invitan como fuentes, nunca como objeto de estudio."),
    ("Una fecha, un museo", "Todos los cursos trabajan en las mismas semanas y abren el mismo día. Cada docente ajusta su planificación a su horario con el planificador; lo que no se mueve es la fecha de inauguración."),
    ("Se evalúa el aprendizaje, no lo bonito", "Hay una rúbrica común. La construcción cuenta, pero pesan más el contenido, la relación entre el lugar y la historia, y la explicación al público."),
    ("Reciclaje primero, caja común", "Los materiales se juntan en una caja común por curso, no por estudiante. Nadie queda fuera por no poder traer algo."),
    ("Cuidar a las personas", "Cartoneros solo con supervisión, circuitos solo con pilas, fotos solo con autorización de los apoderados y audioguías en cuentas del colegio."),
]

HITOS = [
    ("Tres semanas antes", "Coordinación", "UTP o quien coordine fija la fecha y el lugar de la inauguración, confirma qué niveles participan, reúne los materiales y pide las autorizaciones de imagen. Cada docente arma su calendario en el planificador."),
    ("Semana 1", "Lanzamiento", "Todos los cursos parten la misma semana con la misma pregunta: ¿qué Chile mostraba el Mundo Mágico original y qué Chile mostraremos nosotros?"),
    ("A mitad del proyecto", "Curaduría", "8.° presenta el recorrido y la señalética; 5.° confirma el espacio de la Gran Maqueta; 6.° prepara las invitaciones; 7.° graba las audioguías."),
    ("Última semana", "Montaje e inauguración", "8.° dirige el montaje sala por sala. 1.° abre el museo cantando en el escenario y cada curso guía su sala."),
    ("Después", "Cierre", "Cada curso reflexiona sobre qué Chile mostró y qué quedó fuera. Las fotos y las opiniones de los visitantes son la evidencia del proyecto."),
]

PROGRAMA = [
    ("08:30", "Montaje final: cada curso revisa su sala con el equipo curador de 8.°"),
    ("09:00", "Apertura en el escenario: 1.° básico canta"),
    ("09:15", "Visitas por turnos: cursos invitados y familias recorren las salas en orden"),
    ("10:45", "Mural de salida: «¿Qué Chile falta en nuestro museo?»"),
    ("11:00", "Cada curso vuelve a su sala para la reflexión final"),
]

FAQ = [
    ("¿Y si solo participa mi curso?", "Funciona igual: tu sala es tu museo. Usa el planificador de tu nivel, invita a otros cursos y a las familias, y mantén la pregunta del principio y la reflexión del final."),
    ("¿Y si 5.° básico no participa?", "La Gran Maqueta la construye 6.° con las sesiones de 5.° (en el planificador, elige 5.° básico). Si tampoco hay 6.°, el museo funciona sin maqueta: las salas se ordenan en el recorrido igual."),
    ("¿Cuánto tiempo necesita cada curso?", "Depende del nivel y de cuántos minutos semanales dé cada ramo. En el planificador eliges entre 4 y 8 semanas y los minutos de cada ramo; te avisa si algo no cabe y qué ajustar."),
    ("Mi colegio tiene 45 minutos de Tecnología y otro tiene 90. ¿Sirve igual?", "Sí. Si un ramo tiene 45 minutos y la clase dura 90, el planificador la divide en dos semanas y te dice qué parte hacer en cada una. Si un ramo no participa, sus clases pasan a otro ramo cuando es posible."),
    ("¿Los niños de 1.° básico tienen que exponer?", "No. En 1.° pintan, cantan y acompañan a sus familias. En 2.° leen o dicen una tarjeta corta en parejas. La exposición con guion empieza en 3.° y 4.°, y sin leer desde 5.°."),
    ("¿Cuánto cuesta?", "Entre $15.000 y $25.000 por curso, sobre todo en cola fría, témperas e impresión. 5.° necesita además pilas y ampolletas LED para el circuito. El resto es reciclaje."),
    ("¿Dónde se guardan los trabajos entre clases?", "Las cajas de los dioramas se apilan con una tapa de cartón. Los tramos de la Gran Maqueta se separan y se guardan planos. Conviene rotular todo con el curso y el equipo desde el primer día."),
]


def portada():
    s_cuerpo = ""
    s_cuerpo += bloque("museo", "Un museo, ocho salas", f'''
        <p class="bajada">Cada nivel construye la sala que le corresponde según su currículum. Juntas forman un recorrido por Chile, desde el planeta hasta hoy. Elige una sala.</p>
        <div class="museo-explorar">
          <div class="plano-caja" data-plano>{plano()}
            <div class="salas-chips" aria-label="Elegir sala por nivel">{"".join(f'<button type="button" data-sala-btn="{s["nivel"]}">{s["nivel"]}.°</button>' for s in sorted(SALAS, key=lambda x: x["nivel"]))}</div>
          </div>
          <aside class="sala-panel" data-sala-panel tabindex="-1" aria-live="polite"><noscript><p>Activa JavaScript para explorar las salas.</p></noscript></aside>
        </div>''', corto="El museo")
    s_cuerpo += bloque("edades", "Lo que cada edad puede hacer", f'''
        <p class="bajada">El museo no le pide lo mismo a todos. Las salas están pensadas para lo que cada curso puede hacer de verdad.</p>
        {matriz()}''', corto="Cada edad")
    placas = "".join(f'<div class="placa"><h3>{t}</h3><p>{p}</p></div>' for t, p in PLACAS)
    s_cuerpo += bloque("lineamientos", "Lineamientos para docentes", f'''
        <p class="bajada">Ocho acuerdos que sostienen el proyecto en todo el colegio. Son pocos a propósito: el resto lo decide cada docente.</p>
        <div class="placas">{placas}</div>''', corto="Lineamientos")
    hitos = "".join(f'<li><span class="cuando">{a}</span><h3>{b}</h3><p>{c}</p></li>' for a, b, c in HITOS)
    prog = "".join(f'<div><dt>{h}</dt><dd>{t}</dd></div>' for h, t in PROGRAMA)
    s_cuerpo += bloque("organizacion", "Cómo se organiza el colegio", f'''
        <p class="bajada">Una persona coordina; cada docente planifica su nivel; cuatro cursos tienen además un papel para todo el museo.</p>
        <ol class="regla">{hitos}</ol>
        <h3>El día de la inauguración</h3>
        <dl class="programa">{prog}</dl>''', corto="Organización")
    s_cuerpo += bloque("herramientas", "Para llevarlo a la sala", '''
        <div class="accesos">
          <a class="acceso" href="planificador/"><span class="acceso-k">Planificador</span><b>Arma el calendario de tu curso</b><span>Eliges nivel, semanas y los minutos de cada ramo; te entrega cada clase con inicio, desarrollo, cierre, recursos y evaluación, lista para imprimir.</span></a>
          <a class="acceso" href="guias/"><span class="acceso-k">Guías</span><b>Las guías de los estudiantes</b><span>Fichas, cédulas, guiones, pasaporte y pautas de evaluación, separadas por ciclo y listas para imprimir.</span></a>
        </div>''', corto="Planificador y guías")
    faq = "".join(f'<details class="desplegable"><summary><span>{q}</span></summary><div class="contenido"><p>{a}</p></div></details>' for q, a in FAQ)
    s_cuerpo += bloque("preguntas", "Preguntas frecuentes", f'<div class="desplegables">{faq}</div>')
    fuentes = "".join(f'<li><a href="https://www.curriculumnacional.cl/curriculum/{c}" target="_blank" rel="noopener">{t}</a></li>' for t, c in [
        ("Historia, Geografía y Ciencias Sociales, 1.° a 6.° básico", "1o-6o-basico/historia-geografia-ciencias-sociales/6-basico"),
        ("Historia, Geografía y Ciencias Sociales, 7.° y 8.° básico", "7o-basico-2o-medio/historia-geografia-ciencias-sociales/8-basico"),
        ("Lenguaje y Comunicación, 1.° a 6.° básico", "1o-6o-basico/lenguaje-comunicacion/6-basico"),
        ("Lengua y Literatura, 7.° y 8.° básico", "7o-basico-2o-medio/lengua-literatura/8-basico"),
        ("Artes Visuales", "1o-6o-basico/artes-visuales/6-basico"),
        ("Matemática", "1o-6o-basico/matematica/6-basico"),
        ("Ciencias Naturales", "1o-6o-basico/ciencias-naturales/6-basico"),
        ("Tecnología", "1o-6o-basico/tecnologia/6-basico"),
        ("Música, 1.° básico", "1o-6o-basico/musica/1-basico"),
        ("Educación Física y Salud, 1.° básico", "1o-6o-basico/educacion-fisica-salud/1-basico"),
    ])
    s_cuerpo += bloque("fuentes", "Objetivos de aprendizaje y fuentes", f'''
        <p>Todos los objetivos de aprendizaje del proyecto se verificaron en las fichas de cada nivel publicadas en Currículum Nacional (Mineduc). Cada clase del planificador indica los suyos.</p>
        <ul>{fuentes}</ul>''', corto="Fuentes")
    intro = ("Un museo de Chile hecho por todo el colegio, de 1.° a 8.° básico. Cada curso construye una sala según su "
             "currículum y su edad, y todas se abren el mismo día.")
    meta = [("Niveles", "1.° a 8.° básico"), ("Duración", "4 a 8 semanas"), ("Salas", "8")]
    html = pagina(D, "Mundo Mágico Miniatura Escolar · Para docentes", "Propuesta · Para docentes",
                  "Mundo Mágico Miniatura Escolar", intro, meta, s_cuerpo,
                  "Proyecto para todo el colegio, de 1.° a 8.° básico: cada curso construye una sala de un museo de Chile en miniatura. Plano del museo, lineamientos, planificador y guías.")
    html = html.replace('<div class="tc-contenedor lectura">\n    <nav class="indice" data-indice-pagina aria-label="En esta página"></nav>',
                        '<div class="tc-contenedor lectura sin-indice ancha">')
    return con_scripts(html, "")


# ================================================================= Planificador
def planificador():
    cuerpo = '''
      <section class="bloque" id="armar">
        <h2 data-corto="Tu horario">Tu curso y tu horario</h2>
        <div class="planificador" data-planificador>
          <div class="control">
            <p class="control-rotulo">Nivel</p>
            <div class="niveles" data-niveles></div>
          </div>
          <div class="control control-fila">
            <p class="control-rotulo">Semanas del proyecto</p>
            <div class="segmentos" data-semanas></div>
          </div>
          <div class="control">
            <p class="control-rotulo">Minutos semanales que cada ramo dedica al proyecto <small>Usa los de tu colegio; «No» si el ramo no participa.</small></p>
            <div class="minutos" data-minutos></div>
          </div>
        </div>
      </section>
      <section class="bloque" id="calendario">
        <h2 data-corto="Calendario">El calendario</h2>
        <div class="resumen" data-resumen aria-live="polite"></div>
        <div class="calendario" data-calendario></div>
        <div class="por-semana" data-por-semana></div>
        <p class="pie-grafico">Toca una clase para ver su planificación completa. Un borde punteado indica que la clase quedó después de su fase.</p>
      </section>
      <section class="bloque" id="imprimir">
        <h2 data-corto="Imprimir">Imprimir o guardar en PDF</h2>
        <p>Elige un ramo y se imprime su planificación con las semanas de tu calendario: una clase por hoja, con objetivo, inicio, desarrollo, cierre, recursos y evaluación. Para un PDF, elige «Guardar como PDF» en la ventana de impresión.</p>
        <div class="imprimir-fila">
          <select data-imprimir-ramo aria-label="Ramo para imprimir"></select>
          <button type="button" class="boton" data-imprimir>Imprimir planificación</button>
        </div>
        <p>Las guías de los estudiantes están en <a href="../guias/">el cuadernillo de guías</a>.</p>
      </section>
      <dialog class="clase-dialogo" data-clase aria-labelledby="clase-titulo">
        <div class="clase-cab">
          <div><p class="clase-sub" data-clase-sub></p><h2 id="clase-titulo" data-clase-titulo></h2></div>
          <button type="button" class="cerrar" data-clase-cerrar aria-label="Cerrar">×</button>
        </div>
        <div class="clase-cuerpo" data-clase-cuerpo></div>
        <div class="clase-pie">
          <button type="button" class="boton secundario chico" data-clase-ant>← Clase anterior</button>
          <button type="button" class="boton secundario chico" data-clase-sig>Clase siguiente →</button>
        </div>
      </dialog>
      <div class="impreso" data-impreso></div>'''
    intro = "Elige tu nivel, cuántas semanas tienes y cuántos minutos da cada ramo. El calendario se arma solo y cada clase trae su planificación completa."
    meta = [("Niveles", "1.° a 8.° básico"), ("Semanas", "4 a 8")]
    html = pagina(f"{D}/planificador", "Planificador · Mundo Mágico Miniatura Escolar", "Mundo Mágico Miniatura Escolar · Para docentes",
                  "Planificador", intro, meta, cuerpo,
                  "Planificador del Mundo Mágico Miniatura Escolar: arma el calendario de tu curso según tus semanas y los minutos de cada ramo.")
    html = html.replace('<div class="tc-contenedor lectura">\n    <nav class="indice" data-indice-pagina aria-label="En esta página"></nav>',
                        '<div class="tc-contenedor lectura sin-indice">')
    return con_scripts(html, "../")


# ================================================================= Guías por ciclo
A1 = guia("guia-a1", "A1", "Mi fiesta", "1.° básico · para la casa y para Artes", "Historia y Lenguaje (1.°)", f"""
  <p><b>Para la familia:</b> ¿Qué fiesta o celebración es importante para nuestra familia? ¿Qué hacemos ese día? Ayude a su hijo o hija a recordarla y a dibujarla.</p>
  <p>La fiesta de mi familia se llama:</p>{L(1)}
  <p>Dibujo de mi fiesta:</p>{R("16rem")}
  <p>En el museo quiero decir (lo escribe el docente):</p>{L(2)}""")
A2 = guia("guia-a2", "A2", "Mi pueblo y mi objeto", "2.° básico · por equipo", "Historia y Artes (2.°)", f"""
  <p>Nuestro pueblo es: ______________________ · Vivía en el: ☐ norte ☐ centro ☐ sur</p>
  {tabla(["Vivienda", "Alimento", "Abrigo"], [["", "", ""]]).replace("<td></td>", '<td class="vacia" style="height:9rem"></td>')}
  <p>El paisaje donde vivía era (dibújalo):</p>{R("7rem")}
  <p>El objeto que vamos a modelar es: ______________________ y está hecho de: ______________________</p>""")
A3 = guia("guia-a3", "A3", "Tarjeta del museo", "2.° básico · en parejas", "Lenguaje (2.°)", f"""
  <p><b>Modelo:</b> Esta es una ruka. Los mapuche la construían con paja y madera. Adentro cocinaban y conversaban.</p>
  <p>Esta es una ______________________.</p>{L(1)}<p>Los ______________________ la usaban para ______________________.</p>{L(1)}<p>Otra cosa que aprendimos:</p>{L(2)}
  <p>☐ Empecé con mayúscula · ☐ Terminé con punto · ☐ Se lee bien</p>""")

B1 = guia("guia-b1", "B1", "Ficha de investigación", "3.° y 4.° básico · por equipo", "Historia y Lenguaje (3.° y 4.°)", f"""
  <p><b>Nuestro tema:</b> ______________________________________________</p>
  {tabla(["Pregunta", "Lo que encontramos", "¿Dónde lo encontramos?"], [[q, "", ""] for q in ["¿Qué es o quiénes eran?", "¿Dónde está o dónde vivían?", "¿Cómo era? (forma, materiales, costumbres)", "¿Qué tiene de especial?", "¿Qué seguimos viendo hoy?"]]).replace("<td></td>", '<td class="vacia" style="height:4rem"></td>')}
  <p>Dibujo de lo que encontramos:</p>{R("10rem")}""")
B2 = guia("guia-b2", "B2", "Plan de construcción", "3.° y 4.° básico · por equipo", "Tecnología (3.° y 4.°)", f"""
  <p>Lo que vamos a construir (dibujo a mano alzada):</p>{R("9rem")}
  {tabla(["Paso", "Qué hacemos", "Materiales", "Herramientas", "Cuidado"], [[str(i), "", "", "", ""] for i in range(1, 6)]).replace("<td></td>", '<td class="vacia"></td>')}
  <p>Materiales reciclados que usaremos: ______________________________________________</p>""")
B3 = guia("guia-b3", "B3", "Cédula corta", "3.° y 4.° básico · por equipo", "Lenguaje (3.° y 4.°)", f"""
  <p>La cédula tiene dos párrafos: <b>qué es</b> y <b>por qué es importante</b>. 3.° básico: 40 a 60 palabras. 4.° básico: 60 a 80 palabras.</p>
  <p>Título:</p>{L(1)}<p>Párrafo 1 · Qué es:</p>{L(3)}<p>Párrafo 2 · Por qué es importante:</p>{L(3)}<p>Fuente:</p>{L(1)}
  <p>☐ Mayúsculas y puntos · ☐ Palabras propias · ☐ Sin repetir palabras · ☐ Letra grande y clara</p>""")
B4 = guia("guia-b4", "B4", "Guion de un minuto", "3.° y 4.° básico · individual", "Lenguaje (3.° y 4.°)", f"""
  {tabla(["Parte", "Qué digo (palabras clave)", "Qué muestro (dibujo)"], [["Inicio: saludo", "", ""], ["Desarrollo: qué es", "", ""], ["Desarrollo: lo especial", "", ""], ["Cierre (4.°): una pregunta al público", "", ""]]).replace("<td></td>", '<td class="vacia" style="height:4.4rem"></td>')}
  <p>Frases para empezar: «Bienvenidos a…» · «Esto es…» · «Lo especial es que…»</p>""")
B5 = guia("guia-b5", "B5", "Autoevaluación", "3.° y 4.° básico · individual", "Historia (3.° y 4.°)", f"""
  {tabla(["Me evalúo", "😀", "🙂", "😐"], [[c, "", "", ""] for c in ["Trabajé con mi equipo", "Busqué información", "Cuidé los materiales", "Expliqué a los visitantes"]]).replace("<td></td>", '<td class="vacia"></td>')}
  <p>Lo que más aprendí:</p>{L(2)}<p>Lo que haría distinto:</p>{L(2)}""")

G3A = guia("guia-3a", "3A", "Del kilómetro al centímetro", "5.° básico · por equipo", "Matemática (5.°)", f"""
  <div class="nota idea"><span class="titulo-nota">La regla del museo</span><p>1 cm de maqueta = 10 km reales. Para pasar de km a cm, divide por 10.</p></div>
  {tabla(["Zona", "Desde (latitud aprox.)", "Hasta (latitud aprox.)", "Diferencia", "× 111 = km", "÷ 10 = cm"], [
      ["Norte Grande", "17,5° S", "27,0° S", "", "", ""], ["Norte Chico", "27,0° S", "33,0° S", "", "", ""],
      ["Zona Central", "33,0° S", "37,5° S", "", "", ""], ["Zona Sur", "37,5° S", "41,5° S", "", "", ""],
      ["Zona Austral", "41,5° S", "56,0° S", "", "", ""]]).replace("<td></td>", '<td class="vacia"></td>')}
  <p>Suma de los cinco tramos: ______ cm. ¿Se parece a 4,3 m? Si no, ¿dónde está el error?</p>{L(2)}
  <p class="solucion"><b>Solucionario (docente):</b> Norte Grande 105 cm · Norte Chico 67 cm · Central 50 cm · Sur 44 cm · Austral 161 cm · Total 427 cm. Límites aproximados; acepta ±2 cm.</p>""")
G3B = guia("guia-3b", "3B", "Distancias en la Gran Maqueta y plano del diorama", "6.° básico · por equipo", "Matemática (6.°)", f"""
  <p><b>Parte A · Escala:</b> 1 : 1.000.000 significa que 1 cm de maqueta equivale a 1.000.000 cm reales = 10 km.</p>
  {tabla(["Distancia real", "En la maqueta"], [["100 km", ""], ["350 km", ""], ["4.300 km", ""]]).replace("<td></td>", '<td class="vacia"></td>')}
  <p><b>Parte B · Distancias desde Santiago (33,4° S):</b> diferencia de latitud × 111 = km; ÷ 10 = cm.</p>
  {tabla(["Capital", "Latitud", "Diferencia", "km", "cm calculados", "cm medidos en la maqueta"], [[c, l, "", "", "", ""] for c, l in [("________", "____° S"), ("________", "____° S")]]).replace("<td></td>", '<td class="vacia"></td>')}
  <p><b>Parte C · Plano del diorama:</b> largo ____ cm · ancho ____ cm · alto ____ cm.</p>
  <span class="cuadricula" style="--alto:9cm" aria-hidden="true"></span>
  <p><b>Parte D · Superficie de la caja sin tapa:</b> dibuja la red y suma el área de las cinco caras: ______ cm².</p>{R("8rem")}""")
G4A = guia("guia-4a", "4A", "El agua y la luz de nuestra zona", "5.° básico · por equipo", "Ciencias (5.°)", f"""
  <h4>Parte 1 · El agua</h4>
  {tabla(["Tipo de agua", "Nombre en nuestra zona", "¿Dulce o salada?", "Cómo la mostramos"], [[t, "", "", ""] for t in ["Mar", "Río", "Lago", "Glaciar"]]).replace("<td></td>", '<td class="vacia"></td>')}
  <p>Una acción para proteger el agua de nuestra zona:</p>{L(2)}
  <h4>Parte 2 · Una ciudad que se enciende</h4>
  <p>Dibuja tu circuito (pila, cables, interruptor, ampolleta):</p>{R("8rem")}
  {tabla(["Material", "¿Conduce?"], [[m, ""] for m in ["Clip", "Papel aluminio", "Plástico", "Goma"]]).replace("<td></td>", '<td class="vacia"></td>')}
  <p>¿Por qué se apaga la luz si abrimos el interruptor?</p>{L(2)}""")

G11 = guia("guia-11", "11", "Plan de curaduría", "8.° básico · todo el curso", "Artes Visuales y Tecnología (8.°)", f"""
  <p><b>El recorrido:</b> dibuja el plano del lugar y numera las salas en orden: Entrada (1.°), I Chile en el mundo (3.°), II Antes de Chile (7.°), III América antes de Chile (4.°), IV Pueblos originarios (2.°), Gran Sala (5.°), V Colonia y frontera (8.°), VI La República (6.°).</p>
  <span class="cuadricula" style="--alto:11cm" aria-hidden="true"></span>
  {tabla(["Señal", "Dónde va", "Texto", "Responsable"], [["", "", "", ""]] * 6).replace("<td></td>", '<td class="vacia"></td>')}
  <p><b>Para todas las personas:</b> ¿a qué altura van las cédulas para que las lean los niños de 1.°? ¿Hay paso para una silla de ruedas?</p>{L(2)}""")

PASAPORTE = guia("guia-8", "8", "Pasaporte del museo", "Para todos los visitantes", "Inauguración", f"""
  <p class="intro"><b>Mundo Mágico Miniatura Escolar</b> · Pasaporte de: ______________________</p>
  <p>Recorre las salas, escucha a los guías y pide tu timbre.</p>
  {tabla(["Sala", "Timbre", "Una cosa que aprendí"], [[s, "", ""] for s in ["Entrada · Así celebramos", "I · Chile en el mundo", "II · Antes de Chile", "III · América antes de Chile", "IV · Pueblos originarios", "Gran Sala · La Gran Maqueta", "V · Colonia y frontera", "VI · La República"]]).replace("<td></td>", '<td class="vacia" style="height:3.2em"></td>')}
  <p><b>¿Qué Chile falta en nuestro museo?</b></p>{L(2)}""")


TARJ5 = """
      <section class="bloque bloque-guia" id="tarjetas-5">
        <h2 data-corto="Tarjetas 5.°">Anexo · Tarjetas de sorteo de 5.° básico</h2>
        <p class="bajada">Para el docente · Historia, clase 1. Imprimir y recortar.</p>
        <div class="guia">
          <h3>Anexo · Tarjetas de sorteo de 5.° básico</h3>
          <ul class="fichas dos">""" + "".join(f'<li class="ficha"><span class="etiqueta">Equipo {n}</span><h4>{z}</h4><p>{m}</p></li>' for n, z, m in [
    (1, "Norte Grande", "El regreso de Almagro por el desierto de Atacama (1537)"),
    (2, "Norte Chico", "Almagro cruza la cordillera y llega a Copiapó (1536)"),
    (3, "Zona Central", "La fundación de Santiago (1541)"),
    (4, "Zona Sur", "La batalla de Curalaba (1598) y la frontera del Biobío"),
    (5, "Zona Austral", "Magallanes cruza el estrecho (1520)"),
]) + """</ul>
        </div>
      </section>"""


def sin_equipo(h):
    return h.replace("<li>Equipo y zona:</li>", "")


def guias_pagina():
    g1 = G.G1.replace("Parte A · Nuestra zona", "Parte A · El lugar").replace("Regiones y capitales", "Ubicación (región)").replace("Un rasgo de su población", "Quiénes vivían ahí").replace("Actividades económicas", "Actividades de las personas").replace("Parte B · Nuestro momento histórico", "Parte B · Nuestro tema histórico")
    g4b = G.G4.replace('id="guia-4"', 'id="guia-4b"').replace("Guía 4 · Bitácora científica", "Guía 4B · Bitácora científica").replace('data-corto="Guía 4"', 'data-corto="Guía 4B"').replace("Una por equipo · Ciencias, clases 1 a 3", "6.° básico · por equipo · Ciencias")
    g5 = G.G5
    paneles = [
        ("ciclo-1", "1.° y 2.° básico", "Hojas para dibujar y tarjetas cortas. En 1.° el docente escribe lo que los niños dictan.", sin_equipo(A1) + A2.replace("Equipo y zona", "Pueblo") + A3.replace("Equipo y zona", "Pueblo")),
        ("ciclo-2", "3.° y 4.° básico", "Fichas con preguntas cerradas, espacio para dibujar y una cédula de dos párrafos.", B1.replace("Equipo y zona", "Equipo y tema") + B2.replace("Equipo y zona", "Equipo y tema") + B3.replace("Equipo y zona", "Equipo y tema") + sin_equipo(B4) + sin_equipo(B5)),
        ("ciclo-3", "5.° a 8.° básico", "Investigación con fuentes, cédula, guion sin leer y pautas de evaluación. Las guías 3A, 3B, 4A, 4B y 11 son de un nivel específico.",
         (g1 + G.G2 + G3A + G3B + G4A + g4b + g5 + G.G6 + sin_equipo(G.G7) + sin_equipo(G.G9) + sin_equipo(G.G10) + G11 + TARJ5 + G.TARJETAS.replace("Anexo · Tarjetas de sorteo", "Anexo · Tarjetas de sorteo de 6.° básico").replace('id="tarjetas"', 'id="tarjetas-6"').replace('data-corto="Tarjetas de sorteo"', 'data-corto="Tarjetas 6.°"')).replace("Equipo y zona", "Equipo y tema")),
        ("todos", "Para todo el museo", "El pasaporte que reciben los visitantes en la entrada.", re.sub(r'<ul class="encabezado-guia">.*?</ul>', "", PASAPORTE, flags=re.S)),
    ]
    tabs = "".join(f'<button type="button" role="tab" id="t-{i}" aria-controls="p-{i}" aria-selected="{"true" if k == 0 else "false"}">{t}</button>' for k, (i, t, _, _) in enumerate(paneles))
    pans = "".join(f'''<div role="tabpanel" id="p-{i}" aria-labelledby="t-{i}"{"" if k == 0 else " hidden"}>
          <p class="bajada">{d}</p>
          <div class="botones"><button type="button" class="boton" data-imprimir-panel>Imprimir estas guías</button><a class="boton secundario" href="../pdf/mundo-magico-guias-{i}.pdf" download>Descargar PDF</a></div>
          {h}</div>''' for k, (i, t, d, h) in enumerate(paneles))
    cuerpo = f'''
      <section class="bloque" id="guias">
        <h2 data-corto="Guías">Las guías, por ciclo</h2>
        <div class="pestanas" data-pestanas>
          <div role="tablist" aria-label="Guías por ciclo">{tabs}</div>
          {pans}
        </div>
      </section>
      <script>
        document.addEventListener("click", function (e) {{
          if (!e.target.matches("[data-imprimir-panel]")) return;
          window.print();
        }});
      </script>'''
    intro = "Las guías que acompañan a los estudiantes, separadas por ciclo. Cada una empieza en una hoja nueva al imprimir."
    meta = [("Ciclos", "1.°–2.°, 3.°–4.° y 5.°–8.°"), ("Formato", "Carta")]
    html = pagina(f"{D}/guias", "Guías del estudiante · Mundo Mágico Miniatura Escolar", "Mundo Mágico Miniatura Escolar · Para docentes",
                  "Guías del estudiante", intro, meta, cuerpo,
                  "Guías imprimibles para estudiantes del Mundo Mágico Miniatura Escolar, de 1.° a 8.° básico.")
    html = html.replace('<body class="tc pagina">', '<body class="tc pagina guias-imprimibles">')
    return html.replace('<div class="tc-contenedor lectura">\n    <nav class="indice" data-indice-pagina aria-label="En esta página"></nav>',
                        '<div class="tc-contenedor lectura sin-indice">')


if __name__ == "__main__":
    import json
    js = "/* Datos del Mundo Mágico Miniatura Escolar: salas y sesiones por nivel. Generado: no editar a mano. */\nwindow.MUSEO = " + json.dumps(datos, ensure_ascii=False, separators=(",", ":")) + ";\n"
    open(os.path.join(REPO, D, "datos.js"), "w").write(js)
    escribir(D, portada())
    escribir(f"{D}/planificador", planificador())
    escribir(f"{D}/guias", guias_pagina())
