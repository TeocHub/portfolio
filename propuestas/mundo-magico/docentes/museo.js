/* ==========================================================
   Mundo Mágico Miniatura Escolar · plano del museo y planificador
   ----------------------------------------------------------
   Lee window.MUSEO (datos.js). En la portada docente activa el
   plano de salas; en planificador/ arma el calendario a partir
   del nivel, las semanas y los minutos semanales de cada ramo.
   ========================================================== */
(function () {
  "use strict";
  var M = window.MUSEO;
  if (!M) return;

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function salaDe(n) { return M.salas.filter(function (s) { return s.nivel === n; })[0]; }
  function nivelTxt(n) { return n + ".° básico"; }
  function minTxt(m) { return m >= 60 ? (m % 60 ? Math.floor(m / 60) + " h " + (m % 60) + " min" : (m / 60) + (m === 60 ? " hora" : " horas")) : m + " min"; }

  /* ---------------------------------------------------------- Plano del museo */
  function iniciarPlano() {
    var plano = $("[data-plano]");
    var panel = $("[data-sala-panel]");
    if (!plano || !panel) return;
    var salas = $$("[data-sala]", plano);

    function mostrar(n, foco) {
      var s = salaDe(n);
      if (!s) return;
      $$("[data-sala-btn]").forEach(function (b) { b.setAttribute("aria-pressed", +b.dataset.salaBtn === n ? "true" : "false"); });
      salas.forEach(function (g) {
        var activa = +g.dataset.sala === n;
        g.classList.toggle("activa", activa);
        g.setAttribute("aria-pressed", activa ? "true" : "false");
      });
      panel.innerHTML =
        '<p class="sala-num">' + esc(s.num) + " · " + esc(nivelTxt(s.nivel)) + "</p>" +
        "<h3>" + esc(s.sala) + "</h3>" +
        '<p class="sala-periodo">' + esc(s.periodo) + "</p>" +
        '<p class="sala-pregunta">' + esc(s.pregunta) + "</p>" +
        '<dl class="sala-datos">' +
          "<div><dt>Qué construyen</dt><dd>" + esc(s.hacen) + "</dd></div>" +
          "<div><dt>En la inauguración</dt><dd>" + esc(s.inaug) + "</dd></div>" +
          "<div><dt>Equipos</dt><dd>" + esc(s.equipos) + "</dd></div>" +
          "<div><dt>Su papel en el museo</dt><dd>" + esc(s.rol) + "</dd></div>" +
          '<div><dt>Objetivos de aprendizaje</dt><dd class="sala-oa">' + esc(s.oa) + "</dd></div>" +
        "</dl>" +
        '<p><a class="boton" href="planificador/#n=' + s.nivel + '">Planificar ' + esc(nivelTxt(s.nivel)) + " →</a></p>";
      if (foco) panel.focus({ preventScroll: true });
      try { sessionStorage.setItem("nmmme-sala", n); } catch (e) {}
    }
    salas.forEach(function (g) {
      var n = +g.dataset.sala;
      g.addEventListener("click", function () { mostrar(n, false); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); mostrar(n, true); }
      });
    });
    $$("[data-sala-btn]").forEach(function (b) {
      b.addEventListener("click", function () { mostrar(+b.dataset.salaBtn, false); });
    });
    var inicial = 5;
    try { inicial = +sessionStorage.getItem("nmmme-sala") || 5; } catch (e) {}
    mostrar(inicial, false);
  }

  /* ---------------------------------------------------------- Calendario */
  /* Ventanas de cada fase según el total de semanas */
  function ventanas(N) {
    var b1 = Math.max(1, Math.round(N * 0.25));
    var a2 = b1 + 1, b2 = Math.max(a2, Math.round(N * 0.45));
    var a3 = Math.min(b2 + 1, N - 1), b3 = Math.max(a3, N - 1);
    return { 1: [1, b1], 2: [a2, b2], 3: [a3, b3], 4: [N, N] };
  }

  /* Reparte las sesiones: cada sesión ocupa bloques de 45 min; una de 90 en un ramo con 45 semanales se divide en dos semanas */
  function planificar(nivel, N, minutos) {
    var ses = (M.niveles[String(nivel)] || []).map(function (s, i) { return Object.assign({ i: i }, s); });
    var V = ventanas(N);
    var cap = {}, usado = {}, puntero = {};
    Object.keys(minutos).forEach(function (r) { cap[r] = Math.floor((minutos[r] || 0) / 45); });
    var avisos = [], colocadas = [];

    ses.forEach(function (s) {
      var r = s.r, movida = false;
      if (!cap[r]) {
        if (s.alt && cap[s.alt]) { r = s.alt; movida = true; }
        else { colocadas.push({ s: s, r: s.r, partes: [], sinRamo: true }); return; }
      }
      usado[r] = usado[r] || {};
      puntero[r] = puntero[r] || 1;
      var k = s.min / 45, partes = [];
      var w = Math.max(puntero[r], V[s.f][0]);
      for (var j = 0; j < k; j++) {
        while (w <= N && (usado[r][w] || 0) >= cap[r]) w++;
        if (w > N) { partes.push(null); continue; }
        usado[r][w] = (usado[r][w] || 0) + 1;
        partes.push(w);
      }
      var ult = partes.filter(Boolean).pop();
      if (ult) puntero[r] = ult;
      colocadas.push({ s: s, r: r, movida: movida, partes: partes,
        tarde: partes.some(function (p) { return p && p > V[s.f][1]; }),
        noCabe: partes.some(function (p) { return p === null; }) });
    });

    var ramos = [];
    colocadas.forEach(function (c) { if (ramos.indexOf(c.r) < 0 && c.partes.length) ramos.push(c.r); });
    var orden = ["his", "len", "mat", "cie", "art", "tec", "mus", "efi"];
    ramos.sort(function (a, b) { return orden.indexOf(a) - orden.indexOf(b); });

    var sinRamo = colocadas.filter(function (c) { return c.sinRamo; });
    var noCabe = colocadas.filter(function (c) { return c.noCabe; });
    var tarde = colocadas.filter(function (c) { return c.tarde && !c.noCabe; });
    var movidas = colocadas.filter(function (c) { return c.movida; });
    sinRamo.forEach(function (c) {
      avisos.push({ tipo: "aviso", txt: "<b>" + esc(M.corto[c.s.r]) + "</b> no tiene minutos y la clase «" + esc(c.s.t) + "» no tiene otro ramo que la reciba. Dale al menos 45 minutos semanales a " + esc(M.corto[c.s.r]) + "." });
    });
    porRamo(noCabe).forEach(function (g) {
      avisos.push({ tipo: "aviso", txt: "<b>" + esc(M.corto[g.r]) + "</b>: " + g.items.length + (g.items.length === 1 ? " clase no cabe" : " clases no caben") + " en " + N + " semanas. Sube sus minutos semanales o agrega semanas." });
    });
    porRamo(tarde).forEach(function (g) {
      avisos.push({ tipo: "idea", txt: "<b>" + esc(M.corto[g.r]) + "</b>: " + g.items.map(function (c) { return "«" + esc(c.s.t) + "»"; }).join(", ") + (g.items.length === 1 ? " queda" : " quedan") + " después de su fase. Funciona, pero conviene sumar minutos a " + esc(M.corto[g.r]) + " para que llegue a tiempo." });
    });
    movidas.forEach(function (c) {
      avisos.push({ tipo: "idea", txt: "«" + esc(c.s.t) + "» pasa de " + esc(M.corto[c.s.r]) + " a <b>" + esc(M.corto[c.r]) + "</b>, porque " + esc(M.corto[c.s.r]) + " no participa." });
    });
    var holgura = [];
    ramos.forEach(function (r) {
      var total = cap[r] * N, uso = 0;
      Object.keys(usado[r] || {}).forEach(function (w) { uso += usado[r][w]; });
      if (total - uso >= 2) holgura.push(M.corto[r] + " (" + minTxt((total - uso) * 45) + ")");
    });
    return { V: V, N: N, ramos: ramos, colocadas: colocadas, avisos: avisos, holgura: holgura,
      ok: !sinRamo.length && !noCabe.length };
  }
  function porRamo(lista) {
    var g = {};
    lista.forEach(function (c) { (g[c.r] = g[c.r] || []).push(c); });
    return Object.keys(g).map(function (r) { return { r: r, items: g[r] }; });
  }

  /* ---------------------------------------------------------- Planificador */
  var OPCIONES = [0, 45, 90, 135, 180];
  var estado = null;

  function leerHash() {
    var h = {};
    location.hash.replace(/^#/, "").split("&").forEach(function (p) {
      var kv = p.split("=");
      if (kv[0]) h[kv[0]] = decodeURIComponent(kv[1] || "");
    });
    return h;
  }
  function escribirHash() {
    var p = ["n=" + estado.n, "s=" + estado.N];
    Object.keys(estado.min).forEach(function (r) { p.push(r + "=" + estado.min[r]); });
    history.replaceState(null, "", "#" + p.join("&"));
  }
  function minutosPorDefecto(n) {
    var s = salaDe(n), m = {};
    Object.keys(s.ramos).forEach(function (r) { m[r] = s.ramos[r]; });
    return m;
  }

  function iniciarPlanificador() {
    var raiz = $("[data-planificador]");
    if (!raiz) return;
    var h = leerHash();
    var n = +h.n >= 1 && +h.n <= 8 ? +h.n : 5;
    estado = { n: n, N: [4, 5, 6, 7, 8].indexOf(+h.s) >= 0 ? +h.s : 6, min: minutosPorDefecto(n) };
    Object.keys(estado.min).forEach(function (r) {
      if (h[r] !== undefined && OPCIONES.indexOf(+h[r]) >= 0) estado.min[r] = +h[r];
    });

    /* Niveles */
    var niveles = $("[data-niveles]", raiz);
    niveles.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8].map(function (k) {
      var s = salaDe(k);
      return '<button type="button" class="nivel" data-nivel="' + k + '"><b>' + k + '.°</b><span>' + esc(s.sala) + "</span></button>";
    }).join("");
    $$("[data-nivel]", niveles).forEach(function (b) {
      b.addEventListener("click", function () {
        estado.n = +b.dataset.nivel;
        estado.min = minutosPorDefecto(estado.n);
        pintar(true);
      });
    });
    /* Semanas */
    var semanas = $("[data-semanas]", raiz);
    semanas.innerHTML = [4, 5, 6, 7, 8].map(function (k) {
      return '<button type="button" data-n="' + k + '">' + k + "</button>";
    }).join("");
    $$("button", semanas).forEach(function (b) {
      b.addEventListener("click", function () { estado.N = +b.dataset.n; pintar(false); });
    });
    pintar(false);
    window.addEventListener("hashchange", function () {
      var h2 = leerHash();
      if (+h2.n && +h2.n !== estado.n) { estado.n = +h2.n; estado.min = minutosPorDefecto(estado.n); pintar(false); }
    });
  }

  function pintarMinutos() {
    var caja = $("[data-minutos]");
    caja.innerHTML = Object.keys(estado.min).map(function (r) {
      return '<div class="ramo-min" role="group" aria-label="Minutos semanales de ' + esc(M.ramos[r]) + '">' +
        '<span class="ramo-nombre">' + esc(M.corto[r]) + "</span>" +
        '<span class="segmentos">' + OPCIONES.map(function (o) {
          return '<button type="button" data-r="' + r + '" data-m="' + o + '" aria-pressed="' + (estado.min[r] === o) + '">' + (o ? o : "No") + "</button>";
        }).join("") + "</span></div>";
    }).join("");
    $$("button", caja).forEach(function (b) {
      b.addEventListener("click", function () { estado.min[b.dataset.r] = +b.dataset.m; pintar(false); });
    });
  }

  function pintar(saltar) {
    escribirHash();
    var s = salaDe(estado.n);
    $$("[data-nivel]").forEach(function (b) { b.setAttribute("aria-pressed", +b.dataset.nivel === estado.n); });
    $$("[data-semanas] button").forEach(function (b) { b.setAttribute("aria-pressed", +b.dataset.n === estado.N); });
    pintarMinutos();
    var P = planificar(estado.n, estado.N, estado.min);
    estado.P = P;

    var total = P.colocadas.filter(function (c) { return c.partes.length; }).length;
    var resumen = $("[data-resumen]");
    resumen.innerHTML =
      '<p class="resumen-sala">' + esc(s.num) + " · <b>" + esc(s.sala) + "</b> · " + esc(nivelTxt(s.nivel)) + "</p>" +
      '<p class="resumen-frase">' + (P.ok
        ? "Las " + total + " clases caben en " + estado.N + " semanas. El museo se inaugura en la semana " + estado.N + "."
        : "Con este horario no cabe todo. Revisa los avisos.") + "</p>" +
      P.avisos.map(function (a) { return '<p class="nota ' + a.tipo + '">' + a.txt + "</p>"; }).join("") +
      (P.holgura.length ? '<p class="resumen-holgura">Del tiempo que asignaste queda libre: ' + esc(P.holgura.join(", ")) + ". Úsalo en clases regulares o para recuperar atrasos.</p>" : "");

    pintarCalendario(P);
    pintarImpresion();
    if (saltar) $("[data-resumen]").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function etiquetaParte(c, j) {
    var k = c.partes.length;
    return k > 1 && c.partes[0] !== c.partes[k - 1] ? " · " + (j + 1) + "/" + k : "";
  }

  function pintarCalendario(P) {
    var N = P.N, V = P.V;
    /* Celdas: ramo × semana */
    var celdas = {};
    P.colocadas.forEach(function (c) {
      var vistos = {};
      c.partes.forEach(function (w, j) {
        if (!w || vistos[w]) return;
        vistos[w] = 1;
        var mins = c.partes.filter(function (x) { return x === w; }).length * 45;
        (celdas[c.r + w] = celdas[c.r + w] || []).push({ c: c, j: j, mins: mins });
      });
    });
    function boton(x) {
      var c = x.c;
      return '<button type="button" class="clase-chip' + (c.tarde ? " tarde" : "") + (c.movida ? " movida" : "") + '" data-ses="' + c.s.i + '">' +
        "<span>" + esc(c.s.t) + "</span><small>" + x.mins + " min" + etiquetaParte(c, x.j) + "</small></button>";
    }
    var fasesFila = "";
    [1, 2, 3, 4].forEach(function (f) {
      var a = V[f][0], b = V[f][1], span = b - a + 1;
      if (span > 0) fasesFila += '<th colspan="' + span + '" class="fase f' + f + '">' + esc(M.fases[f - 1]) + "</th>";
    });
    var cab = "";
    for (var w = 1; w <= N; w++) cab += '<th scope="col">Semana ' + w + (w === N ? '<small>Inauguración</small>' : "") + "</th>";
    var filas = P.ramos.map(function (r) {
      var tds = "";
      for (var w2 = 1; w2 <= N; w2++) tds += "<td" + (w2 === N ? ' class="ultima"' : "") + ">" + (celdas[r + w2] || []).map(boton).join("") + "</td>";
      return '<tr><th scope="row">' + esc(M.corto[r]) + "<small>" + minTxt(estado.min[r] || 0) + " por semana</small></th>" + tds + "</tr>";
    }).join("");
    $("[data-calendario]").innerHTML =
      '<div class="calendario-tabla"><table><thead><tr><td></td>' + fasesFila + '</tr><tr><td></td>' + cab + "</tr></thead><tbody>" + filas + "</tbody></table></div>";

    /* Vista por semana (pantallas angostas) */
    var porSemana = "";
    for (var w3 = 1; w3 <= N; w3++) {
      var fase = [1, 2, 3, 4].filter(function (f) { return w3 >= V[f][0] && w3 <= V[f][1]; })[0];
      var items = P.ramos.map(function (r) {
        return (celdas[r + w3] || []).map(function (x) {
          return '<li><span class="ramo-mini">' + esc(M.corto[r]) + "</span>" + boton(x) + "</li>";
        }).join("");
      }).join("");
      porSemana += '<section class="semana"><h3>Semana ' + w3 + " <small>" + esc(M.fases[fase - 1]) + "</small></h3>" +
        (items ? '<ul class="semana-clases">' + items + "</ul>" : '<p class="vacia">Sin clases del proyecto.</p>') + "</section>";
    }
    $("[data-por-semana]").innerHTML = porSemana;

    $$("[data-ses]").forEach(function (b) {
      b.addEventListener("click", function () { abrirClase(+b.dataset.ses); });
    });
  }

  /* ---------------------------------------------------------- Detalle de una clase */
  function htmlClase(c, conTitulo) {
    var s = c.s, P = estado.P;
    var semanas = c.partes.filter(Boolean);
    var semTxt = semanas.length ? (semanas[0] === semanas[semanas.length - 1] ? "Semana " + semanas[0] : "Semanas " + semanas[0] + " y " + semanas[semanas.length - 1]) : "Sin semana";
    var dividir = c.partes.length > 1 && semanas[0] !== semanas[semanas.length - 1]
      ? '<p class="nota idea"><span class="titulo-nota">Clase en dos partes</span>Este ramo tiene 45 minutos semanales: haz el inicio y la primera mitad del desarrollo en la semana ' + semanas[0] + ", y el resto con el cierre en la semana " + semanas[semanas.length - 1] + ".</p>" : "";
    function momento(nombre, m) {
      return '<div class="momento"><p class="momento-cab"><b>' + nombre + "</b><span>" + m[0] + " min</span></p><ol>" +
        m[1].map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ol></div>";
    }
    return (conTitulo ? "<h3>" + esc(s.t) + "</h3>" : "") +
      '<dl class="plan-datos">' +
        "<div><dt>Ramo</dt><dd>" + esc(M.ramos[c.r]) + (c.movida ? " (en lugar de " + esc(M.corto[s.r]) + ")" : "") + "</dd></div>" +
        "<div><dt>Cuándo</dt><dd>" + semTxt + " · " + esc(M.fases[s.f - 1]) + " · " + s.min + " min</dd></div>" +
        '<div class="ancho"><dt>Objetivos de aprendizaje</dt><dd>' + esc(s.oa) + "</dd></div>" +
        '<div class="ancho objetivo"><dt>Objetivo de la clase</dt><dd>' + esc(s.obj) + "</dd></div>" +
      "</dl>" + dividir +
      (s.prep ? "<h4>Antes de la clase</h4><ul>" + s.prep.map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul>" : "") +
      '<div class="momentos">' + momento("Inicio", s.ini) + momento("Desarrollo", s.des) + momento("Cierre", s.cie) + "</div>" +
      "<h4>Recursos y materiales</h4><ul>" + (s.rec || []).map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul>" +
      "<h4>Evaluación</h4>" + (s.ev || "") +
      (s.nota ? '<div class="nota idea"><span class="titulo-nota">Para tener en cuenta</span>' + s.nota + "</div>" : "");
  }

  function abrirClase(i) {
    var dlg = $("[data-clase]");
    var c = estado.P.colocadas.filter(function (x) { return x.s.i === i; })[0];
    if (!c) return;
    var mismos = estado.P.colocadas.filter(function (x) { return x.r === c.r && x.partes.length; });
    var pos = mismos.indexOf(c);
    $("[data-clase-titulo]", dlg).textContent = c.s.t;
    $("[data-clase-sub]", dlg).textContent = M.corto[c.r] + " · clase " + (pos + 1) + " de " + mismos.length;
    $("[data-clase-cuerpo]", dlg).innerHTML = htmlClase(c, false);
    var ant = $("[data-clase-ant]", dlg), sig = $("[data-clase-sig]", dlg);
    ant.disabled = pos <= 0; sig.disabled = pos >= mismos.length - 1;
    ant.onclick = function () { abrirClase(mismos[pos - 1].s.i); };
    sig.onclick = function () { abrirClase(mismos[pos + 1].s.i); };
    if (!dlg.open) dlg.showModal();
    $("[data-clase-cuerpo]", dlg).scrollTop = 0;
  }

  /* ---------------------------------------------------------- Impresión por ramo */
  function pintarImpresion() {
    var sel = $("[data-imprimir-ramo]");
    if (!sel) return;
    var P = estado.P;
    sel.innerHTML = P.ramos.map(function (r) { return '<option value="' + r + '">' + esc(M.ramos[r]) + "</option>"; }).join("") +
      '<option value="todo">Todo el nivel (todos los ramos)</option>';
  }
  function imprimir() {
    var r = $("[data-imprimir-ramo]").value, P = estado.P, s = salaDe(estado.n);
    var ramos = r === "todo" ? P.ramos : [r];
    var html = ramos.map(function (rr) {
      var cl = P.colocadas.filter(function (c) { return c.r === rr && c.partes.length; });
      return '<section class="impreso-ramo">' +
        '<p class="carta">Planificación · Mundo Mágico Miniatura Escolar</p>' +
        "<h2>" + esc(M.ramos[rr]) + "</h2>" +
        '<p class="impreso-meta">' + esc(nivelTxt(estado.n)) + " · " + esc(s.num) + " «" + esc(s.sala) + "» · " + estado.N + " semanas · " + minTxt(estado.min[rr] || 0) + " semanales · " + cl.length + " clases</p>" +
        '<p class="impreso-meta">Pregunta guía del nivel: ' + esc(s.pregunta) + "</p>" +
        cl.map(function (c, k) {
          return '<article class="impreso-clase"><h3>Clase ' + (k + 1) + " · " + esc(c.s.t) + "</h3>" + htmlClase(c, false) + "</article>";
        }).join("") + "</section>";
    }).join("");
    $("[data-impreso]").innerHTML = html;
    document.documentElement.classList.add("imprimiendo");
    window.print();
  }
  window.addEventListener("afterprint", function () { document.documentElement.classList.remove("imprimiendo"); });

  document.addEventListener("DOMContentLoaded", function () {
    iniciarPlano();
    iniciarPlanificador();
    var b = $("[data-imprimir]");
    if (b) b.addEventListener("click", imprimir);
    var dlg = $("[data-clase]");
    if (dlg) {
      $("[data-clase-cerrar]", dlg).addEventListener("click", function () { dlg.close(); });
      dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    }
  });
  window.NMMME = { planificar: planificar, ventanas: ventanas };
})();
