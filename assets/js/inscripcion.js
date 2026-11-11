/* Andesco · inscripción en pasos. Camino de la empresa afiliada (factura, sin pasarela) y del no afiliado (pago en línea). */
(function () {
  "use strict";
  var A = window.andesco, $ = A.$, $$ = A.$$;
  var form = $("[data-insc]"); if (!form) return;
  var EV = JSON.parse($("#ev-data").textContent), AF = JSON.parse($("#af-data").textContent);
  var params = new URLSearchParams(location.search);
  var slug = EV[params.get("evento")] ? params.get("evento") : "congreso-andesco-2027";
  var ev = EV[slug], isCongreso = slug === "congreso-andesco-2027";
  var fmt = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
  function money(n) { return "$" + fmt.format(n); }

  var modes = ev.modalidad === "hibrido" ? ["presencial", "virtual"] : [ev.modalidad];
  var st = { mode: modes.indexOf(params.get("modo")) > -1 ? params.get("modo") : modes[0], af: null, company: null, idx: 0 };
  var fieldsets = $$("fieldset.step", form), stepLis = $$(".stepper li", form);
  var prevB = $("[data-prev]", form), nextB = $("[data-next]", form), subB = $("[data-submit]", form);

  /* Encabezado y resumen */
  document.title = "Inscripción: " + ev.name + " | Andesco";
  $("[data-ev-title]").textContent = "Inscripción: " + ev.name;
  var crumb = $("[data-ev-crumb]"); crumb.textContent = ev.name; crumb.href = ev.url;
  $("[data-sum-name]").textContent = ev.name;
  $("[data-sum-fecha]").textContent = ev.fechas + (ev.modalidad === "virtual" ? " · En línea" : " · " + ev.ciudad);
  $("[data-sum-img]").src = ev.img;
  if (ev.estado === "invitacion") {
    form.innerHTML = '<div class="validate validate--no"><span><b>Este evento es por invitación.</b> Si su empresa es finalista, escríbanos a andesco@andesco.org.co.</span></div>';
    return;
  }
  if (modes.length === 1) {
    var other = $$('input[name="modo"]', form).filter(function (r) { return r.value !== modes[0]; })[0];
    if (other) other.closest(".opt").hidden = true;
  }
  $$('input[name="modo"]', form).forEach(function (r) { r.checked = r.value === st.mode; });
  if (ev.modalidad !== "virtual") $("[data-modo-presencial]").textContent = ev.sede;

  function isFree() { return ev.af == null || (isCongreso && st.mode === "virtual"); }
  function unit() { if (isFree()) return 0; return st.af === "si" && st.company ? ev.af : ev.no; }
  function steps() {
    var s = [];
    if (modes.length > 1) s.push(1);
    if (!isFree()) s.push(2);
    s.push(3, 4);
    return s;
  }
  function attendees() { return $$("[data-att]", form); }

  function summary() {
    var n = attendees().length || 1, u = unit(), sub = u * n, iva = Math.round(sub * 0.19);
    $("[data-sum-modo]").textContent = st.mode === "virtual" ? "Virtual" : "Presencial";
    $("[data-sum-precio]").textContent = isFree() ? "Sin costo" : money(u) + " + IVA";
    $("[data-sum-n]").textContent = n;
    $("[data-sum-sub]").textContent = isFree() ? "—" : money(sub);
    $("[data-sum-iva]").textContent = isFree() ? "—" : money(iva);
    $("[data-sum-total]").textContent = isFree() ? "$0" : money(sub + iva);
    var box = $("[data-sum-af]"), txt = $("[data-sum-af-txt]");
    if (st.af === "si" && st.company) { box.hidden = false; txt.textContent = "Tarifa de afiliado para " + st.company.name + ". La factura llega a su empresa con el plazo de su afiliación."; }
    else if (!isFree() && st.af) { box.hidden = false; txt.textContent = "¿Su empresa se afilia a Andesco? Ahorraría " + money((ev.no - ev.af) * n) + " + IVA en este evento."; }
    else box.hidden = true;
    return { n: n, unit: u, sub: sub, iva: iva, total: sub + iva };
  }

  function show() {
    var s = steps(); if (st.idx >= s.length) st.idx = s.length - 1;
    var cur = s[st.idx];
    fieldsets.forEach(function (f) { f.hidden = +f.getAttribute("data-step") !== cur; });
    stepLis.forEach(function (li, i) {
      var n = i + 1; li.hidden = s.indexOf(n) < 0;
      li.classList.toggle("done", s.indexOf(n) > -1 && s.indexOf(n) < st.idx);
      if (n === cur) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    var lastLabel = $("span", stepLis[3]);
    if (lastLabel) lastLabel.textContent = isFree() ? "Confirmación" : (st.af === "si" && st.company) ? "Facturación" : "Pago";
    prevB.hidden = st.idx === 0;
    var last = st.idx === s.length - 1;
    nextB.hidden = last; subB.hidden = !last;
    if (cur === 4) payPanel();
    if (last) subB.textContent = isFree() ? "Confirmar registro" : st.af === "si" ? "Confirmar inscripción" : (($('input[name="metodo"]:checked', form) || {}).value === "factura" ? "Solicitar factura" : "Pagar " + money(summary().total));
    summary();
  }

  function payPanel() {
    var free = isFree(), afi = st.af === "si" && st.company;
    $("[data-pay-af]").hidden = !afi || free;
    $("[data-pay-no]").hidden = afi || free;
    $("[data-pay-free]").hidden = !free;
    $("[data-pay-legend]").textContent = free ? "Confirmación" : afi ? "Facturación a su empresa" : "Pago";
    var fact = $("[data-opt-factura]"); if (fact) fact.hidden = st.af === "persona";
    if (st.af === "persona") { var pse = $('input[name="metodo"][value="pse"]', form); if (pse && $('input[name="metodo"][value="factura"]', form).checked) pse.checked = true; }
  }

  /* Paso 1 */
  $$('input[name="modo"]', form).forEach(function (r) { r.addEventListener("change", function () { st.mode = r.value; show(); }); });

  /* Paso 2: afiliación */
  var afSi = $("[data-af-si]"), afNo = $("[data-af-no]"), nit = $("#i-nit"), nitOut = $("[data-nit-out]"), nitErr = $('[data-err="nit"]');
  $$('input[name="af"]', form).forEach(function (r) {
    r.addEventListener("change", function () {
      st.af = r.value; $('[data-err="af"]').hidden = true;
      afSi.hidden = r.value !== "si"; afNo.hidden = r.value !== "no";
      if (r.value !== "si") { st.company = null; nitOut.innerHTML = ""; }
      summary();
      if (r.value === "si") nit.focus();
    });
  });
  function validar() {
    var v = (nit.value || "").replace(/\D/g, "").slice(0, 9);
    nitErr.hidden = true; nit.removeAttribute("aria-invalid");
    if (v.length < 9) { nitErr.textContent = "Escriba los 9 dígitos del NIT, sin el dígito de verificación."; nitErr.hidden = false; nit.setAttribute("aria-invalid", "true"); nit.focus(); return false; }
    if (AF[v]) {
      st.company = { nit: v, name: AF[v] };
      nitOut.innerHTML = '<div class="validate validate--ok"><svg class="ic" aria-hidden="true"><use href="#i-check-c"/></svg><span><b>' + AF[v] + '</b> es empresa afiliada. Se aplica la tarifa preferencial de ' + money(ev.af) + ' + IVA y la factura llegará a su empresa.</span></div>';
    } else {
      st.company = null;
      nitOut.innerHTML = '<div class="validate validate--no"><svg class="ic" aria-hidden="true"><use href="#i-info"/></svg><span><b>No encontramos ese NIT entre las empresas afiliadas.</b> Revise el número o elija «No es afiliada» para continuar con la tarifa general. Si cree que es un error, escríbanos a andesco@andesco.org.co.</span></div>';
    }
    summary(); return !!st.company;
  }
  $("[data-validar]").addEventListener("click", validar);
  nit.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); validar(); } });
  nit.addEventListener("input", function () { if (st.company) { st.company = null; nitOut.innerHTML = ""; summary(); } });

  /* Paso 3: asistentes */
  var list = $("[data-attendees]"), tpl = $("[data-att-tpl]"), addB = $("[data-add]"), seq = 0;
  function renumber() {
    attendees().forEach(function (a, i) {
      $("[data-n]", a).textContent = i + 1;
      $("[data-remove]", a).hidden = i === 0;
    });
    addB.hidden = attendees().length >= 10;
    summary();
  }
  function addAttendee(focus) {
    seq++;
    var node = tpl.content.firstElementChild.cloneNode(true);
    $$(".field", node).forEach(function (f, i) {
      var inp = $("input", f), lab = $("label", f), id = "att-" + seq + "-" + i;
      inp.id = id; lab.setAttribute("for", id);
      inp.addEventListener("blur", function () { if (inp.value || inp.getAttribute("aria-invalid")) A.check(inp); });
      inp.addEventListener("input", function () { if (inp.getAttribute("aria-invalid")) A.check(inp); });
    });
    $("[data-remove]", node).addEventListener("click", function () { node.remove(); renumber(); show(); });
    list.appendChild(node); renumber();
    if (focus) $("input", node).focus();
  }
  addB.addEventListener("click", function () { addAttendee(true); show(); });
  addAttendee(false);

  /* Paso 4 */
  $$('input[name="metodo"]', form).forEach(function (r) { r.addEventListener("change", show); });
  var consent = $("[data-consent]");
  consent.addEventListener("change", function () { if (consent.checked) $('[data-err="datos"]').hidden = true; });

  function validStep(n) {
    if (n === 1) return true;
    if (n === 2) {
      if (!st.af) { $('[data-err="af"]').hidden = false; $('input[name="af"]', form).focus(); return false; }
      if (st.af === "si" && !st.company) { if (!validar()) return false; }
      return true;
    }
    if (n === 3) {
      var bad = $$("input", list).filter(function (i) { return !A.check(i); });
      if (bad.length) { bad[0].focus(); return false; }
      return true;
    }
    if (n === 4) {
      var ok = true;
      if (st.af === "si" && st.company && !isFree()) {
        var f = $("#i-fact"); f.required = true;
        if (!A.check(f)) { f.focus(); ok = false; }
      }
      if (!consent.checked) { $('[data-err="datos"]').hidden = false; if (ok) consent.focus(); ok = false; }
      return ok;
    }
    return true;
  }

  nextB.addEventListener("click", function () {
    var s = steps();
    if (!validStep(s[st.idx])) return;
    st.idx++; show();
    var fs = fieldsets.filter(function (f) { return !f.hidden; })[0];
    var lg = fs && $("legend", fs); if (lg) { lg.tabIndex = -1; lg.focus(); }
    form.scrollIntoView({ block: "start" });
  });
  prevB.addEventListener("click", function () { st.idx = Math.max(0, st.idx - 1); show(); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validStep(4)) return;
    var sum = summary(), metodo = ($('input[name="metodo"]:checked', form) || {}).value;
    var names = attendees().map(function (a) { return $('input[name="a-nombre"]', a).value.trim(); });
    var rec = {
      tipo: "inscripcion", t: Date.now(), slug: slug,
      evento: { name: ev.name, fechas: ev.fechas, sede: ev.modalidad === "virtual" || st.mode === "virtual" ? "En línea" : ev.sede, url: ev.url, ics: ev.ics },
      modo: st.mode, afiliada: !!(st.af === "si" && st.company), empresa: st.company ? st.company.name : ($("#i-emp").value || ""),
      asistentes: names, total: sum.total, gratis: isFree(), metodo: isFree() ? null : (st.af === "si" && st.company ? "factura-afiliada" : metodo),
      factura: ($("#i-fact") || {}).value || ""
    };
    try { sessionStorage.setItem("andesco:ultima", JSON.stringify(rec)); } catch (err) {}
    var go = function () { location.href = form.getAttribute("action") + "?tipo=inscripcion&evento=" + encodeURIComponent(slug); };
    if (!rec.gratis && !rec.afiliada && (metodo === "pse" || metodo === "tarjeta")) {
      var ov = document.createElement("div"); ov.className = "paying"; ov.setAttribute("role", "status");
      ov.innerHTML = '<div><span class="spinner" aria-hidden="true"></span><p><b>Conectando con ' + (metodo === "pse" ? "PSE" : "la pasarela de pagos") + '…</b><br>En el demo el pago se aprueba automáticamente.</p></div>';
      document.body.appendChild(ov); setTimeout(go, 1500);
    } else go();
  });

  show();
})();
