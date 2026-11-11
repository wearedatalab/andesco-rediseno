/* Andesco · Congreso: estados de la página (antes / durante / después), certificados y filtro de conferencistas */
(function () {
  "use strict";
  var A = window.andesco, $ = A.$, $$ = A.$$;

  /* Vista del demo: la página cambia sola según la fecha; aquí se puede forzar para verla */
  var root = $("#cg-root");
  $$(".fase-switch [data-fase]").forEach(function (b, _, all) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-fase");
      if (root) root.setAttribute("data-fase", f);
      all.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      A.toast(f === "antes" ? "Antes del evento: inscripciones y cuenta regresiva" : f === "durante" ? "Durante el evento: lo que pasa ahora en el escenario" : "Después del evento: certificados y memorias");
    });
  });

  /* Certificado (demo) */
  var cert = $("[data-cert]");
  if (cert) {
    var inp = $("input", cert), out = $("[data-cert-out]", cert);
    cert.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!A.check(inp)) { inp.focus(); return; }
      out.innerHTML = '<div class="validate validate--ok"><svg class="ic" aria-hidden="true"><use href="#i-check-c"/></svg><span><b>Certificado encontrado.</b> 28.° Congreso Andesco · 23 al 25 de septiembre de 2026 · 24 horas de asistencia. En el sitio real se descarga aquí el PDF con su nombre.</span></div>';
    });
  }

  /* Filtro de conferencistas por línea */
  var box = $("[data-spk-filter]");
  if (box) {
    var cards = $$(".spk .spk__card"), on = [], cnt = $("[data-spk-count]");
    $$("[data-linea]", box).forEach(function (c) {
      c.addEventListener("click", function () {
        var l = c.getAttribute("data-linea"), i = on.indexOf(l);
        i > -1 ? on.splice(i, 1) : on.push(l);
        c.setAttribute("aria-pressed", String(i < 0));
        var n = 0;
        cards.forEach(function (k) {
          var ls = k.getAttribute("data-lineas").split(" ");
          var ok = !on.length || on.some(function (x) { return ls.indexOf(x) > -1; });
          k.hidden = !ok; if (ok) n++;
        });
        cnt.textContent = on.length ? n + " conferencistas" : "";
      });
    });
  }
})();
