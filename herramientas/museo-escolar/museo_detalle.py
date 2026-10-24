"""Detalle adicional para las sesiones de 7.° y 8.° que quedaron más breves."""


def di(t):
    return f'<span class="di">{t}</span>'


DETALLE = {
    (7, "Investigar y sintetizar"): dict(
        des=[60, ["<b>Delimitar (15 min).</b> Cada equipo convierte su tema en una pregunta que se pueda responder en la cédula. De «la cultura Chinchorro» a «¿Por qué los Chinchorro momificaban a sus muertos y qué nos dice eso de cómo vivían junto al mar?».",
                  "<b>Evaluar fuentes (20 min).</b> Para cada fuente del dossier: ¿quién la publica (museo, universidad, blog)?, ¿cuándo?, ¿cita a quién investigó el sitio? Marcan confiable o dudosa en la tabla de la Guía 1.",
                  "<b>Sintetizar (25 min).</b> Cada integrante resume un texto en tres ideas con palabras propias. El equipo las ordena en un organizador: lugar, modo de vida, tecnología, relación con el medio, legado." + di("Si no lo puedes explicar sin mirar el texto, todavía no lo sintetizaste.")]]),
    (7, "La cédula: un texto expositivo"): dict(
        des=[60, ["<b>Planificar (15 min).</b> Definen destinatario (estudiantes de 1.° a 8.° y familias) y la idea que el visitante debe llevarse en un minuto.",
                  "<b>Escribir (25 min).</b> Presentación del tema, dos párrafos de desarrollo (cómo vivían y cómo se adaptaron a su medio) y un cierre que conecte con hoy. Entre 100 y 120 palabras, con la fuente.",
                  "<b>Revisar (20 min).</b> Intercambian con otro equipo y aplican la pauta de la Guía 6: oraciones de menos de dos líneas, palabras técnicas explicadas, ortografía y puntuación."]]),
    (7, "Construcción con materiales sustentables"): dict(
        des=[70, ["<b>Fondo y relieve (25 min).</b> Pintan el paisaje del sitio en el fondo de la caja: el desierto costero de Arica, el bosque húmedo de Monte Verde, los valles diaguitas, los canales australes o la costa de Rapa Nui. Modelan el relieve con papel y cartón reciclados.",
                  "<b>Construcciones a escala (30 min).</b> Construyen viviendas, embarcaciones, moai o caminos con las medidas calculadas en Matemática (escala 1:20), usando palitos, fibras naturales, cartón y arcilla.",
                  "<b>Figuras y detalles (15 min).</b> Personas a escala realizando una actividad que explique la adaptación al medio: pescar, cultivar, tejer, navegar."]]),
    (7, "Curaduría: el pueblo y su medio"): dict(
        des=[25, ["<b>Lista de verificación (15 min).</b> ¿Se entiende de qué vivían? ¿Aparece el medio (mar, río, bosque, desierto)? ¿Se ve una tecnología o forma de adaptación? ¿Hay elementos de otra época?",
                  "<b>Impacto mutuo (10 min).</b> Cada equipo agrega a su cédula una línea sobre cómo el pueblo transformó su medio o cómo el medio limitó su vida."]]),
    (7, "Ensayo de la exposición"): dict(
        des=[25, ["<b>Rondas (20 min).</b> En pares de equipos, cada uno expone dos minutos frente a su diorama sin leer y responde una pregunta. El otro equipo completa la Guía 9: claridad, volumen, velocidad, dicción e información fidedigna.",
                  "<b>Ajustes (5 min).</b> Cada expositor anota dos mejoras concretas en su guion."]]),
    (7, "Inauguración y reflexión"): dict(
        des=[60, ["Los guías reciben a los visitantes en la sala «Antes de Chile» por turnos de 20 minutos; quienes no guían recorren el museo con su pasaporte.",
                  "Para los cursos de 1.° y 2.°, ofrecen la versión para niños pequeños o la audioguía.",
                  "Registra con la lista de observación quién expone sin leer y quién responde preguntas (insumo para la rúbrica)."]]),
    (8, "Investigar con dos miradas"): dict(
        des=[60, ["<b>Las fuentes (25 min).</b> Cada equipo lee en su dossier una fuente española o colonial (crónica, acta, carta) y una que muestre la mirada indígena, mestiza o de los trabajadores (estudio actual, relato mapuche, testimonio).",
                  "<b>Comparar (20 min).</b> En la Guía 1, parte D: quién escribe, qué destaca, qué omite, en qué coinciden y en qué difieren.",
                  "<b>Decidir (15 min).</b> Escriben en una oración qué mirada se verá en el diorama además de la oficial y cómo la mostrarán (un personaje, un objeto, un cartel)."]]),
    (8, "Fuentes y síntesis"): dict(
        des=[60, ["<b>Confiabilidad (20 min).</b> Evalúan cada fuente del dossier: autor, fecha, propósito y si registra de dónde saca su información. Las dudosas se descartan o se contrastan.",
                  "<b>Síntesis (25 min).</b> Cada integrante sintetiza una fuente en tres ideas propias; el equipo las ordena en un esquema causa–consecuencia.",
                  "<b>Registro (15 min).</b> Completan el registro de fuentes de la Guía 1 con el formato acordado por el curso."]]),
    (8, "Patrimonio colonial y boceto"): dict(
        des=[60, ["<b>Analizar (25 min).</b> En equipos, analizan una obra o edificio colonial: contexto (quién la encargó y para qué), materialidad (adobe, madera, piedra, tejido), lenguaje visual y propósito expresivo.",
                  "<b>Bocetar (35 min).</b> Dibujan la escena del diorama de frente y desde arriba en la Guía 5, eligiendo materiales sustentables y una paleta inspirada en el patrimonio analizado."]]),
    (8, "Construcción del diorama"): dict(
        des=[70, ["<b>Estructura (25 min).</b> Construyen la caja con las medidas calculadas en Matemática y el relieve o la planta del lugar (plaza, iglesia, casa patronal, fuerte, cancha del parlamento, capilla).",
                  "<b>Edificaciones y figuras (30 min).</b> Construyen las edificaciones con cartón, palitos y papeles; modelan figuras que muestren a los distintos grupos de la sociedad colonial.",
                  "<b>Textiles y detalles (15 min).</b> Agregan tejidos, techos de paja o tejuela y los elementos que muestran la segunda mirada acordada en Historia."]]),
    (8, "Texto expositivo de la cédula"): dict(
        des=[60, ["<b>Planificar (15 min).</b> Propósito, destinatario y la idea central que debe llevarse el visitante.",
                  "<b>Escribir (25 min).</b> Presentación del tema, desarrollo con información de al menos dos fuentes y cierre coherente. Unas 120 palabras.",
                  "<b>Revisar y reescribir (20 min).</b> Con la pauta de la Guía 6 y el comentario de otro equipo, corrigen cohesión, ortografía y puntuación (punto, coma, raya y dos puntos)."]]),
    (8, "Revisión: ¿se escuchan las dos miradas?"): dict(
        des=[25, ["<b>Lista de verificación (15 min).</b> ¿Aparecen españoles, mestizos e indígenas? ¿Se muestra convivencia y conflicto? ¿Hay elementos de otra época?",
                  "<b>Corrección (10 min).</b> Cada equipo agrega o cambia al menos un elemento para que la segunda mirada se vea sin tener que leer la cédula."]]),
    (8, "Ensayo de la exposición"): dict(
        des=[25, ["<b>Rondas (20 min).</b> En pares de equipos, cada uno expone dos minutos con progresión temática, sin leer, y responde una pregunta. El otro equipo completa la Guía 9.",
                  "<b>Ajustes (5 min).</b> Cada expositor anota dos mejoras y el equipo decide quién guía en cada turno."]]),
    (8, "Montaje del museo"): dict(
        des=[25, ["<b>Señalética (10 min).</b> Instalan los carteles de cada sala y las flechas del recorrido según el plan de curaduría.",
                  "<b>Recepción de salas (15 min).</b> Cada pareja de 8.° recibe a un curso y lo ayuda a ubicar su sala en el lugar acordado, cuidando alturas y paso libre."]]),
    (8, "Inauguración y reflexión"): dict(
        des=[60, ["Los guías explican la sala «Colonia y frontera» por turnos; el resto del curso orienta a los visitantes en el recorrido general.",
                  "Al cerrar, el equipo curador recoge las respuestas del mural «¿Qué Chile falta?».",
                  "Registra con la lista de observación quién expone sin leer y quién responde preguntas (insumo para la rúbrica)."]]),
}


def aplicar(niveles):
    usados = set()
    for n, lista in niveles.items():
        for s in lista:
            k = (n, s["t"])
            if k in DETALLE:
                s.update({kk: list(v) for kk, v in DETALLE[k].items()})
                usados.add(k)
    faltan = set(DETALLE) - usados
    assert not faltan, faltan
