/* ==========================================================
   Directorio de autores y comparador
   ----------------------------------------------------------
   Lo usan las guías de lectura infantil y juvenil. Los datos
   de cada guía están en su propio archivo datos.js:
     window.GUIA = { autores: [...], comparar: { criterios: [...], puntajes: {...} } }
   Cada autor: { nombre, tipo, genero, publico, frase, descripcion, obras: [], valor }
   ========================================================== */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function unicos(lista, campo) {
    var vistos = {};
    lista.forEach(function (a) { if (a[campo]) vistos[a[campo]] = 1; });
    return Object.keys(vistos).sort(function (x, y) {
      var nx = parseInt(x.replace(/\D/g, ""), 10), ny = parseInt(y.replace(/\D/g, ""), 10);
      if (!isNaN(nx) && !isNaN(ny)) return nx - ny;
      if (!isNaN(nx)) return 1;
      if (!isNaN(ny)) return -1;
      return x.localeCompare(y, "es");
    });
  }

  /* ---------- Directorio con filtros ---------- */
  function directorio(raiz, opciones) {
    var autores = opciones.autores, paso = opciones.visibles || 8, limite = paso;
    var filtros = opciones.filtros || [];
    var estado = {};

    raiz.innerHTML =
      '<div class="herramienta"><div class="campos">' +
        filtros.map(function (f, i) {
          var ops = unicos(autores, f.campo);
          return '<div class="campo"><label for="filtro-' + i + '">' + esc(f.rotulo) + '</label>' +
            '<select id="filtro-' + i + '" data-campo="' + f.campo + '"><option value="">' + esc(f.todos) + "</option>" +
            ops.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + "</option>"; }).join("") +
            "</select></div>";
        }).join("") +
      '</div><p class="resultado vacio" data-cuenta aria-live="polite" style="min-height:0;margin-top:14px;padding:10px 14px"></p></div>' +
      '<ul class="fichas" data-lista></ul>' +
      '<div class="botones"><button type="button" class="boton secundario" data-mas hidden>Mostrar más autores</button></div>';

    var lista = raiz.querySelector("[data-lista]"), cuenta = raiz.querySelector("[data-cuenta]"), mas = raiz.querySelector("[data-mas]");

    function filtrados() {
      return autores.filter(function (a) {
        return Object.keys(estado).every(function (c) { return !estado[c] || a[c] === estado[c]; });
      });
    }
    function pintar() {
      var fs = filtrados(), vis = fs.slice(0, limite);
      lista.innerHTML = vis.map(function (a) {
        var etiquetas = [a.tipo, a.genero, a.publico].filter(Boolean).map(function (t) { return '<li>' + esc(t) + "</li>"; }).join("");
        var obras = a.obras && a.obras.length ? '<p><b>Obras:</b> ' + esc(a.obras.join(", ")) + "</p>" : "";
        var detalle = a.descripcion || a.valor
          ? '<details class="mas"><summary>Más información</summary>' +
              (a.descripcion ? "<p>" + esc(a.descripcion) + "</p>" : "") +
              (a.valor ? "<p><b>Valor pedagógico:</b> " + esc(a.valor) + "</p>" : "") + "</details>"
          : "";
        return '<li class="ficha"><ul class="etiquetas">' + etiquetas + "</ul><h3>" + esc(a.nombre) + "</h3>" +
          (a.frase ? "<p>" + esc(a.frase) + "</p>" : "") + obras + detalle + "</li>";
      }).join("");
      if (!fs.length) {
        cuenta.textContent = "Ningún autor coincide con estos filtros. Prueba quitando alguno.";
      } else {
        cuenta.textContent = "Mostrando " + vis.length + " de " + fs.length + (fs.length === 1 ? " autor." : " autores.");
      }
      mas.hidden = vis.length >= fs.length;
    }
    raiz.querySelectorAll("select[data-campo]").forEach(function (s) {
      s.addEventListener("change", function () { estado[s.dataset.campo] = s.value; limite = paso; pintar(); });
    });
    mas.addEventListener("click", function () { limite = autores.length; pintar(); });
    pintar();
  }

  /* ---------- Comparador (radar de Chart.js) ---------- */
  function comparador(raiz, datos, maximo) {
    maximo = maximo || 3;
    var nombres = Object.keys(datos.puntajes);
    var elegidos = nombres.slice(0, 2).concat([""]).slice(0, maximo);
    var colores = ["var(--acento)", "var(--h2)", "var(--h3)"];
    var rellenos = ["rgb(var(--acento-rgb) / .18)", "rgb(var(--h2-rgb) / .18)", "rgb(var(--h3-rgb) / .18)"];
    var campos = "";
    for (var i = 0; i < maximo; i++) {
      campos += '<div class="campo"><label for="comparar-' + i + '">Autor ' + (i + 1) + "</label>" +
        '<select id="comparar-' + i + '" data-i="' + i + '"><option value="">Ninguno</option>' +
        nombres.map(function (n) { return '<option value="' + esc(n) + '">' + esc(n) + "</option>"; }).join("") + "</select></div>";
    }
    raiz.innerHTML = '<div class="herramienta"><div class="campos">' + campos + "</div></div>" +
      '<figure class="grafico"><div class="lienzo"><canvas aria-label="Comparación de autores en un gráfico de radar" role="img"></canvas></div>' +
      "<figcaption>Puntaje de 0 a 5 en cada criterio: " + esc(datos.criterios.join(", ")) + ".</figcaption></figure>";
    var selects = raiz.querySelectorAll("select[data-i]"), lienzo = raiz.querySelector("canvas"), grafico = null;
    selects.forEach(function (s, i) { s.value = elegidos[i] || ""; });

    function pintar() {
      if (!window.Chart) { lienzo.parentElement.innerHTML = '<p class="resultado vacio">No se pudo cargar el gráfico. Revisa tu conexión y recarga la página.</p>'; return; }
      var conjuntos = [];
      elegidos.forEach(function (n, i) {
        if (!n) return;
        conjuntos.push({ label: n, data: datos.puntajes[n], borderColor: colores[i], pointBackgroundColor: colores[i], backgroundColor: rellenos[i], borderWidth: 2 });
      });
      if (grafico) grafico.destroy();
      grafico = new window.Chart(lienzo, {
        type: "radar",
        data: { labels: datos.criterios, datasets: conjuntos },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { r: { suggestedMin: 0, suggestedMax: 5, ticks: { stepSize: 1, backdropColor: "rgb(var(--superficie-rgb) / .8)" }, pointLabels: { font: { size: 12 } } } },
          plugins: { legend: { position: "top" } }
        }
      });
    }
    selects.forEach(function (s) {
      s.addEventListener("change", function () { elegidos[+s.dataset.i] = s.value; pintar(); });
    });
    pintar();
  }

  function iniciar() {
    if (!window.GUIA) return;
    var d = document.querySelector("[data-directorio]");
    if (d) directorio(d, { autores: window.GUIA.autores, filtros: window.GUIA.filtros, visibles: window.GUIA.visibles });
    var c = document.querySelector("[data-comparador]");
    if (c && window.GUIA.comparar) comparador(c, window.GUIA.comparar);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
