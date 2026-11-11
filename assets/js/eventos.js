/* Andesco · calendario de eventos: filtros por tipo, línea y modalidad, sincronizados con la URL */
(function () {
  "use strict";
  var A = window.andesco, $ = A.$, $$ = A.$$;
  var list = $("[data-evlist]"); if (!list) return;
  var rows = $$(".erow", list), months = $$("[data-month]", list), stations = $$(".ymap .st");
  var segBtns = $$(".seg [data-tipo]"), chips = $$(".filters [data-linea]"), mod = $("[data-fmod]");
  var countEl = $("[data-fcount]"), empty = $("[data-fempty]"), reset = $("[data-freset]");
  var st = { tipo: "", lineas: [], mod: "" };

  function readUrl() {
    var p = new URLSearchParams(location.search);
    st.tipo = p.get("tipo") || "";
    st.lineas = (p.get("linea") || "").split(",").filter(Boolean);
    st.mod = p.get("modalidad") || "";
  }
  function writeUrl() {
    var p = new URLSearchParams();
    if (st.tipo) p.set("tipo", st.tipo);
    if (st.lineas.length) p.set("linea", st.lineas.join(","));
    if (st.mod) p.set("modalidad", st.mod);
    var q = p.toString();
    history.replaceState(null, "", location.pathname + (q ? "?" + q : "") + location.hash);
  }
  function match(el) {
    var t = el.getAttribute("data-tipo"), ls = (el.getAttribute("data-lineas") || "").split(" "), m = el.getAttribute("data-modalidad");
    if (st.tipo && t !== st.tipo) return false;
    if (st.lineas.length && !st.lineas.some(function (l) { return ls.indexOf(l) > -1; })) return false;
    if (st.mod && m && m !== st.mod) return false;
    return true;
  }
  function apply() {
    var n = 0;
    rows.forEach(function (r) { var ok = match(r); r.hidden = !ok; if (ok) n++; });
    months.forEach(function (m) { m.hidden = !$$(".erow", m).some(function (r) { return !r.hidden; }); });
    stations.forEach(function (s) { s.classList.toggle("is-dim", !match(s)); });
    $$(".ymap [data-row]").forEach(function (g) { g.classList.toggle("is-dim", st.lineas.length > 0 && st.lineas.indexOf(g.getAttribute("data-row")) < 0); });
    countEl.textContent = n;
    empty.hidden = n > 0;
    reset.hidden = !(st.tipo || st.lineas.length || st.mod);
    segBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-tipo") === st.tipo)); });
    chips.forEach(function (c) { c.setAttribute("aria-pressed", String(st.lineas.indexOf(c.getAttribute("data-linea")) > -1)); });
    if (mod) mod.value = st.mod;
  }
  segBtns.forEach(function (b) { b.addEventListener("click", function () { st.tipo = b.getAttribute("data-tipo"); apply(); writeUrl(); }); });
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var l = c.getAttribute("data-linea"), i = st.lineas.indexOf(l);
      i > -1 ? st.lineas.splice(i, 1) : st.lineas.push(l);
      apply(); writeUrl();
    });
  });
  if (mod) mod.addEventListener("change", function () { st.mod = mod.value; apply(); writeUrl(); });
  $$("[data-freset],[data-freset2]").forEach(function (b) { b.addEventListener("click", function () { st = { tipo: "", lineas: [], mod: "" }; apply(); writeUrl(); }); });
  readUrl(); apply();
  if (location.search && !location.hash) { var f = $("#listado"); if (f) setTimeout(function () { f.scrollIntoView(); }, 50); }
})();
