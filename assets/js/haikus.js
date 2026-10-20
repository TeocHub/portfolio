/* ==========================================================
   Generador de haikus (compartido)
   ----------------------------------------------------------
   Lo usan: Práctica › Generador de haikus escolares,
            Práctica › Haikus del 7.º del Pablo Neruda,
            Tesis › Generador de líneas aleatorias.
   Cada página llama a HAIKUS.iniciar({...}) con su fuente:
     fuente: { tipo: "sheets", clave, hoja, rango }  (columnas: colegio, curso, nombre, sílabas, verso, fecha)
     fuente: { tipo: "csv", archivo }                 (columnas: nombre, sílabas, verso)
   ========================================================== */
(function () {
  "use strict";

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function anio(fecha) {
    if (!fecha) return "";
    var m = String(fecha).match(/\b(20\d{2})\b/);
    return m ? m[1] : String(fecha);
  }

  function cargar(fuente) {
    if (fuente.tipo === "csv") {
      return fetch(fuente.archivo).then(function (r) {
        if (!r.ok) throw new Error("No se encontró el archivo de versos.");
        return r.text();
      }).then(function (t) {
        return t.split(/\r?\n/).slice(1).filter(function (l) { return l.trim(); }).map(function (l) {
          var v = l.split(",");
          return { nombre: (v[0] || "").trim(), silabas: parseInt(v[1], 10) || 0, verso: v.slice(2).join(",").trim() };
        }).filter(function (x) { return x.verso; });
      });
    }
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + fuente.hoja + "/values/" + encodeURIComponent(fuente.rango) + "?key=" + fuente.clave;
    return fetch(url).then(function (r) {
      if (r.status === 403) throw new Error("La planilla no permite el acceso. Revisa la clave de la API y los permisos.");
      if (r.status === 404) throw new Error("No se encontró la planilla.");
      if (!r.ok) throw new Error("No se pudo leer la planilla (error " + r.status + ").");
      return r.json();
    }).then(function (d) {
      return (d.values || []).slice(1).filter(function (f) { return f.length >= 5; }).map(function (f) {
        return { colegio: (f[0] || "").trim(), curso: (f[1] || "").trim(), nombre: (f[2] || "").trim(), silabas: parseInt(f[3], 10) || 0, verso: (f[4] || "").trim(), anio: anio(f[5]) };
      });
    });
  }

  function azar(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
  function armar(lineas, revolver) {
    var de5 = lineas.filter(function (l) { return l.silabas === 5; });
    var de7 = lineas.filter(function (l) { return l.silabas === 7; });
    if (de5.length < 2) return { error: "Faltan versos de 5 sílabas: hay " + de5.length + " y se necesitan 2." };
    if (!de7.length) return { error: "Falta un verso de 7 sílabas." };
    var a = azar(de5), c;
    do { c = azar(de5); } while (c === a);
    var b = azar(de7);
    var versos = [a, b, c];
    if (revolver) versos.sort(function () { return Math.random() - 0.5; });
    return { versos: versos };
  }

  function unicos(lista, campo, desc) {
    var v = {};
    lista.forEach(function (x) { if (x[campo]) v[x[campo]] = 1; });
    var r = Object.keys(v).sort(function (a, b) { return a.localeCompare(b, "es", { numeric: true }); });
    return desc ? r.reverse() : r;
  }

  function iniciar(op) {
    var raiz = document.querySelector(op.contenedor || "[data-haikus]");
    if (!raiz) return;
    var filtros = op.filtros || [];
    raiz.innerHTML =
      '<div class="herramienta">' +
        (filtros.length ? '<div class="campos">' + filtros.map(function (f, i) {
          return '<div class="campo"><label for="h-' + f.campo + '">' + esc(f.rotulo) + '</label><select id="h-' + f.campo + '" data-campo="' + f.campo + '"' + (i ? " disabled" : "") + '><option value="">Cargando…</option></select></div>';
        }).join("") + "</div>" : "") +
        '<div class="botones" style="margin-bottom:0"><button type="button" class="boton" data-generar>' + esc(op.boton || "Generar haiku") + "</button>" + (op.extra || "") + "</div>" +
        '<p class="resultado vacio" data-estado aria-live="polite" style="min-height:0;padding:10px 14px">Cargando versos…</p>' +
      "</div>" +
      '<figure class="haiku" data-haiku hidden aria-live="polite"><blockquote></blockquote><figcaption></figcaption></figure>';
    var estado = raiz.querySelector("[data-estado]"), salida = raiz.querySelector("[data-haiku]"), datos = [];
    var selects = filtros.map(function (f) { return raiz.querySelector('select[data-campo="' + f.campo + '"]'); });

    function decir(t, error) { estado.textContent = t; estado.classList.toggle("vacio", !error); estado.style.borderColor = error ? "var(--peligro)" : ""; }
    function filtrar(hasta) {
      return datos.filter(function (d) {
        return filtros.every(function (f, i) { return i >= hasta || !selects[i].value || d[f.campo] === selects[i].value; });
      });
    }
    function llenar(i) {
      var f = filtros[i], s = selects[i];
      if (i > 0 && !selects[i - 1].value) { s.innerHTML = '<option value="">Elige primero ' + esc(filtros[i - 1].rotulo.toLowerCase()) + "</option>"; s.disabled = true; return; }
      var ops = unicos(filtrar(i), f.campo, f.desc);
      s.innerHTML = '<option value="">Elige ' + esc(f.rotulo.toLowerCase()) + "</option>" + ops.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + "</option>"; }).join("");
      s.disabled = !ops.length;
    }
    selects.forEach(function (s, i) {
      s.addEventListener("change", function () { for (var j = i + 1; j < selects.length; j++) llenar(j); });
    });

    raiz.querySelector("[data-generar]").addEventListener("click", function () {
      if (!datos.length) { decir("Todavía no hay versos cargados.", true); return; }
      var falta = filtros.filter(function (f, i) { return !selects[i].value; });
      if (falta.length) { decir("Elige " + falta.map(function (f) { return f.rotulo.toLowerCase(); }).join(", ") + " para generar el haiku.", true); return; }
      var r = armar(filtrar(filtros.length), op.revolver);
      if (r.error) { decir(r.error, true); salida.hidden = true; return; }
      salida.querySelector("blockquote").innerHTML = r.versos.map(function (v) { return "<p>" + esc(v.verso) + "</p>"; }).join("");
      var autores = r.versos.map(function (v) { return v.nombre; }).filter(Boolean);
      var extra = filtros.length ? " · " + selects.map(function (s) { return s.value; }).join(" · ") : "";
      salida.querySelector("figcaption").textContent = (autores.length ? "Versos de " + autores.slice(0, -1).join(", ") + " y " + autores.slice(-1) : "") + extra;
      salida.hidden = false;
      decir("Haiku listo. Vuelve a tocar el botón para otra combinación.", false);
    });

    cargar(op.fuente).then(function (d) {
      datos = d;
      if (!d.length) { decir("No hay versos disponibles todavía.", true); return; }
      if (selects.length) llenar(0);
      decir(d.length + " versos cargados." + (filtros.length ? " Elige " + filtros.map(function (f) { return f.rotulo.toLowerCase(); }).join(", ") + "." : ""), false);
    }).catch(function (e) {
      selects.forEach(function (s) { s.innerHTML = '<option value="">Sin datos</option>'; s.disabled = true; });
      var msg = e instanceof TypeError ? "No se pudo conectar con la planilla de versos. Revisa tu conexión y recarga la página." : (e.message || "No se pudieron cargar los versos.");
      decir(msg, true);
    });
  }

  window.HAIKUS = { iniciar: iniciar, armar: armar };
})();
