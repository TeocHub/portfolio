/* Prototipo de líneas aleatorias: mismos datos que el generador de haikus, en orden al azar. */
HAIKUS.iniciar({
  fuente: {
    tipo: "sheets",
    clave: "AIzaSyCgPf4Vqdkdb2pDwduWaNm5SOTU4bnU4ok",
    hoja: "1xNkHeq_UGz0M9OdkKjuNabO2XXZ2Toz71h8g5_5L0yU",
    rango: "Haikus!A:F"
  },
  filtros: [
    { campo: "colegio", rotulo: "Colegio" },
    { campo: "anio", rotulo: "Año", desc: true },
    { campo: "curso", rotulo: "Curso" }
  ],
  boton: "Generar líneas",
  revolver: true
});
