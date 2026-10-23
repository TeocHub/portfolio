/* ==========================================================
   Tomás Cabrolier · Portfolio — script compartido
   ----------------------------------------------------------
   Se carga en el <head> SIN defer, para elegir la baraja
   (Luz o Sombra) antes de pintar y evitar un parpadeo.

   PARA AGREGAR UN TRABAJO NUEVO: busca el área en CATALOGO
   (más abajo) y añade una línea a la lista "items" del grupo
   que corresponda:
     { t: "Título", d: "Una frase que diga qué es.", url: "ruta/desde/la/raiz/", tipo: "Lectura guiada" }
   Sin "url", el trabajo aparece como pendiente.
   La ruta siempre se escribe desde la raíz del portfolio.

   PARA QUE UN COLOR CAMBIE CON LA BARAJA en una página,
   usa los tokens de assets/css/barajas.css:
     CSS:      color: var(--tinta);  background: var(--acento-suave);
     Gráficos: backgroundColor: "var(--acento-relleno)"
   ========================================================== */
(function () {
  "use strict";

  /* ---------- Raíz del sitio (funciona en GitHub Pages y en local) ---------- */
  var script = document.currentScript || document.querySelector('script[src*="assets/js/site.js"]');
  var RAIZ = new URL("../../", script.src);
  var html = document.documentElement;
  html.classList.add("js");

  /* ---------- Baraja: Luz o Sombra ---------- */
  var CLAVE = "tc-baraja";
  function barajaGuardada() {
    try { return localStorage.getItem(CLAVE); } catch (e) { return null; }
  }
  function guardarBaraja(b) {
    try { localStorage.setItem(CLAVE, b); } catch (e) { /* sin almacenamiento: no pasa nada */ }
  }
  var inicial = barajaGuardada();
  if (inicial !== "luz" && inicial !== "sombra") {
    inicial = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "sombra" : "luz";
  }
  html.dataset.baraja = inicial;

  /* ---------- Colores de gráficos (Chart.js) que siguen a la baraja ---------- */
  var sonda = null, lienzo = null;
  function resolverColor(valor) {
    if (typeof valor !== "string" || valor.indexOf("var(") < 0) return valor;
    if (!sonda) {
      sonda = document.createElement("span");
      sonda.style.display = "none";
      html.appendChild(sonda);
      lienzo = document.createElement("canvas").getContext("2d");
    }
    sonda.style.color = "";
    sonda.style.color = valor;
    var calculado = getComputedStyle(sonda).color;
    lienzo.fillStyle = "#000";
    lienzo.fillStyle = calculado;
    return lienzo.fillStyle;
  }
  function recorrer(obj, registro, visto) {
    if (!obj || typeof obj !== "object" || visto.indexOf(obj) >= 0) return;
    visto.push(obj);
    Object.keys(obj).forEach(function (k) {
      var v = obj[k];
      if (typeof v === "string" && v.indexOf("var(") >= 0) registro.push([obj, k, v]);
      else if (v && typeof v === "object" && !(v instanceof HTMLElement)) recorrer(v, registro, visto);
    });
  }
  var pluginBaraja = {
    id: "tcBaraja",
    beforeInit: function (chart) {
      var reg = [];
      var conf = chart.config._config || chart.config;
      recorrer(conf.data, reg, []);
      recorrer(conf.options, reg, []);
      chart.$tcColores = reg;
    },
    beforeUpdate: function (chart) {
      (chart.$tcColores || []).forEach(function (r) { r[0][r[1]] = resolverColor(r[2]); });
    }
  };
  function prepararChart(C) {
    try {
      C.register(pluginBaraja);
      C.defaults.font.family = '"Atkinson Hyperlegible", system-ui, sans-serif';
      C.defaults.color = "var(--tinta-2)";
      C.defaults.borderColor = "rgb(var(--linea-rgb))";
      ajustarDefaultsChart(C);
    } catch (e) { /* versión de Chart.js sin register: se ignora */ }
  }
  function ajustarDefaultsChart(C) {
    C.defaults.color = resolverColor("var(--tinta-2)");
    C.defaults.borderColor = resolverColor("rgb(var(--linea-rgb))");
  }
  if (window.Chart) prepararChart(window.Chart);
  else {
    try {
      var _chart;
      Object.defineProperty(window, "Chart", {
        configurable: true,
        get: function () { return _chart; },
        set: function (v) { _chart = v; if (v && v.register) prepararChart(v); }
      });
    } catch (e) { /* sin acceso: los gráficos quedan con sus colores */ }
  }
  function actualizarGraficos() {
    var C = window.Chart;
    if (!C || !C.instances) return;
    ajustarDefaultsChart(C);
    Object.keys(C.instances).forEach(function (k) {
      var g = C.instances[k];
      try {
        if (g.options && g.options.scales) {
          Object.keys(g.options.scales).forEach(function (s) {
            var e = g.options.scales[s];
            if (e.ticks) e.ticks.color = C.defaults.color;
            if (e.grid) e.grid.color = C.defaults.borderColor;
            if (e.pointLabels) e.pointLabels.color = C.defaults.color;
            if (e.angleLines) e.angleLines.color = C.defaults.borderColor;
            if (e.title) e.title.color = C.defaults.color;
          });
        }
        if (g.options && g.options.plugins && g.options.plugins.legend && g.options.plugins.legend.labels) {
          g.options.plugins.legend.labels.color = C.defaults.color;
        }
        g.update("none");
      } catch (e) { /* gráfico sin opciones estándar */ }
    });
  }

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

  /* Dibujos de cada arcano. Clases: .area (color del área), .tinta, .papel, .llama, .sol */
  var GLIFOS = {
    pedagogia:
      '<path d="M50 5v11M31 11l6 9M69 11l-6 9"/>' +
      '<path class="area" d="M10 74q20-10 40 0q20-10 40 0V34q-20-10-40 0q-20-10-40 0z"/>' +
      '<path d="M50 34v40M20 46q10-4 21 0M20 56q10-4 21 0M59 46q10-4 21 0M59 56q10-4 21 0"/>',
    letras:
      '<path class="tinta" d="M22 14a12 12 0 1 0 13 17a9.5 9.5 0 1 1-13-17z"/>' +
      '<path class="area" d="M80 9C58 15 40 41 33 79l9-4c4-15 13-28 25-38C81 26 86 15 80 9z"/>' +
      '<path d="M75 15C59 29 46 51 37 77M33 79l-5 12"/>' +
      '<path class="papel" d="M14 90h30"/>',
    codigo:
      '<path d="M50 23c-7-10-20-10-20 0s13 10 20 0c7-10 20-10 20 0s-13 10-20 0z"/>' +
      '<rect class="area" x="13" y="40" width="74" height="50" rx="9"/>' +
      '<path d="M38 55l-10 10 10 10M62 55l10 10-10 10M55 52l-10 26"/>',
    esoterico:
      '<path class="area" d="M62 8a33 33 0 1 0 29 45a26 26 0 1 1-29-45z"/>' +
      '<path class="llama" d="M22 41c-7 8-6 16 0 16s7-8 0-16z"/>' +
      '<path d="M22 57v5"/>' +
      '<rect class="papel" x="13" y="62" width="18" height="28" rx="2"/>' +
      '<path class="tinta" d="M84 70l2.2 5.3 5.3 2.2-5.3 2.2-2.2 5.3-2.2-5.3-5.3-2.2 5.3-2.2z"/>',
    estudio:
      '<path class="sol" d="M50 4l4 8.4 9 1.2-6.6 6.2 1.7 9-8.1-4.4-8.1 4.4 1.7-9-6.6-6.2 9-1.2z"/>' +
      '<path class="area" d="M26 91V57a24 24 0 0 1 48 0v34l-8-7-8 7-8-7-8 7-8-7z"/>' +
      '<circle class="papel" cx="50" cy="57" r="10"/><circle class="tinta" cx="52" cy="58" r="4.2"/>',
    sitios:
      '<rect class="area" x="12" y="16" width="76" height="52" rx="7"/>' +
      '<path d="M12 30h76M24 45h32M24 55h20"/>' +
      '<circle class="tinta" cx="21" cy="23" r="2.2"/><circle class="tinta" cx="28" cy="23" r="2.2"/>' +
      '<circle class="papel" cx="30" cy="81" r="10"/><circle class="papel" cx="70" cy="81" r="10"/>' +
      '<path d="M30 71v20M20 81h20M70 71v20M60 81h20"/>'
  };
  function glifo(area) {
    return '<svg class="glifo" viewBox="0 0 100 100" aria-hidden="true">' + (GLIFOS[area] || "") + "</svg>";
  }

  /* Engranaje: dientes cuadrados alrededor de un círculo */
  function engranaje(cx, cy, r, dientes, prof) {
    var n = dientes * 4, pts = [];
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var rr = (i % 4 < 2) ? r : r - prof;
      pts.push((cx + rr * Math.cos(a)).toFixed(1) + " " + (cy + rr * Math.sin(a)).toFixed(1));
    }
    return "M" + pts.join("L") + "Z";
  }
  var NUBE = "M18 52h86a14 14 0 0 0 0-28a20 20 0 0 0-36-12a18 18 0 0 0-30 8a14 14 0 0 0-20 32z";
  function adornosCarta() {
    return '<svg class="adorno nube" viewBox="0 0 120 60" aria-hidden="true"><path d="' + NUBE + '"/></svg>' +
      '<svg class="adorno nube" viewBox="0 0 120 60" aria-hidden="true"><path d="' + NUBE + '"/></svg>' +
      '<svg class="adorno engranaje" viewBox="0 0 100 100" aria-hidden="true">' +
        '<path d="' + engranaje(50, 50, 46, 14, 5) + '"/><circle cx="50" cy="50" r="33"/>' +
        '<circle cx="50" cy="50" r="8"/><path d="M50 17v25M50 58v25M17 50h25M58 50h25"/></svg>';
  }

  /* Escena del cielo (Luz) y de la relojería (Sombra) */
  function escenaHTML() {
    var rayos = "";
    for (var i = 0; i < 12; i++) {
      var a = (i / 12) * Math.PI * 2;
      rayos += "M" + (100 + 70 * Math.cos(a)).toFixed(1) + " " + (100 + 70 * Math.sin(a)).toFixed(1) +
        "L" + (100 + 92 * Math.cos(a)).toFixed(1) + " " + (100 + 92 * Math.sin(a)).toFixed(1);
    }
    var sol =
      '<svg class="sol" viewBox="0 0 200 200" aria-hidden="true"><path class="rayos" d="' + rayos + '"/>' +
      '<circle class="disco" cx="100" cy="100" r="56"/>' +
      '<circle cx="82" cy="94" r="6" fill="var(--trazo)"/><circle cx="118" cy="94" r="6" fill="var(--trazo)"/>' +
      '<path d="M80 114q20 18 40 0" fill="none" stroke="var(--trazo)" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="70" cy="112" r="7" fill="#FF8DB3" opacity=".8"/><circle cx="130" cy="112" r="7" fill="#FF8DB3" opacity=".8"/></svg>';
    var nubes = ["n1", "n2", "n3"].map(function (c) {
      return '<svg class="nube-grande ' + c + '" viewBox="0 0 120 60" aria-hidden="true"><path d="' + NUBE + '"/></svg>';
    }).join("");
    var colinas =
      '<svg class="colinas" viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden="true">' +
      '<path class="c2" vector-effect="non-scaling-stroke" d="M-10 150V72C200 22 380 30 560 70S900 122 1100 62 1360 30 1450 50V150Z"/>' +
      '<path class="c1" vector-effect="non-scaling-stroke" d="M-10 150V106C240 70 420 80 640 110S1040 132 1240 96 1450 88 1450 88V150Z"/></svg>';
    /* Constelación: puntos fijos, siempre iguales */
    var pts = [[3, 8], [9, 4], [16, 9], [24, 3], [58, 6], [64, 14], [71, 7], [78, 18], [86, 9], [93, 20], [97, 6], [2, 86], [5, 72], [10, 92], [90, 62], [96, 78], [84, 90]];
    var lineas = [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [11, 12], [11, 13], [14, 15], [15, 16]];
    var conste = '<svg class="constelacion" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
      lineas.map(function (l) {
        return '<line vector-effect="non-scaling-stroke" x1="' + pts[l[0]][0] + '" y1="' + pts[l[0]][1] + '" x2="' + pts[l[1]][0] + '" y2="' + pts[l[1]][1] + '"/>';
      }).join("") + "</svg>";
    var estrellas = pts.map(function (p, i) {
      var r = i % 3 === 0 ? 2.2 : 1.4;
      return '<span style="position:absolute;left:' + p[0] + "%;top:" + p[1] + "%;width:" + (r * 2) + "px;height:" + (r * 2) +
        'px;margin:-' + r + "px;border-radius:50%;background:var(--tinta);opacity:" + (i % 2 ? ".55" : ".9") + '"></span>';
    }).join("");
    var marcas = "";
    for (var m = 0; m < 60; m++) {
      var am = (m / 60) * Math.PI * 2, r1 = m % 5 === 0 ? 212 : 222;
      marcas += "M" + (260 + r1 * Math.cos(am)).toFixed(1) + " " + (260 + r1 * Math.sin(am)).toFixed(1) +
        "L" + (260 + 232 * Math.cos(am)).toFixed(1) + " " + (260 + 232 * Math.sin(am)).toFixed(1);
    }
    var reloj = '<svg class="reloj" viewBox="0 0 520 520" aria-hidden="true">' +
      '<circle cx="260" cy="260" r="246"/><circle cx="260" cy="260" r="236"/><path d="' + marcas + '"/>' +
      '<circle cx="260" cy="260" r="150"/>' +
      '<path d="' + engranaje(200, 230, 92, 18, 9) + '"/><circle cx="200" cy="230" r="58"/><circle cx="200" cy="230" r="12"/>' +
      '<path d="' + engranaje(330, 330, 62, 13, 8) + '"/><circle cx="330" cy="330" r="34"/><circle cx="330" cy="330" r="8"/>' +
      '<path d="M260 260L260 92M260 260L372 300"/><circle cx="260" cy="260" r="6"/></svg>';
    return '<div class="escena" aria-hidden="true">' + sol + nubes + colinas + conste + estrellas + reloj + "</div>";
  }
  function pintarEscenas() {
    document.querySelectorAll(".cielo > .escena:empty").forEach(function (e) {
      e.outerHTML = escenaHTML();
    });
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
        { t: "Entre dos mundos", d: "Octavio Ibarra tiene el talento para ser el mejor practicante de Vallarreal. Lo que no tiene es el apellido.", img: "letras/portadas/Entre Dos Mundos.png", url: "https://www.wattpad.com/story/416510977" },
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
          { t: "Cuestionario definitivo de FNAF", d: "376 preguntas sobre el lore canónico de Five Nights at Freddy's, en español e inglés, con ranking global.", url: "https://teochub.github.io/fnaf-quest/", tipo: "Cuestionario" },
          { t: "Cuestionario definitivo de Percy Jackson", d: "1379 preguntas sobre los 18 libros del universo de Rick Riordan y las dos temporadas de la serie, con ranking global.", url: "https://teochub.github.io/pj-quest/quiz/", tipo: "Cuestionario" },
          { t: "Cuestionario definitivo de Avatar", d: "349 preguntas de Avatar en cinco partes, con ranking global.", url: "https://teochub.github.io/avatar-quest/quiz/", tipo: "Cuestionario" },
          { t: "¿Qué elemento controlarías?", d: "Test de Avatar con 54 afirmaciones: agua, tierra, fuego o aire.", url: "https://teochub.github.io/avatar-quest/elemento/", tipo: "Test" },
          { t: "¿De qué dios serías hijo o hija?", d: "El próximo test de Percy Jackson Quest.", tipo: "Próximamente" },
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
        { t: "SindicatoLegal", d: "Prototipo rápido de la base de una plataforma para sindicatos, con portal de socios y panel de directiva.", url: "sitios/sindicato/", tipo: "Prototipo" },
        { t: "Reglamentos SmartFit", d: "Mi primer sitio, hecho rápido: contratos y reglamentos de SmartFit resumidos. Ya no refleja sus políticas actuales.", url: "sitios/smartfit/", tipo: "Archivo" },
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

  /* ---------- Interruptor de baraja ---------- */
  var ICONO_SOL = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="#FFCB3D" stroke="currentColor" stroke-width="2"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var ICONO_LUNA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 3.5a8.5 8.5 0 1 0 5 13.4A6.8 6.8 0 1 1 15.5 3.5z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="6" r="1" fill="currentColor"/></svg>';
  function etiquetaBaraja(b) { return b === "sombra" ? "Sombra" : "Luz"; }
  function pintarInterruptores() {
    var b = html.dataset.baraja, otra = b === "sombra" ? "luz" : "sombra";
    document.querySelectorAll("[data-baraja-boton]").forEach(function (btn) {
      var largo = btn.hasAttribute("data-largo");
      btn.setAttribute("aria-label", "Baraja de " + etiquetaBaraja(b) + ". Cambiar a la baraja de " + etiquetaBaraja(otra));
      btn.setAttribute("aria-pressed", b === "sombra" ? "true" : "false");
      if (largo) {
        btn.innerHTML = (b === "sombra" ? ICONO_SOL : ICONO_LUNA) + "<span>Barajar hacia la " + etiquetaBaraja(otra) + "</span>";
      } else {
        btn.innerHTML = '<span class="tc-baraja-icono">' + (b === "sombra" ? ICONO_LUNA : ICONO_SOL) + "</span>" +
          '<span class="tc-baraja-texto">' + etiquetaBaraja(b) + "</span>";
      }
    });
  }
  function aplicarBaraja(b) {
    html.dataset.baraja = b;
    guardarBaraja(b);
    pintarInterruptores();
    actualizarGraficos();
    document.dispatchEvent(new CustomEvent("tc:baraja", { detail: b }));
  }
  function cambiarBaraja() {
    var nueva = html.dataset.baraja === "sombra" ? "luz" : "sombra";
    var reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var cartas = Array.prototype.slice.call(document.querySelectorAll(".arcano"));
    if (reducir || !cartas.length) {
      if (!reducir && document.startViewTransition) document.startViewTransition(function () { aplicarBaraja(nueva); });
      else aplicarBaraja(nueva);
      return;
    }
    cartas.forEach(function (c) { c.classList.remove("volteando"); void c.offsetWidth; c.classList.add("volteando"); });
    setTimeout(function () { aplicarBaraja(nueva); }, 280);
    setTimeout(function () { cartas.forEach(function (c) { c.classList.remove("volteando"); }); }, 600);
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-baraja-boton]");
    if (btn) { e.preventDefault(); cambiarBaraja(); }
  });
  /* Si se cambia de baraja en otra pestaña, esta también cambia */
  window.addEventListener("storage", function (e) {
    if (e.key === CLAVE && (e.newValue === "luz" || e.newValue === "sombra") && e.newValue !== html.dataset.baraja) {
      aplicarBaraja(e.newValue);
    }
  });

  /* ---------- Barra superior y pie ---------- */
  function construirBarra() {
    var area = html.dataset.area || areaDeRuta(rutaActual);
    if (area && !html.dataset.area) html.dataset.area = area;

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
        '<button type="button" class="tc-baraja" data-baraja-boton></button>' +
      "</div>";
    document.body.insertBefore(barra, document.body.firstChild);

    var pie = document.createElement("div");
    pie.className = "tc-pie";
    pie.setAttribute("role", "contentinfo");
    pie.innerHTML =
      '<div class="tc-pie-in">' +
        '<span class="tc-pie-firma">Tomás Cabrolier · Teoc</span>' +
        "<span>Santiago de Chile</span>" +
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
      pie.style.setProperty("margin", "56px " + (-der) + "px " + (-abajo) + "px " + (-izq) + "px", "important");
      pie.style.setProperty("width", ancho, "important");
      pie.style.setProperty("max-width", "none", "important");
    }
  }

  /* ---------- Arcanos ---------- */
  function arcanoHTML(k, conPie, esEnlace) {
    var a = AREAS[k];
    var tag = esEnlace ? "a" : "div";
    return "<" + tag + ' class="arcano" data-area="' + k + '"' + (esEnlace ? ' href="' + enlace(a.url) + '"' : ' aria-hidden="true"') + ">" +
      adornosCarta() +
      '<span class="arcano-num">' + a.num + "</span>" + glifo(k) +
      (conPie ? '<span class="arcano-pie"><span class="arcano-area">' + esc(a.nombre) + '</span><span class="arcano-carta">' + esc(a.carta) + "</span></span>" : "") +
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
    var color = conArea
      ? ' style="--obra-color: var(--a-' + conArea + '-relleno); --obra-suave: var(--a-' + conArea + '-suave); --obra-tinta: var(--a-' + conArea + ')"'
      : "";
    return '<li class="obra' + (url ? "" : " pendiente") + '"' + color + ">" +
      "<div>" + area + '<h3 class="obra-titulo">' + titulo + "</h3></div>" +
      '<span class="obra-tipo">' + esc(it.tipo || "") + "</span>" +
      (it.d ? '<p class="obra-desc">' + esc(it.d) + "</p>" : "") +
      "</li>";
  }

  /* ---------- La Rueda: cómo se explora cada área ----------
     Cada trabajo es un medallón en una rueda (el arcano X). Se gira
     arrastrando, con las flechas o tocando un medallón; el que queda
     frente a la aguja se lee al lado. El centro tira la rueda al azar. */
  var ICONOS = {
    libro: '<path d="M3 5.5c3-1.3 6-1 9 1v13c-3-2-6-2.3-9-1z"/><path d="M21 5.5c-3-1.3-6-1-9 1v13c3-2 6-2.3 9-1z"/>',
    hoja: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    pluma: '<path d="M20 3C12 5 7 11 5.5 19.5"/><path d="M20 3c-.5 6-4.5 10.5-11 12.5"/><path d="M5.5 19.5L4 22"/>',
    letras: '<path d="M3 18l4.5-12L12 18M4.7 14h5.6"/><circle cx="17" cy="15" r="2.8"/><path d="M19.8 11.5V18"/>',
    audifonos: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.6"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.6"/>',
    ventana: '<rect x="3" y="4.5" width="18" height="15" rx="2.2"/><path d="M3 9h18"/><path d="M6 6.8h.01M8.5 6.8h.01"/>',
    bandera: '<path d="M5 21V4"/><path d="M5 4.5h12l-2.5 4 2.5 4H5"/>',
    barras: '<path d="M4 20h16"/><path d="M7.5 20v-6M12 20V8M16.5 20v-9.5"/>',
    formulario: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 8h.01M11 8h4.5M8.5 12h.01M11 12h4.5M8.5 16h.01M11 16h4.5"/>',
    llave: '<circle cx="7.5" cy="12" r="4"/><path d="M11.5 12H21M18 12v3.5M21 12v2.5"/>',
    herramienta: '<path d="M14.7 6.3a4.5 4.5 0 0 0 5.6 5.6L12 20.2a2.1 2.1 0 0 1-3-3l8.3-8.3"/><path d="M14.7 6.3l2.6-2.6a4.5 4.5 0 0 1 3 3l-2.6 2.6"/>',
    dado: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M8.5 8.5h.01M15.5 15.5h.01M12 12h.01M15.5 8.5h.01M8.5 15.5h.01"/>',
    pdf: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 13h6M9 17h4"/>',
    lupa: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>',
    mando: '<rect x="2.5" y="7.5" width="19" height="10.5" rx="5.2"/><path d="M7 10.6v4.3M4.9 12.8h4.3M15.5 11.5h.01M18 14h.01"/>',
    engranaje: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M5.5 18.5l2.1-2.1M16.4 7.6l2.1-2.1"/>',
    lapiz: '<path d="M4 20l1.2-4.6L16 4.6a2.1 2.1 0 0 1 3 3L8.2 18.4z"/><path d="M14.3 6.3l3.4 3.4"/>',
    caja: '<rect x="3" y="4" width="18" height="5" rx="1.2"/><path d="M5 9v10.5h14V9M10 13h4"/>',
    luna: '<path d="M15.5 3.5a8.6 8.6 0 1 0 5 13.9A7 7 0 0 1 15.5 3.5z"/>',
    vela: '<path d="M12 3c-2.4 2.7-2.4 5.4 0 6 2.4-.6 2.4-3.3 0-6z"/><path d="M12 9v2"/><rect x="8" y="11" width="8" height="10" rx="1.5"/>',
    balanza: '<path d="M12 4v16M8 20h8M5 7h14M12 4h.01"/><path d="M5 7l-2.6 6h5.2zM19 7l-2.6 6h5.2z"/>',
    globo: '<path d="M4 5h16v11H10l-4.5 3.5V16H4z"/><path d="M8 9h8M8 12.3h5"/>',
    reloj: '<path d="M7 3h10M7 21h10"/><path d="M8 3c0 5 8 6 8 9s-8 4-8 9M16 3c0 5-8 6-8 9s8 4 8 9"/>',
    chip: '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/><path d="M10 3v3.5M14 3v3.5M10 17.5V21M14 17.5V21M3 10h3.5M3 14h3.5M17.5 10H21M17.5 14H21"/>',
    pi: '<path d="M4.5 7.5h15M9 7.5V19M15 7.5v8.5a3 3 0 0 0 3.5 3"/>',
    matraz: '<path d="M9 3h6M10 3v6.2l-5.2 8.9A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-2.9L14 9.2V3"/><path d="M7.4 15h9.2"/>',
    pizarra: '<rect x="3" y="4" width="18" height="12" rx="1.4"/><path d="M8 20.5l2-4.5M16 20.5l-2-4.5M7 8.5h6M7 11.5h8.5"/>',
    birrete: '<path d="M2 9.5L12 5l10 4.5L12 14z"/><path d="M6.5 11.6v4.6c3 2.6 8 2.6 11 0v-4.6M22 9.5v5.5"/>',
    carpeta: '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.6l2.2 2.3h8.2A1.5 1.5 0 0 1 21 8.8v9.7a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z"/>',
    monstruo: '<path d="M5 20.5V11a7 7 0 0 1 14 0v9.5l-2.4-1.8-2.3 1.8-2.3-1.8-2.3 1.8-2.3-1.8z"/><path d="M9.5 11h.01M14.5 11h.01M10 14.5q2 1.4 4 0"/>',
    pregunta: '<circle cx="12" cy="12" r="9"/><path d="M9.3 9.4a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.3-2.7 4"/><path d="M12 17.4h.01"/>',
    brujula: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    oso: '<circle cx="6.8" cy="6.3" r="2.6"/><circle cx="17.2" cy="6.3" r="2.6"/><path d="M5 13.5a7 7 0 0 1 14 0v1.5a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z"/><path d="M9.4 12.8h.01M14.6 12.8h.01M10.3 16.8h3.4"/>',
    tridente: '<path d="M12 21.5V4.5"/><path d="M6.5 3.5V8c0 2.3 2.4 3.8 5.5 3.8s5.5-1.5 5.5-3.8V3.5"/><path d="M10 5.5l2-3 2 3"/>',
    espiral: '<path d="M12 12.5c0-1.6 2-2 2.9-.9s0 3.8-2.9 3.8-4.6-2.6-3-5.4 6.4-3.6 8.8-.6"/><path d="M3.5 17c4 1.8 8 1.8 12 0M6 20.5c3 1 6 1 9 0"/>',
    rayo: '<path d="M13.5 2.5L5.5 13.5h6l-1 8 8-11.5h-6z"/>',
    estrella: '<path d="M12 3.5l2.5 5.4 5.9.6-4.4 4 1.2 5.8L12 16.4l-5.2 2.9L8 13.5l-4.4-4 5.9-.6z"/>'
  };
  var ICONO_TIPO = {
    "Lectura guiada": "libro", "Resumen": "hoja", "Ensayo": "pluma", "Glosario": "letras",
    "Guía con podcast": "audifonos", "Interactivo con podcast": "audifonos", "Página web": "ventana",
    "Sitio web": "ventana", "Actividad": "bandera", "Informe": "barras", "Formulario": "formulario",
    "Escape room": "llave", "Herramienta": "herramienta", "Generador": "dado", "Propuesta": "pluma",
    "PDF": "pdf", "Buscador": "lupa", "Guía": "hoja", "Juego web": "mando", "En desarrollo": "engranaje",
    "Prototipo": "lapiz", "Archivo": "caja", "Próximamente": "luna",
    "Cuestionario": "pregunta", "Test": "brujula"
  };
  var ICONO_HUB = {
    "pedagogia/etica": "balanza", "pedagogia/lenguaje": "globo", "pedagogia/historia": "reloj",
    "pedagogia/tics": "chip", "pedagogia/matematicas": "pi", "pedagogia/fisica-quimica": "matraz",
    "pedagogia/practica": "pizarra", "pedagogia/tesis": "birrete", "pedagogia/recursos": "carpeta"
  };
  var ICONO_TITULO = { "Velas de cera de abeja": "vela", "Lecturas de tarot": "luna", "Mar y Ola": "vela", "Digital Monster": "monstruo", "¿De qué dios serías hijo o hija?": "rayo",
    "Cuestionario definitivo de FNAF": "oso", "Cuestionario definitivo de Percy Jackson": "tridente", "Cuestionario definitivo de Avatar": "espiral" };
  /* Color de cada grupo de la rueda: el del área y luego los secundarios */
  var COLOR_GRUPO = ["acento", "h1", "h3", "h4", "h2"];

  function icono(n) {
    return '<svg class="rueda-icono" viewBox="0 0 24 24" aria-hidden="true">' + (ICONOS[n] || ICONOS.estrella) + "</svg>";
  }
  function romano(n) {
    var r = "";
    [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]].forEach(function (p) { while (n >= p[0]) { r += p[1]; n -= p[0]; } });
    return r;
  }
  function colorGrupo(gi) {
    var c = COLOR_GRUPO[gi % COLOR_GRUPO.length];
    return "--g: var(--" + c + "-relleno); --gs: var(--" + c + "-suave); --gt: var(--" + c + ")";
  }

  function itemsRueda(h) {
    var items = [], grupos = [];
    if (h.estante) {
      grupos.push("Historias");
      h.estante.forEach(function (l) {
        items.push({ t: l.t, d: l.d, url: l.url, img: l.img, tipo: "Historia en Wattpad", g: 0, ic: "libro" });
      });
    }
    (h.grupos || []).forEach(function (g) {
      grupos.push(g.titulo);
      var gi = grupos.length - 1;
      g.items.forEach(function (it) {
        if (it.hub) {
          var sub = CATALOGO[it.hub], n = contar(it.hub), hijos = [];
          (sub.grupos || []).forEach(function (sg) { sg.items.forEach(function (x) { if (x.t) hijos.push(x); }); });
          items.push({ t: sub.titulo, d: sub.resumen, url: it.hub + "/", tipo: n ? plural(n) : "Todavía sin trabajos", g: gi, ic: ICONO_HUB[it.hub], hijos: hijos, vacio: !n });
        } else {
          items.push({ t: it.t, d: it.d, url: it.url, tipo: it.tipo, g: gi, ic: ICONO_TITULO[it.t] || ICONO_TIPO[it.tipo] });
        }
      });
    });
    return { items: items, grupos: grupos, puestos: Math.max(items.length, 6) };
  }

  /* Geometría (unidades del SVG, centro en 0,0, radio 300; 0° = derecha, sentido horario) */
  var R = { centro: 150, cara: 258, borde: 298, medallon: 204, rotulo: 270 };
  function punto(r, a) {
    var rad = a * Math.PI / 180;
    return (r * Math.cos(rad)).toFixed(2) + " " + (r * Math.sin(rad)).toFixed(2);
  }
  function sector(r1, r2, a1, a2) {
    if (a2 - a1 > 179) { var m = (a1 + a2) / 2; return sector(r1, r2, a1, m) + sector(r1, r2, m, a2); }
    return "M" + punto(r2, a1) + "A" + r2 + " " + r2 + " 0 0 1 " + punto(r2, a2) +
      "L" + punto(r1, a2) + "A" + r1 + " " + r1 + " 0 0 0 " + punto(r1, a1) + "Z";
  }
  function ruedaSVG(datos, uid) {
    var items = datos.items, N = items.length, S = datos.puestos, paso = 360 / S, s = "";
    var tramos = [];
    items.forEach(function (it, i) {
      var t = tramos[tramos.length - 1];
      if (t && t.g === it.g) t.fin = i; else tramos.push({ g: it.g, ini: i, fin: i });
    });
    s += '<circle class="disco" r="' + R.borde + '"/>';
    tramos.forEach(function (t, k) {
      var a1 = t.ini * paso - paso / 2, a2 = t.fin * paso + paso / 2;
      var estilo = ' style="' + colorGrupo(t.g) + '"';
      s += '<path class="cara"' + estilo + ' d="' + sector(R.centro, R.cara, a1, a2) + '"/>';
      s += '<path class="banda"' + estilo + ' d="' + sector(R.cara, R.borde, a1, a2) + '"/>';
      var fin = Math.min(a2, a1 + 359), largo = fin - a1, grande = largo > 180 ? 1 : 0;
      var id = uid + "-r" + k;
      /* Dos trazos: uno para leer arriba (horario) y otro para abajo (antihorario) */
      s += '<path id="' + id + '" fill="none" d="M' + punto(R.rotulo, a1) + "A" + R.rotulo + " " + R.rotulo + " 0 " + grande + " 1 " + punto(R.rotulo, fin) + '"/>';
      s += '<path id="' + id + 'b" fill="none" d="M' + punto(R.rotulo + 12, fin) + "A" + (R.rotulo + 12) + " " + (R.rotulo + 12) + " 0 " + grande + " 0 " + punto(R.rotulo + 12, a1) + '"/>';
      var texto = datos.grupos[t.g], arcoLargo = largo * Math.PI / 180 * R.rotulo * 0.9;
      var escala = Math.min(1, arcoLargo / (texto.length * 15 * 0.78));
      if (escala < 0.8) {
        escala = 0.8;
        var caben = Math.floor(arcoLargo / (12 * 0.78)) - 1;
        if (caben < texto.length) texto = texto.slice(0, Math.max(3, caben)).replace(/\s+\S*$/, "") + "…";
      }
      s += '<text class="rotulo" data-medio="' + ((a1 + fin) / 2) + '" data-id="' + id + '" style="--esc:' + escala.toFixed(2) + '">' +
        '<textPath href="#' + id + '" startOffset="50%" text-anchor="middle">' + esc(texto) + "</textPath></text>";
    });
    var grupoDe = function (i) { i = (i + S) % S; return i < N ? items[i].g : -1; };
    for (var e = 0; e < S; e++) {
      if (S === 1) break;
      var ga = grupoDe(e - 1), gb = grupoDe(e), ang = e * paso - paso / 2;
      if (ga === -1 && gb === -1) continue;
      var limite = ga !== gb;
      s += '<path class="radio' + (limite ? "" : " fino") + '" d="M' + punto(R.centro, ang) + "L" + punto(limite ? R.borde : R.cara, ang) + '"/>';
    }
    s += '<circle class="aro" r="' + R.centro + '"/><circle class="aro" r="' + R.cara + '"/><circle class="aro borde" r="' + R.borde + '"/>';
    for (var m = 0; m < 72; m++) {
      var larga = m % 6 === 0;
      s += '<path class="marca" d="M' + punto(larga ? 284 : 290, m * 5) + "L" + punto(R.borde, m * 5) + '"/>';
    }
    for (var f = 0; f < 24; f++) s += '<circle class="foco" r="6" cx="' + punto(R.borde, f * 15 + 7.5).replace(" ", '" cy="') + '"/>';
    s += '<circle class="aro interior" r="' + (R.centro - 14) + '"/>';
    return '<svg class="rueda-fondo" viewBox="-300 -300 600 600" aria-hidden="true">' + s + "</svg>";
  }

  function ruedaHTML(h, datos, uid) {
    var items = datos.items, N = items.length, S = datos.puestos, paso = 360 / S;
    var med = Math.min(16, (2 * Math.PI * R.medallon / S) * 0.7 / 6);
    var huecos = "";
    for (var k = N; k < S; k++) {
      var ah = k * paso * Math.PI / 180;
      huecos += '<span class="hueco" aria-hidden="true" style="--x:' + (50 + (R.medallon / 6) * Math.cos(ah)).toFixed(2) + "%;--y:" + (50 + (R.medallon / 6) * Math.sin(ah)).toFixed(2) + '%"></span>';
    }
    var meds = items.map(function (it, i) {
      var a = i * paso * Math.PI / 180;
      var x = 50 + (R.medallon / 6) * Math.cos(a), y = 50 + (R.medallon / 6) * Math.sin(a);
      return '<button type="button" class="medallon' + (it.url && !it.vacio ? "" : " pendiente") + (it.img ? " con-portada" : "") + '" data-i="' + i + '"' +
        ' style="--x:' + x.toFixed(2) + "%;--y:" + y.toFixed(2) + "%;" + colorGrupo(it.g) + '"' +
        ' aria-label="' + esc(it.t) + '" aria-pressed="false" tabindex="-1">' +
        "<span>" + (it.img ? '<img src="' + esc(enlace(it.img)) + '" alt="" loading="lazy" draggable="false">' : icono(it.ic)) +
        '<b class="medallon-nombre" aria-hidden="true">' + esc(it.t) + "</b></span></button>";
    }).join("");
    var tirar = N > 1
      ? '<button type="button" class="rueda-centro" data-tirar aria-label="Tirar la rueda: elegir un trabajo al azar">' + glifo(h.area) + "<span>Tirar</span></button>"
      : '<div class="rueda-centro" aria-hidden="true">' + glifo(h.area) + "</div>";
    var grupos = datos.grupos.length > 1
      ? '<div class="rueda-grupos" role="group" aria-label="Ir a un grupo">' + datos.grupos.map(function (g, gi) {
          var primero = -1;
          items.some(function (it, i) { if (it.g === gi) { primero = i; return true; } return false; });
          return primero < 0 ? "" : '<button type="button" data-ir="' + primero + '" style="' + colorGrupo(gi) + '">' + esc(g) + "</button>";
        }).join("") + "</div>"
      : "";
    return '<section class="rueda-zona tc-contenedor" data-rueda="' + uid + '" aria-label="Trabajos de ' + esc(h.titulo) + '">' +
      '<div class="rueda-escena">' +
        '<div class="rueda" style="--med:' + med.toFixed(2) + '%">' +
          '<div class="rueda-giro">' + ruedaSVG(datos, uid) + '<div class="rueda-medallones" role="toolbar" aria-label="Medallones de la rueda">' + huecos + meds + "</div></div>" +
          tirar +
          '<svg class="rueda-aguja" viewBox="0 0 40 40" aria-hidden="true"><path d="M3 20L37 4v32z"/></svg>' +
        "</div>" +
        '<p class="rueda-pista">' + (N > 1 ? "Gira la rueda o toca un medallón. Tócalo otra vez para abrirlo." : "Toca el medallón para abrirlo.") + "</p>" +
        grupos +
      "</div>" +
      '<div class="rueda-lectura">' +
        '<div class="rueda-contenido" aria-live="polite"></div>' +
        (N > 1 ? '<div class="rueda-pasos"><button type="button" data-paso="-1" aria-label="Anterior">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
          '<span data-cuenta></span><button type="button" data-paso="1" aria-label="Siguiente">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button></div>' : "") +
      "</div>" +
    "</section>";
  }

  function lecturaHTML(it, i, datos) {
    var url = it.url ? enlace(it.url) : "";
    var externo = /^https?:/.test(it.url || "");
    var abre = !url || it.vacio ? '<span class="rueda-pronto">' + (it.vacio ? "Pronto habrá trabajos aquí" : "Próximamente") + "</span>"
      : '<a class="boton" href="' + esc(url) + '"' + (externo ? ' target="_blank" rel="noopener"' : "") + ">" +
        (it.img ? "Leer en Wattpad" : it.hijos ? "Entrar a " + esc(it.t) : "Abrir") + (externo ? " ↗" : " →") + "</a>";
    var hijos = "";
    if (it.hijos && it.hijos.length) {
      var max = 5, resto = it.hijos.length - max;
      hijos = '<div class="rueda-hijos"><span>Adentro</span>' + it.hijos.slice(0, max).map(function (x) {
        var u = x.url ? enlace(x.url) : "";
        var ext = /^https?:/.test(x.url || "");
        return u ? '<a href="' + esc(u) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(x.t) + "</a>" : "<em>" + esc(x.t) + "</em>";
      }).join("") + (resto > 0 ? "<em>y " + resto + " más</em>" : "") + "</div>";
    }
    return (it.img ? '<img class="rueda-portada" src="' + esc(enlace(it.img)) + '" alt="Portada de ' + esc(it.t) + '">' : '<div class="rueda-emblema">' + icono(it.ic) + "</div>") +
      '<div class="rueda-texto">' +
        '<p class="rueda-kicker"><span class="rueda-num">' + romano(i + 1) + "</span>" + esc(datos.grupos[it.g]) + "</p>" +
        "<h2>" + esc(it.t) + "</h2>" +
        (it.tipo ? '<p class="rueda-tipo">' + esc(it.tipo) + "</p>" : "") +
        (it.d ? '<p class="rueda-desc">' + esc(it.d) + "</p>" : "") +
        hijos + '<div class="rueda-abrir">' + abre + "</div>" +
      "</div>";
  }

  function prepararRueda(zona, datos) {
    var items = datos.items, N = items.length, paso = 360 / datos.puestos;
    var rueda = zona.querySelector(".rueda");
    var meds = Array.prototype.slice.call(zona.querySelectorAll(".medallon"));
    var contenido = zona.querySelector(".rueda-contenido");
    var lectura = zona.querySelector(".rueda-lectura");
    var cuenta = zona.querySelector("[data-cuenta]");
    var reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var movil = window.matchMedia("(max-width: 759px)");
    var clave = "tc-rueda:" + zona.dataset.rueda;
    var actual = -1, angulo = 0, arrastrado = false, temporizador;

    function aguja() { return movil.matches ? 90 : 0; }
    var rotulos = Array.prototype.slice.call(zona.querySelectorAll(".rotulo"));
    var esperaRotulos;
    function orientar() {
      rotulos.forEach(function (r) {
        var m = (((Number(r.dataset.medio) + angulo) % 360) + 360) % 360;
        var abajo = m > 15 && m < 165;
        var tp = r.firstChild, href = "#" + r.dataset.id + (abajo ? "b" : "");
        if (tp.getAttribute("href") !== href) {
          tp.setAttribute("href", href);
          r.classList.remove("aparece"); void r.getBBox; r.classList.add("aparece");
        }
      });
    }
    function poner(a, dur) {
      angulo = a;
      dur = reducir ? 0 : dur;
      rueda.style.setProperty("--dur", dur + "ms");
      rueda.style.setProperty("--giro", a.toFixed(2) + "deg");
      clearTimeout(esperaRotulos);
      if (dur) esperaRotulos = setTimeout(orientar, dur * 0.8); else orientar();
    }
    function destino(i, vueltas) {
      var d = (aguja() - i * paso) - angulo;
      d = ((d % 360) + 540) % 360 - 180;
      return angulo + d + (vueltas || 0) * 360;
    }
    function elegir(i, op) {
      op = op || {};
      i = ((i % N) + N) % N;
      var cambia = i !== actual;
      actual = i;
      meds.forEach(function (m, j) {
        m.setAttribute("aria-pressed", j === i ? "true" : "false");
        m.tabIndex = j === i ? 0 : -1;
      });
      if (op.foco) meds[i].focus({ preventScroll: true });
      var destinoA = op.meta != null ? op.meta : destino(i, op.vueltas);
      var dur = op.dur != null ? op.dur : Math.min(1100, 380 + Math.abs(destinoA - angulo) * 3.2);
      poner(destinoA, dur);
      if (op.vueltas) {
        rueda.classList.add("girando");
        clearTimeout(temporizador);
        temporizador = setTimeout(function () { rueda.classList.remove("girando"); }, reducir ? 0 : dur);
      }
      if (cambia || op.forzar) {
        var pintar = function () {
          contenido.innerHTML = lecturaHTML(items[i], i, datos);
          lectura.setAttribute("style", colorGrupo(items[i].g));
          lectura.classList.remove("cambia"); void lectura.offsetWidth; lectura.classList.add("cambia");
        };
        if (op.vueltas && !reducir) { lectura.classList.add("esperando"); setTimeout(function () { lectura.classList.remove("esperando"); pintar(); }, dur - 250); }
        else pintar();
        if (cuenta) cuenta.textContent = (i + 1) + " de " + N;
      }
      try { sessionStorage.setItem(clave, String(i)); } catch (e) {}
    }
    function abrir(i) {
      var it = items[i];
      if (!it.url || it.vacio) return;
      var url = enlace(it.url);
      if (/^https?:/.test(it.url)) window.open(url, "_blank", "noopener");
      else location.href = url;
    }

    meds.forEach(function (m, i) {
      m.addEventListener("click", function () {
        if (arrastrado) return;
        if (i === actual) abrir(i); else elegir(i);
      });
      m.addEventListener("keydown", function (e) {
        var k = e.key, j = null;
        if (k === "ArrowRight" || k === "ArrowDown") j = i + 1;
        else if (k === "ArrowLeft" || k === "ArrowUp") j = i - 1;
        else if (k === "Home") j = 0;
        else if (k === "End") j = N - 1;
        if (j !== null) { e.preventDefault(); elegir(j, { foco: true }); }
      });
    });
    zona.querySelectorAll("[data-paso]").forEach(function (b) {
      b.addEventListener("click", function () { elegir(actual + Number(b.dataset.paso)); });
    });
    zona.querySelectorAll("[data-ir]").forEach(function (b) {
      b.addEventListener("click", function () { elegir(Number(b.dataset.ir)); });
    });
    var tirar = zona.querySelector("[data-tirar]");
    if (tirar) tirar.addEventListener("click", function () {
      var j = actual;
      while (j === actual) j = Math.floor(Math.random() * N);
      elegir(j, { vueltas: 2, dur: 2400 });
    });

    /* Arrastrar para girar */
    var arr = null;
    function anguloDe(e) {
      return Math.atan2(e.clientY - arr.cy, e.clientX - arr.cx) * 180 / Math.PI;
    }
    rueda.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || e.target.closest(".rueda-centro")) return;
      var r = rueda.getBoundingClientRect();
      arr = { cx: r.left + r.width / 2, cy: r.top + r.height / 2, total: 0, mov: false, v: 0, t: performance.now() };
      arr.ult = anguloDe(e);
      arrastrado = false;
    });
    rueda.addEventListener("pointermove", function (e) {
      if (!arr) return;
      var a = anguloDe(e), d = a - arr.ult;
      d = ((d % 360) + 540) % 360 - 180;
      arr.ult = a; arr.total += d;
      if (!arr.mov && Math.abs(arr.total) > 5) {
        arr.mov = true; arrastrado = true;
        rueda.classList.add("arrastrando");
        try { rueda.setPointerCapture(e.pointerId); } catch (x) {}
      }
      if (arr.mov) {
        var ahora = performance.now(), dt = Math.max(1, ahora - arr.t);
        arr.v = arr.v * 0.6 + (d / dt) * 0.4; arr.t = ahora;
        poner(angulo + d, 0);
      }
    });
    function soltar(cancelado) {
      if (!arr) return;
      var mov = arr.mov, v = cancelado ? 0 : arr.v;
      arr = null;
      rueda.classList.remove("arrastrando");
      if (!mov) return;
      var proyectado = angulo + Math.max(-540, Math.min(540, v * 260));
      var i = Math.round((aguja() - proyectado) / paso);
      var meta = aguja() - i * paso;
      elegir(i, { meta: meta, dur: Math.min(1600, 420 + Math.abs(meta - angulo) * 2.4), forzar: true });
      setTimeout(function () { arrastrado = false; }, 30);
    }
    rueda.addEventListener("pointerup", function () { soltar(false); });
    rueda.addEventListener("pointercancel", function () { soltar(true); });
    rueda.addEventListener("lostpointercapture", function () { soltar(false); });

    var cambioMovil = function () { elegir(actual, { dur: 0, forzar: false }); };
    if (movil.addEventListener) movil.addEventListener("change", cambioMovil);

    var inicial = 0;
    try { var g = parseInt(sessionStorage.getItem(clave), 10); if (g >= 0 && g < N) inicial = g; } catch (e) {}
    var meta0 = aguja() - inicial * paso;
    poner(meta0 - (N > 1 ? 150 : 60), 0);
    void rueda.offsetWidth;
    actual = -1;
    requestAnimationFrame(function () { requestAnimationFrame(function () { elegir(inicial, { dur: 1300 }); }); });
  }

  /* ---------- Índices de área ---------- */
  function construirIndice(main) {
    var id = main.dataset.indice, h = CATALOGO[id];
    if (!h) return;
    var a = AREAS[h.area];
    html.dataset.area = h.area;
    var esArea = AREAS[id];
    var out =
      '<header class="cielo cabecera-area"><div class="escena"></div><div class="tc-contenedor">' + arcanoHTML(h.area, false, false) +
        "<div>" + '<p class="carta">' + (esArea ? a.num + " · " + esc(a.carta) : esc(a.nombre)) + "</p>" +
        "<h1>" + esc(h.titulo) + "</h1>" +
        '<p class="intro">' + esc(h.intro) + "</p></div>" +
      "</div></header>";

    var datos = itemsRueda(h);
    if (datos.items.length) out += ruedaHTML(h, datos, id.replace(/\//g, "-"));
    if (!h.grupos.length && !h.estante) {
      out += '<section class="grupo tc-contenedor"><h2>Todavía no hay trabajos aquí</h2>' +
        '<p>Los iré subiendo a medida que avance el ramo. Mientras tanto, revisa el resto de <a href="' + enlace("pedagogia/") + '">Pedagogía</a>.</p></section>';
    }
    main.innerHTML = out;
    var zona = main.querySelector("[data-rueda]");
    if (zona) prepararRueda(zona, datos);
  }

  /* ---------- Portada ---------- */
  function construirPortada() {
    var tirada = document.querySelector("[data-tirada]");
    if (tirada) {
      tirada.innerHTML = ORDEN.map(function (k, i) {
        var a = AREAS[k];
        return '<li style="--i:' + i + ";--dx:" + ((ORDEN.length - 1) / 2 - i) * 170 + 'px">' +
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
          lectura.innerHTML = "<h2><small>" + a.num + " · " + esc(a.carta) + "</small>" + esc(a.nombre) + "</h2>" +
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
        var ultima = tirada.querySelector("li:last-child");
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

  /* ---------- Páginas de contenido: índice lateral y pestañas ---------- */
  function construirIndicePagina() {
    var nav = document.querySelector("[data-indice-pagina]");
    if (!nav) return;
    var bloques = Array.prototype.slice.call(document.querySelectorAll(".cuerpo > .bloque[id] > h2"));
    if (bloques.length < 2) { nav.remove(); var l = document.querySelector(".lectura"); if (l) l.classList.add("sin-indice"); return; }
    var escritorio = window.matchMedia("(min-width: 1000px)").matches;
    nav.innerHTML = '<details' + (escritorio ? " open" : "") + '><summary>En esta página</summary><ol>' +
      bloques.map(function (h) {
        return '<li><a href="#' + h.parentElement.id + '">' + esc(h.dataset.corto || h.textContent.trim()) + "</a></li>";
      }).join("") + "</ol></details>";
    var enlaces = nav.querySelectorAll("a");
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && !window.matchMedia("(min-width: 1000px)").matches) nav.querySelector("details").open = false;
    });
    if (!("IntersectionObserver" in window)) return;
    var visibles = {};
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) { visibles[en.target.id] = en.isIntersecting; });
      var activo = null;
      bloques.some(function (h) { if (visibles[h.parentElement.id]) { activo = h.parentElement.id; return true; } return false; });
      if (!activo) return;
      enlaces.forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("href") === "#" + activo ? "true" : "false"); });
    }, { rootMargin: "-10% 0px -55% 0px" });
    bloques.forEach(function (h) { obs.observe(h.parentElement); });
  }

  function prepararPestanas() {
    document.querySelectorAll("[data-pestanas]").forEach(function (grupo, gi) {
      var lista = grupo.querySelector('[role="tablist"]');
      if (!lista) return;
      var tabs = Array.prototype.slice.call(lista.querySelectorAll('[role="tab"]'));
      var paneles = Array.prototype.slice.call(grupo.querySelectorAll(':scope > [role="tabpanel"]'));
      tabs.forEach(function (t, i) {
        var p = paneles[i];
        if (!p) return;
        t.id = t.id || "pest-" + gi + "-" + i;
        p.id = p.id || "panel-" + gi + "-" + i;
        t.setAttribute("aria-controls", p.id);
        p.setAttribute("aria-labelledby", t.id);
        p.tabIndex = 0;
      });
      function elegir(i, foco) {
        tabs.forEach(function (t, j) {
          var sel = i === j;
          t.setAttribute("aria-selected", sel ? "true" : "false");
          t.tabIndex = sel ? 0 : -1;
          if (paneles[j]) paneles[j].hidden = !sel;
        });
        if (foco) tabs[i].focus();
        grupo.dispatchEvent(new CustomEvent("tc:pestana", { detail: i }));
      }
      var inicial = tabs.findIndex(function (t) { return t.getAttribute("aria-selected") === "true"; });
      elegir(inicial < 0 ? 0 : inicial, false);
      tabs.forEach(function (t, i) {
        t.addEventListener("click", function () { elegir(i, false); });
        t.addEventListener("keydown", function (e) {
          var n = tabs.length, k = e.key, j = null;
          if (k === "ArrowRight") j = (i + 1) % n;
          else if (k === "ArrowLeft") j = (i - 1 + n) % n;
          else if (k === "Home") j = 0;
          else if (k === "End") j = n - 1;
          if (j !== null) { e.preventDefault(); elegir(j, true); }
        });
      });
    });
  }

  /* ---------- Recorrido por pasos ---------- */
  function prepararRecorridos() {
    document.querySelectorAll("[data-recorrido]").forEach(function (rec) {
      var pasos = Array.prototype.slice.call(rec.querySelectorAll(":scope > .paso-recorrido"));
      if (!pasos.length) return;
      var actual = 0;
      var avance = document.createElement("ol");
      avance.className = "avance";
      avance.setAttribute("aria-label", "Avance");
      avance.innerHTML = pasos.map(function (p) { return "<li>" + esc(p.dataset.titulo || "") + "</li>"; }).join("");
      rec.insertBefore(avance, rec.firstChild);
      pasos.forEach(function (p, i) {
        var nav = document.createElement("div");
        nav.className = "navegar-pasos";
        nav.innerHTML =
          '<p class="aviso-campos" role="alert" hidden>Completa los campos marcados para continuar.</p>' +
          (i > 0 ? '<button type="button" class="boton secundario" data-ir="' + (i - 1) + '">Anterior</button>' : "<span></span>") +
          (i < pasos.length - 1 ? '<button type="button" class="boton" data-ir="' + (i + 1) + '">Siguiente: ' + esc(pasos[i + 1].dataset.titulo || "") + "</button>" : "");
        p.appendChild(nav);
      });
      function completo(p) {
        var ok = true;
        p.querySelectorAll("[required]").forEach(function (c) {
          var vacio = !String(c.value || "").trim();
          c.setAttribute("aria-invalid", vacio ? "true" : "false");
          if (vacio) ok = false;
        });
        var aviso = p.querySelector(".aviso-campos");
        if (aviso) aviso.hidden = ok;
        if (!ok) { var primero = p.querySelector('[aria-invalid="true"]'); if (primero) primero.focus(); }
        return ok;
      }
      function ir(i) {
        if (i > actual && !completo(pasos[actual])) return;
        actual = i;
        pasos.forEach(function (p, j) { p.hidden = j !== i; });
        avance.querySelectorAll("li").forEach(function (li, j) {
          li.classList.toggle("hecho", j < i);
          if (j === i) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
        });
        rec.dispatchEvent(new CustomEvent("tc:paso", { detail: i }));
        var h = pasos[i].querySelector("h2");
        if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
        rec.scrollIntoView({ block: "start" });
      }
      rec.addEventListener("click", function (e) {
        var b = e.target.closest("[data-ir]");
        if (b && rec.contains(b)) ir(+b.dataset.ir);
      });
      rec.addEventListener("input", function (e) { if (e.target.getAttribute("aria-invalid") === "true" && String(e.target.value).trim()) e.target.setAttribute("aria-invalid", "false"); });
      pasos.forEach(function (p, j) { p.hidden = j !== 0; });
      avance.querySelector("li").setAttribute("aria-current", "step");
    });
  }

  /* ---------- Arranque ---------- */
  function iniciar() {
    construirBarra();
    var main = document.querySelector("[data-indice]");
    if (main) construirIndice(main);
    if (document.querySelector("[data-tirada]")) construirPortada();
    pintarEscenas();
    pintarInterruptores();
    construirIndicePagina();
    prepararPestanas();
    prepararRecorridos();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();

  window.TC = { AREAS: AREAS, CATALOGO: CATALOGO, color: resolverColor, cambiarBaraja: cambiarBaraja };
})();
