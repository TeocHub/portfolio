from base import bloque, tabla, lista, clase, FUENTE_OA

SLUG = "matematica"
NOMBRE = "Matemática"
INTRO = ("Matemática resuelve el problema de fondo del museo: que Chile quepa en la sala. La escala se trabaja como "
         "una razón, y la superficie de la caja del diorama, como un cálculo real. Tres clases de 90 minutos.")
META = [("Curso", "6.º básico"), ("Clases", "3 de 90 min"), ("Semanas", "1 a 3")]

# Latitudes aproximadas (redondeadas para el cálculo). 1° de latitud ≈ 111 km.
ZONAS = [
    ("1 · Norte Grande", "Arica", 18.5, "límite Antofagasta–Atacama", 26.0),
    ("2 · Norte Chico", "límite Antofagasta–Atacama", 26.0, "límite Coquimbo–Valparaíso", 32.2),
    ("3 · Zona Central", "límite Coquimbo–Valparaíso", 32.2, "límite O'Higgins–Maule", 35.0),
    ("4 · Centro Sur", "límite O'Higgins–Maule", 35.0, "límite Biobío–Araucanía", 38.5),
    ("5 · Sur", "límite Biobío–Araucanía", 38.5, "límite Los Lagos–Aysén", 44.0),
    ("6 · Austral", "límite Los Lagos–Aysén", 44.0, "Cabo de Hornos", 56.0),
]


def fmt(x, d=1):
    s = f"{x:,.{d}f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return s


def solucionario():
    filas, tot_km, tot_cm = [], 0, 0
    for z, a, la, b, lb in ZONAS:
        dl = lb - la
        km = round(dl * 111)
        cm = round(km / 10)
        tot_km += km
        tot_cm += cm
        filas.append([z, f"{fmt(la)}° S", f"{fmt(lb)}° S", f"{fmt(dl)}°", f"{fmt(km, 0)} km", f"{cm} cm"])
    filas.append(["<b>Total</b>", "", "", "", f"<b>{fmt(tot_km, 0)} km</b>", f"<b>{tot_cm} cm</b>"])
    return tabla(["Zona", "Desde", "Hasta", "Diferencia de latitud", "Distancia aprox.", "En la maqueta (1:1.000.000)"], filas)


OAS = tabla(
    ["OA", "Qué pide", "Clases"],
    [
        ["OA 3", "Demostrar que comprenden el concepto de razón de manera concreta, pictórica y simbólica.", "1, 2"],
        ["OA 2", "Realizar cálculos que involucren las cuatro operaciones en la resolución de problemas.", "1, 2, 3"],
        ["OA 13", "Demostrar que comprenden el concepto de área de una superficie en cubos y paralelepípedos, calculando el área de sus redes.", "3"],
        ["OA 18", "Calcular la superficie de cubos y paralelepípedos expresando el resultado en cm² y m².", "3"],
        ["OAH g", "Identificar un error, explicar su causa y corregirlo.", "2, 3"],
        ["OAH i, k", "Aplicar y evaluar modelos matemáticos; modelar situaciones cotidianas.", "1, 2"],
    ])

RESUMEN = tabla(
    ["Clase", "Semana", "Qué se hace", "Termina con"],
    [
        ["1 · ¿Cómo cabe Chile?", "1", "Entender la escala como razón y convertir distancias", "Ticket de salida"],
        ["2 · El plano", "2", "Calcular el largo de cada tramo y dibujar el plano del diorama", "Plano a escala aprobado (entregable semana 2)"],
        ["3 · Control de calidad", "3", "Calcular la superficie de la caja y verificar el tramo construido", "Guía 3, parte D"],
    ])

C1 = clase(
    1, "¿Cómo cabe Chile en la sala?", "¿Cómo cabe Chile?", "1", "90 minutos",
    "OA 3 · OA 2 · OAH k",
    "Comprender la escala como una razón y usarla para convertir distancias reales en distancias de la maqueta.",
    (15, """<ol>
      <li>Plantea el problema: <i>Chile continental mide unos 4.200 km de Arica al Cabo de Hornos. Queremos construirlo en el pasillo del colegio. ¿Cómo lo hacemos?</i></li>
      <li>Recoge ideas sin corregir. Lleva la conversación a que hay que «achicar todo lo mismo».</li>
    </ol>"""),
    (60, """<ol>
      <li><b>Concreto (15 min).</b> Cada pareja recibe una tira de papel de 42 cm. Si toda la tira es Chile, ¿cuántos km representa cada centímetro? (100 km). ¿Y si la tira midiera 4,2 m? (10 km por centímetro).</li>
      <li><b>Pictórico (10 min).</b> Dibuja en la pizarra una tabla de razón: 1 cm ↔ 10 km; 2 cm ↔ 20 km; 10 cm ↔ 100 km; 100 cm ↔ 1.000 km. Pregunta qué patrón ven.</li>
      <li><b>Simbólico (10 min).</b> Explica la notación 1:1.000.000: 1 cm en la maqueta equivale a 1.000.000 cm reales, es decir, 10 km. Muestra el paso: 1.000.000 cm = 10.000 m = 10 km.</li>
      <li><b>Práctica (25 min).</b> Guía 3, parte A: convertir distancias (por ejemplo, el ancho máximo de Chile, unos 445 km, son 44,5 cm; el mínimo, unos 90 km, son 9 cm). Al final, comparar con otra escala: 1:2.000.000. ¿Cuánto mediría Chile? ¿Cabría mejor? ¿Qué se pierde?</li>
    </ol>"""),
    (15, """<ol>
      <li>Ticket de salida: <i>Dos ciudades están a 350 km. ¿A cuántos centímetros quedan en la maqueta a escala 1:1.000.000? Explica cómo lo calculaste.</i> (35 cm)</li>
    </ol>"""),
    ["Guía 3: Escala y plano, parte A", "Tiras de papel de 42 cm", "Huinchas o reglas", "Mapa de Chile con escala gráfica"],
    "<p>Formativa con el ticket de salida. Quien no llegue a 35 cm repasa la tabla de razón al inicio de la clase 2.</p>",
)

C2 = clase(
    2, "El plano de nuestro tramo y de nuestro diorama", "El plano", "2", "90 minutos",
    "OA 3 · OA 2 · OAH g",
    "Calcular el largo del tramo de la zona en la Gran Maqueta y dibujar el plano del diorama con sus medidas.",
    (10, """<ol>
      <li>Revisa el ticket de salida en la pizarra. Recuerda el dato clave: un grado de latitud mide unos 111 km de norte a sur.</li>
    </ol>"""),
    (65, """<ol>
      <li><b>El largo del tramo (25 min).</b> Con la tabla de latitudes de la Guía 3, parte B, cada equipo calcula: diferencia de latitud → kilómetros (× 111) → centímetros en la maqueta (÷ 10). Pueden usar calculadora para la multiplicación (OA 2).</li>
      <li><b>¿Cuadra Chile? (15 min).</b> Cada equipo escribe su resultado en una tabla común en la pizarra. Suman todos los tramos: el total debe dar cerca de 416 cm. Si no cuadra, buscan el error entre todos.
        <span class="di">Un error encontrado vale más que un resultado copiado. ¿Dónde se pudo equivocar el cálculo?</span></li>
      <li><b>El plano del diorama (25 min).</b> Cada equipo mide su caja (largo, ancho y alto) y dibuja en la cuadrícula de la Guía 3, parte C, la vista desde arriba a escala 1:1 o 1:2, ubicando los elementos de su boceto de Artes.</li>
    </ol>"""),
    (15, """<ol>
      <li>Revisa y firma cada plano. Es el <b>entregable de la semana 2</b>, junto con el boceto de Artes.</li>
    </ol>"""),
    ["Guía 3, partes B y C", "Calculadoras", "Huinchas", "Cajas de los dioramas", "Solucionario (en esta planificación)"],
    "<p>Rúbrica del proyecto, criterio «Escala y medidas» (formativa). Usa el solucionario para revisar.</p>"
    "<h4>Solucionario: largo de cada tramo</h4>" + solucionario() +
    "<p>Las latitudes están redondeadas para que el cálculo sea manejable. Acepta resultados que difieran en ±2 cm por redondeo. El equipo 7 (Chile insular y antártico) y el equipo 8 (la comuna) trabajan en recuadros aparte: calculan, en cambio, a cuántos centímetros quedaría Rapa Nui de la costa (unos 3.700 km = 370 cm) y por qué conviene mostrarlo en un recuadro.</p>",
    "<p>Para estudiantes que lo necesiten, entrega la tabla con la columna de diferencia de latitud ya calculada, de modo que solo multipliquen y dividan.</p>",
)

C3 = clase(
    3, "Control de calidad: superficie y medidas", "Control de calidad", "3", "90 minutos",
    "OA 13 · OA 18 · OA 2 · OAH g",
    "Calcular la superficie de la caja del diorama a partir de su red para forrarla, y comprobar las medidas del tramo construido.",
    (15, """<ol>
      <li>Muestra una caja de zapatos sin tapa. Pregunta: <i>¿Cuánto papel necesitamos para forrarla por fuera? ¿Cómo lo sabemos sin desperdiciar?</i></li>
      <li>Abre una caja (o dibuja su red) para mostrar que la superficie es la suma de las caras.</li>
    </ol>"""),
    (60, """<ol>
      <li><b>La red de nuestra caja (25 min).</b> En la Guía 3, parte D, cada equipo dibuja la red de su caja sin tapa (5 caras), anota las medidas y calcula el área de cada cara y el total en cm².</li>
      <li><b>Cortar con el cálculo (10 min).</b> Cortan el papel de forrar según su cálculo, con 1 cm extra por lado para doblar. Comprueban si alcanzó.</li>
      <li><b>Control del tramo (25 min).</b> Miden el tramo de la Gran Maqueta que ya construyeron (Tecnología) y lo comparan con su cálculo de la semana 2. Registran la diferencia. Si supera los 5 cm, explican la causa y lo corrigen.</li>
    </ol>"""),
    (15, """<ol>
      <li>Cada equipo comparte qué error encontró y cómo lo corrigió. Valora los errores explicados tanto como los aciertos.</li>
    </ol>"""),
    ["Guía 3, parte D", "Cajas de los dioramas y una caja de muestra para abrir", "Papel para forrar", "Reglas, huinchas y tijeras", "Calculadoras"],
    "<p>Sumativa con la rúbrica del proyecto, criterio «Escala y medidas», usando las partes B, C y D de la Guía 3.</p>",
)

EVAL = "<p>Matemática califica el criterio «Escala y medidas» de la rúbrica común, con estas evidencias:</p>" + tabla(
    ["Evidencia", "Qué se revisa", "Ponderación sugerida"], [
        ["Guía 3, parte B", "Cálculo correcto del tramo", "35 %"],
        ["Guía 3, parte C", "Plano con medidas y escala indicada", "25 %"],
        ["Guía 3, parte D", "Red, superficie en cm² y control del tramo", "40 %"],
    ])

FUENTES = f"""<ul><li><a href="{FUENTE_OA['matematica']}" target="_blank" rel="noopener">Objetivos de Aprendizaje de Matemática, 6.º básico</a>, Currículum Nacional, Mineduc</li></ul>"""


def cuerpo(botones):
    return (bloque("descargar", "Esta planificación", botones + "<p>Imprime o descarga el PDF para tenerla en la sala. Las guías de los estudiantes están en el cuadernillo del proyecto.</p>" + RESUMEN, corto="Resumen")
            + bloque("oa", "Objetivos de aprendizaje", OAS, corto="OA")
            + C1 + C2 + C3
            + bloque("evaluacion", "Evaluación", EVAL)
            + bloque("fuentes", "Fuentes", FUENTES))
