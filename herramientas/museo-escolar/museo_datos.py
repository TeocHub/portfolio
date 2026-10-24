"""Arma assets de datos del Mundo Mágico Miniatura Escolar (salas, sesiones, horarios) en un archivo JS."""
import json, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from museo_niveles import S, di, N1, N2, N3, N4, N5, N7, N8

RAMOS = {
    "his": "Historia, Geografía y Cs. Sociales",
    "len": "Lenguaje y Comunicación",
    "mat": "Matemática",
    "cie": "Ciencias Naturales",
    "art": "Artes Visuales",
    "tec": "Tecnología",
    "mus": "Música",
    "efi": "Educación Física y Salud",
}
CORTO = {"his": "Historia", "len": "Lenguaje", "mat": "Matemática", "cie": "Ciencias", "art": "Artes",
         "tec": "Tecnología", "mus": "Música", "efi": "Ed. Física"}

# ---------------------------------------------------------------- 6.° desde las planificaciones anteriores
sexto = json.load(open(os.path.join(os.path.dirname(__file__), "sexto.json")))
FASE6 = {"historia": [1, 1, 2, 3, 4], "lenguaje": [1, 2, 3, 4], "matematica": [1, 2, 3], "ciencias": [1, 2, 3],
         "artes": [1, 2, 3, 4], "tecnologia": [1, 2, 3, 4]}
COD = {"historia": "his", "lenguaje": "len", "matematica": "mat", "ciencias": "cie", "artes": "art", "tecnologia": "tec"}


def limpiar6(txt):
    txt = txt.replace("comprobar las medidas del tramo construido", "comprobar las medidas de la capa de regiones")
    txt = txt.replace("cada diorama junto a su tramo", "cada diorama junto a su región en la Gran Maqueta")
    txt = txt.replace("ubican cada diorama junto a su tramo de la Gran Maqueta", "ubican cada diorama junto a su región de la Gran Maqueta")
    txt = txt.replace("(tabla de zonas en la guía del proyecto)", "(tabla de equipos de 6.° en el planificador)")
    txt = txt.replace("tabla de zonas en la guía del proyecto", "tabla de equipos de 6.° en el planificador")
    return txt


N6 = []
for asig in ["historia", "lenguaje", "matematica", "ciencias", "artes", "tecnologia"]:
    for i, c in enumerate(sexto[asig]):
        r = COD[asig]
        mn = 45 if asig == "tecnologia" else 90
        oa = ("Historia " if r == "his" else CORTO[r] + " ") + c["oas"] if not c["oas"].startswith(CORTO[r]) else c["oas"]
        ses = S(r, FASE6[asig][i], mn, c["titulo"], oa, limpiar6(c["objetivo"]),
                (c["inicio"][0], [limpiar6(x) for x in c["inicio"][1]]),
                (c["desarrollo"][0], [limpiar6(x) for x in c["desarrollo"][1]]),
                (c["cierre"][0], [limpiar6(x) for x in c["cierre"][1]]),
                c["recursos"], limpiar6(c["evaluacion"]), c["notas"], c["preparar"],
                alt={"mat": "his", "cie": "his", "tec": "art"}.get(r))
        N6.append(ses)

# Ajustes de 6.°: Matemática y Tecnología ya no construyen la Gran Maqueta (la hace 5.°); 6.° pone la capa política y difunde.
CAPITALES = [("Arica", 18.5), ("Iquique", 20.2), ("Antofagasta", 23.6), ("Copiapó", 27.4), ("La Serena", 29.9),
             ("Valparaíso", 33.0), ("Santiago", 33.4), ("Rancagua", 34.2), ("Talca", 35.4), ("Chillán", 36.6),
             ("Concepción", 36.8), ("Temuco", 38.7), ("Valdivia", 39.8), ("Puerto Montt", 41.5), ("Coyhaique", 45.6),
             ("Punta Arenas", 53.2)]


def fmt(x, d=1):
    return f"{x:,.{d}f}".replace(",", "X").replace(".", ",").replace("X", ".")


def tabla(cab, filas):
    th = "".join(f"<th>{c}</th>" for c in cab)
    tr = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in f) + "</tr>" for f in filas)
    return f'<div class="tabla"><table><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div>'


sol6 = tabla(["Desde Santiago hasta", "Latitud", "Diferencia", "Distancia aprox. norte–sur", "En la maqueta"],
             [[n, f"{fmt(l)}° S", f"{fmt(abs(l - 33.4))}°", f"{fmt(round(abs(l - 33.4) * 111), 0)} km", f"{round(abs(l - 33.4) * 111 / 10)} cm"]
              for n, l in CAPITALES if n != "Santiago"])

for s in N6:
    if s["r"] == "mat" and s["t"].startswith("El plano"):
        s.update(t="Distancias en la Gran Maqueta", oa="Matemática OA 3 · OA 2 · OAH g",
                 obj="Usar la razón 1 : 1.000.000 (1 cm = 10 km) para calcular distancias entre capitales regionales y comprobarlas sobre la Gran Maqueta que construye 5.° básico, y dibujar el plano del diorama.",
                 des=[65, ["<b>De la latitud a los kilómetros (25 min).</b> Con la tabla de capitales de la Guía 3B, cada equipo calcula la distancia norte–sur entre Santiago y dos capitales: diferencia de latitud × 111 = km. Luego, ÷ 10 = cm en la maqueta.",
                           "<b>Comprobar en la maqueta (15 min).</b> Con huincha, miden esas distancias sobre la Gran Maqueta de 5.° (o sobre su plano, si aún no está armada) y comparan. " + di("Si la medida y el cálculo no coinciden, ¿el error está en la maqueta o en el cálculo?"),
                           "<b>El plano del diorama (25 min).</b> Cada equipo mide su caja y dibuja en la cuadrícula de la Guía 3B la vista desde arriba, ubicando los elementos del boceto de Artes."]],
                 ev="<p>Rúbrica común, criterio «Escala y medidas» (formativa).</p><h4>Solucionario: distancias desde Santiago</h4>" + sol6 +
                    "<p>Latitudes redondeadas. Acepta diferencias de ±2 cm. Si 5.° no participa en el museo, 6.° construye la Gran Maqueta con las sesiones de 5.° y la Guía 3A.</p>")
    if s["r"] == "tec":
        if s["t"].startswith("Diseñar la Gran Maqueta"):
            s.update(t="Diseñar la capa de regiones", oa="Tecnología OA 1",
                     obj="Diseñar un sistema para marcar las 16 regiones y sus capitales sobre la Gran Maqueta de 5.° básico sin dañarla.",
                     ini=[5, ["Plantea el problema: <i>5.° construye el relieve de Chile; nosotros debemos mostrar sus regiones y capitales encima, sin pegar nada sobre su trabajo y de modo que se pueda sacar.</i>"]],
                     des=[30, ["<b>Propuestas (15 min).</b> Cada equipo dibuja a mano alzada una solución: banderines clavados en plasticina, una lámina transparente con los límites, hitos de cartón que se apoyan.",
                               "<b>Criterios (5 min).</b> Que no dañe la maqueta, que se lea a un metro, que sea barato y reciclable.",
                               "<b>Votación (10 min).</b> Presentan en un minuto y el curso elige."]],
                     cie=[10, ["Registra el diseño ganador en un afiche y acuerda con el curso de 5.° cómo y cuándo se instalará."]],
                     rec=["Hojas para bocetos", "Afiche", "Muestras de banderines, mica transparente o cartón"],
                     nota="<p>Este diseño depende de la Gran Maqueta de 5.° básico. Si 5.° no participa, usa las sesiones de Tecnología de 5.° para construirla.</p>")
        elif s["t"].startswith("Construir y probar"):
            s.update(t="Construir e instalar la capa de regiones", oa="Tecnología OA 3 · OA 4",
                     obj="Construir los banderines o hitos de las regiones y probar que se lean bien y no dañen la Gran Maqueta.",
                     ini=[5, ["Recuerda los criterios de prueba: se lee a un metro, se sostiene, se puede sacar sin dañar."]],
                     des=[30, ["<b>Construcción (20 min).</b> Cada equipo fabrica los banderines de las regiones de su zona: nombre de la región, capital y número romano.",
                               "<b>Instalación y prueba (10 min).</b> Con el curso de 5.°, instalan los banderines y comprueban que se lean y que la maqueta quede intacta."]],
                     cie=[10, ["Evaluación entre equipos con los criterios y una corrección por equipo."]],
                     rec=["Cartulina, palitos de brocheta sin punta, plasticina", "Plumones", "La Gran Maqueta"],
                     ev="<p>Sumativa con la capa de regiones terminada y probada (OA 3 y 4).</p>")
        elif s["t"].startswith("Planificar"):
            s["t"] = "Planificar la capa de regiones y el diorama"
            s["obj"] = "Planificar la construcción de la capa de regiones y del diorama: acciones, responsables, tiempos, materiales, costos e impacto ambiental."
        elif s["t"].startswith("Difundir"):
            s["t"] = "Difundir el museo de todo el colegio"
            s["obj"] = "Crear con un procesador de textos la invitación del museo de todo el colegio y planificar su difusión segura. 6.° básico es el equipo de difusión."
    if s["r"] == "his" and s["t"].startswith("Lanzamiento"):
        s["t"] = "Lanzamiento: ¿qué Chile mostraba Mundo Mágico?"

for s in N6:
    if s["r"] == "mat" and s["t"].startswith("Control de calidad"):
        s["des"][1] = [x if not x.startswith("<b>Control del tramo") else "<b>Control de la capa de regiones (25 min).</b> Miden sobre la Gran Maqueta la distancia entre dos banderines de capitales y la comparan con su cálculo de la clase 2. Si la diferencia supera 5 cm, explican la causa y corrigen la ubicación del banderín." for x in s["des"][1]]
    if s["r"] == "cie":
        for k in ["ini", "des", "cie"]:
            s[k][1] = [x.replace("en su tramo de la Gran Maqueta", "en su región de la Gran Maqueta") for x in s[k][1]]
    for k in ["ini", "des", "cie"]:
        s[k][1] = [x.replace("Guía 3, parte", "Guía 3B, parte").replace("Guía 4, parte", "Guía 4B, parte") for x in s[k][1]]
    s["rec"] = [x.replace("Guía 3:", "Guía 3B:").replace("Guía 3, parte", "Guía 3B, parte").replace("Guía 4, parte", "Guía 4B, parte") for x in s["rec"]]
    s["ev"] = s["ev"].replace("Guía 3, parte", "Guía 3B, parte").replace("Guía 4 completa", "Guía 4B completa").replace("Guía 4, parte", "Guía 4B, parte")
    if s["prep"]:
        s["prep"] = [x.replace("tarjetas de sorteo", "tarjetas de sorteo de 6.°") for x in s["prep"]]

# ---------------------------------------------------------------- Salas (una por nivel)
SALAS = [
    dict(nivel=1, num="Entrada", sala="Así celebramos", periodo="Hoy",
         pregunta="¿Cómo celebramos en Chile?",
         hacen="Pinturas de las fiestas de sus familias y de Chile, alrededor de un gran mapa del país pintado por el curso. Abren la inauguración cantando una canción de tradición oral con movimientos guiados.",
         inaug="Abren el museo cantando en el escenario y llevan a sus familias a ver su pintura. No exponen ni memorizan textos.",
         equipos="Todo el curso junto. Cada niño hace su propia pintura.",
         rol="El escenario y la galería de la entrada.",
         ramos={"his": 90, "len": 45, "art": 90, "mus": 45, "efi": 45},
         oa="Historia OA 4, 5, 6, 8, 9 · Lenguaje OA 21, 23 · Artes OA 1–5 · Música OA 3, 4, 6 · Ed. Física OA 5"),
    dict(nivel=3, num="Sala I", sala="Chile en el mundo", periodo="El planeta y la Antigüedad",
         pregunta="¿Dónde está Chile en el mundo y qué heredamos de Grecia y Roma?",
         hacen="Un gran planisferio con las zonas climáticas y Chile marcado, y fachadas de edificios chilenos con columnas y frontones heredados de Grecia y Roma (La Moneda, el ex Congreso Nacional, el Teatro Municipal).",
         inaug="Reciben a los visitantes en la primera sala. Explican en parejas, en un minuto y con un guion con dibujos.",
         equipos="Un equipo para el planisferio y tres o cuatro equipos de fachadas.",
         rol="La primera sala del recorrido.",
         ramos={"his": 90, "len": 45, "mat": 45, "art": 90, "tec": 45},
         oa="Historia OA 1, 2, 4, 6, 7, 8 · Lenguaje OA 6, 9, 14, 17, 18, 28 · Matemática OA 14, 15, 16 · Artes OA 1, 3 · Tecnología OA 1–4"),
    dict(nivel=7, num="Sala II", sala="Antes de Chile", periodo="Hace 14.500 años – siglo XV",
         pregunta="¿Cómo vivieron los primeros habitantes de este territorio y cómo se adaptaron a su medio?",
         hacen="Dioramas a escala de Monte Verde, la cultura Chinchorro, el pueblo diaguita, el Inca en Chile, los pueblos canoeros del sur y Rapa Nui. Además, las audioguías con código QR y las versiones accesibles del museo.",
         inaug="Guían su sala con una exposición de dos minutos sin leer y apoyan con las audioguías.",
         equipos="Seis equipos, uno por sitio o pueblo.",
         rol="Equipo de accesibilidad: audioguías, letra grande y versión para niños pequeños.",
         ramos={"his": 90, "len": 90, "mat": 90, "art": 90, "tec": 45},
         oa="Historia OA 1, 2, 14, 15, 16, 21, 22 · Lengua y Literatura OA 13, 15, 22, 23, 24, 25 · Matemática OA 8 · Artes OA 2, 4 · Tecnología OA 1–5"),
    dict(nivel=4, num="Sala III", sala="América antes de Chile", periodo="Siglos IV – XVI",
         pregunta="¿Cómo eran las grandes civilizaciones americanas y cómo llegó el Inca hasta Chile?",
         hacen="Dioramas en caja de Tikal, Tenochtitlan y Cusco, y un tramo del Qhapaq Ñan con un tambo y un chasqui, junto a un mapa de América.",
         inaug="Guían su diorama con una explicación de inicio, desarrollo y cierre, apoyada en el guion.",
         equipos="Cuatro equipos: maya, azteca, inca y el Qhapaq Ñan en Chile.",
         rol="La sala de las civilizaciones americanas.",
         ramos={"his": 90, "len": 90, "mat": 45, "art": 90, "tec": 45},
         oa="Historia OA 1–6 · Lenguaje OA 6, 9, 13, 16, 17, 27, 28 · Matemática OA 16 · Artes OA 1, 2, 3 · Tecnología OA 1–4"),
    dict(nivel=2, num="Sala IV", sala="Pueblos originarios", periodo="Período precolombino y hoy",
         pregunta="¿Cómo vivían los pueblos originarios según el paisaje de su zona?",
         hacen="Un mural-mapa de Chile con norte, centro y sur, y objetos modelados en greda o plasticina: viviendas, vasijas, canoas, tejidos. Cada objeto lleva una tarjeta de dos o tres oraciones.",
         inaug="En parejas, presentan su objeto a las familias leyendo o diciendo su tarjeta.",
         equipos="Cuatro equipos: aymara, diaguita, mapuche y un pueblo canoero del sur.",
         rol="El mural de los pueblos.",
         ramos={"his": 90, "len": 45, "art": 90},
         oa="Historia OA 1, 2, 3, 8, 9, 10, 11 · Lenguaje OA 7, 10, 14, 15, 17, 27 · Artes OA 1, 3, 5"),
    dict(nivel=5, num="Gran Sala", sala="La Gran Maqueta", periodo="El territorio y la Conquista",
         pregunta="¿Cómo es Chile de norte a sur y qué pasó en cada zona cuando llegaron los europeos?",
         hacen="La Gran Maqueta de Chile en cinco tramos (unos 4,3 m, 1 cm = 10 km), con relieve, ríos, lagos, glaciares y ciudades que se encienden con un circuito simple. Cada equipo hace además un diorama de la Conquista en su zona.",
         inaug="La Gran Maqueta es el centro del museo. Guían su tramo y su diorama con una visita de dos minutos.",
         equipos="Cinco equipos, uno por zona natural.",
         rol="Constructores de la Gran Maqueta, la pieza central del museo.",
         ramos={"his": 90, "len": 90, "mat": 90, "cie": 90, "art": 90, "tec": 45},
         oa="Historia OA 1, 2, 4, 7, 8, 9 · Lenguaje OA 7, 8, 11, 15, 17, 18, 28 · Matemática OA 19, 20 · Ciencias OA 9, 10, 12, 14 · Artes OA 1, 2, 3 · Tecnología OA 1–4"),
    dict(nivel=8, num="Sala V", sala="Colonia y frontera", periodo="Siglos XVI – XVIII",
         pregunta="¿Cómo era la sociedad colonial y cómo convivieron españoles, mestizos y mapuche en la frontera?",
         hacen="Dioramas de la Plaza de Armas de Santiago, la iglesia de San Francisco, una hacienda, los fuertes de Valdivia, el Parlamento de Quilín y las misiones de Chiloé. Además, la curaduría de todo el museo: recorrido, señalética y montaje.",
         inaug="Guían su sala y orientan a los visitantes por todo el museo.",
         equipos="Seis equipos, uno por tema colonial.",
         rol="Equipo curador: diseña el recorrido, la señalética y dirige el montaje.",
         ramos={"his": 90, "len": 90, "mat": 90, "art": 90, "tec": 45},
         oa="Historia OA 8, 11, 12, 13, 16, 17, 19 · Lengua y Literatura OA 14, 16, 23, 24, 25, 26 · Matemática OA 11 · Artes OA 2, 4, 6 · Tecnología OA 1–5"),
    dict(nivel=6, num="Sala VI", sala="La República", periodo="1810 – siglo XX",
         pregunta="¿Cómo se formó la República y por qué cada hecho ocurrió en su lugar?",
         hacen="Dioramas de la Independencia, el ferrocarril, el salitre, la Araucanía, Fuerte Bulnes, Rapa Nui y el terremoto de Chillán, ligados a su región. Sobre la Gran Maqueta de 5.°, instalan la capa de regiones y capitales.",
         inaug="Guían su sala con una visita de dos minutos sin leer. Como equipo de difusión, hicieron las invitaciones del museo.",
         equipos="Siete u ocho equipos, uno por zona y momento.",
         rol="Equipo de difusión: invitaciones y entradas del museo.",
         ramos={"his": 90, "len": 90, "mat": 90, "cie": 90, "art": 90, "tec": 45},
         oa="Historia OA 2, 4, 5, 6, 10, 11, 12, 13, 14, 20, 21 · Lenguaje OA 7, 8, 11, 15, 17, 18, 27, 29 · Matemática OA 2, 3, 13, 18 · Ciencias OA 11, 13, 16, 17, 18 · Artes OA 1–5 · Tecnología OA 1, 2, 3, 4, 6, 7"),
]

NIVELES = {1: N1, 2: N2, 3: N3, 4: N4, 5: N5, 6: N6, 7: N7, 8: N8}
from museo_detalle import aplicar
aplicar(NIVELES)

# Lo que cada edad puede hacer: 0 no corresponde, 1 con apoyo, 2 de forma autónoma
CAPACIDADES = [
    ("Pintar y modelar", [2, 2, 2, 2, 2, 2, 2, 2]),
    ("Construir maquetas", [0, 1, 1, 2, 2, 2, 2, 2]),
    ("Investigar en fuentes", [0, 1, 1, 1, 2, 2, 2, 2]),
    ("Escribir la cédula", [0, 1, 1, 2, 2, 2, 2, 2]),
    ("Explicar al público", [0, 1, 1, 2, 2, 2, 2, 2]),
    ("Cantar o actuar", [2, 2, 2, 2, 2, 2, 2, 2]),
    ("Organizar el museo", [0, 0, 0, 0, 1, 1, 2, 2]),
]


def limpio(d):
    return {k: v for k, v in d.items() if v not in (None, [], "")}


datos = dict(
    ramos=RAMOS, corto=CORTO,
    fases=["Investigar", "Diseñar", "Construir", "Abrir el museo"],
    salas=SALAS,
    niveles={str(k): [limpio(s) for s in v] for k, v in NIVELES.items()},
    capacidades=CAPACIDADES,
)

if __name__ == "__main__":
    out = sys.argv[1]
    js = "/* Datos del Mundo Mágico Miniatura Escolar: salas, sesiones y horarios. Generado; edita el generador. */\nwindow.MUSEO = " + json.dumps(datos, ensure_ascii=False, separators=(",", ":")) + ";\n"
    open(out, "w").write(js)
    for k, v in NIVELES.items():
        u = sum(1 if s["min"] == 45 else 2 for s in v)
        print(f"{k}.°: {len(v)} sesiones, {u} bloques de 45 min")
    print(len(js) // 1024, "KB")
