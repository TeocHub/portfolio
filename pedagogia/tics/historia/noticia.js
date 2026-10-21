/* Reporteros de la democracia: ideas de problemas, resumen, vista previa y PDF.
   El avance por pasos lo maneja el recorrido común del portfolio (assets/js/site.js). */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var CAMPOS = [["Problema", "problema"], ["Escenario", "escenario"], ["Qué", "que"], ["Quién", "quien"], ["Cuándo", "cuando"], ["Dónde", "donde"], ["Por qué", "porque"], ["Cómo", "como"]];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function iniciar() {
    document.querySelectorAll("[data-ideas] button").forEach(function (b) {
      b.addEventListener("click", function () {
        $("problema").value = b.textContent.trim();
        $("problema").setAttribute("aria-invalid", "false");
        $("problema").focus();
      });
    });

    var rec = document.querySelector("[data-recorrido]");
    rec.addEventListener("tc:paso", function () {
      var p = $("problema").value.trim() || "(todavía no eliges un problema)";
      document.querySelectorAll('[data-ver="problema"]').forEach(function (el) { el.textContent = p; });
      document.querySelector("[data-resumen]").innerHTML = CAMPOS.map(function (c) {
        return '<div class="termino"><dt>' + c[0] + "</dt><dd>" + esc($(c[1]).value.trim() || "…") + "</dd></div>";
      }).join("");
    });

    document.querySelector("[data-vista]").addEventListener("click", function () {
      var t = $("titular").value.trim(), l = $("lead").value.trim();
      [$("titular"), $("lead")].forEach(function (c) { c.setAttribute("aria-invalid", c.value.trim() ? "false" : "true"); });
      if (!t || !l) return;
      document.querySelector("[data-vp-titular]").textContent = t;
      document.querySelector("[data-vp-lead]").textContent = l;
      document.querySelector("[data-vista-previa]").hidden = false;
    });

    document.querySelector("[data-pdf]").addEventListener("click", function () {
      var req = [$("titular"), $("lead"), $("reflexion")];
      var ok = true;
      req.forEach(function (c) { var v = !!c.value.trim(); c.setAttribute("aria-invalid", v ? "false" : "true"); if (!v) ok = false; });
      document.querySelector("[data-aviso-pdf]").hidden = ok;
      if (!ok) return;
      if (!window.jspdf) { alert("No se pudo cargar el generador de PDF. Revisa tu conexión y recarga la página."); return; }
      var doc = new window.jspdf.jsPDF();
      var v = function (id) { return $(id).value.trim(); };
      doc.setFontSize(20); doc.text("Reportero de la democracia: mi noticia", 20, 20);
      doc.setFontSize(16); doc.text("TITULAR:", 20, 40);
      doc.setFontSize(14); doc.text(doc.splitTextToSize(v("titular"), 170), 20, 50);
      doc.setFontSize(16); doc.text("PÁRRAFO PRINCIPAL:", 20, 72);
      doc.setFontSize(12); doc.text(doc.splitTextToSize(v("lead"), 170), 20, 82);
      doc.addPage();
      doc.setFontSize(16); doc.text("DETALLES DE LA INVESTIGACIÓN", 20, 20);
      doc.setFontSize(14); doc.text("Problema:", 20, 40);
      doc.setFontSize(12); doc.text(doc.splitTextToSize(v("problema"), 170), 20, 50);
      doc.setFontSize(14); doc.text("Escenario de solución:", 20, 70);
      doc.setFontSize(12); doc.text(doc.splitTextToSize(v("escenario"), 170), 20, 80);
      doc.setFontSize(14); doc.text("Las seis preguntas:", 20, 125);
      doc.setFontSize(12);
      var y = 135;
      CAMPOS.slice(2).forEach(function (c) { var lineas = doc.splitTextToSize(c[0].toUpperCase() + ": " + v(c[1]), 170); doc.text(lineas, 20, y); y += lineas.length * 7 + 3; });
      doc.addPage();
      doc.setFontSize(16); doc.text("Mi reflexión", 20, 20);
      doc.setFontSize(13); doc.text(doc.splitTextToSize("¿Por qué, si no hubiéramos incluido a los ciudadanos, nuestra noticia no sería una historia completa?", 170), 20, 36);
      doc.setFontSize(12); doc.text(doc.splitTextToSize(v("reflexion"), 170), 20, 56);
      doc.save("mi_noticia_democracia.pdf");
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
