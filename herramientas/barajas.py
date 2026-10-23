"""Genera assets/css/barajas.css (los colores de las dos barajas) y revisa contrastes.

Para cambiar un color: edítalo en LUZ, SOMBRA, AREAS_LUZ o AREAS_SOMBRA y ejecuta
    python3 herramientas/barajas.py
El script avisa si algún par de colores queda con poco contraste."""
import os, sys

LUZ = {
    "fondo": "#E6F4FE", "fondo-2": "#D2EBFC", "superficie": "#FFFFFF", "superficie-2": "#FFF4CF",
    "tinta": "#1C2541", "tinta-2": "#465275", "tinta-3": "#6C7699",
    "linea": "#BCD3E6", "trazo": "#1C2541",
    "resalte": "#FFCB3D", "resalte-tinta": "#8A5800",
    "boton": "#1C2541", "sobre-boton": "#FFFFFF",
    "peligro": "#C8243B", "exito": "#17803F",
    # familias secundarias: fuerte (texto), relleno, suave
    "h1": "#8A5800", "h1-relleno": "#FFCB3D", "h1-suave": "#FFF2C4",   # sol
    "h2": "#B4245A", "h2-relleno": "#FF8DB3", "h2-suave": "#FFE3ED",   # chicle
    "h3": "#155FA6", "h3-relleno": "#6CC4FF", "h3-suave": "#DDF0FF",   # cielo
    "h4": "#6A3FC9", "h4-relleno": "#B9A0FF", "h4-suave": "#ECE5FF",   # lila
}
SOMBRA = {
    "fondo": "#0F1A19", "fondo-2": "#132220", "superficie": "#172825", "superficie-2": "#1F332F",
    "tinta": "#EFE6CF", "tinta-2": "#BFB59D", "tinta-3": "#948C77",
    "linea": "#30453F", "trazo": "#B8924A",
    "resalte": "#D9B061", "resalte-tinta": "#E6C57F",
    "boton": "#D9B061", "sobre-boton": "#16201E",
    "peligro": "#E8806E", "exito": "#83CCA2",
    "h1": "#E6C57F", "h1-relleno": "#5C4718", "h1-suave": "#2C2617",   # latón
    "h2": "#E99A86", "h2-relleno": "#6E2F28", "h2-suave": "#35201C",   # cobre
    "h3": "#94C2E6", "h3-relleno": "#24455F", "h3-suave": "#172A36",   # acero
    "h4": "#C2A8EE", "h4-relleno": "#46326F", "h4-suave": "#251E37",   # amatista
}
AREAS_LUZ = {
    "pedagogia": ("#157A43", "#63D27A", "#DCF6E1"),
    "letras":    ("#B4245A", "#FF8DB3", "#FFE3ED"),
    "codigo":    ("#155FA6", "#6CC4FF", "#DDF0FF"),
    "esoterico": ("#6A3FC9", "#B9A0FF", "#ECE5FF"),
    "estudio":   ("#8F5500", "#FFC54D", "#FFF0CF"),
    "sitios":    ("#0B7468", "#5ED8C9", "#D8F7F3"),
    "propuestas": ("#B3401A", "#FF9B6B", "#FFE6DA"),
}
AREAS_SOMBRA = {
    "pedagogia": ("#80C9A8", "#2C5C4B", "#1A3630"),
    "letras":    ("#E99A8B", "#6E2D2B", "#371E1E"),
    "codigo":    ("#94C2E6", "#24455F", "#172A36"),
    "esoterico": ("#C2A8EE", "#46326F", "#251E37"),
    "estudio":   ("#E6C068", "#5D4719", "#30281A"),
    "sitios":    ("#7DD3C7", "#1F504A", "#16302D"),
    "propuestas": ("#EDA57E", "#673620", "#36231A"),
}


def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def lum(h):
    def c(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = rgb(h)
    return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)


def contraste(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)


def bloque(tok, areas):
    out = []
    for k, v in tok.items():
        r, g, b = rgb(v)
        out.append(f"  --{k}-rgb: {r} {g} {b};")
    for a, (f, rel, s) in areas.items():
        for suf, v in (("", f), ("-relleno", rel), ("-suave", s)):
            r, g, b = rgb(v)
            out.append(f"  --a-{a}{suf}-rgb: {r} {g} {b};")
    return "\n".join(out)


def revisar(nombre, tok, areas):
    malos = []
    chequeos = [
        ("tinta", "fondo", 7), ("tinta", "superficie", 7), ("tinta-2", "fondo", 4.5), ("tinta-2", "superficie", 4.5),
        ("tinta-3", "superficie", 3), ("resalte-tinta", "superficie", 4.5), ("sobre-boton", "boton", 4.5),
        ("peligro", "superficie", 4.5), ("exito", "superficie", 4.5),
    ] + [(f"h{i}", "superficie", 4.5) for i in range(1, 5)] + [(f"h{i}", f"h{i}-suave", 4.5) for i in range(1, 5)] \
      + [("tinta", f"h{i}-relleno", 4.5) for i in range(1, 5)]
    for a, b, m in chequeos:
        c = contraste(tok[a], tok[b])
        if c < m:
            malos.append(f"{nombre}: {a}/{b} = {c:.2f} < {m}")
    for a, (f, rel, s) in areas.items():
        for fondo in ("fondo", "superficie"):
            c = contraste(f, tok[fondo])
            if c < 4.5:
                malos.append(f"{nombre}: area {a} sobre {fondo} = {c:.2f}")
        c = contraste(f, s)
        if c < 4.5:
            malos.append(f"{nombre}: area {a} sobre su suave = {c:.2f}")
        c = contraste(tok["tinta"], rel)
        if c < 4.5:
            malos.append(f"{nombre}: tinta sobre relleno {a} = {c:.2f}")
    return malos


malos = revisar("luz", LUZ, AREAS_LUZ) + revisar("sombra", SOMBRA, AREAS_SOMBRA)
print("\n".join(malos) or "contrastes OK")

nombres = list(LUZ.keys())
derivados = "\n".join(f"  --{k}: rgb(var(--{k}-rgb));" for k in nombres)
derivados_areas = "\n".join(
    f"  --a-{a}{s}: rgb(var(--a-{a}{s}-rgb));" for a in AREAS_LUZ for s in ("", "-relleno", "-suave"))
area_sel = "\n".join(
    f'[data-area="{a}"] {{ --acento-rgb: var(--a-{a}-rgb); --acento-relleno-rgb: var(--a-{a}-relleno-rgb); --acento-suave-rgb: var(--a-{a}-suave-rgb); }}'
    for a in AREAS_LUZ)

css = f"""/* ==========================================================
   Las dos barajas: tokens de color
   ----------------------------------------------------------
   Archivo generado. Cada color se guarda como tripleta RGB
   (--x-rgb) para que Tailwind pueda usar transparencias, y
   como color listo para usar (--x).
   Baraja de Luz: cielo, sol, chicle; trazo grueso de tinta.
   Baraja de Sombra: tinta verde-negra, latón, cobre, relojería.
   ========================================================== */

:root,
:root[data-baraja="luz"] {{
  color-scheme: light;
{bloque(LUZ, AREAS_LUZ)}
}}
:root[data-baraja="sombra"] {{
  color-scheme: dark;
{bloque(SOMBRA, AREAS_SOMBRA)}
}}

:root {{
{derivados}
{derivados_areas}
  /* Acento del área actual (por defecto, Pedagogía) */
  --acento-rgb: var(--a-pedagogia-rgb);
  --acento-relleno-rgb: var(--a-pedagogia-relleno-rgb);
  --acento-suave-rgb: var(--a-pedagogia-suave-rgb);
  --acento: rgb(var(--acento-rgb));
  --acento-relleno: rgb(var(--acento-relleno-rgb));
  --acento-suave: rgb(var(--acento-suave-rgb));
}}
{area_sel}
/* Recalcular los derivados dentro de cada área */
[data-area] {{
  --acento: rgb(var(--acento-rgb));
  --acento-relleno: rgb(var(--acento-relleno-rgb));
  --acento-suave: rgb(var(--acento-suave-rgb));
}}
"""
destino = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "assets", "css", "barajas.css")
open(destino, "w", encoding="utf-8").write(css)
print("escrito", destino)
