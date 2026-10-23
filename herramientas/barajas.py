"""Genera assets/css/barajas.css (los colores de las dos barajas) y revisa contrastes.

Para cambiar un color: edítalo en LUZ, SOMBRA, AREAS_LUZ o AREAS_SOMBRA y ejecuta
    python3 herramientas/barajas.py
El script avisa si algún par de colores queda con poco contraste."""
import os, sys

LUZ = {   # papel y tinta
    "fondo": "#F5F0E6", "fondo-2": "#EDE6D8", "superficie": "#FAF7F0", "superficie-2": "#F0E8D8",
    "tinta": "#211E1B", "tinta-2": "#524B43", "tinta-3": "#6C645A",
    "linea": "#D6CCBB", "trazo": "#211E1B",
    "resalte": "#C48C34", "resalte-tinta": "#7A5214",
    "boton": "#211E1B", "sobre-boton": "#FAF7F0",
    "peligro": "#A3302E", "exito": "#3D6B3A",
    # familias secundarias: fuerte (texto), relleno, suave
    "h1": "#7A5214", "h1-relleno": "#E2C38A", "h1-suave": "#F2E6CC",   # ocre
    "h2": "#8C3438", "h2-relleno": "#DFA9A2", "h2-suave": "#F1DED6",   # granate
    "h3": "#2E4E70", "h3-relleno": "#A9BDD0", "h3-suave": "#DDE3E8",   # pizarra
    "h4": "#5C4278", "h4-relleno": "#C2B2D4", "h4-suave": "#E6DFEA",   # ciruela
}
SOMBRA = {   # tinta oscura y latón
    "fondo": "#161513", "fondo-2": "#1D1C19", "superficie": "#1B1A17", "superficie-2": "#24221E",
    "tinta": "#E9E2D4", "tinta-2": "#BAB2A4", "tinta-3": "#968E81",
    "linea": "#3A3731", "trazo": "#B09258",
    "resalte": "#CDA860", "resalte-tinta": "#D8B878",
    "boton": "#CDA860", "sobre-boton": "#161513",
    "peligro": "#E0897A", "exito": "#A0BE96",
    "h1": "#D8B878", "h1-relleno": "#4A3C20", "h1-suave": "#2A251A",   # latón
    "h2": "#D69691", "h2-relleno": "#5A2E2A", "h2-suave": "#30211F",   # cobre
    "h3": "#96B4D2", "h3-relleno": "#2A3A4C", "h3-suave": "#1F262E",   # acero
    "h4": "#BAA5D6", "h4-relleno": "#3E3150", "h4-suave": "#28232F",   # amatista
}
AREAS_LUZ = {
    "pedagogia": ("#40623E", "#A9BE9C", "#E1E7D6"),
    "letras":    ("#8C3438", "#DFA9A2", "#F1DED6"),
    "codigo":    ("#2E4E70", "#A9BDD0", "#DDE3E8"),
    "esoterico": ("#5C4278", "#C2B2D4", "#E6DFEA"),
    "estudio":   ("#7E5418", "#E2C38A", "#F0E4CE"),
    "sitios":    ("#22605A", "#A2CBC3", "#D8E7E2"),
    "propuestas": ("#9A4622", "#E7B59A", "#F2E1D4"),
}
AREAS_SOMBRA = {
    "pedagogia": ("#A0BE96", "#33432F", "#232A21"),
    "letras":    ("#D69691", "#5A2E2A", "#30211F"),
    "codigo":    ("#96B4D2", "#2A3A4C", "#1F262E"),
    "esoterico": ("#BAA5D6", "#3E3150", "#28232F"),
    "estudio":   ("#D6AC6C", "#4C3A1E", "#2E271B"),
    "sitios":    ("#8CC4BA", "#24443F", "#1C2927"),
    "propuestas": ("#DEA07C", "#563220", "#2F231C"),
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
   Baraja de Luz: papel y tinta, un acento terroso por área.
   Baraja de Sombra: tinta oscura y latón.
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
