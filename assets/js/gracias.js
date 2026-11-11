/* Andesco · página de gracias: confirma lo que pasó y qué sigue; dispara la conversión una sola vez */
(function () {
  "use strict";
  var A = window.andesco, $ = A.$;
  var rec = null;
  try { rec = JSON.parse(sessionStorage.getItem("andesco:ultima") || "null"); } catch (e) { rec = null; }
  var tipo = new URLSearchParams(location.search).get("tipo") || (rec && rec.tipo) || "";
  var fmt = new Intl.NumberFormat("es-CO");
  function el(tag, html) { var x = document.createElement(tag); x.innerHTML = html; return x; }
  function esc(s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var title = $("[data-t-title]"), lead = $("[data-t-lead]"), receipt = $("[data-t-receipt]"), next = $("[data-t-next]"), actions = $("[data-t-actions]");
  var base = document.documentElement.getAttribute("data-base") || "/";

  function row(k, v) { receipt.appendChild(el("div", "<dt>" + k + "</dt><dd>" + v + "</dd>")); }
  function steps(items) { next.hidden = false; items.forEach(function (t, i) { next.appendChild(el("li", "<b>" + (i + 1) + "</b><span>" + t + "</span>")); }); }

  if (tipo === "inscripcion" && rec && rec.evento) {
    var ev = rec.evento;
    title.textContent = rec.gratis ? "¡Listo! Su registro quedó confirmado" : rec.afiliada ? "¡Listo! Su inscripción quedó registrada" : rec.metodo === "factura" ? "Recibimos su solicitud de inscripción" : "¡Pago aprobado! Su inscripción está confirmada";
    lead.textContent = ev.name + " · " + ev.fechas + " · " + ev.sede;
    receipt.hidden = false;
    row("Evento", esc(ev.name));
    row("Modalidad", rec.modo === "virtual" ? "Virtual" : "Presencial");
    row("Asistentes", rec.asistentes.length + " · " + esc(rec.asistentes.join(", ")));
    if (rec.empresa) row("Empresa", esc(rec.empresa) + (rec.afiliada ? " (afiliada)" : ""));
    row("Total", rec.gratis ? "Sin costo" : "$" + fmt.format(rec.total) + " (IVA incluido)");
    if (rec.gratis) steps(["Le enviamos el enlace de acceso a cada asistente.", "El día anterior recibirá un recordatorio.", "Al terminar, descargue su certificado con su número de documento."]);
    else if (rec.afiliada) steps(["No tiene que pagar ahora: la factura llega a " + esc(rec.factura || "su área de cuentas por pagar") + " en 2 días hábiles, con el plazo de pago de su afiliación.", "Cada asistente recibe su confirmación y su escarapela digital con código QR.", "Si necesita cambiar a un asistente, escríbanos hasta 10 días antes."]);
    else if (rec.metodo === "factura") steps(["Le enviamos la factura con los datos para la transferencia.", "Cuando registremos el pago, confirmamos los cupos por correo.", "Cada asistente recibe su escarapela digital con código QR."]);
    else steps(["Enviamos el comprobante de pago a su correo.", "Cada asistente recibe su confirmación y su escarapela digital con código QR.", "Al terminar el evento, descargue el certificado con su número de documento."]);
    actions.innerHTML = '<a class="btn" href="' + ev.ics + '" download><svg class="ic" aria-hidden="true"><use href="#i-cal"/></svg> Agregar al calendario</a><a class="btn btn--ghost" href="' + ev.url + '">Volver al evento</a>';
  } else if (tipo === "boletin") {
    title.textContent = "¡Suscripción confirmada!";
    lead.textContent = "Recibirá el boletín de Andesco una vez al mes. Puede darse de baja con un clic desde cualquier correo.";
  } else if (tipo === "patrocinio") {
    title.textContent = "Le enviaremos el brochure comercial";
    lead.textContent = "En menos de un día hábil llegará a su correo, y una persona del equipo comercial le escribirá para resolver sus dudas.";
    actions.innerHTML = '<a class="btn" href="' + base + 'congreso/">Volver al Congreso</a><a class="btn btn--ghost" href="' + base + 'congreso/agenda/">Ver la agenda</a>';
  }

  /* Conversión (GA4 / Google Ads vía dataLayer), una sola vez por envío */
  window.dataLayer = window.dataLayer || [];
  var key = "andesco:lead:" + (rec ? rec.t : tipo);
  try {
    if (!sessionStorage.getItem(key)) {
      window.dataLayer.push({ event: "generate_lead", form_type: tipo || "desconocido", event_slug: rec && rec.slug || null, value: rec && rec.total || 0, currency: "COP" });
      sessionStorage.setItem(key, "1");
    }
  } catch (e) {}
})();
