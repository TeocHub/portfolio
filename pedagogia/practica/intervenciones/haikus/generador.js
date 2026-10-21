/* Generador de haikus escolares: versos desde la planilla del formulario. */
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
  ]
});
