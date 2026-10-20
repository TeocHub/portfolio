/* Calculadora editorial: cada capítulo empieza en una cara nueva; cada hoja tiene dos caras. */
(function () {
  "use strict";
  var caps = [];
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return n.toLocaleString("es-CL"); };

  function pintar() {
    var lista = $("capitulos");
    lista.innerHTML = caps.map(function (w, i) {
      return '<li><span><b>Capítulo ' + (i + 1) + ":</b> " + fmt(w) + ' palabras</span><button type="button" class="boton chico secundario" data-quitar="' + i + '" aria-label="Quitar el capítulo ' + (i + 1) + '">Quitar</button></li>';
    }).join("");
    $("sin-capitulos").hidden = caps.length > 0;
    var dens = parseInt($("densidad").value, 10), extras = Math.max(0, parseInt($("extras").value, 10) || 0);
    var contenido = 0, total = 0;
    caps.forEach(function (w) { total += w; contenido += Math.ceil(w / dens); });
    var paginas = contenido + extras;
    $("paginas").textContent = fmt(paginas);
    $("hojas").textContent = fmt(Math.ceil(paginas / 2));
    $("total-palabras").textContent = fmt(total);
  }

  $("form-capitulo").addEventListener("submit", function (e) {
    e.preventDefault();
    var c = $("palabras"), v = parseInt(c.value, 10);
    if (!(v > 0)) { c.setAttribute("aria-invalid", "true"); c.focus(); return; }
    c.setAttribute("aria-invalid", "false");
    caps.push(v);
    c.value = "";
    c.focus();
    pintar();
  });
  $("capitulos").addEventListener("click", function (e) {
    var b = e.target.closest("[data-quitar]");
    if (b) { caps.splice(+b.dataset.quitar, 1); pintar(); }
  });
  $("borrar-todo").addEventListener("click", function () { caps = []; pintar(); });
  $("densidad").addEventListener("change", pintar);
  $("extras").addEventListener("input", pintar);
  pintar();
})();
