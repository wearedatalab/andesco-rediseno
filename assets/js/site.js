/* Andesco · demo · comportamiento compartido (sin dependencias) */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  var toastT;
  function toast(msg) {
    var t = $(".toast");
    if (!t) { t = doc.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); doc.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 3200);
  }
  window.andesco = { toast: toast, store: store, $: $, $$: $$ };

  /* Barra de demo */
  var bar = $("#demo-bar");
  if (bar && store("andesco:demo-bar") === "1") bar.hidden = true;
  $$("[data-dismiss-demo]").forEach(function (b) { b.addEventListener("click", function () { bar.hidden = true; store("andesco:demo-bar", "1"); }); });

  /* Menú principal (patrón de divulgación) */
  var navBtns = $$(".nav__btn");
  function closeAll(except) {
    navBtns.forEach(function (b) {
      if (b === except) return;
      b.setAttribute("aria-expanded", "false");
      var p = doc.getElementById(b.getAttribute("aria-controls")); if (p) p.hidden = true;
    });
  }
  navBtns.forEach(function (b) {
    var panel = doc.getElementById(b.getAttribute("aria-controls"));
    b.addEventListener("click", function () {
      var open = b.getAttribute("aria-expanded") === "true";
      closeAll(b);
      b.setAttribute("aria-expanded", String(!open));
      if (panel) panel.hidden = open;
    });
    b.parentElement.addEventListener("focusout", function (e) {
      if (!b.parentElement.contains(e.relatedTarget)) { b.setAttribute("aria-expanded", "false"); if (panel) panel.hidden = true; }
    });
  });
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var open = navBtns.filter(function (b) { return b.getAttribute("aria-expanded") === "true"; })[0];
    if (open) { closeAll(); open.focus(); }
  });
  doc.addEventListener("click", function (e) { if (!e.target.closest(".nav")) closeAll(); });

  /* Menú móvil */
  var drawer = $("#drawer"), menuBtn = $(".hdr__menu");
  if (drawer && menuBtn) {
    menuBtn.addEventListener("click", function () {
      if (typeof drawer.showModal === "function") drawer.showModal(); else drawer.setAttribute("open", "");
      menuBtn.setAttribute("aria-expanded", "true");
    });
    drawer.addEventListener("close", function () { menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus(); });
    $$("[data-close]", drawer).forEach(function (b) { b.addEventListener("click", function () { drawer.close(); }); });
    drawer.addEventListener("click", function (e) { if (e.target === drawer) drawer.close(); });
  }

  /* Pestañas genéricas (sectores) */
  $$("[data-tabs]").forEach(function (box) {
    var tabs = $$('[role="tab"]', box);
    function select(t, focus) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1;
        var p = doc.getElementById(x.getAttribute("aria-controls")); if (p) p.hidden = !on;
      });
      if (focus) t.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, n = null;
        if (k === "ArrowRight" || k === "ArrowDown") n = tabs[(i + 1) % tabs.length];
        if (k === "ArrowLeft" || k === "ArrowUp") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (k === "Home") n = tabs[0];
        if (k === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    select(tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0]);
  });

  /* Movimiento del héroe: pausa (WCAG 2.2.2) y movimiento reducido */
  var svgs = $$(".hero__lines, .cg-hero__lines");
  var pauseBtn = $("[data-pause]");
  function setPaused(p) {
    svgs.forEach(function (s) { if (s.pauseAnimations) { p ? s.pauseAnimations() : s.unpauseAnimations(); } s.querySelectorAll(".pulses").forEach(function (g) { g.style.display = p ? "none" : ""; }); });
    if (pauseBtn) {
      pauseBtn.setAttribute("aria-pressed", String(p));
      pauseBtn.querySelector("span").textContent = p ? "Reanudar movimiento" : "Pausar movimiento";
      var use = pauseBtn.querySelector("use"); if (use) use.setAttribute("href", p ? "#i-play" : "#i-pause");
    }
    store("andesco:motion", p ? "off" : "on");
  }
  if (svgs.length) {
    if (reduce || store("andesco:motion") === "off") setPaused(true);
    if (pauseBtn) pauseBtn.addEventListener("click", function () { setPaused(pauseBtn.getAttribute("aria-pressed") !== "true"); });
  }

  /* Cuenta regresiva */
  $$("[data-countdown]").forEach(function (el) {
    var target = new Date(el.getAttribute("data-countdown")).getTime();
    function tick() {
      var ms = Math.max(0, target - Date.now());
      var dd = Math.floor(ms / 864e5), hh = Math.floor(ms % 864e5 / 36e5), mm = Math.floor(ms % 36e5 / 6e4);
      var set = function (k, v) { var n = el.querySelector('[data-cd="' + k + '"]'); if (n) n.textContent = k === "d" ? v : String(v).padStart(2, "0"); };
      set("d", dd); set("h", hh); set("m", mm);
    }
    tick(); setInterval(tick, 30000);
  });

  /* Aparición al hacer scroll */
  var rev = $$(".reveal");
  if (rev.length && "IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -10% 0px" });
    rev.forEach(function (r) { io.observe(r); });
  } else { rev.forEach(function (r) { r.classList.add("in"); }); }

  /* Validación de formularios (al salir del campo y al enviar) */
  function fieldError(input, msg) {
    var f = input.closest(".field") || input.parentElement;
    var id = (input.id || input.name) + "-err";
    var e = doc.getElementById(id);
    if (!msg) {
      input.removeAttribute("aria-invalid");
      if (e) e.remove();
      var db = (input.getAttribute("aria-describedby") || "").replace(id, "").trim();
      db ? input.setAttribute("aria-describedby", db) : input.removeAttribute("aria-describedby");
      return true;
    }
    input.setAttribute("aria-invalid", "true");
    if (!e) { e = doc.createElement("p"); e.className = "err"; e.id = id; f.appendChild(e); }
    e.textContent = msg;
    var desc = input.getAttribute("aria-describedby") || "";
    if (desc.indexOf(id) < 0) input.setAttribute("aria-describedby", (desc + " " + id).trim());
    return false;
  }
  function check(input) {
    if (input.type === "checkbox") return fieldError(input, input.required && !input.checked ? "Debe aceptar para continuar." : "");
    var v = input.value.trim();
    if (input.required && !v) return fieldError(input, "Este campo es obligatorio.");
    if (v && input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return fieldError(input, "Escriba un correo válido, por ejemplo nombre@empresa.com.");
    if (v && input.pattern && !new RegExp("^(?:" + input.pattern + ")$").test(v)) return fieldError(input, "Revise el formato: " + (input.getAttribute("title") || "solo números, sin puntos") + ".");
    return fieldError(input, "");
  }
  window.andesco.check = check; window.andesco.fieldError = fieldError;
  $$("form[data-form]").forEach(function (form) {
    var inputs = $$("input,select,textarea", form).filter(function (i) { return i.type !== "hidden"; });
    inputs.forEach(function (i) {
      i.addEventListener("blur", function () { if (i.value || i.getAttribute("aria-invalid")) check(i); });
      i.addEventListener("input", function () { if (i.getAttribute("aria-invalid")) check(i); });
      i.addEventListener("change", function () { if (i.type === "checkbox") check(i); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = inputs.filter(function (i) { return !check(i); });
      if (bad.length) { bad[0].focus(); return; }
      var data = {}; inputs.forEach(function (i) { data[i.name] = i.type === "checkbox" ? i.checked : i.value; });
      var tipo = form.getAttribute("data-form");
      try { sessionStorage.setItem("andesco:ultima", JSON.stringify({ tipo: tipo, data: data, t: Date.now() })); } catch (err) {}
      location.href = form.getAttribute("action") + "?tipo=" + encodeURIComponent(tipo);
    });
  });

  /* Imprimir (la agenda muestra todos los días al imprimir) */
  $$("[data-print]").forEach(function (b) { b.addEventListener("click", function () { window.print(); }); });

  /* Compartir */
  $$("[data-share]").forEach(function (b) {
    b.addEventListener("click", function () {
      var data = { title: doc.title, url: location.href };
      if (navigator.share) { navigator.share(data).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { toast("Enlace copiado"); });
    });
  });

  /* Barra fija de inscripción en móvil */
  var sticky = $("[data-sticky]"), evHero = $(".ev-hero");
  if (sticky && evHero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { sticky.classList.toggle("is-on", !es[0].isIntersecting); }).observe(evHero);
  }

  /* Perfil de conferencista en diálogo */
  var dlg = $("#spk-dlg");
  if (dlg) {
    var opener = null;
    $$("[data-spk]").forEach(function (b) {
      b.addEventListener("click", function () {
        var card = b.closest(".spk__card");
        var tpl = $("template[data-bio]", card);
        $("[data-dlg-body]", dlg).innerHTML = tpl ? tpl.innerHTML : "";
        var pic = $("picture", card);
        $("[data-dlg-img]", dlg).innerHTML = pic ? pic.outerHTML : "";
        opener = b;
        if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
        var h = $("h2", dlg); if (h) { h.tabIndex = -1; h.focus(); }
      });
    });
    $$("[data-close]", dlg).forEach(function (b) { b.addEventListener("click", function () { dlg.close(); }); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { if (opener) opener.focus(); });
    if (location.hash) {
      var target = doc.getElementById(location.hash.slice(1));
      var btn = target && $("[data-spk]", target);
      if (btn) setTimeout(function () { btn.click(); }, 300);
    }
  }
})();
