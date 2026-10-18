/* ==========================================================
   Tomás Cabrolier · Portfolio — script compartido
   ----------------------------------------------------------
   PARA AGREGAR UN TRABAJO NUEVO: busca el área en CATALOGO
   (más abajo) y añade una línea a la lista "items" del grupo
   que corresponda:
     { t: "Título", d: "Una frase que diga qué es.", url: "ruta/desde/la/raiz/", tipo: "Lectura guiada" }
   Sin "url", el trabajo aparece como pendiente.
   La ruta siempre se escribe desde la raíz del portfolio.
   ========================================================== */
(function () {
  "use strict";

  /* ---------- Raíz del sitio (funciona en GitHub Pages y en local) ---------- */
  var script = document.currentScript || document.querySelector('script[src*="assets/js/site.js"]');
  var RAIZ = new URL("../../", script.src);
  document.documentElement.classList.add("js");

  function enlace(url) {
    if (!url) return null;
    if (/^https?:/.test(url)) return url;
    return new URL(url, RAIZ).href;
  }
  function normalizar(ruta) {
    return decodeURI(ruta).replace(/index\.html$/, "").replace(/\/+$/, "");
  }
  var rutaRaiz = normalizar(RAIZ.pathname);
  var rutaActual = normalizar(location.pathname).slice(rutaRaiz.length).replace(/^\/+/, "");

  /* ---------- Áreas (los arcanos de la portada) ---------- */
  var AREAS = {
    pedagogia: { nombre: "Pedagogía", carta: "El Hierofante", num: "V", url: "pedagogia/",
      nota: "Lo que he leído, escrito y llevado al aula durante la carrera." },
    letras: { nombre: "Letras", carta: "La Sacerdotisa", num: "II", url: "letras/",
      nota: "Mis historias publicadas en Wattpad y herramientas para escribir." },
    codigo: { nombre: "Código y juegos", carta: "El Mago", num: "I", url: "codigo/",
      nota: "Programas, juegos y herramientas que he construido." },
    esoterico: { nombre: "Esotérico", carta: "La Luna", num: "XVIII", url: "esoterico/",
      nota: "Lecturas de tarot y velas de cera de abeja hechas a mano." },
    estudio: { nombre: "Digital Monster", carta: "El Loco", num: "0", url: "digital-monster/",
      nota: "El estudio indie que formé con Francisco: cómics, series y juegos." },
    sitios: { nombre: "Sitios web", carta: "El Carro", num: "VII", url: "sitios/",
      nota: "Páginas que diseñé y programé para negocios y organizaciones." }
  };
  var ORDEN = ["pedagogia", "letras", "codigo", "esoterico", "estudio", "sitios"];
  var CARPETA_AREA = { "digital-monster": "estudio" };

  /* Dibujos de cada arcano (trazos simples, se colorean con currentColor) */
  var GLIFOS = {
    pedagogia: '<path d="M50 8v10M34 13l5 8M66 13l-5 8"/><path d="M12 70q19-9 38 0q19-9 38 0V36q-19-9-38 0q-19-9-38 0z"/><path d="M50 36v34M22 46q10-3 20 1M22 56q10-3 20 1M58 47q10-4 20-1M58 57q10-4 20-1"/>',
    letras: '<path d="M27 15a12 12 0 1 0 12 16a9 9 0 1 1-12-16z"/><path d="M80 12C58 18 42 44 34 86"/><path d="M80 12c6 24-10 44-38 52M80 12C66 22 54 38 46 58"/><path d="M34 86l-3 8"/>',
    codigo: '<path d="M50 22c-7-10-20-10-20 0s13 10 20 0c7-10 20-10 20 0s-13 10-20 0z"/><path d="M34 46L18 62l16 16M66 46l16 16-16 16M56 42L44 82"/>',
    esoterico: '<path d="M60 10a32 32 0 1 0 30 44a25 25 0 1 1-30-44z"/><path d="M14 62h16v28H14z"/><path class="relleno" d="M22 44c-5 7-4 13 0 13s5-6 0-13z"/><path d="M12 90h20"/>',
    estudio: '<path d="M50 6l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/><path d="M28 88V56a22 22 0 0 1 44 0v32l-7-6-7 6-7-6-7 6-7-6-9 6z"/><circle cx="50" cy="56" r="8"/><circle class="relleno" cx="51" cy="57" r="3"/>',
    sitios: '<rect x="14" y="20" width="72" height="46" rx="4"/><path d="M14 31h72"/><circle class="relleno" cx="21" cy="25.5" r="1.8"/><circle class="relleno" cx="27" cy="25.5" r="1.8"/><circle cx="30" cy="80" r="9"/><circle cx="70" cy="80" r="9"/><path d="M24 66l3 6M76 66l-3 6"/>'
  };
  function glifo(area) {
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' + (GLIFOS[area] || "") + "</svg>";
  }

  /* ---------- Catálogo: índices y trabajos ---------- */
  var CATALOGO = {
    "pedagogia": {
      area: "pedagogia", titulo: "Pedagogía",
      intro: "Estudio Pedagogía en Educación Básica en la Universidad Autónoma de Chile. Aquí guardo las lecturas que trabajé, los materiales que diseñé y lo que llevé a la sala en mis prácticas.",
      grupos: [
        { titulo: "Ramos de la carrera", items: [
          { hub: "pedagogia/etica" }, { hub: "pedagogia/lenguaje" }, { hub: "pedagogia/historia" },
          { hub: "pedagogia/tics" }, { hub: "pedagogia/matematicas" }, { hub: "pedagogia/fisica-quimica" }
        ]},
        { titulo: "En la sala y en la tesis", items: [
          { hub: "pedagogia/practica" }, { hub: "pedagogia/tesis" }
        ]},
        { titulo: "Para el trabajo docente", items: [
          { hub: "pedagogia/recursos" }
        ]}
      ]
    },
    "pedagogia/etica": {
      area: "pedagogia", titulo: "Ética docente",
      resumen: "El marco legal y ético de la profesión: MBE, Decreto 67, Ley 20.903 y un ensayo propio.",
      intro: "Las normas que ordenan la profesión docente en Chile y lo que significan en la práctica.",
      grupos: [{ titulo: "Lecturas", items: [
        { t: "Marco para la Buena Enseñanza 2021", d: "Los cuatro dominios del MBE explicados uno a uno: qué se espera de un buen docente en Chile.", url: "pedagogia/etica/marco-para-la-buena-ensenanza/", tipo: "Lectura guiada" },
        { t: "Decreto 67", d: "Normas nacionales de evaluación, calificación y promoción escolar.", url: "pedagogia/etica/decreto-67/", tipo: "Resumen" },
        { t: "Ley 20.903", d: "El Sistema de Desarrollo Profesional Docente: tramos, inducción y carrera.", url: "pedagogia/etica/ley-20903/", tipo: "Resumen" },
        { t: "El amor como principio educativo", d: "Ensayo sobre el afecto como núcleo del vínculo pedagógico.", url: "pedagogia/etica/el-amor-como-principio-educativo/", tipo: "Ensayo" }
      ]}]
    },
    "pedagogia/lenguaje": {
      area: "pedagogia", titulo: "Lenguaje",
      resumen: "Lectura y escritura inicial: textos teóricos, un glosario y guías de lectura con podcast.",
      intro: "Lectura y escritura inicial: cómo aprenden a leer los niños y qué libros ponerles en las manos.",
      grupos: [
        { titulo: "Textos teóricos", items: [
          { t: "Alfabetización inicial", d: "La primera etapa en el dominio de la lengua escrita y los componentes de una lectura efectiva.", url: "pedagogia/lenguaje/lecturas/alfabetizacion-inicial/", tipo: "Lectura guiada" },
          { t: "Aprender a leer", d: "Cómo el cerebro se especializa para leer: sistemas de escritura y conciencia fonológica.", url: "pedagogia/lenguaje/lecturas/aprender-a-leer/", tipo: "Lectura guiada" },
          { t: "Condemarín", d: "Una propuesta que parte del lenguaje oral y valora la lengua materna y la identidad cultural.", url: "pedagogia/lenguaje/lecturas/condemarin/", tipo: "Lectura guiada" },
          { t: "Desarrollo de la comprensión lectora", d: "Galdames sobre por qué la comprensión lectora sigue baja y cómo trabajarla en el aula.", url: "pedagogia/lenguaje/lecturas/galdames/", tipo: "Lectura guiada" },
          { t: "Glosario de lectoescritura", d: "Definiciones breves de los conceptos clave de la lectoescritura inicial.", url: "pedagogia/lenguaje/definiciones/", tipo: "Glosario" }
        ]},
        { titulo: "Recomendaciones literarias", items: [
          { t: "Guía de lectura infantil", d: "Autores clásicos y contemporáneos ordenados por etapa del desarrollo lector.", url: "pedagogia/lenguaje/recomendaciones-literarias/infantil/", tipo: "Guía con podcast" },
          { t: "Guía de lectura juvenil", d: "Una selección de autores y obras para jóvenes, con su metodología de selección.", url: "pedagogia/lenguaje/recomendaciones-literarias/juvenil/", tipo: "Guía con podcast" }
        ]}
      ]
    },
    "pedagogia/historia": {
      area: "pedagogia", titulo: "Historia",
      resumen: "Didáctica de la historia: qué enseñamos y por qué muchas veces no se aprende.",
      intro: "Didáctica de la historia y ciencias sociales.",
      grupos: [{ titulo: "Lecturas", items: [
        { t: "Pensar la historia, enseñar la historia", d: "Tres textos de didáctica de la historia en lenguaje claro: de la investigación al aula.", url: "pedagogia/historia/lecturas/didactica/", tipo: "Lectura guiada" }
      ]}]
    },
    "pedagogia/tics": {
      area: "pedagogia", titulo: "Tecnología",
      resumen: "Páginas interactivas, ensayos con podcast y actividades digitales para estudiantes.",
      intro: "Trabajos del ramo de TIC: páginas interactivas, ensayos con podcast y actividades para estudiantes.",
      grupos: [
        { titulo: "Ensayos interactivos", items: [
          { t: "Redes sociales y autoestima juvenil", d: "Cómo la realidad construida en redes afecta la autoestima de adolescentes en Chile.", url: "pedagogia/tics/redes-sociales-y-autoestima/", tipo: "Interactivo con podcast" },
          { t: "Roblox: guía de seguridad", d: "Riesgos de la plataforma y medidas concretas para docentes y apoderados.", url: "pedagogia/tics/roblox/", tipo: "Interactivo con podcast" }
        ]},
        { titulo: "Páginas para estudiantes", items: [
          { t: "Mi cuerpo saludable", d: "Guía de vida saludable para estudiantes de 14 años.", url: "pedagogia/tics/saludable/", tipo: "Página web" },
          { t: "Reporteros de la democracia", d: "Una misión de periodismo para explicar cómo Chile resuelve sus problemas.", url: "pedagogia/tics/historia/", tipo: "Actividad" },
          { t: "Innovatech", d: "Sitio de un congreso ficticio de ciberseguridad, hecho como ejercicio de diseño web.", url: "pedagogia/tics/innovatech/", tipo: "Página web" }
        ]},
        { titulo: "Evaluación", items: [
          { t: "El agua y la vida", d: "Los resultados de la evaluación del proyecto, en gráficos.", url: "pedagogia/tics/trabajos/agua/", tipo: "Informe" },
          { t: "Formulario del ramo", d: "Formulario en Google Forms creado para el curso.", url: "https://docs.google.com/forms/d/e/1FAIpQLSdtMtayS_BOGm-2FWfEp8uZPRrSKCExlfBnXDGb40wY3iC90Q/viewform?usp=dialog", tipo: "Formulario" }
        ]}
      ]
    },
    "pedagogia/matematicas": {
      area: "pedagogia", titulo: "Matemáticas",
      resumen: "Todavía sin trabajos publicados.",
      intro: "Didáctica de la matemática.", grupos: []
    },
    "pedagogia/fisica-quimica": {
      area: "pedagogia", titulo: "Física y química",
      resumen: "Todavía sin trabajos publicados.",
      intro: "Ciencias naturales: física y química.", grupos: []
    },
    "pedagogia/practica": {
      area: "pedagogia", titulo: "Práctica",
      resumen: "Intervenciones que llevé a la sala, como el escape room Código 4D, y textos de estudio.",
      intro: "Lo que diseñé para trabajar con cursos reales durante mis prácticas, y los textos que me ayudaron a prepararlas.",
      grupos: [
        { titulo: "Intervenciones en aula", items: [
          { t: "Código 4D", d: "Escape room con disco decodificador sobre las cuatro dimensiones de la sexualidad, para 7° básico.", url: "pedagogia/practica/intervenciones/codigo-4d/", tipo: "Escape room" },
          { t: "Código 4D: panel de la sala", d: "Pantalla para proyectar durante el juego, con los niveles y las pistas.", url: "pedagogia/practica/intervenciones/codigo-4d/panel/", tipo: "Herramienta" },
          { t: "Generador de haikus escolares", d: "Arma haikus nuevos con los versos que escriben los estudiantes.", url: "pedagogia/practica/intervenciones/haikus/", tipo: "Generador" },
          { t: "Haikus del 7° del Pablo Neruda", d: "El generador con los versos que escribió el curso en 2025.", url: "pedagogia/practica/intervenciones/haikus-pablo-neruda/", tipo: "Generador" }
        ]},
        { titulo: "Textos de estudio", items: [
          { t: "Educar con cerebro", d: "Neuroeducación: emoción, movimiento y sorpresa como base del aprendizaje.", url: "pedagogia/practica/textos/neuroeducacion/", tipo: "Lectura guiada" },
          { t: "El acceso al entorno de aprendizaje II", d: "El Diseño Universal para el Aprendizaje y cómo flexibilizar el currículo para todos.", url: "pedagogia/practica/textos/acceso_entorno_aprendizaje/", tipo: "Lectura guiada" }
        ]}
      ]
    },
    "pedagogia/tesis": {
      area: "pedagogia", titulo: "Tesis",
      resumen: "Una propuesta de manual de escritura creativa para educación básica.",
      intro: "Mi tesis propone un manual de escritura creativa para educación básica. Aquí está la propuesta y lo que leí para construirla.",
      grupos: [
        { titulo: "Propuesta", items: [
          { t: "Escritura creativa en Chile", d: "Propuesta didáctica centrada en el proceso de escritura, para potenciar la expresión y el pensamiento crítico.", url: "pedagogia/tesis/escritura-chile/", tipo: "Propuesta" },
          { t: "Base del informe", d: "El documento base de la propuesta de manual de escritura creativa.", url: "pedagogia/tesis/Propuesta_ Manual de Escritura Creativa_.pdf", tipo: "PDF" }
        ]},
        { titulo: "Referencias y herramientas", items: [
          { t: "Modelo de escritura Didactext", d: "Las fases del modelo Didactext, una de las lecturas recomendadas para la tesis.", url: "pedagogia/tesis/didactext/", tipo: "Lectura guiada" },
          { t: "Generador de líneas aleatorias", d: "Combina versos al azar; la base del trabajo con haikus.", url: "pedagogia/tesis/Haikus/", tipo: "Generador" }
        ]}
      ]
    },
    "pedagogia/recursos": {
      area: "pedagogia", titulo: "Recursos",
      resumen: "Bases curriculares por curso y la guía operacional de la PAES 2026.",
      intro: "Material de consulta para el trabajo docente.",
      grupos: [{ titulo: "Consulta", items: [
        { t: "Bases curriculares", d: "Objetivos de aprendizaje de educación básica, por asignatura y curso.", url: "pedagogia/recursos/bases-curriculares/", tipo: "Buscador" },
        { t: "Guía operacional PAES 2026", d: "Horarios, roles y procedimientos para el equipo examinador.", url: "pedagogia/recursos/paes/", tipo: "Guía" }
      ]}]
    },
    "letras": {
      area: "letras", titulo: "Letras",
      intro: "Escribo historias desde hace años y las publico en Wattpad. Algunas son cortas; otras son mundos completos.",
      estante: [
        { t: "Travesía a lo desconocido", d: "Romina descubre que los cuentos de su abuelo eran reales y entra a Folgan, un mundo que solo existía en su infancia.", img: "letras/portadas/Travesía a lo Desconocido.png", url: "https://www.wattpad.com/story/342387679" },
        { t: "Lost Media", d: "Mi mejor amiga fue borrada de la memoria de todos. Y no sé si soy el siguiente.", img: "letras/portadas/Lost Media.png", url: "https://www.wattpad.com/story/399853618" },
        { t: "Natu: la historia de un inmortal", d: "En un futuro lejano, un inmortal solitario llega a la ciudad buscando compañía y se encuentra con su pasado.", img: "letras/portadas/Natu.png", url: "https://www.wattpad.com/story/359579112" },
        { t: "Bajo la tormenta", d: "El renacimiento de un personaje que todos conocen, contado desde otra perspectiva.", img: "letras/portadas/Bajo_la_Tormenta.png", url: "https://www.wattpad.com/story/393607212" },
        { t: "Desequilibrio", d: "Esa desviación de vista te desequilibra. Este joven se cayó.", img: "letras/portadas/Desquilibrio.png", url: "https://www.wattpad.com/story/391934569" },
        { t: "Normalidad", d: "Joel e Iván viven juntos, y hasta los problemas se vuelven parte de la rutina.", img: "letras/portadas/Normalidad.png", url: "https://www.wattpad.com/story/331861567" },
        { t: "Es la muerte", d: "", img: "letras/portadas/Muerte.png", url: "https://www.wattpad.com/story/399847206" },
        { t: "Última carta", d: "Al final se decidió por escribirle una última carta, y es esta.", img: "letras/portadas/Última Carta.png", url: "https://www.wattpad.com/story/332387378" }
      ],
      grupos: [{ titulo: "Para escribir", items: [
        { t: "Calculadora editorial", d: "Estima páginas y formato de un libro a partir de su número de palabras.", url: "letras/calculadora-editorial/", tipo: "Herramienta" }
      ]}]
    },
    "codigo": {
      area: "codigo", titulo: "Código y juegos",
      intro: "Programo en Unity, Godot, Java y Python. Aquí junto los juegos y herramientas que he hecho, incluidos los que nacieron para la sala de clases.",
      grupos: [
        { titulo: "Juegos", items: [
          { t: "Cuestionario definitivo de FNAF", d: "Quiz sobre el lore de Five Nights at Freddy's con ranking global.", tipo: "Juego web" },
          { t: "Illagers DG", d: "Add-on para Minecraft Bedrock con illagers elementales, jefes y estructuras nuevas.", tipo: "En desarrollo" },
          { t: "Código 4D", d: "Escape room educativo con disco decodificador y panel para proyectar.", url: "pedagogia/practica/intervenciones/codigo-4d/", tipo: "Escape room" }
        ]},
        { titulo: "Herramientas", items: [
          { t: "Calculadora editorial", d: "Estima páginas y formato de un libro a partir de su número de palabras.", url: "letras/calculadora-editorial/", tipo: "Herramienta" },
          { t: "Generador de haikus escolares", d: "Lee los versos de los estudiantes desde una planilla y arma haikus al azar.", url: "pedagogia/practica/intervenciones/haikus/", tipo: "Generador" },
          { t: "Bases curriculares", d: "Buscador de objetivos de aprendizaje por asignatura y curso.", url: "pedagogia/recursos/bases-curriculares/", tipo: "Buscador" }
        ]}
      ]
    },
    "esoterico": {
      area: "esoterico", titulo: "Esotérico",
      intro: "Leo el tarot con dos mazos, uno luminoso y otro oscuro, y trabajo con velas de cera de abeja.",
      grupos: [{ titulo: "Tarot & Alquimia", items: [
        { t: "Lecturas de tarot", d: "Lecturas asíncronas entregadas en PDF o audio: rápida, temática, mensual y de cumpleaños.", tipo: "Próximamente" },
        { t: "Velas de cera de abeja", d: "Velas intencionadas de cera de abeja, hechas a mano.", tipo: "Próximamente" }
      ]}]
    },
    "sitios": {
      area: "sitios", titulo: "Sitios web",
      intro: "Páginas que diseñé y programé para negocios y organizaciones. Cada una conserva la identidad de su marca.",
      grupos: [{ titulo: "Proyectos", items: [
        { t: "Mar y Ola", d: "Tienda de velas, home spray y talleres de candelería en Barrio Italia, Ñuñoa.", url: "sitios/mar-y-ola/", tipo: "Sitio web" },
        { t: "Reglamentos SmartFit", d: "Contratos y reglamentos de SmartFit Chile resumidos y fáciles de navegar.", url: "sitios/smartfit/", tipo: "Sitio web" },
        { t: "SindicatoLegal", d: "Prototipo de plataforma para sindicatos, con portal de socios y panel de directiva.", url: "sitios/sindicato/", tipo: "Prototipo" },
        { t: "Digital Monster", d: "El sitio de nuestro estudio indie.", url: "digital-monster/", tipo: "Sitio web" }
      ]}]
    }
  };

  /* Trabajos destacados en la portada (por ruta) */
  var DESTACADOS = [
    "pedagogia/practica/intervenciones/codigo-4d/",
    "pedagogia/historia/lecturas/didactica/",
    "pedagogia/tics/redes-sociales-y-autoestima/",
    "pedagogia/lenguaje/recomendaciones-literarias/infantil/",
    "sitios/mar-y-ola/",
    "letras/calculadora-editorial/"
  ];

  /* ---------- Utilidades ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function todosLosItems() {
    var lista = [];
    Object.keys(CATALOGO).forEach(function (k) {
      var h = CATALOGO[k];
      (h.grupos || []).forEach(function (g) {
        g.items.forEach(function (it) { if (it.t) lista.push({ item: it, hub: k, area: h.area }); });
      });
    });
    return lista;
  }
  function contar(hubId) {
    var h = CATALOGO[hubId], n = 0, vistos = {};
    if (!h) return 0;
    (h.grupos || []).forEach(function (g) {
      g.items.forEach(function (it) {
        if (it.hub) n += contar(it.hub);
        else if (it.t && !vistos[it.url || it.t]) { vistos[it.url || it.t] = 1; n++; }
      });
    });
    return n + (h.estante ? h.estante.length : 0);
  }
  function plural(n) { return n === 1 ? "1 trabajo" : n + " trabajos"; }
  function areaDeRuta(ruta) {
    var seg = ruta.split("/")[0];
    return AREAS[seg] ? seg : (CARPETA_AREA[seg] || "");
  }
  function buscarItem(ruta) {
    var r = normalizar(ruta), hallado = null;
    todosLosItems().some(function (x) {
      if (x.item.url && normalizar(x.item.url) === r) { hallado = x.item; return true; }
      return false;
    });
    return hallado;
  }

  /* ---------- Barra superior y pie ---------- */
  function construirBarra() {
    var area = document.documentElement.dataset.area || areaDeRuta(rutaActual);
    if (area && !document.documentElement.dataset.area) document.documentElement.dataset.area = area;

    var migas = [];
    var segs = rutaActual ? rutaActual.split("/") : [];
    var acumulado = "";
    segs.forEach(function (s, i) {
      acumulado = acumulado ? acumulado + "/" + s : s;
      var ultimo = i === segs.length - 1;
      var hub = CATALOGO[acumulado];
      if (ultimo) {
        var it = buscarItem(acumulado);
        var nombre = hub ? hub.titulo : (it ? it.t : (document.title.split(/[|·—–-]/)[0] || "").trim());
        if (!hub && !it && acumulado === "digital-monster") nombre = "Digital Monster";
        migas.push('<span class="tc-actual" aria-current="page">' + esc(nombre) + "</span>");
      } else if (hub) {
        migas.push('<a href="' + enlace(acumulado + "/") + '">' + esc(hub.titulo) + "</a>");
      } else if (acumulado === "digital-monster") {
        migas.push('<a href="' + enlace("digital-monster/") + '">Digital Monster</a>');
      }
    });
    /* En móvil solo se ven la sección madre y la página actual */
    var migasHTML = migas.map(function (m, i) {
      var media = i < migas.length - 2 ? " tc-media" : "";
      return '<span class="tc-miga' + media + '"><span class="tc-sep" aria-hidden="true">/</span>' + m + "</span>";
    }).join("");

    var nav = ORDEN.map(function (k) {
      var a = AREAS[k];
      return '<a href="' + enlace(a.url) + '"' + (k === area ? ' aria-current="page"' : "") + ">" + esc(a.nombre) + "</a>";
    }).join("");

    var barra = document.createElement("div");
    barra.className = "tc-barra";
    barra.setAttribute("role", "banner");
    barra.innerHTML =
      '<div class="tc-barra-in">' +
        '<a class="tc-firma" href="' + RAIZ.href + '" aria-label="Inicio del portfolio"><span class="tc-sello" aria-hidden="true">TC</span><span class="tc-nombre">Tomás Cabrolier</span></a>' +
        (migas.length ? '<nav class="tc-migas" aria-label="Estás en">' + migasHTML + "</nav>" : "") +
        '<nav class="tc-nav" aria-label="Áreas">' + nav + "</nav>" +
      "</div>";
    document.body.insertBefore(barra, document.body.firstChild);

    var pie = document.createElement("div");
    pie.className = "tc-pie";
    pie.setAttribute("role", "contentinfo");
    pie.innerHTML =
      '<div class="tc-pie-in">' +
        "<span>Tomás Cabrolier, Santiago de Chile</span>" +
        '<span class="tc-pie-enlaces">' +
          '<a href="' + RAIZ.href + '">Inicio</a>' +
          '<a href="https://www.wattpad.com/user/Teoc679" target="_blank" rel="noopener">Wattpad</a>' +
          '<a href="https://github.com/TeocHub" target="_blank" rel="noopener">GitHub</a>' +
        "</span>" +
      "</div>";
    document.body.appendChild(pie);
    encajar(barra, pie);
  }

  /* Algunas páginas antiguas tienen márgenes o un body en fila (flex).
     La barra y el pie se estiran hasta los bordes de la ventana igual. */
  function encajar(barra, pie) {
    if (document.body.classList.contains("tc")) return;
    var cs = getComputedStyle(document.body);
    var px = function (v) { return parseFloat(v) || 0; };
    var arriba = px(cs.paddingTop) + px(cs.marginTop);
    var abajo = px(cs.paddingBottom) + px(cs.marginBottom);
    var izq = px(cs.paddingLeft) + px(cs.marginLeft);
    var der = px(cs.paddingRight) + px(cs.marginRight);
    var ancho = "calc(100% + " + (izq + der) + "px)";
    if (/flex/.test(cs.display) && /^row/.test(cs.flexDirection)) {
      document.body.style.flexWrap = "wrap";
      [barra, pie].forEach(function (el) { el.style.flexBasis = ancho; el.style.flexShrink = "0"; });
      pie.style.order = "9999";
    }
    if (arriba || izq || der) {
      barra.style.setProperty("margin", (-arriba) + "px " + (-der) + "px " + (arriba ? 20 : 0) + "px " + (-izq) + "px", "important");
      barra.style.setProperty("width", ancho, "important");
      barra.style.setProperty("max-width", "none", "important");
    }
    if (abajo || izq || der) {
      pie.style.setProperty("margin", (abajo ? 24 : 0) + "px " + (-der) + "px " + (-abajo) + "px " + (-izq) + "px", "important");
      pie.style.setProperty("width", ancho, "important");
      pie.style.setProperty("max-width", "none", "important");
    }
  }

  /* ---------- Arcanos ---------- */
  function arcanoHTML(k, conPie, etiqueta) {
    var a = AREAS[k];
    var tag = etiqueta ? "a" : "div";
    return "<" + tag + ' class="arcano" data-area="' + k + '"' + (etiqueta ? ' href="' + enlace(a.url) + '"' : ' aria-hidden="true"') + ">" +
      '<span class="arcano-num">' + a.num + "</span>" + glifo(k) +
      (conPie ? '<span class="arcano-pie"><span class="arcano-area">' + esc(a.nombre) + '</span><span class="arcano-carta">' + esc(a.carta) + "</span></span>" : "<span></span>") +
      "</" + tag + ">";
  }

  /* ---------- Filas de trabajos ---------- */
  function filaHTML(it, conArea) {
    if (it.hub) {
      var h = CATALOGO[it.hub], n = contar(it.hub);
      it = { t: h.titulo, d: h.resumen, url: it.hub + "/", tipo: n ? plural(n) : "Pronto" };
    }
    var url = enlace(it.url);
    var externo = url && /^https?:/.test(it.url || "");
    var titulo = url
      ? '<a href="' + esc(url) + '"' + (externo ? ' target="_blank" rel="noopener"' : "") + ">" + esc(it.t) + "</a>"
      : esc(it.t);
    var area = conArea ? '<span class="obra-area">' + esc(AREAS[conArea].nombre) + "</span>" : "";
    var color = conArea ? ' style="--obra-color: var(--tc-' + conArea + ')"' : "";
    return '<li class="obra' + (url ? "" : " pendiente") + '"' + color + ">" +
      '<div>' + area + '<h3 class="obra-titulo">' + titulo + "</h3></div>" +
      '<span class="obra-tipo">' + esc(it.tipo || "") + "</span>" +
      (it.d ? '<p class="obra-desc">' + esc(it.d) + "</p>" : "") +
      "</li>";
  }

  /* ---------- Índices de área ---------- */
  function construirIndice(main) {
    var id = main.dataset.indice, h = CATALOGO[id];
    if (!h) return;
    var a = AREAS[h.area];
    document.documentElement.dataset.area = h.area;
    var esArea = AREAS[id];
    var html =
      '<header class="cabecera-area"><div class="tc-contenedor">' + arcanoHTML(h.area, false, false) +
        "<div>" + '<p class="carta">' + (esArea ? a.num + ", " + esc(a.carta) : esc(a.nombre)) + "</p>" +
        "<h1>" + esc(h.titulo) + "</h1>" +
        '<p class="intro">' + esc(h.intro) + "</p></div>" +
      "</div></header>";

    if (h.estante) {
      html += '<section class="grupo tc-contenedor"><h2>Historias</h2><p>Toca una portada para leerla en Wattpad.</p><ul class="estante">' +
        h.estante.map(function (l) {
          return '<li class="libro"><a href="' + esc(l.url) + '" target="_blank" rel="noopener">' +
            '<img src="' + esc(enlace(l.img)) + '" alt="Portada de ' + esc(l.t) + '" loading="lazy" width="300" height="450">' +
            "<h3>" + esc(l.t) + "</h3>" + (l.d ? "<p>" + esc(l.d) + "</p>" : "") + "</a></li>";
        }).join("") + "</ul></section>";
    }
    (h.grupos || []).forEach(function (g) {
      html += '<section class="grupo tc-contenedor"><h2>' + esc(g.titulo) + "</h2>" +
        (g.bajada ? "<p>" + esc(g.bajada) + "</p>" : "") +
        '<ul class="obras">' + g.items.map(function (it) { return filaHTML(it); }).join("") + "</ul></section>";
    });
    if (!h.grupos.length && !h.estante) {
      html += '<section class="grupo tc-contenedor"><h2>Todavía no hay trabajos aquí</h2>' +
        '<p>Los iré subiendo a medida que avance el ramo. Mientras tanto, revisa el resto de <a href="' + enlace("pedagogia/") + '">Pedagogía</a>.</p></section>';
    }
    main.innerHTML = html;
    if (!document.title || /^\s*$/.test(document.title)) document.title = h.titulo + " | Tomás Cabrolier";
  }

  /* ---------- Portada ---------- */
  function construirPortada() {
    var tirada = document.querySelector("[data-tirada]");
    if (tirada) {
      tirada.innerHTML = ORDEN.map(function (k, i) {
        var a = AREAS[k];
        var n = k === "estudio" ? 0 : contar(k);
        return '<li style="--i:' + i + ";--dx:" + ((ORDEN.length - 1) / 2 - i) * 164 + 'px">' +
          arcanoHTML(k, true, true) +
          '<span class="tirada-nota">' + esc(a.nota) + "</span></li>";
      }).join("");

      var lectura = document.querySelector("[data-lectura]");
      var defecto = lectura ? lectura.innerHTML : "";
      tirada.querySelectorAll(".arcano").forEach(function (carta) {
        var k = carta.dataset.area, a = AREAS[k];
        var n = k === "estudio" ? 0 : contar(k);
        function leer() {
          if (!lectura) return;
          lectura.innerHTML = "<h2><small>" + a.num + ", " + esc(a.carta) + "</small>" + esc(a.nombre) + "</h2>" +
            "<p>" + esc(a.nota) + (n ? " " + plural(n) + "." : "") + "</p>";
        }
        carta.addEventListener("mouseenter", leer);
        carta.addEventListener("focus", leer);
        carta.addEventListener("mouseleave", function () { if (lectura) lectura.innerHTML = defecto; });
        carta.addEventListener("blur", function () { if (lectura) lectura.innerHTML = defecto; });
      });

      var reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reducir) {
        tirada.classList.add("repartir");
        var ultima = tirada.querySelector("li:last-child .arcano");
        var fin = function () { tirada.classList.remove("repartir"); };
        ultima.addEventListener("animationend", fin);
        setTimeout(fin, 2200);
      }
    }

    var dest = document.querySelector("[data-destacados]");
    if (dest) {
      dest.innerHTML = DESTACADOS.map(function (url) {
        var it = buscarItem(url);
        if (!it) return "";
        return filaHTML(it, areaDeRuta(url));
      }).join("");
    }
  }

  /* ---------- Arranque ---------- */
  function iniciar() {
    construirBarra();
    var main = document.querySelector("[data-indice]");
    if (main) construirIndice(main);
    if (document.querySelector("[data-tirada]")) construirPortada();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();

  window.TC = { AREAS: AREAS, CATALOGO: CATALOGO };
})();
