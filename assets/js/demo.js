/* Andesco · página «fuera del demo»: nombra la sección pedida y enlaza a su versión en el sitio actual */
(function () {
  "use strict";
  var s = new URLSearchParams(location.search).get("s");
  var LIVE = {
    "quienes-somos": ["¿Quiénes somos?", "https://andesco.org.co/sobre-nosotros/quienes-somos/"],
    "afiliados": ["Nuestros afiliados", "https://andesco.org.co/sobre-nosotros/nuestros-afiliados/"],
    "afiliese": ["Cómo afiliarse", "https://andesco.org.co/sobre-nosotros/como-afiliarse/"],
    "comite-proveedores": ["Comité de proveedores", "https://andesco.org.co/sobre-nosotros/comite-de-proveedores/"],
    "energia-electrica": ["Energía eléctrica", "https://andesco.org.co/sectores/energia-y-gas/energia-electrica/"],
    "gas-natural": ["Gas natural", "https://andesco.org.co/sectores/energia-y-gas/gas-natural/"],
    "acueducto-y-alcantarillado": ["Acueducto y alcantarillado", "https://andesco.org.co/sectores/agua-y-aseo/acueducto-y-alcantarillado/"],
    "aseo-y-gestion-de-residuos": ["Aseo y gestión de residuos", "https://andesco.org.co/sectores/agua-y-aseo/aseo-y-gestion-de-residuos/"],
    "tic-y-television": ["TIC y televisión", "https://andesco.org.co/sectores/tic-y-tv/"],
    "medio-ambiente-y-sostenibilidad": ["Medio ambiente y sostenibilidad", "https://andesco.org.co/areas-transversales/medio-ambiente-y-sostenibilidad/medio-ambiente/"],
    "juridico-y-tributario": ["Jurídico y tributario", "https://andesco.org.co/areas-transversales/juridico-y-tributario/"],
    "legislativo": ["Legislativo", "https://andesco.org.co/areas-transversales/legislativo/"],
    "comunicaciones": ["Comunicaciones", "https://andesco.org.co/areas-transversales/comunicaciones/"],
    "premio-sostenibilidad": ["Premio a la Sostenibilidad", "https://andesco.org.co/premios-a-la-sostenibilidad"],
    "noticias": ["Noticias", "https://andesco.org.co/noticias"],
    "noticias-afiliados": ["Noticias de afiliados", "https://andesco.org.co/noticias-afiliados"],
    "columna": ["Columna de opinión", "https://andesco.org.co/columnas-de-opinion"],
    "estudios": ["Estudios", "https://andesco.org.co/publicaciones/estudios"],
    "marco-tarifario": ["Página pilar del marco tarifario", "https://andesco.org.co/"],
    "terminos-inscripcion": ["Términos de inscripción", "https://andesco.org.co/"]
  };
  var item = LIVE[s];
  if (!item) return;
  document.querySelector("[data-demo-title]").textContent = "«" + item[0] + "» se diseña en la siguiente fase";
  var lead = document.querySelector("[data-demo-lead]");
  if (s === "marco-tarifario") lead.textContent = "Aquí vivirá la página pilar recomendada en el diagnóstico SEO: el análisis completo de Andesco sobre la Resolución CRA 1032 de 2026, con autor, fecha, el PDF en el propio sitio, preguntas frecuentes y datos estructurados, para que Google y la IA citen a Andesco como fuente.";
  else if (s === "afiliese") lead.textContent = "Aquí vivirá la página «Afíliese a Andesco» con beneficios, tarifas y un formulario en línea que reemplaza los formatos que hoy se imprimen y se envían por correo.";
  document.title = item[0] + " · fuera del demo | Andesco";
  var live = document.querySelector("[data-demo-live]");
  if (live) live.href = item[1];
})();
