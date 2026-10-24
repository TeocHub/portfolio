from base import bloque, tabla, lista
from matematica import ZONAS, fmt

INTRO = ("Diez guías listas para imprimir: el cuadernillo que acompaña a cada estudiante y a cada equipo durante las "
         "cuatro semanas. Cada guía empieza en una hoja nueva al imprimir.")
META = [("Curso", "6.º básico"), ("Guías", "10"), ("Formato", "Carta, para imprimir")]


def enc(equipo=True):
    campos = ["Nombre", "Curso"] + (["Equipo y zona"] if equipo else []) + ["Fecha"]
    return '<ul class="encabezado-guia">' + "".join(f"<li>{c}:</li>" for c in campos) + "</ul>"


def L(n):
    return f'<span class="lineas" style="--n:{n}" aria-hidden="true"></span>'


def R(alto="8rem"):
    return f'<span class="recuadro" style="--alto:{alto}" aria-hidden="true"></span>'


def vacias(cabeza, n):
    return tabla(cabeza, [['<span class="sr">vacío</span>'] * len(cabeza) for _ in range(n)]).replace("<td>", '<td class="vacia">')


def guia(id_, num, titulo, quien, cuando, html):
    return f"""
      <section class="bloque bloque-guia" id="{id_}">
        <h2 data-corto="Guía {num}">Guía {num} · {titulo}</h2>
        <p class="bajada">{quien} · {cuando}</p>
        <div class="guia">
          <h3>Guía {num} · {titulo}</h3>
          {enc()}
          {html}
        </div>
      </section>"""


G1 = guia("guia-1", 1, "Ficha de investigación", "Una por equipo", "Historia (clases 2 a 4) y Lenguaje (clase 1)", f"""
  <p><b>Nuestra pregunta:</b> ¿Cómo es nuestra zona y qué pasó ahí en el momento que nos tocó?</p>
  <h4>Registro de fuentes</h4>
  <p>Anota cada fuente que uses. Para saber si es confiable, pregúntate: ¿quién lo escribe?, ¿para qué?, ¿cuándo?</p>
  {vacias(["N.º", "Fuente (título, autor o sitio)", "¿Primaria o secundaria?", "¿Quién la escribe y para qué?", "¿Confiable? (sí / dudosa)"], 4)}
  <h4>Parte A · Nuestra zona</h4>
  {tabla(["Aspecto", "Lo que encontramos (con nuestras palabras)", "Fuente N.º"], [[a, "", ""] for a in ["Regiones y capitales", "Relieve", "Clima", "Ríos, lagos o mar", "Ambiente natural", "Actividades económicas", "Un rasgo de su población"]]).replace("<td></td>", '<td class="vacia"></td>')}
  <h4>Parte B · Nuestro momento histórico</h4>
  {tabla(["Pregunta", "Respuesta", "Fuente N.º"], [[a, "", ""] for a in ["¿Qué pasó?", "¿Cuándo?", "¿Quiénes participaron?", "¿Por qué ocurrió?", "¿Qué consecuencias tuvo?", "¿Quién no suele aparecer en esta historia?"]]).replace("<td></td>", '<td class="vacia"></td>')}
  <h4>Parte C · ¿Por qué pasó ahí? (Historia, clase 3)</h4>
  {tabla(["Rasgo del territorio", "Cómo influyó en el hecho"], [["1.", ""], ["2.", ""], ["3.", ""]]).replace("<td></td>", '<td class="vacia"></td>')}
  <p><b>Línea de tiempo:</b> ordena de 3 a 5 hitos. Marca con una estrella la escena del diorama.</p>
  {R("5rem")}
  <p><b>Nuestra escena:</b> el instante exacto que mostraremos, quiénes aparecen y qué hacen.</p>
  {L(3)}
  <h4>Parte D · Dos miradas (Historia, clase 4)</h4>
  {tabla(["", "Fuente 1", "Fuente 2"], [["¿Quién la escribe?", "", ""], ["¿Qué destaca?", "", ""], ["¿En qué coinciden?", "", ""], ["¿En qué difieren?", "", ""]]).replace("<td></td>", '<td class="vacia"></td>')}
  <p><b>La voz que agregamos al diorama y cómo la mostramos:</b></p>
  {L(2)}
  <h4>Lista de cotejo (la completa el docente)</h4>
  <ul class="lista-chequeo">
    <li><label><input type="checkbox"><span>Usa al menos tres fuentes registradas.</span></label></li>
    <li><label><input type="checkbox"><span>Al menos una fuente muestra una mirada distinta a la oficial.</span></label></li>
    <li><label><input type="checkbox"><span>Las partes A y B están escritas con palabras propias, no copiadas.</span></label></li>
    <li><label><input type="checkbox"><span>Cada dato indica su fuente.</span></label></li>
  </ul>""")

G2 = guia("guia-2", 2, "Contrato de equipo", "Una por equipo", "Historia, clase 1", f"""
  <p><b>Nombre del equipo:</b></p>{L(1)}
  <p><b>Zona y momento histórico que nos tocó:</b></p>{L(1)}
  <h4>Roles</h4>
  {tabla(["Rol", "Qué hace", "Nombre", "Firma"], [
      ["Investigador/a", "Cuida que el contenido sea correcto y que las fuentes estén registradas.", "", ""],
      ["Arquitecto/a", "Está a cargo del plano, la escala y las medidas.", "", ""],
      ["Escenógrafo/a", "Dirige la construcción y el uso de los materiales.", "", ""],
      ["Curador/a", "Escribe la cédula y cuida que se escuche más de una voz.", "", ""],
      ["Guía", "Prepara la visita guiada (en la inauguración todos guían por turnos).", "", ""],
  ]).replace("<td></td>", '<td class="vacia"></td>')}
  <h4>Nuestros acuerdos</h4>
  <p>1. Para tomar decisiones, nosotros…</p>{L(1)}
  <p>2. Si alguien no puede cumplir su parte, …</p>{L(1)}
  <p>3. Para cuidar los materiales y el diorama, …</p>{L(1)}""")

filas_lat = [[z, a + f" ({fmt(la)}° S)", b + f" ({fmt(lb)}° S)", "", "", ""] for z, a, la, b, lb in ZONAS]
G3 = guia("guia-3", 3, "Escala y plano", "Individual (A) y por equipo (B, C, D)", "Matemática, clases 1 a 3", f"""
  <div class="nota idea"><span class="titulo-nota">La escala de nuestro museo</span><p>1:1.000.000 significa que 1 cm en la maqueta equivale a 1.000.000 cm reales, es decir, a <b>10 km</b>.</p></div>
  <h4>Parte A · Convertir distancias</h4>
  {tabla(["Distancia real", "Operación", "En la maqueta"], [["100 km", "", ""], ["445 km (ancho máximo de Chile)", "", ""], ["90 km (ancho mínimo)", "", ""], ["350 km", "", ""], ["4.200 km (de Arica al Cabo de Hornos)", "", ""]]).replace("<td></td>", '<td class="vacia"></td>')}
  <p><b>Y si usáramos la escala 1:2.000.000, ¿cuánto mediría Chile? ¿Qué ganamos y qué perdemos?</b></p>{L(3)}
  <h4>Parte B · El largo de nuestro tramo</h4>
  <p>Un grado de latitud mide unos <b>111 km</b> de norte a sur. Completa la fila de tu zona: diferencia de latitud → × 111 = km → ÷ 10 = cm.</p>
  {tabla(["Zona", "Desde", "Hasta", "Diferencia de latitud", "Kilómetros", "Centímetros"], filas_lat).replace("<td></td>", '<td class="vacia"></td>')}
  <p><b>Suma de todos los tramos del curso:</b> ______ cm. ¿Se parece a lo que mide Chile en la maqueta? Si no, ¿dónde estuvo el error?</p>{L(2)}
  <h4>Parte C · Plano del diorama (vista desde arriba)</h4>
  <p>Medidas de la caja: largo ____ cm · ancho ____ cm · alto ____ cm. Escala del plano: ______. Dibuja dónde va cada elemento.</p>
  <span class="cuadricula" style="--alto:11cm" aria-hidden="true"></span>
  <h4>Parte D · Superficie de la caja y control del tramo</h4>
  <p>Dibuja la red de la caja sin tapa (5 caras) y anota las medidas de cada cara.</p>{R("10rem")}
  {tabla(["Cara", "Largo (cm)", "Ancho (cm)", "Área (cm²)"], [["Fondo", "", "", ""], ["Lado largo 1", "", "", ""], ["Lado largo 2", "", "", ""], ["Lado corto 1", "", "", ""], ["Lado corto 2", "", "", ""], ["<b>Total</b>", "", "", ""]]).replace("<td></td>", '<td class="vacia"></td>')}
  <p><b>Control del tramo:</b> largo calculado ____ cm · largo construido ____ cm · diferencia ____ cm. Si la diferencia supera 5 cm, ¿por qué ocurrió y cómo lo corregimos?</p>{L(2)}""")

G4 = guia("guia-4", 4, "Bitácora científica", "Una por equipo", "Ciencias, clases 1 a 3", f"""
  <h4>Parte A · Recursos y energía de nuestra zona</h4>
  {tabla(["Capa", "Recurso que entrega a nuestra zona", "Cómo la afecta la actividad humana"], [["Litósfera", "", ""], ["Litósfera", "", ""], ["Hidrósfera", "", ""]]).replace("<td></td>", '<td class="vacia"></td>')}
  {tabla(["Fuente de energía de nuestra zona", "¿Renovable o no renovable?", "¿Por qué?"], [["", "", ""], ["", "", ""]]).replace("<td></td>", '<td class="vacia"></td>')}
  <p><b>Símbolo que pondremos en la maqueta</b> (dibújalo):</p>{R("5rem")}
  <p><b>Una medida para proteger una capa en nuestra zona:</b></p>{L(2)}
  <h4>Parte B · Experimento: ¿qué papel maché seca antes?</h4>
  <p><b>Pregunta:</b> ¿Cómo cambia el tiempo de secado si la mezcla tiene más o menos agua?</p>
  <p><b>Mi predicción y por qué:</b></p>{L(2)}
  <p><b>Variables.</b> Cambiamos: __________________ · Medimos: __________________ · Mantenemos igual: __________________</p>
  {tabla(["Muestra", "Mezcla (cola : agua)", "A los 30 min", "Al día siguiente", "Masa inicial y final (si hay balanza)"], [["A", "1 : 1", "", "", ""], ["B", "1 : 2", "", "", ""], ["C", "1 : 3", "", "", ""]]).replace("<td></td>", '<td class="vacia"></td>')}
  <p><b>Conclusión:</b> ¿se cumplió la predicción? ¿Qué le pasó al agua de las muestras?</p>{L(3)}
  <p><b>Una mejora para el procedimiento:</b></p>{L(1)}
  <p><b>Mezcla que usaremos en el diorama y por qué:</b></p>{L(1)}
  <h4>Parte C · Suelo y erosión</h4>
  {tabla(["Muestra", "Color", "Textura al tacto", "¿Cuánta agua retuvo?"], [["Arena", "", "", ""], ["Tierra de hoja", "", "", ""], ["Arcilla", "", "", ""]]).replace("<td></td>", '<td class="vacia"></td>')}
  <p><b>El principal agente de erosión de nuestra zona es ______ porque…</b></p>{L(2)}
  <p><b>Cómo lo mostramos en la maqueta:</b></p>{L(1)}""")

G5 = guia("guia-5", 5, "Del boceto a la construcción", "Por equipo", "Artes (clases 1 y 2) y Tecnología (clase 2)", f"""
  <h4>Parte A · Mirar un diorama</h4>
  {tabla(["Pregunta", "Imagen 1", "Imagen 2"], [["¿Qué historia cuenta?", "", ""], ["¿Qué hay en primer plano y qué al fondo?", "", ""], ["¿Qué colores dominan?", "", ""], ["¿Qué está lleno y qué vacío?", "", ""], ["¿Qué detalle ves primero?", "", ""]]).replace("<td></td>", '<td class="vacia"></td>')}
  <p><b>Técnicas que usaremos y por qué:</b></p>{L(2)}
  <h4>Parte B · Boceto</h4>
  <p>Vista de frente: fondo, plano medio y primer plano.</p>{R("11rem")}
  <p><b>Paleta</b> (pinta 4 a 6 colores): </p>{R("3rem")}
  {tabla(["Elemento", "Material", "Técnica", "Responsable"], [["", "", "", ""]] * 6).replace("<td></td>", '<td class="vacia"></td>')}
  <h4>Parte C · Plan de construcción (Tecnología)</h4>
  {tabla(["Acción", "Responsable", "Tiempo", "Materiales", "¿Se compra o se recicla?", "Costo"], [["", "", "", "", "", ""]] * 6).replace("<td></td>", '<td class="vacia"></td>')}
  <p><b>Costo total:</b> $ ______ · <b>Cómo reduciremos el gasto y la basura:</b></p>{L(2)}""")

G6 = guia("guia-6", 6, "Cédula de museo", "Por equipo", "Lenguaje, clases 2 y 3", f"""
  <h4>Cédula modelo</h4>
  <div class="cita"><p><b>Un cerro que vigila la bahía</b></p>
  <p><b>Lo que ves:</b> el Morro de Arica, un gran cerro junto al puerto.</p>
  <p><b>Qué pasó:</b> en junio de 1880, durante la Guerra del Pacífico, el ejército chileno tomó el Morro, defendido por tropas peruanas. Arica pasó definitivamente a Chile con el Tratado de 1929.</p>
  <p><b>Por qué aquí:</b> desde la cima se domina toda la bahía; quien controlaba el Morro, controlaba el puerto.</p>
  <p><b>Otra mirada:</b> para Perú es un lugar de memoria de sus soldados caídos, como el coronel Francisco Bolognesi.</p>
  <footer>Fuente: texto escolar de Historia 6.º básico y Memoria Chilena.</footer></div>
  <h4>Planificar</h4>
  <p><b>¿Para quién escribimos?</b></p>{L(1)}
  <p><b>¿Qué queremos que entiendan en un minuto?</b></p>{L(1)}
  <h4>Borrador (80 a 120 palabras)</h4>
  {tabla(["Parte", "Nuestro texto"], [["Título atractivo", ""], ["Lo que ves", ""], ["Qué pasó y cuándo", ""], ["Por qué aquí", ""], ["Otra mirada", ""], ["Fuente", ""]]).replace("<td></td>", '<td class="vacia" style="height:4em"></td>')}
  <h4>Pauta de revisión</h4>
  <ul class="lista-chequeo">
    <li><label><input type="checkbox"><span>Tiene entre 80 y 120 palabras.</span></label></li>
    <li><label><input type="checkbox"><span>Cada parte tiene una sola idea.</span></label></li>
    <li><label><input type="checkbox"><span>Ninguna oración ocupa más de dos líneas.</span></label></li>
    <li><label><input type="checkbox"><span>Usa palabras precisas y explica las difíciles.</span></label></li>
    <li><label><input type="checkbox"><span>La ortografía y los tildes están revisados.</span></label></li>
    <li><label><input type="checkbox"><span>Explica por qué pasó en ese lugar.</span></label></li>
    <li><label><input type="checkbox"><span>Incluye otra mirada y la fuente.</span></label></li>
  </ul>""")

G7 = guia("guia-7", 7, "Guion de la visita guiada", "Individual", "Lenguaje, clases 3 y 4", f"""
  <p>Escribe solo <b>palabras clave</b>: el guion es un mapa, no un texto para leer. La visita dura 2 minutos.</p>
  {tabla(["Parte", "Qué digo (palabras clave)", "Qué señalo del diorama"], [
      ["Introducción: saludo y zona", "", ""],
      ["Desarrollo 1: qué se ve", "", ""],
      ["Desarrollo 2: qué pasó y cuándo", "", ""],
      ["Desarrollo 3: por qué aquí", "", ""],
      ["Cierre: una pregunta al público y el timbre", "", ""]]).replace("<td></td>", '<td class="vacia" style="height:4em"></td>')}
  <p><b>Frases para empezar:</b> «Bienvenidos a la zona…» · «En este diorama van a ver…» · «Esto pasó aquí porque…» · «¿Qué creen que…?»</p>
  <p><b>Mis dos mejoras después del ensayo:</b></p>{L(2)}""")

G8 = guia("guia-8", 8, "Pasaporte de zonas", "Uno por visitante (imprimir varios)", "Inauguración", f"""
  <p class="intro"><b>Mundo Mágico Miniatura Escolar</b> · Pasaporte de: ______________________</p>
  <p>Visita cada zona, escucha al guía y pide tu timbre.</p>
  {tabla(["Zona", "Timbre", "Una cosa que aprendí"], [[z, "", ""] for z in ["Norte Grande", "Norte Chico", "Zona Central", "Centro Sur", "Sur", "Austral", "Chile insular y antártico", "Nuestra comuna"]]).replace("<td></td>", '<td class="vacia" style="height:3.4em"></td>')}
  <p><b>Mi momento favorito fue…</b></p>{L(2)}
  <p><b>Para el museo del próximo año, me gustaría ver…</b></p>{L(1)}""")

G9 = guia("guia-9", 9, "Pautas de coevaluación", "Individual", "Lenguaje (clase 4) y Artes (clase 4)", f"""
  <h4>Parte A · Visita guiada (Lenguaje)</h4>
  <p>Equipo que evalúo: ______________________</p>
  {tabla(["Criterio", "Sí", "A veces", "No"], [[c, "", "", ""] for c in ["Saludó y presentó la zona", "Explicó sin leer", "Se escuchó claro y fuerte", "Señaló partes del diorama", "Explicó por qué pasó ahí", "Terminó con una pregunta"]]).replace("<td></td>", '<td class="vacia"></td>')}
  <p><b>Lo más claro de la explicación fue…</b></p>{L(1)}
  <p><b>Les sugiero…</b></p>{L(1)}
  <h4>Parte B · Crítica de arte (Artes)</h4>
  {tabla(["", "Diorama 1: ________", "Diorama 2: ________"], [["¿Qué idea o emoción transmite?", "", ""], ["¿Cómo usa los materiales?", "", ""], ["¿Qué elemento visual destaca (color, volumen, composición)?", "", ""], ["Una sugerencia respetuosa", "", ""]]).replace("<td></td>", '<td class="vacia" style="height:3.6em"></td>')}""")

G10 = guia("guia-10", 10, "Autoevaluación y reflexión", "Individual", "Historia, clase 5", f"""
  {tabla(["Me evalúo", "Siempre", "A veces", "Pocas veces"], [[c, "", "", ""] for c in ["Cumplí mi rol en el equipo", "Escuché y respeté a mis compañeros", "Busqué información en varias fuentes", "Cuidé los materiales y el trabajo de otros", "Expliqué el diorama sin leer"]]).replace("<td></td>", '<td class="vacia"></td>')}
  <p><b>¿Qué aprendí sobre nuestra zona y nuestro momento histórico?</b></p>{L(3)}
  <p><b>¿Qué parte del diorama hice yo? ¿Qué haría distinto?</b></p>{L(2)}
  <p><b>¿Qué Chile mostró nuestro museo y qué quedó fuera?</b></p>{L(3)}""")


TARJETAS = """
      <section class="bloque bloque-guia" id="tarjetas">
        <h2 data-corto="Tarjetas de sorteo">Anexo · Tarjetas de sorteo</h2>
        <p class="bajada">Para el docente · Historia, clase 1. Imprimir y recortar.</p>
        <div class="guia">
          <h3>Anexo · Tarjetas de sorteo de zonas</h3>
          <ul class="fichas dos">""" + "".join(f'''<li class="ficha"><span class="etiqueta">Equipo {n}</span><h4>{z}</h4><p>{m}</p></li>''' for n, z, m in [
    (1, "Norte Grande", "Una oficina salitrera y la vida de sus trabajadores"),
    (2, "Norte Chico", "El ferrocarril Caldera–Copiapó (1851)"),
    (3, "Zona Central", "El cabildo abierto del 18 de septiembre de 1810"),
    (4, "Centro Sur", "El terremoto de Chillán (1939) y la reconstrucción"),
    (5, "Sur", "La ocupación de la Araucanía y la colonización"),
    (6, "Austral", "Fuerte Bulnes (1843) y los pueblos del estrecho"),
    (7, "Chile insular y antártico", "Rapa Nui y el Acuerdo de Voluntades (1888)"),
    (8, "Nuestra comuna", "La comuna hoy y hace cien años"),
]) + """</ul>
        </div>
      </section>"""


def cuerpo(botones):
    indice = tabla(["Guía", "Para", "Se usa en"], [
        ["1 · Ficha de investigación", "Equipo", "Historia 2, 3, 4 · Lenguaje 1"],
        ["2 · Contrato de equipo", "Equipo", "Historia 1"],
        ["3 · Escala y plano", "Estudiante y equipo", "Matemática 1, 2, 3"],
        ["4 · Bitácora científica", "Equipo", "Ciencias 1, 2, 3"],
        ["5 · Del boceto a la construcción", "Equipo", "Artes 1, 2 · Tecnología 2"],
        ["6 · Cédula de museo", "Equipo", "Lenguaje 2, 3"],
        ["7 · Guion de la visita guiada", "Estudiante", "Lenguaje 3, 4"],
        ["8 · Pasaporte de zonas", "Visitante", "Inauguración"],
        ["9 · Pautas de coevaluación", "Estudiante", "Lenguaje 4 · Artes 4"],
        ["10 · Autoevaluación y reflexión", "Estudiante", "Historia 5"],
    ])
    copias = "<p><b>Cuántas copias:</b> guías de equipo, una por equipo; guías individuales (3, 7, 9 y 10), una por estudiante; pasaporte, una por visitante esperado más un 10 %. Al final del cuadernillo están las tarjetas de sorteo de zonas, para recortar.</p>"
    return (bloque("cuadernillo", "El cuadernillo", botones + indice + copias, corto="Índice")
            + G1 + G2 + G3 + G4 + G5 + G6 + G7 + G8 + G9 + G10 + TARJETAS)
