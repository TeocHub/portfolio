/* ==========================================================
   Guía de Hojas de cálculo de Google
   ----------------------------------------------------------
   1. Motor de fórmulas en español (configuración de Chile:
      coma decimal y punto y coma entre argumentos)
   2. Hoja de pruebas (la mesa) y sus ejemplos
   3. Mapa en celdas y buscador de la guía
   4. Anatomía de la pantalla
   5. Calculadora de logaritmos
   ========================================================== */
(function () {
  "use strict";

  /* ======================= 1. Motor ======================= */
  var COLS = "ABCDEF", FILAS = 8;

  function Err(c, m) { this.c = c; this.m = m; }
  function Fecha(n) { this.n = n; }
  var E = {
    div: function () { return new Err("#¡DIV/0!", "Se intentó dividir por cero o por una celda vacía."); },
    valor: function (m) { return new Err("#¡VALOR!", m || "Una operación recibió un dato del tipo equivocado, como texto en lugar de un número."); },
    ref: function (m) { return new Err("#¡REF!", m || "La fórmula apunta a una celda que no existe."); },
    na: function (m) { return new Err("#N/A", m || "La búsqueda no encontró el valor."); },
    num: function (m) { return new Err("#¡NUM!", m || "El cálculo no tiene un resultado numérico."); },
    nombre: function (m) { return new Err("#¿NOMBRE?", m); },
    error: function (m) { return new Err("#ERROR!", m || "No se pudo leer la fórmula. Revisa paréntesis, comillas y separadores."); }
  };
  var ORIGEN = Date.UTC(1899, 11, 30);
  function serial(y, m, d) { return Math.round((Date.UTC(y, m - 1, d) - ORIGEN) / 864e5); }
  function aFecha(n) { var d = new Date(ORIGEN + Math.floor(n) * 864e5); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), dow: d.getUTCDay() }; }
  function hoySerial() { var h = new Date(); return serial(h.getFullYear(), h.getMonth() + 1, h.getDate()); }

  function sinTildes(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  /* Lee lo que alguien escribió en una celda (que no es fórmula) */
  function leerLiteral(raw) {
    var s = String(raw).trim();
    if (s === "") return null;
    if (/^verdadero$/i.test(s)) return true;
    if (/^falso$/i.test(s)) return false;
    var f = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (f) return new Fecha(serial(+f[3], +f[2], +f[1]));
    var pct = /%$/.test(s);
    var n = s.replace(/%$/, "").trim();
    if (/^-?(\d{1,3}(\.\d{3})+|\d+)(,\d+)?$/.test(n)) {
      var v = parseFloat(n.replace(/\./g, "").replace(",", "."));
      return pct ? v / 100 : v;
    }
    return String(raw);
  }

  /* ---------- Lexer ---------- */
  function tokens(f) {
    var t = [], i = 0, m;
    while (i < f.length) {
      var r = f.slice(i), c = f[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === '"') {
        var j = i + 1, s = "";
        while (j < f.length) {
          if (f[j] === '"') { if (f[j + 1] === '"') { s += '"'; j += 2; continue; } break; }
          s += f[j++];
        }
        if (j >= f.length) throw E.error("Falta cerrar unas comillas.");
        t.push({ t: "str", v: s }); i = j + 1; continue;
      }
      if ((m = r.match(/^#(¡?REF!|¡?DIV\/0!|N\/A|¡?VALOR!|¿?NOMBRE\?|¡?NUM!)/i))) { t.push({ t: "errlit", v: m[0] }); i += m[0].length; continue; }
      if ((m = r.match(/^\d+(?:[.,]\d+)?/))) { t.push({ t: "num", v: parseFloat(m[0].replace(",", ".")) }); i += m[0].length; continue; }
      if ((m = r.match(/^([A-Za-zÁÉÍÓÚÑáéíóúñ_][A-Za-z0-9ÁÉÍÓÚÑáéíóúñ_.]*)\s*\(/))) { t.push({ t: "fn", v: sinTildes(m[1]).toUpperCase() }); i += m[0].length; continue; }
      if ((m = r.match(/^(\$?)([A-Za-z]{1,2})(\$?)(\d+)(?![A-Za-z0-9_])/))) {
        var a = { c: colNum(m[2]), r: +m[4] - 1 };
        i += m[0].length;
        var m2 = f.slice(i).match(/^:(\$?)([A-Za-z]{1,2})(\$?)(\d+)/);
        if (m2) { t.push({ t: "rango", a: a, b: { c: colNum(m2[2]), r: +m2[4] - 1 } }); i += m2[0].length; }
        else t.push({ t: "ref", a: a });
        continue;
      }
      if ((m = r.match(/^(VERDADERO|FALSO|TRUE|FALSE)(?![A-Za-z0-9_.(])/i))) { t.push({ t: "bool", v: /^(VERDADERO|TRUE)$/i.test(m[1]) }); i += m[0].length; continue; }
      if ((m = r.match(/^[A-Za-zÁÉÍÓÚÑáéíóúñ_][A-Za-z0-9ÁÉÍÓÚÑáéíóúñ_.]*/))) { t.push({ t: "nombre", v: m[0] }); i += m[0].length; continue; }
      if ((m = r.match(/^(<=|>=|<>|[+\-*\/^&=<>%])/))) { t.push({ t: "op", v: m[1] }); i += m[1].length; continue; }
      if (c === "(" || c === ")" || c === ";") { t.push({ t: c }); i++; continue; }
      if (c === ",") throw E.error("Hay una coma donde va punto y coma. En Chile los argumentos se separan con ; porque la coma es el decimal.");
      if (c === "{" || c === "}") throw E.nombre("La hoja de pruebas no lee llaves { }. En Google Sheets sí funcionan.");
      throw E.error("No se entiende el signo «" + c + "».");
    }
    return t;
  }
  function colNum(l) { l = l.toUpperCase(); var n = 0; for (var i = 0; i < l.length; i++) n = n * 26 + (l.charCodeAt(i) - 64); return n - 1; }

  /* ---------- Parser (precedencia) ---------- */
  var PREC = { "=": 1, "<>": 1, "<": 1, ">": 1, "<=": 1, ">=": 1, "&": 2, "+": 3, "-": 3, "*": 4, "/": 4, "^": 5 };
  function parsear(f) {
    var t = tokens(f), p = 0;
    function ver() { return t[p]; }
    function expr(min) {
      var izq = unario();
      for (;;) {
        var k = ver();
        if (!k || k.t !== "op" || !(k.v in PREC) || PREC[k.v] < min) return izq;
        p++;
        var der = expr(PREC[k.v] + 1);   /* todo de izquierda a derecha, también ^ (como en Google) */
        izq = { k: "bin", op: k.v, a: izq, b: der };
      }
    }
    function unario() {
      var k = ver();
      if (k && k.t === "op" && (k.v === "-" || k.v === "+")) { p++; var a = unario(); return k.v === "-" ? { k: "neg", a: a } : a; }
      var n = primario();
      while (ver() && ver().t === "op" && ver().v === "%") { p++; n = { k: "pct", a: n }; }
      return n;
    }
    function primario() {
      var k = t[p++];
      if (!k) throw E.error("La fórmula termina antes de tiempo.");
      if (k.t === "num") return { k: "val", v: k.v };
      if (k.t === "str") return { k: "val", v: k.v };
      if (k.t === "bool") return { k: "val", v: k.v };
      if (k.t === "errlit") return { k: "val", v: E.ref() };
      if (k.t === "ref") return { k: "ref", a: k.a };
      if (k.t === "rango") return { k: "rango", a: k.a, b: k.b };
      if (k.t === "nombre") return { k: "val", v: E.nombre("«" + k.v + "» no es una función ni una celda. Si es un texto, va entre comillas.") };
      if (k.t === "(") {
        var e = expr(1);
        if (!ver() || ver().t !== ")") throw E.error("Falta cerrar un paréntesis.");
        p++; return e;
      }
      if (k.t === "fn") {
        var args = [];
        if (ver() && ver().t === ")") { p++; return { k: "fn", n: k.v, args: args }; }
        for (;;) {
          if (ver() && (ver().t === ";" || ver().t === ")")) args.push({ k: "val", v: null });
          else args.push(expr(1));
          var s = t[p++];
          if (!s) throw E.error("Falta cerrar el paréntesis de " + k.v + ".");
          if (s.t === ")") break;
          if (s.t !== ";") throw E.error("Entre los argumentos de " + k.v + " va punto y coma.");
        }
        return { k: "fn", n: k.v, args: args };
      }
      throw E.error("Sobra o falta algo cerca de «" + (k.v || k.t) + "».");
    }
    var arbol = expr(1);
    if (p < t.length) throw E.error(t[p].t === ")" ? "Sobra un paréntesis de cierre." : "Sobra algo al final de la fórmula.");
    return arbol;
  }

  /* ---------- Conversión de tipos ---------- */
  function esErr(v) { return v instanceof Err; }
  function num(v) {
    if (esErr(v)) throw v;
    if (v === null || v === "") return 0;
    if (typeof v === "number") return v;
    if (typeof v === "boolean") return v ? 1 : 0;
    if (v instanceof Fecha) return v.n;
    var l = leerLiteral(v);
    if (typeof l === "number") return l;
    if (l instanceof Fecha) return l.n;
    throw E.valor("«" + v + "» es texto y no se puede usar como número.");
  }
  function texto(v) {
    if (esErr(v)) throw v;
    if (v === null) return "";
    if (typeof v === "boolean") return v ? "VERDADERO" : "FALSO";
    if (typeof v === "number") return formatoNumero(v);
    if (v instanceof Fecha) return formatoFecha(v.n);
    return String(v);
  }
  function bool(v) {
    if (esErr(v)) throw v;
    if (typeof v === "boolean") return v;
    if (v === null || v === "") return false;
    if (typeof v === "number") return v !== 0;
    if (v instanceof Fecha) return v.n !== 0;
    if (/^verdadero$/i.test(v)) return true;
    if (/^falso$/i.test(v)) return false;
    throw E.valor("«" + v + "» no es VERDADERO ni FALSO.");
  }
  function plano(v) {
    if (v && v.rango) { var o = []; v.rango.forEach(function (f) { o.push.apply(o, f); }); return o; }
    return [v];
  }
  /* Números de los argumentos: en rangos se ignora el texto; sueltos se convierten */
  function numeros(args) {
    var o = [];
    args.forEach(function (v) {
      if (v && v.rango) plano(v).forEach(function (x) {
        if (esErr(x)) throw x;
        if (typeof x === "number") o.push(x); else if (x instanceof Fecha) o.push(x.n);
      });
      else if (v !== null) o.push(num(v));
    });
    return o;
  }
  function escalar(v) { if (v && v.rango) return v.rango[0][0]; return v; }

  function comparar(a, b) {
    if (a === null) a = typeof b === "string" ? "" : 0;
    if (b === null) b = typeof a === "string" ? "" : 0;
    if (a instanceof Fecha) a = a.n; if (b instanceof Fecha) b = b.n;
    var ta = typeof a, tb = typeof b;
    if (ta === tb) {
      if (ta === "string") { a = sinTildes(a).toLowerCase(); b = sinTildes(b).toLowerCase(); }
      return a < b ? -1 : a > b ? 1 : 0;
    }
    var orden = { number: 0, string: 1, boolean: 2 };
    return orden[ta] - orden[tb];
  }

  /* Condiciones de CONTAR.SI y compañía: 4, ">=4", "7A", "<>Ausente", "A*" */
  function criterio(c) {
    if (esErr(c)) throw c;
    if (typeof c === "number" || typeof c === "boolean") return function (v) { return comparar(v, c) === 0 && v !== null; };
    var m = String(c).match(/^(<=|>=|<>|<|>|=)?([\s\S]*)$/), op = m[1] || "=", rest = m[2];
    var n = leerLiteral(rest), esNum = typeof n === "number";
    var comodin = !esNum && /[*?]/.test(rest);
    var re = comodin ? new RegExp("^" + sinTildes(rest).replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$", "i") : null;
    return function (v) {
      if (esErr(v)) return false;
      if (re) { var ok = typeof v === "string" && re.test(sinTildes(v)); return op === "<>" ? !ok : ok; }
      if (esNum) {
        if (v instanceof Fecha) v = v.n;
        if (typeof v !== "number") return op === "<>";
      } else if (rest === "" && op === "=") return v === null || v === "";
      var k = comparar(v, esNum ? n : rest);
      if (!esNum && typeof v !== "string") k = op === "<>" ? 1 : NaN;
      switch (op) {
        case "=": return k === 0; case "<>": return k !== 0;
        case "<": return k < 0; case ">": return k > 0;
        case "<=": return k <= 0; case ">=": return k >= 0;
      }
    };
  }

  function redondear(n, d, modo) {
    var f = Math.pow(10, d), s = n < 0 ? -1 : 1, a = Math.abs(n) * f;
    a = parseFloat(a.toPrecision(14));
    var r = modo === "mas" ? Math.ceil(a) : modo === "menos" ? Math.floor(a) : Math.round(a);
    return s * r / f;
  }

  /* ---------- Funciones ---------- */
  var ALIAS = {
    SUM: "SUMA", AVERAGE: "PROMEDIO", COUNT: "CONTAR", COUNTA: "CONTARA", COUNTBLANK: "CONTAR.BLANCO", ROUND: "REDONDEAR",
    ROUNDUP: "REDONDEAR.MAS", ROUNDDOWN: "REDONDEAR.MENOS", INT: "ENTERO", MOD: "RESIDUO", SQRT: "RAIZ", POWER: "POTENCIA",
    RAND: "ALEATORIO", RANDBETWEEN: "ALEATORIO.ENTRE", MROUND: "REDOND.MULT", MEDIAN: "MEDIANA", MODE: "MODA", STDEV: "DESVEST",
    COUNTIF: "CONTAR.SI", SUMIF: "SUMAR.SI", AVERAGEIF: "PROMEDIO.SI", COUNTIFS: "CONTAR.SI.CONJUNTO", SUMIFS: "SUMAR.SI.CONJUNTO",
    IF: "SI", AND: "Y", OR: "O", NOT: "NO", IFERROR: "SI.ERROR", IFS: "SI.CONJUNTO", VLOOKUP: "BUSCARV", XLOOKUP: "BUSCARX",
    CONCATENATE: "CONCATENAR", UPPER: "MAYUSC", LOWER: "MINUSC", PROPER: "NOMPROPIO", LEN: "LARGO", TRIM: "ESPACIOS",
    LEFT: "IZQUIERDA", RIGHT: "DERECHA", TODAY: "HOY", NOW: "AHORA", WEEKDAY: "DIASEM", DAYS: "DIAS", DATE: "FECHA",
    TRUE: "VERDADERO", FALSE: "FALSO", ENTERO: "ENTERO", "SI.ERROR": "SI.ERROR"
  };
  var SOLO_GOOGLE = ["FILTER", "SORT", "UNIQUE", "QUERY", "IMPORTRANGE", "ARRAYFORMULA", "SPARKLINE", "GOOGLETRANSLATE", "IMAGEN", "IMAGE", "IMPORTHTML", "GOOGLEFINANCE"];

  function n1(f) { return function (a) { return f(num(escalar(a[0]))); }; }
  var F = {
    "SUMA": function (a) { return numeros(a).reduce(function (s, x) { return s + x; }, 0); },
    "PROMEDIO": function (a) { var v = numeros(a); if (!v.length) throw E.div(); return v.reduce(function (s, x) { return s + x; }, 0) / v.length; },
    "MIN": function (a) { var v = numeros(a); return v.length ? Math.min.apply(null, v) : 0; },
    "MAX": function (a) { var v = numeros(a); return v.length ? Math.max.apply(null, v) : 0; },
    "CONTAR": function (a) { var c = 0; a.forEach(function (v) { plano(v).forEach(function (x) { if (typeof x === "number" || x instanceof Fecha) c++; }); }); return c; },
    "CONTARA": function (a) { var c = 0; a.forEach(function (v) { plano(v).forEach(function (x) { if (x !== null && x !== "") c++; }); }); return c; },
    "CONTAR.BLANCO": function (a) { var c = 0; plano(a[0]).forEach(function (x) { if (x === null || x === "") c++; }); return c; },
    "REDONDEAR": function (a) { return redondear(num(escalar(a[0])), a[1] === undefined ? 0 : num(escalar(a[1]))); },
    "REDONDEAR.MAS": function (a) { return redondear(num(escalar(a[0])), a[1] === undefined ? 0 : num(escalar(a[1])), "mas"); },
    "REDONDEAR.MENOS": function (a) { return redondear(num(escalar(a[0])), a[1] === undefined ? 0 : num(escalar(a[1])), "menos"); },
    "REDOND.MULT": function (a) { var n = num(escalar(a[0])), m = num(escalar(a[1])); if (m === 0) return 0; return Math.round(n / m) * m; },
    "ENTERO": n1(Math.floor),
    "ABS": n1(Math.abs),
    "RESIDUO": function (a) { var x = num(escalar(a[0])), y = num(escalar(a[1])); if (y === 0) throw E.div(); return x - y * Math.floor(x / y); },
    "RAIZ": n1(function (x) { if (x < 0) throw E.num("No existe la raíz cuadrada de un número negativo (en los números reales)."); return Math.sqrt(x); }),
    "POTENCIA": function (a) { var r = Math.pow(num(escalar(a[0])), num(escalar(a[1]))); if (!isFinite(r) || isNaN(r)) throw E.num(); return r; },
    "LOG": function (a) {
      var x = num(escalar(a[0])), b = a[1] === undefined || a[1] === null ? 10 : num(escalar(a[1]));
      if (x <= 0 || b <= 0) throw E.num("El logaritmo solo existe para números mayores que 0.");
      if (b === 1) throw E.div();
      return Math.log(x) / Math.log(b);
    },
    "LOG10": n1(function (x) { if (x <= 0) throw E.num("El logaritmo solo existe para números mayores que 0."); return Math.log10(x); }),
    "LN": n1(function (x) { if (x <= 0) throw E.num("El logaritmo solo existe para números mayores que 0."); return Math.log(x); }),
    "EXP": n1(Math.exp),
    "PI": function () { return Math.PI; },
    "ALEATORIO": function () { return Math.random(); },
    "ALEATORIO.ENTRE": function (a) { var lo = Math.ceil(num(escalar(a[0]))), hi = Math.floor(num(escalar(a[1]))); if (hi < lo) throw E.num(); return lo + Math.floor(Math.random() * (hi - lo + 1)); },
    "MEDIANA": function (a) {
      var v = numeros(a).sort(function (x, y) { return x - y; });
      if (!v.length) throw E.num(); var m = Math.floor(v.length / 2);
      return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
    },
    "MODA": function (a) {
      var v = numeros(a), c = {}, mejor = null, max = 1;
      v.forEach(function (x) { c[x] = (c[x] || 0) + 1; if (c[x] > max) { max = c[x]; mejor = x; } });
      if (mejor === null) throw E.na("Ningún valor se repite, así que no hay moda.");
      return mejor;
    },
    "DESVEST": function (a) {
      var v = numeros(a); if (v.length < 2) throw E.div();
      var p = v.reduce(function (s, x) { return s + x; }, 0) / v.length;
      return Math.sqrt(v.reduce(function (s, x) { return s + (x - p) * (x - p); }, 0) / (v.length - 1));
    },
    "CONTAR.SI": function (a) { var ok = criterio(escalar(a[1])); return plano(a[0]).filter(ok).length; },
    "SUMAR.SI": function (a) {
      var ok = criterio(escalar(a[1])), r = plano(a[0]), s = a[2] ? plano(a[2]) : r, t = 0;
      r.forEach(function (x, i) { if (ok(x) && typeof s[i] === "number") t += s[i]; }); return t;
    },
    "PROMEDIO.SI": function (a) {
      var ok = criterio(escalar(a[1])), r = plano(a[0]), s = a[2] ? plano(a[2]) : r, t = 0, c = 0;
      r.forEach(function (x, i) { if (ok(x) && typeof s[i] === "number") { t += s[i]; c++; } });
      if (!c) throw E.div(); return t / c;
    },
    "CONTAR.SI.CONJUNTO": function (a) {
      var base = plano(a[0]), c = 0;
      base.forEach(function (_, i) {
        for (var k = 0; k < a.length; k += 2) if (!criterio(escalar(a[k + 1]))(plano(a[k])[i])) return;
        c++;
      });
      return c;
    },
    "SUMAR.SI.CONJUNTO": function (a) {
      var s = plano(a[0]), t = 0;
      s.forEach(function (x, i) {
        for (var k = 1; k < a.length; k += 2) if (!criterio(escalar(a[k + 1]))(plano(a[k])[i])) return;
        if (typeof x === "number") t += x;
      });
      return t;
    },
    "Y": function (a) { var r = true; a.forEach(function (v) { plano(v).forEach(function (x) { if (!bool(x)) r = false; }); }); return r; },
    "O": function (a) { var r = false; a.forEach(function (v) { plano(v).forEach(function (x) { if (bool(x)) r = true; }); }); return r; },
    "NO": function (a) { return !bool(escalar(a[0])); },
    "VERDADERO": function () { return true; },
    "FALSO": function () { return false; },
    "BUSCARV": function (a) {
      var buscado = escalar(a[0]), t = a[1] && a[1].rango, col = num(escalar(a[2])), aprox = a[3] === undefined ? true : bool(escalar(a[3]));
      if (!t) throw E.valor("El segundo argumento de BUSCARV debe ser un rango.");
      if (col < 1 || col > t[0].length) throw E.ref("La tabla no tiene una columna " + col + ".");
      if (!aprox) {
        for (var i = 0; i < t.length; i++) if (comparar(t[i][0], buscado) === 0) return t[i][col - 1];
        throw E.na("BUSCARV no encontró «" + texto(buscado) + "» en la primera columna de la tabla.");
      }
      var fila = -1;
      for (var j = 0; j < t.length; j++) { if (comparar(t[j][0], buscado) <= 0) fila = j; else break; }
      if (fila < 0) throw E.na(); return t[fila][col - 1];
    },
    "BUSCARX": function (a) {
      var buscado = escalar(a[0]), r = plano(a[1]), d = plano(a[2]);
      for (var i = 0; i < r.length; i++) if (comparar(r[i], buscado) === 0) return d[i];
      if (a[3] !== undefined) return escalar(a[3]);
      throw E.na("BUSCARX no encontró «" + texto(buscado) + "».");
    },
    "CONCATENAR": function (a) { return a.map(function (v) { return plano(v).map(texto).join(""); }).join(""); },
    "MAYUSC": function (a) { return texto(escalar(a[0])).toUpperCase(); },
    "MINUSC": function (a) { return texto(escalar(a[0])).toLowerCase(); },
    "NOMPROPIO": function (a) { return texto(escalar(a[0])).toLowerCase().replace(/(^|[^a-záéíóúñü])([a-záéíóúñü])/g, function (m, p, l) { return p + l.toUpperCase(); }); },
    "LARGO": function (a) { return texto(escalar(a[0])).length; },
    "ESPACIOS": function (a) { return texto(escalar(a[0])).trim().replace(/\s+/g, " "); },
    "IZQUIERDA": function (a) { return texto(escalar(a[0])).slice(0, a[1] === undefined ? 1 : num(escalar(a[1]))); },
    "DERECHA": function (a) { var s = texto(escalar(a[0])), n = a[1] === undefined ? 1 : num(escalar(a[1])); return n ? s.slice(-n) : ""; },
    "HOY": function () { return new Fecha(hoySerial()); },
    "AHORA": function () { var h = new Date(); return new Fecha(hoySerial() + (h.getHours() * 3600 + h.getMinutes() * 60) / 86400); },
    "FECHA": function (a) { return new Fecha(serial(num(escalar(a[0])), num(escalar(a[1])), num(escalar(a[2])))); },
    "DIAS": function (a) { return Math.floor(num(escalar(a[0]))) - Math.floor(num(escalar(a[1]))); },
    "DIASEM": function (a) { var d = aFecha(num(escalar(a[0]))).dow, tipo = a[1] === undefined ? 1 : num(escalar(a[1])); return tipo === 2 ? (d + 6) % 7 + 1 : d + 1; },
    "DATEDIF": function (a) {
      var x = num(escalar(a[0])), y = num(escalar(a[1])), u = texto(escalar(a[2])).toUpperCase();
      if (y < x) throw E.num("La fecha final es anterior a la inicial.");
      if (u === "D") return Math.floor(y) - Math.floor(x);
      var A = aFecha(x), B = aFecha(y), meses = (B.y - A.y) * 12 + (B.m - A.m) - (B.d < A.d ? 1 : 0);
      if (u === "M") return meses;
      if (u === "Y") return Math.floor(meses / 12);
      throw E.num("La unidad de DATEDIF puede ser \"D\", \"M\" o \"Y\".");
    }
  };
  /* Funciones que deciden antes de calcular todo (como en Google) */
  var PEREZOSAS = {
    "SI": function (args, ev) {
      var c = bool(escalar(ev(args[0])));
      if (c) return args[1] ? ev(args[1]) : true;
      return args[2] ? ev(args[2]) : false;
    },
    "SI.ERROR": function (args, ev) {
      var v;
      try { v = escalar(ev(args[0])); } catch (e) { if (esErr(e)) v = e; else throw e; }
      return esErr(v) ? (args[1] ? ev(args[1]) : "") : v;
    },
    "SI.CONJUNTO": function (args, ev) {
      for (var i = 0; i + 1 < args.length; i += 2) if (bool(escalar(ev(args[i])))) return ev(args[i + 1]);
      throw E.na("Ninguna condición de SI.CONJUNTO se cumplió. Agrega VERDADERO como última condición para un «en otro caso».");
    }
  };

  /* ---------- Evaluación ---------- */
  function Hoja(celdas) { this.celdas = celdas; this.cache = {}; }
  Hoja.prototype.clave = function (c, r) { return COLS[c] + (r + 1); };
  Hoja.prototype.valor = function (ref, pila) {
    if (ref in this.cache) return this.cache[ref];
    pila = pila || {};
    if (pila[ref]) return E.ref("Referencia circular: la fórmula depende de sí misma.");
    pila[ref] = true;
    var raw = this.celdas[ref], v;
    if (raw === undefined || raw === "") v = null;
    else if (String(raw).charAt(0) !== "=") v = leerLiteral(raw);
    else {
      try {
        var arbol = parsear(String(raw).slice(1));
        v = escalar(this.ev(arbol, pila));
        if (v === null) v = 0;
        if (typeof v === "number" && !isFinite(v)) v = E.num();
      } catch (e) { if (esErr(e)) v = e; else { v = E.error(); } }
    }
    delete pila[ref];
    this.cache[ref] = v;
    return v;
  };
  Hoja.prototype.ev = function (n, pila) {
    var h = this;
    function ev(x) { return h.ev(x, pila); }
    function dentro(a) { return a.c >= 0 && a.c < COLS.length && a.r >= 0 && a.r < FILAS; }
    switch (n.k) {
      case "val": if (esErr(n.v)) throw n.v; return n.v;
      case "ref":
        if (!dentro(n.a)) throw E.ref("La hoja de pruebas solo llega hasta la columna F y la fila 8.");
        var v = h.valor(h.clave(n.a.c, n.a.r), pila); if (esErr(v)) throw v; return v;
      case "rango":
        if (!dentro(n.a) || !dentro(n.b)) throw E.ref("La hoja de pruebas solo llega hasta la columna F y la fila 8.");
        var r0 = Math.min(n.a.r, n.b.r), r1 = Math.max(n.a.r, n.b.r), c0 = Math.min(n.a.c, n.b.c), c1 = Math.max(n.a.c, n.b.c), filas = [];
        for (var r = r0; r <= r1; r++) { var f = []; for (var c = c0; c <= c1; c++) f.push(h.valor(h.clave(c, r), pila)); filas.push(f); }
        return { rango: filas };
      case "neg": return -num(escalar(ev(n.a)));
      case "pct": return num(escalar(ev(n.a))) / 100;
      case "bin":
        var a = escalar(ev(n.a)), b = escalar(ev(n.b));
        if (esErr(a)) throw a; if (esErr(b)) throw b;
        switch (n.op) {
          case "+": case "-":
            var x = num(a), y = num(b), res = n.op === "+" ? x + y : x - y;
            if (a instanceof Fecha && b instanceof Fecha && n.op === "-") return res;
            if (a instanceof Fecha || (b instanceof Fecha && n.op === "+")) return new Fecha(res);
            return res;
          case "*": return num(a) * num(b);
          case "/": var d = num(b); if (d === 0) throw E.div(); return num(a) / d;
          case "^": var p = Math.pow(num(a), num(b)); if (isNaN(p)) throw E.num(); return p;
          case "&": return texto(a) + texto(b);
          case "=": return comparar(a, b) === 0;
          case "<>": return comparar(a, b) !== 0;
          case "<": return comparar(a, b) < 0;
          case ">": return comparar(a, b) > 0;
          case "<=": return comparar(a, b) <= 0;
          case ">=": return comparar(a, b) >= 0;
        }
        break;
      case "fn":
        var nombre = ALIAS[n.n] || n.n;
        if (PEREZOSAS[nombre]) return PEREZOSAS[nombre](n.args, ev);
        if (!F[nombre]) {
          if (SOLO_GOOGLE.indexOf(nombre) >= 0) throw E.nombre(nombre + " funciona en Hojas de cálculo de Google, pero no en esta hoja de pruebas.");
          throw E.nombre("No existe una función llamada " + nombre + ". Revisa cómo está escrita.");
        }
        var args = n.args.map(function (x) { var v = ev(x); if (esErr(v)) throw v; return v; });
        return F[nombre](args);
    }
    throw E.error();
  };

  /* ---------- Formatos ---------- */
  var FMT = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 6 });
  var FMT0 = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 });
  var FMT2 = new Intl.NumberFormat("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function formatoNumero(n) {
    n = parseFloat(n.toPrecision(12));
    if (Math.abs(n) >= 1e15 || (n !== 0 && Math.abs(n) < 1e-6)) return n.toExponential(2).replace(".", ",").replace("e", "E");
    return FMT.format(n);
  }
  function dos(n) { return (n < 10 ? "0" : "") + n; }
  function formatoFecha(n) {
    var f = aFecha(n), s = dos(f.d) + "-" + dos(f.m) + "-" + f.y, fr = n - Math.floor(n);
    if (fr > 1e-9) { var min = Math.round(fr * 1440); s += " " + dos(Math.floor(min / 60)) + ":" + dos(min % 60); }
    return s;
  }
  function mostrar(v, fmt) {
    if (v === null) return "";
    if (esErr(v)) return v.c;
    if (typeof v === "boolean") return v ? "VERDADERO" : "FALSO";
    if (v instanceof Fecha) return formatoFecha(v.n);
    if (typeof v === "number") {
      if (fmt === "clp") return (v < 0 ? "-$" : "$") + FMT0.format(Math.abs(v));
      if (fmt === "pct") return formatoNumero(v * 100) + " %";
      if (fmt === "dec2") return FMT2.format(v);
      return formatoNumero(v);
    }
    return String(v);
  }

  /* Copiar una fórmula: las referencias sin $ se mueven igual que la celda */
  function desplazar(raw, dr, dc) {
    raw = String(raw);
    if (raw.charAt(0) !== "=") return raw;
    return raw.split('"').map(function (parte, i) {
      if (i % 2) return parte;
      return parte.replace(/(^|[^A-Za-z0-9_.$])(\$?)([A-Za-z]{1,2})(\$?)(\d+)(?![A-Za-z0-9_(])/g, function (m, pre, dC, col, dR, fila) {
        var c = colNum(col), r = +fila;
        if (!dC) c += dc;
        if (!dR) r += dr;
        if (c < 0 || r < 1) return pre + "#¡REF!";
        var letras = c < 26 ? String.fromCharCode(65 + c) : String.fromCharCode(64 + Math.floor(c / 26)) + String.fromCharCode(65 + c % 26);
        return pre + dC + letras + dR + r;
      });
    }).join('"');
  }

  /* ======================= 2. Hoja de pruebas ======================= */
  function notas(extra) {
    var d = {
      A1: "Estudiante", B1: "Prueba 1", C1: "Prueba 2", D1: "Promedio", E1: "Curso",
      A2: "Amanda", B2: "5,8", C2: "6,4", E2: "7A",
      A3: "Benjamín", B3: "4,9", C3: "5,5", E3: "7B",
      A4: "Catalina", B4: "6,7", C4: "7,0", E4: "7A",
      A5: "Diego", B5: "3,6", C5: "3,2", E5: "7B",
      A6: "Emilia", B6: "6,4", C6: "5,9", E6: "7A"
    };
    for (var r = 2; r <= 6; r++) d["D" + r] = "=PROMEDIO(B" + r + ":C" + r + ")";
    for (var k in extra) d[k] = extra[k];
    return d;
  }
  var FMT_NOTAS = { D2: "dec2", D3: "dec2", D4: "dec2", D5: "dec2", D6: "dec2" };
  function proxima(d, m) {
    var h = new Date(), y = h.getFullYear();
    if (h.getMonth() + 1 > m || (h.getMonth() + 1 === m && h.getDate() >= d)) y++;
    return dos(d) + "/" + dos(m) + "/" + y;
  }

  var EJEMPLOS = {
    libre: { datos: function () { return notas({}); }, fmt: FMT_NOTAS, sel: "D2", nota: "Estas son notas de ejemplo. Cambia una nota y mira cómo cambia el promedio de la columna D." },
    "orden-mal": { datos: function () { return { A1: "Prueba 1", B1: "5,8", A2: "Prueba 2", B2: "6,4", A4: "Sin paréntesis", B4: "=B1+B2/2" }; }, sel: "B4", nota: "Sin paréntesis, la hoja divide primero B2 entre 2 y después suma B1. Por eso da 9 y no el promedio." },
    "orden-bien": { datos: function () { return { A1: "Prueba 1", B1: "5,8", A2: "Prueba 2", B2: "6,4", A4: "Sin paréntesis", B4: "=B1+B2/2", A5: "Con paréntesis", B5: "=(B1+B2)/2" }; }, sel: "B5", nota: "El paréntesis obliga a sumar primero. Compara B4 con B5." },
    errores: {
      datos: function () { return {
        A1: "Dividir por 0", B1: "=10/0", A2: "Mal escrita", B2: "=PROMEDO(1;2)", A3: "Texto + número", B3: '=5+"ausente"',
        A4: "Raíz negativa", B4: "=RAIZ(-4)", A5: "No encontrado", B5: '=BUSCARV("Zoe";A1:A4;1;FALSO)', A6: "Circular", B6: "=B6+1",
        A7: "Sin cerrar", B7: "=SUMA(1;2", A8: "Con coma", B8: "=SUMA(1,5,2)"
      }; },
      sel: "B1", nota: "Toca cada error de la columna B: aquí abajo aparece qué significa. Después intenta arreglarlos."
    },
    kiosco: {
      datos: function () { return {
        A1: "Producto", B1: "Precio", C1: "Cantidad", D1: "Total con IVA", F1: "IVA", F2: "19%",
        A2: "Jugo", B2: "690", C2: "2", A3: "Galletas", B3: "450", C3: "3", A4: "Sándwich", B4: "1500", C4: "1", A5: "Agua", B5: "590", C5: "4",
        D2: "=B2*C2*(1+$F$2)", A7: "Total", D7: "=SUMA(D2:D5)"
      }; },
      fmt: { B2: "clp", B3: "clp", B4: "clp", B5: "clp", D2: "clp", D3: "clp", D4: "clp", D5: "clp", D7: "clp", F2: "pct" },
      sel: "D2", nota: "Toca «Copiar hacia abajo» tres veces y mira la barra de fórmulas: B y C avanzan de fila, $F$2 se queda fijo."
    },
    suma: { datos: function () { return notas({ A8: "Suma P1", B8: "=SUMA(B2:B6)" }); }, fmt: FMT_NOTAS, sel: "B8", nota: "SUMA de la Prueba 1. Cambia una nota de la columna B y el total se actualiza." },
    promedio: { datos: function () { return notas({ A8: "Promedio P1", B8: "=PROMEDIO(B2:B6)" }); }, fmt: FMT_NOTAS, sel: "B8", nota: "Borra una nota de la columna B: el promedio pasa a calcularse con cuatro. Ahora escribe 0: vuelve a contar cinco." },
    max: { datos: function () { return notas({ A7: "Más alta", B7: "=MAX(B2:B6)", A8: "Más baja", B8: "=MIN(B2:B6)", C8: "=B7-B8" }); }, fmt: FMT_NOTAS, sel: "B7", nota: "B7 es la nota más alta y B8 la más baja. C8 resta las dos: el rango de las notas." },
    contar: { datos: function () { return notas({ B5: "", A7: "CONTARA", B7: "=CONTARA(A2:A6)", A8: "CONTAR", B8: "=CONTAR(B2:B6)" }); }, fmt: FMT_NOTAS, sel: "B8", nota: "Diego no tiene nota en la Prueba 1. Hay 5 estudiantes (CONTARA) pero solo 4 notas (CONTAR)." },
    redondear: { datos: function () { return notas({ A7: "Promedio P1", B7: "=PROMEDIO(B2:B6)", A8: "Redondeado", B8: "=REDONDEAR(B7;1)" }); }, fmt: FMT_NOTAS, sel: "B8", nota: "Cambia el 1 por 0 o por 2 para ver más o menos decimales." },
    potencia: { datos: function () { return { A1: "Base", B1: "2", A2: "Exponente", B2: "10", A4: "Con ^", B4: "=B1^B2", A5: "Con POTENCIA", B5: "=POTENCIA(B1;B2)", A7: "Exponente 0", B7: "=B1^0", A8: "Exponente -1", B8: "=B1^-1" }; }, sel: "B4", nota: "Cambia la base o el exponente. Fíjate en B7 y B8: cualquier número elevado a 0 da 1, y a -1 da su inverso." },
    raiz: { datos: function () { return { A1: "Número", B1: "144", A3: "RAIZ", B3: "=RAIZ(B1)", A4: "Como potencia", B4: "=B1^(1/2)", A6: "Raíz cúbica de 27", B6: "=27^(1/3)", A7: "Comprobar", B7: "=B3*B3" }; }, sel: "B3", nota: "B4 muestra que la raíz cuadrada es lo mismo que elevar a 1/2. B7 comprueba el resultado." },
    log: {
      datos: function () { return {
        A1: "Número", B1: "LOG10", C1: "LN", D1: "LOG base 2",
        A2: "1", A3: "10", A4: "100", A5: "1000", A6: "8",
        B2: "=LOG10(A2)", B3: "=LOG10(A3)", B4: "=LOG10(A4)", B5: "=LOG10(A5)", B6: "=LOG10(A6)",
        C2: "=LN(A2)", C3: "=LN(A3)", C4: "=LN(A4)", C5: "=LN(A5)", C6: "=LN(A6)",
        D2: "=LOG(A2;2)", D3: "=LOG(A3;2)", D4: "=LOG(A4;2)", D5: "=LOG(A5;2)", D6: "=LOG(A6;2)",
        A8: "Comprobar", B8: "=10^B5"
      }; },
      sel: "D6", nota: "LOG(8;2) es 3 porque 2 × 2 × 2 = 8. B8 deshace el logaritmo con una potencia. Escribe 0 en la columna A para ver qué pasa."
    },
    matematica: { datos: function () { return {
      A1: "ABS(-7)", B1: "=ABS(-7)", A2: "ENTERO(5,9)", B2: "=ENTERO(5,9)", A3: "RESIDUO(17;5)", B3: "=RESIDUO(17;5)", A4: "¿17 es par?", B4: "=RESIDUO(17;2)=0",
      A5: "Área círculo r=3", B5: "=PI()*3^2", A6: "Dado", B6: "=ALEATORIO.ENTRE(1;6)", A7: "REDOND.MULT", B7: "=REDOND.MULT(1234;10)", A8: "Porcentaje", B8: "=2000*19%"
    }; }, sel: "B4", nota: "Cada fila muestra una función. El dado cambia cada vez que editas cualquier celda, como en Google." },
    mesada: { datos: function () { return {
      A1: "Nombre", B1: "Mesada", A2: "Amanda", B2: "1000", A3: "Benjamín", B3: "1000", A4: "Catalina", B4: "1000", A5: "Diego", B5: "1000", A6: "Emilia", B6: "100000",
      D1: "Medida", E1: "Valor", D2: "Promedio", E2: "=PROMEDIO(B2:B6)", D3: "Mediana", E3: "=MEDIANA(B2:B6)", D4: "Moda", E4: "=MODA(B2:B6)"
    }; }, fmt: { B2: "clp", B3: "clp", B4: "clp", B5: "clp", B6: "clp", E2: "clp", E3: "clp", E4: "clp" }, sel: "E3", nota: "Un solo caso extremo sube el promedio a $20.800. La mediana y la moda siguen en $1.000. Cambia la mesada de Emilia a 1000 y compara." },
    desvest: { datos: function () { return {
      A1: "Curso A", B1: "Curso B", A2: "5,4", A3: "5,6", A4: "5,5", A5: "5,5", A6: "5,6", A7: "5,4", B2: "7,0", B3: "3,8", B4: "7,0", B5: "4,0", B6: "6,8", B7: "4,4",
      D1: "Medida", E1: "Curso A", F1: "Curso B", D2: "Promedio", E2: "=PROMEDIO(A2:A7)", F2: "=PROMEDIO(B2:B7)", D3: "Desv. estándar", E3: "=DESVEST(A2:A7)", F3: "=DESVEST(B2:B7)"
    }; }, fmt: { E2: "dec2", F2: "dec2", E3: "dec2", F3: "dec2" }, sel: "F3", nota: "Los dos cursos tienen promedio 5,5, pero en el B las notas están mucho más repartidas. Eso es lo que mide la desviación." },
    "promedio-si": { datos: function () { return notas({ A7: "Promedio 7A", B7: '=PROMEDIO.SI(E2:E6;"7A";D2:D6)', A8: "Promedio 7B", B8: '=PROMEDIO.SI(E2:E6;"7B";D2:D6)' }); }, fmt: { D2: "dec2", D3: "dec2", D4: "dec2", D5: "dec2", D6: "dec2", B7: "dec2", B8: "dec2" }, sel: "B7", nota: "Mira la columna E (curso) y promedia solo la columna D de las filas que dicen 7A." },
    si: { datos: function () { return notas({ F1: "Situación", F2: '=SI(D2>=4;"Aprobado";"Reprobado")' }); }, fmt: FMT_NOTAS, sel: "F2", nota: "Usa «Copiar hacia abajo» para llenar la columna F. Después baja la nota de alguien y mira cómo cambia." },
    y: { datos: function () { return notas({ F1: "¿Ambas ≥ 4?", F2: '=SI(Y(B2>=4;C2>=4);"Sí";"No")' }); }, fmt: FMT_NOTAS, sel: "F2", nota: "Copia hacia abajo. Después cambia Y por O y compara: con O basta con una prueba aprobada." },
    "si-conjunto": { datos: function () { return notas({ F1: "Logro", F2: '=SI.CONJUNTO(D2>=6;"Muy bien";D2>=4;"Suficiente";VERDADERO;"Insuficiente")' }); }, fmt: FMT_NOTAS, sel: "F2", nota: "Copia hacia abajo. El último VERDADERO funciona como «en cualquier otro caso»." },
    "si-error": { datos: function () { return {
      A1: "Puntaje", B1: "Intentos", C1: "Sin SI.ERROR", D1: "Con SI.ERROR",
      A2: "12", B2: "3", A3: "8", B3: "0", A4: "15", B4: "5",
      C2: "=A2/B2", C3: "=A3/B3", C4: "=A4/B4", D2: '=SI.ERROR(A2/B2;"—")', D3: '=SI.ERROR(A3/B3;"—")', D4: '=SI.ERROR(A4/B4;"—")'
    }; }, sel: "D3", nota: "Con 0 intentos, dividir da error. La columna D muestra una raya en su lugar." },
    "contar-si": { datos: function () { return notas({ A7: "Aprobados", B7: '=CONTAR.SI(D2:D6;">=4")', A8: "Del 7A", B8: '=CONTAR.SI(E2:E6;"7A")' }); }, fmt: FMT_NOTAS, sel: "B7", nota: "Cuenta los promedios de 4 o más. Prueba otras condiciones: \"<4\", \">=6\" o \"7B\"." },
    "sumar-si": { datos: function () { return {
      A1: "Gasto", B1: "Categoría", C1: "Monto",
      A2: "Pan", B2: "Colación", C2: "900", A3: "Micro", B3: "Transporte", C3: "700", A4: "Jugo", B4: "Colación", C4: "690",
      A5: "Cuaderno", B5: "Útiles", C5: "1990", A6: "Micro", B6: "Transporte", C6: "700", A7: "Galletas", B7: "Colación", C7: "450",
      E1: "Colación", E2: '=SUMAR.SI(B2:B7;"Colación";C2:C7)', F1: "Transporte", F2: '=SUMAR.SI(B2:B7;"Transporte";C2:C7)'
    }; }, fmt: { C2: "clp", C3: "clp", C4: "clp", C5: "clp", C6: "clp", C7: "clp", E2: "clp", F2: "clp" }, sel: "E2", nota: "Mira la columna B y suma la columna C solo donde dice «Colación»." },
    buscarv: { datos: function () { return notas({ A8: "Buscar:", B8: "Diego", C8: "=BUSCARV(B8;A2:D6;4;FALSO)" }); }, fmt: { D2: "dec2", D3: "dec2", D4: "dec2", D5: "dec2", D6: "dec2", C8: "dec2" }, sel: "C8", nota: "Escribe otro nombre en B8. Si escribes uno que no está, aparece #N/A. El 4 indica la cuarta columna de A:D, el promedio." },
    buscarx: { datos: function () { return notas({ A8: "Buscar:", B8: "Diego", C8: "=BUSCARX(B8;A2:A6;D2:D6)" }); }, fmt: { D2: "dec2", D3: "dec2", D4: "dec2", D5: "dec2", D6: "dec2", C8: "dec2" }, sel: "C8", nota: "Cambia D2:D6 por E2:E6 para traer el curso en vez del promedio." },
    texto: { datos: function () { return {
      A1: "Nombre", B1: "Apellido", A2: "aMANDA", B2: "  rojas   soto ",
      A4: "Nombre completo", B4: '=NOMPROPIO(A2)&" "&NOMPROPIO(ESPACIOS(B2))', A5: "Mayúsculas", B5: "=MAYUSC(A2)", A6: "Letras del nombre", B6: "=LARGO(A2)",
      A7: "Inicial", B7: "=IZQUIERDA(MAYUSC(A2);1)", A8: "Sin espacios", B8: "=ESPACIOS(B2)"
    }; }, sel: "B4", nota: "Los datos vienen desordenados, como pasa al copiarlos de un formulario. Las fórmulas los limpian." },
    fechas: { datos: function () { return {
      A1: "Hoy", B1: "=HOY()", A2: "Fiestas Patrias", B2: proxima(18, 9), A3: "Días que faltan", B3: "=B2-B1",
      A4: "En una semana", B4: "=B1+7", A5: "Día de la semana", B5: "=DIASEM(B1)", A6: "Nacimiento", B6: "15/03/2013", A7: "Edad (años)", B7: '=DATEDIF(B6;B1;"Y")'
    }; }, sel: "B3", nota: "Restar dos fechas da los días entre ellas. Cambia la fecha de nacimiento por la tuya (día/mes/año)." }
  };

  var mesa = document.querySelector(".hc-mesa");
  if (mesa) iniciarMesa();

  function iniciarMesa() {
    var rejilla = mesa.querySelector("[data-mesa-rejilla]"),
        fx = mesa.querySelector("[data-mesa-fx]"),
        nombre = mesa.querySelector("[data-mesa-nombre]"),
        notaEl = mesa.querySelector("[data-mesa-nota]"),
        abrir = document.querySelector("[data-abrir-mesa]");
    var estado = { celdas: {}, fmt: {}, sel: "A1", ejemplo: "libre", nota: "", previo: "" };
    var hoja, arrastre = null;

    /* Construir la cuadrícula una vez */
    var html = '<div class="hc-esquina" aria-hidden="true"></div>';
    for (var c = 0; c < COLS.length; c++) html += '<div class="hc-col" role="columnheader">' + COLS[c] + "</div>";
    for (var r = 1; r <= FILAS; r++) {
      html += '<div class="hc-fila" role="rowheader">' + r + "</div>";
      for (c = 0; c < COLS.length; c++) html += '<div class="hc-c" role="gridcell" data-ref="' + COLS[c] + r + '"></div>';
    }
    rejilla.innerHTML = html;
    var celdasEl = {};
    rejilla.querySelectorAll(".hc-c").forEach(function (el) { celdasEl[el.dataset.ref] = el; });

    function pintar() {
      hoja = new Hoja(estado.celdas);
      Object.keys(celdasEl).forEach(function (ref) {
        var el = celdasEl[ref], v = hoja.valor(ref);
        el.textContent = mostrar(v, estado.fmt[ref]);
        el.className = "hc-c" + (typeof v === "number" || v instanceof Fecha ? " n" : "") + (typeof v === "boolean" ? " b" : "") + (esErr(v) ? " err" : "") + (ref === estado.sel ? " activa" : "");
        el.setAttribute("aria-selected", ref === estado.sel ? "true" : "false");
        if (esErr(v)) el.title = v.c + ": " + v.m; else el.removeAttribute("title");
      });
      marcarCitadas();
    }
    function explicar() {
      var v = hoja.valor(estado.sel);
      if (esErr(v)) { notaEl.innerHTML = "<b>" + v.c + "</b> " + escapar(v.m); notaEl.classList.add("es-error"); }
      else { notaEl.textContent = estado.nota; notaEl.classList.remove("es-error"); }
    }
    function elegir(ref, foco) {
      estado.sel = ref;
      nombre.textContent = ref;
      fx.value = estado.celdas[ref] || "";
      estado.previo = fx.value;
      pintar(); explicar();
      if (foco !== false) rejilla.focus({ preventScroll: true });
      celdasEl[ref].scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    function guardar(ref, raw) {
      if (raw === "" || raw === undefined) delete estado.celdas[ref]; else estado.celdas[ref] = raw;
      if (/%$/.test(String(raw).trim()) && String(raw).charAt(0) !== "=") estado.fmt[ref] = "pct";
    }
    function confirmar() {
      if (fx.value !== estado.previo) { guardar(estado.sel, fx.value); estado.previo = fx.value; }
      pintar(); explicar();
    }
    function mover(dc, dr) {
      var c = COLS.indexOf(estado.sel[0]) + dc, r = +estado.sel.slice(1) + dr;
      c = Math.max(0, Math.min(COLS.length - 1, c)); r = Math.max(1, Math.min(FILAS, r));
      elegir(COLS[c] + r);
    }
    function editandoFormula() { return document.activeElement === fx && fx.value.charAt(0) === "="; }
    function marcarCitadas() {
      Object.keys(celdasEl).forEach(function (k) { celdasEl[k].classList.remove("citada"); });
      var f = fx.value;
      if (f.charAt(0) !== "=") return;
      f.split('"').forEach(function (parte, i) {
        if (i % 2) return;
        var re = /(?:^|[^A-Za-z0-9_.$])\$?([A-Za-z]{1,2})\$?(\d+)(?::\$?([A-Za-z]{1,2})\$?(\d+))?(?![A-Za-z0-9_(])/g, m;
        while ((m = re.exec(parte))) {
          var c0 = colNum(m[1]), r0 = +m[2], c1 = m[3] ? colNum(m[3]) : c0, r1 = m[4] ? +m[4] : r0;
          for (var cc = Math.min(c0, c1); cc <= Math.max(c0, c1); cc++)
            for (var rr = Math.min(r0, r1); rr <= Math.max(r0, r1); rr++) {
              var k = (COLS[cc] || "") + rr; if (celdasEl[k]) celdasEl[k].classList.add("citada");
            }
        }
      });
    }
    function cargar(nombreEj) {
      var ej = EJEMPLOS[nombreEj] || EJEMPLOS.libre;
      estado.ejemplo = nombreEj;
      estado.celdas = ej.datos();
      estado.fmt = Object.assign({}, ej.fmt || {});
      estado.nota = ej.nota;
      elegir(ej.sel, false);
    }
    function abrirMesa(nombreEj) {
      if (nombreEj) cargar(nombreEj);
      mesa.hidden = false;
      document.body.classList.add("hc-con-mesa");
      abrir.setAttribute("aria-expanded", "true");
      requestAnimationFrame(function () { rejilla.focus({ preventScroll: true }); });
    }
    function cerrarMesa() {
      mesa.hidden = true;
      document.body.classList.remove("hc-con-mesa");
      abrir.setAttribute("aria-expanded", "false");
      abrir.focus();
    }
    function copiar(dr, dc) {
      var c = COLS.indexOf(estado.sel[0]) + dc, r = +estado.sel.slice(1) + dr;
      if (c >= COLS.length || r > FILAS) { notaEl.textContent = "No hay más celdas hacia ese lado en la hoja de pruebas."; return; }
      var destino = COLS[c] + r, raw = estado.celdas[estado.sel];
      if (raw === undefined) return;
      guardar(destino, desplazar(raw, dr, dc));
      if (estado.fmt[estado.sel]) estado.fmt[destino] = estado.fmt[estado.sel];
      elegir(destino);
      if (String(raw).charAt(0) === "=") notaEl.innerHTML = "Copiaste <b>" + escapar(raw) + "</b> y quedó <b>" + escapar(estado.celdas[destino]) + "</b>.";
    }

    /* Eventos de la cuadrícula */
    rejilla.addEventListener("pointerdown", function (e) {
      var el = e.target.closest(".hc-c");
      if (!el) return;
      if (editandoFormula()) {
        e.preventDefault();
        var ini = fx.selectionStart, fin = fx.selectionEnd;
        arrastre = { desde: el.dataset.ref, ini: ini, largo: 0 };
        insertarRef(el.dataset.ref, ini, fin);
        return;
      }
      if (document.activeElement === fx) confirmar();
      elegir(el.dataset.ref);
    });
    rejilla.addEventListener("pointerover", function (e) {
      if (!arrastre || !e.buttons) return;
      var el = e.target.closest(".hc-c");
      if (!el) return;
      var texto = el.dataset.ref === arrastre.desde ? arrastre.desde : arrastre.desde + ":" + el.dataset.ref;
      insertarRef(texto, arrastre.ini, arrastre.ini + arrastre.largo);
    });
    document.addEventListener("pointerup", function () { arrastre = null; });
    function insertarRef(texto, ini, fin) {
      fx.value = fx.value.slice(0, ini) + texto + fx.value.slice(fin);
      if (arrastre) arrastre.largo = texto.length;
      var p = ini + texto.length;
      fx.setSelectionRange(p, p);
      marcarCitadas();
    }
    rejilla.addEventListener("dblclick", function () { fx.focus(); fx.setSelectionRange(fx.value.length, fx.value.length); });
    rejilla.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k === "ArrowUp") { e.preventDefault(); mover(0, -1); }
      else if (k === "ArrowDown") { e.preventDefault(); mover(0, 1); }
      else if (k === "ArrowLeft") { e.preventDefault(); mover(-1, 0); }
      else if (k === "ArrowRight" || k === "Tab" && !e.shiftKey) { if (k === "Tab" && estado.sel[0] === COLS[COLS.length - 1]) return; e.preventDefault(); mover(1, 0); }
      else if (k === "Enter" || k === "F2") { e.preventDefault(); fx.focus(); fx.setSelectionRange(fx.value.length, fx.value.length); }
      else if (k === "Delete" || k === "Backspace") { e.preventDefault(); guardar(estado.sel, ""); elegir(estado.sel); }
      else if (k === "Escape") { e.preventDefault(); cerrarMesa(); }
      else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); fx.value = k; fx.focus(); marcarCitadas(); }
    });
    fx.addEventListener("input", marcarCitadas);
    fx.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); confirmar(); mover(0, 1); }
      else if (e.key === "Tab") { e.preventDefault(); confirmar(); mover(1, 0); }
      else if (e.key === "Escape") { e.preventDefault(); fx.value = estado.previo; marcarCitadas(); rejilla.focus(); }
      else if (e.key === "F4") { e.preventDefault(); rotarDolar(); }
    });
    fx.addEventListener("blur", function () { if (!arrastre) { confirmar(); } });
    /* F4: rota A1 → $A$1 → A$1 → $A1 en la referencia donde está el cursor */
    function rotarDolar() {
      var v = fx.value, p = fx.selectionStart, re = /\$?[A-Za-z]{1,2}\$?\d+/g, m;
      while ((m = re.exec(v))) {
        if (p >= m.index && p <= m.index + m[0].length) {
          var s = m[0], base = s.replace(/\$/g, ""), col = base.match(/[A-Za-z]+/)[0], fila = base.match(/\d+/)[0];
          var formas = [col + fila, "$" + col + "$" + fila, col + "$" + fila, "$" + col + fila];
          var sig = formas[(formas.indexOf(s) + 1) % 4];
          fx.value = v.slice(0, m.index) + sig + v.slice(m.index + s.length);
          fx.setSelectionRange(m.index + sig.length, m.index + sig.length);
          return;
        }
      }
    }

    mesa.addEventListener("click", function (e) {
      var b = e.target.closest("[data-mesa]");
      if (b) {
        var a = b.dataset.mesa;
        if (a === "abajo") copiar(1, 0);
        else if (a === "derecha") copiar(0, 1);
        else if (a === "borrar") { guardar(estado.sel, ""); elegir(estado.sel); }
        else if (a === "reiniciar") cargar(estado.ejemplo);
      }
      if (e.target.closest("[data-cerrar-mesa]")) cerrarMesa();
    });
    abrir.addEventListener("click", function () { if (mesa.hidden) abrirMesa(); else cerrarMesa(); });
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-probar]");
      if (b) { abrirMesa(b.dataset.probar); return; }
    });
    window.HC_abrirMesa = abrirMesa;
    cargar("libre");
  }

  function escapar(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ======================= 3. Mapa y buscador ======================= */
  var mapa = document.querySelector("[data-mapa]");
  if (mapa) iniciarMapa();

  function iniciarMapa() {
    var celdas = Array.prototype.slice.call(mapa.querySelectorAll("button.hc-celda")),
        nombre = mapa.querySelector("[data-mapa-nombre]"),
        buscar = mapa.querySelector("[data-mapa-buscar]"),
        caja = mapa.querySelector(".hc-sugerencias"),
        lee = document.createElement("div");
    lee.className = "hc-mapa-lee";
    lee.setAttribute("aria-live", "polite");
    mapa.appendChild(lee);
    var activa = null;

    function leer(btn) {
      celdas.forEach(function (b) { b.classList.toggle("activa", b === btn); b.setAttribute("aria-selected", b === btn ? "true" : "false"); });
      activa = btn;
      nombre.textContent = btn.dataset.ref;
      lee.innerHTML = '<p><b>' + escapar(btn.textContent) + "</b> " + escapar(btn.dataset.que) + '</p><button type="button" class="boton chico" data-ir-celda>Ir a ' + escapar(btn.textContent.toLowerCase()) + " →</button>";
    }
    function ir(btn) {
      if (btn.hasAttribute("data-abre-mesa") && window.HC_abrirMesa) { window.HC_abrirMesa(); return; }
      irA(document.querySelector(btn.dataset.ir));
    }
    celdas.forEach(function (b, i) {
      b.setAttribute("role", "gridcell");
      b.addEventListener("click", function () { if (activa === b) ir(b); else leer(b); });
      b.addEventListener("dblclick", function () { ir(b); });
      b.addEventListener("keydown", function (e) {
        var col = "ABCDEFG".indexOf(b.dataset.ref[0]), fila = +b.dataset.ref.slice(1), dc = 0, df = 0;
        if (e.key === "ArrowRight") dc = 1; else if (e.key === "ArrowLeft") dc = -1;
        else if (e.key === "ArrowDown") df = 1; else if (e.key === "ArrowUp") df = -1; else return;
        e.preventDefault();
        for (var paso = 1; paso < 8; paso++) {
          var c = col + dc * paso, f = fila + df * paso;
          var sig = mapa.querySelector('button.hc-celda[data-ref="' + "ABCDEFG"[c] + f + '"]');
          if (c < 0 || c > 6 || f < 1 || f > 4) break;
          if (sig) { sig.focus(); leer(sig); break; }
        }
      });
    });
    lee.addEventListener("click", function (e) { if (e.target.closest("[data-ir-celda]") && activa) ir(activa); });
    leer(celdas[0]);

    /* Índice de búsqueda */
    var indice = [];
    function seccionDe(el) { var s = el.closest(".bloque"); return s ? (s.querySelector("h2").dataset.corto || s.querySelector("h2").textContent) : ""; }
    document.querySelectorAll(".cuerpo > .bloque[id]").forEach(function (s) {
      if (s.id === "mapa") return;
      var h = s.querySelector("h2");
      indice.push({ t: h.textContent.trim(), sub: "Sección", el: s, claves: norm(h.textContent) });
    });
    celdas.forEach(function (b) { indice.push({ t: b.textContent.trim(), sub: b.dataset.ref + " · " + b.dataset.que, el: document.querySelector(b.dataset.ir), claves: norm(b.textContent + " " + b.dataset.que) }); });
    document.querySelectorAll("[data-fn]").forEach(function (el) {
      el.dataset.fn.split(" ").forEach(function (fn) {
        indice.push({ t: "=" + fn, sub: seccionDe(el), el: el, fn: norm(fn), claves: norm(fn + " " + (el.dataset.buscar || "")) });
      });
    });
    document.querySelectorAll("[data-buscar]:not([data-fn])").forEach(function (el) {
      var titulo = el.querySelector("h3, h4, summary span, dt, td code");
      var t = titulo ? (titulo.childNodes[0] && titulo.childNodes[0].nodeType === 3 && titulo.tagName === "SPAN" ? titulo.childNodes[0].textContent : titulo.textContent) : el.textContent.slice(0, 40);
      indice.push({ t: t.trim(), sub: seccionDe(el), el: el, claves: norm(t + " " + el.dataset.buscar) });
    });

    function norm(s) { return sinTildes(s).toLowerCase(); }
    var sugeridas = [], elegida = -1;
    function buscarAhora() {
      var q = norm(buscar.value.trim()).replace(/^=/, "");
      if (!q) { cerrarCaja(); return; }
      var palabras = q.split(/\s+/);
      sugeridas = indice.map(function (it) {
        var p = 0;
        if (it.fn && it.fn.indexOf(q) === 0) p += 100 - it.fn.length;
        if (norm(it.t).indexOf(q) >= 0) p += 30;
        if (palabras.every(function (w) { return it.claves.indexOf(w) >= 0; })) p += 20;
        return { it: it, p: p };
      }).filter(function (x) { return x.p > 0; }).sort(function (a, b) { return b.p - a.p; }).slice(0, 7).map(function (x) { return x.it; });
      elegida = sugeridas.length ? 0 : -1;
      pintarCaja();
    }
    function pintarCaja() {
      if (!sugeridas.length) {
        caja.innerHTML = '<p class="hc-sin">Nada con ese nombre. Prueba con otra palabra, como «sumar» o «gráfico».</p>';
      } else {
        caja.innerHTML = sugeridas.map(function (it, i) {
          return '<div role="option" id="hc-sug-' + i + '" class="hc-sug' + (i === elegida ? " activa" : "") + '" aria-selected="' + (i === elegida) + '" data-i="' + i + '"><b' + (it.fn ? ' class="fn"' : "") + ">" + escapar(it.t) + "</b><span>" + escapar(it.sub) + "</span></div>";
        }).join("");
      }
      caja.hidden = false;
      buscar.setAttribute("aria-expanded", "true");
      if (elegida >= 0) buscar.setAttribute("aria-activedescendant", "hc-sug-" + elegida); else buscar.removeAttribute("aria-activedescendant");
    }
    function cerrarCaja() { caja.hidden = true; buscar.setAttribute("aria-expanded", "false"); buscar.removeAttribute("aria-activedescendant"); }
    function irSugerencia(i) { var it = sugeridas[i]; if (!it) return; cerrarCaja(); irA(it.el); }
    buscar.addEventListener("input", buscarAhora);
    buscar.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" && sugeridas.length) { e.preventDefault(); elegida = (elegida + 1) % sugeridas.length; pintarCaja(); }
      else if (e.key === "ArrowUp" && sugeridas.length) { e.preventDefault(); elegida = (elegida - 1 + sugeridas.length) % sugeridas.length; pintarCaja(); }
      else if (e.key === "Enter") { e.preventDefault(); irSugerencia(elegida < 0 ? 0 : elegida); }
      else if (e.key === "Escape") cerrarCaja();
    });
    caja.addEventListener("pointerdown", function (e) { var s = e.target.closest("[data-i]"); if (s) { e.preventDefault(); irSugerencia(+s.dataset.i); } });
    buscar.addEventListener("blur", function () { setTimeout(cerrarCaja, 120); });
    buscar.addEventListener("focus", function () { if (buscar.value.trim()) buscarAhora(); });
  }

  function irA(el) {
    if (!el) return;
    var d = el.closest("details") || (el.tagName === "DETAILS" ? el : null);
    if (d) d.open = true;
    var panel = el.closest('[role="tabpanel"][hidden]');
    if (panel) { var tab = document.getElementById(panel.getAttribute("aria-labelledby")); if (tab) tab.click(); }
    el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    el.classList.remove("hc-destello");
    void el.offsetWidth;
    el.classList.add("hc-destello");
    if (!el.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SUMMARY)$/.test(el.tagName)) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }

  /* ======================= 4. Anatomía ======================= */
  var anat = document.querySelector("[data-anatomia]");
  if (anat) {
    var zonas = anat.querySelectorAll("[data-parte]");
    anat.addEventListener("click", function (e) {
      var z = e.target.closest("[data-parte]");
      if (!z) return;
      zonas.forEach(function (x) { x.setAttribute("aria-pressed", x === z ? "true" : "false"); });
      anat.querySelectorAll("[data-explica]").forEach(function (d) { d.hidden = d.dataset.explica !== z.dataset.parte; });
      if (!matchMedia("(min-width: 860px)").matches) anat.querySelector(".hc-explica").scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    zonas.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
  }

  /* ======================= 5. Logaritmos ======================= */
  var log = document.querySelector("[data-log]");
  if (log) {
    var selBase = log.querySelector("#log-base"), inNum = log.querySelector("#log-num"), res = log.querySelector(".hc-log-res");
    function fmt(n) { return formatoNumero(n); }
    function calcular() {
      var bv = selBase.value, b = bv === "e" ? Math.E : +bv, bt = bv === "e" ? "e" : fmt(b);
      var x = parseFloat(String(inNum.value).replace(",", "."));
      var xs = String(x).replace(".", ",");   /* en la fórmula el número va sin puntos de miles */
      var formula = bv === "e" ? "=LN(" + xs + ")" : bv === "10" ? "=LOG(" + xs + ")" : "=LOG(" + xs + ";" + bt + ")";
      if (!(x > 0)) { res.innerHTML = '<p><code class="hc-codigo">' + escapar(formula) + '</code> da <b>#¡NUM!</b></p><p>No existe: multiplicando un número positivo nunca llegas a 0 ni a un negativo.</p>'; return; }
      var r = Math.log(x) / Math.log(b), k = Math.round(r), exacto = Math.abs(r - k) < 1e-9;
      var html = "";
      if (exacto && k >= 1 && k <= 12) {
        var fichas = []; for (var i = 0; i < k; i++) fichas.push('<span class="hc-factor">' + bt + "</span>");
        html += '<p class="hc-cadena">' + fichas.join('<span class="hc-por">×</span>') + '<span class="hc-por">=</span><b>' + fmt(x) + "</b></p>";
        html += "<p>Multiplicaste " + bt + " <b>" + k + (k === 1 ? " vez" : " veces") + "</b>.</p>";
      } else if (exacto && k === 0) {
        html += "<p>Cualquier base elevada a 0 da 1, así que el logaritmo de 1 siempre es <b>0</b>.</p>";
      } else if (exacto && k < 0) {
        html += "<p>" + bt + "<sup>" + k + "</sup> = " + fmt(x) + ": en vez de multiplicar, divides " + (-k) + (k === -1 ? " vez" : " veces") + ". El logaritmo es <b>negativo</b> porque el número es menor que 1.</p>";
      } else {
        var lo = Math.floor(r), hi = lo + 1;
        html += "<p>" + bt + "<sup>" + lo + "</sup> = " + fmt(Math.pow(b, lo)) + " y " + bt + "<sup>" + hi + "</sup> = " + fmt(Math.pow(b, hi)) + ". Como " + fmt(x) + " queda entre los dos, el logaritmo está <b>entre " + lo + " y " + hi + "</b>.</p>";
      }
      html += '<p class="hc-log-fx"><code class="hc-codigo">' + escapar(formula) + "</code> → <b>" + fmt(parseFloat(r.toPrecision(10))) + "</b></p>";
      res.innerHTML = html;
    }
    selBase.addEventListener("change", calcular);
    inNum.addEventListener("input", calcular);
    calcular();
  }
})();
