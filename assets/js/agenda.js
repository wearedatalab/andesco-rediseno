/* Andesco · agenda interactiva: días en pestañas, filtros, búsqueda, «Mi agenda» y exportación .ics */
(function () {
  "use strict";
  var A = window.andesco, $ = A.$, $$ = A.$$;

  function norm(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function utc(local) { // "2027-09-22T08:30" en hora de Colombia (UTC−5) → 20270922T133000Z
    var d = new Date(local + ":00-05:00");
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }
  function esc(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
  function vevent(ses) {
    var h = $("h2,h3,h4", ses);
    var place = ses.getAttribute("data-room") + (document.title.indexOf("Congreso") > -1 ? ", Hotel Las Américas, Cartagena" : "");
    return ["BEGIN:VEVENT", "UID:" + ses.id + "@andesco.org.co", "DTSTAMP:" + utc(new Date(Date.now() - 5 * 36e5).toISOString().slice(0, 16)),
      "DTSTART:" + utc(ses.getAttribute("data-ini")), "DTEND:" + utc(ses.getAttribute("data-fin")),
      "SUMMARY:" + esc(h ? h.textContent : "Sesión"), "LOCATION:" + esc(place),
      "URL:" + location.origin + location.pathname + "#" + ses.id, "END:VEVENT"];
  }
  function download(name, lines) {
    var body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Andesco//Agenda//ES"].concat(lines, ["END:VCALENDAR"]).join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar;charset=utf-8" }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  $$("[data-agenda]").forEach(function (box) {
    var key = "andesco:agenda:" + box.getAttribute("data-agenda");
    var tabs = $$('[role="tab"]', box), days = $$(".aday", box), sessions = $$(".ses", box);
    var search = $("[data-asearch]", box), fmt = $("[data-afmt]", box), mineBtn = $("[data-mine]", box), mineN = $("[data-mine-n]", box);
    var chips = $$(".afilters [data-linea]", box), count = $("[data-acount]", box), empty = $("[data-aempty]", box);
    var st = { lineas: [], fmt: "", q: "", mine: false };
    var fav = [];
    try { fav = JSON.parse(A.store(key) || "[]"); } catch (e) { fav = []; }

    function selectDay(t, focus) {
      tabs.forEach(function (x) {
        var on = x === t; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1;
        var p = document.getElementById(x.getAttribute("aria-controls")); if (p) p.hidden = !on;
      });
      if (focus) t.focus();
      apply();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { selectDay(t); });
      t.addEventListener("keydown", function (e) {
        var n = e.key === "ArrowRight" ? tabs[(i + 1) % tabs.length] : e.key === "ArrowLeft" ? tabs[(i - 1 + tabs.length) % tabs.length] : null;
        if (n) { e.preventDefault(); selectDay(n, true); }
      });
    });

    function paintFav() {
      sessions.forEach(function (s) { var b = $("[data-star]", s); if (b) b.setAttribute("aria-pressed", String(fav.indexOf(s.id) > -1)); });
      if (mineN) mineN.textContent = fav.length;
      A.store(key, JSON.stringify(fav));
    }
    function apply() {
      var q = norm(st.q), visible = 0;
      sessions.forEach(function (s) {
        var ls = s.getAttribute("data-lineas").split(" "), ok = true;
        if (st.lineas.length && !st.lineas.some(function (l) { return ls.indexOf(l) > -1; })) ok = false;
        if (st.fmt && s.getAttribute("data-fmt") !== st.fmt) ok = false;
        if (q && s.getAttribute("data-text").indexOf(q) < 0) ok = false;
        if (st.mine && fav.indexOf(s.id) < 0) ok = false;
        s.classList.toggle("is-hidden", !ok);
      });
      $$(".slot", box).forEach(function (sl) { sl.classList.toggle("is-hidden", !$$(".ses", sl).some(function (s) { return !s.classList.contains("is-hidden"); })); });
      var day = days.filter(function (d) { return !d.hidden; })[0];
      if (day) visible = $$(".ses", day).filter(function (s) { return !s.classList.contains("is-hidden"); }).length;
      var filtered = st.lineas.length || st.fmt || q || st.mine;
      if (count) count.textContent = filtered ? visible + " sesiones en este día" : "";
      if (empty) empty.hidden = !(filtered && visible === 0);
      $$("[data-areset]", box).forEach(function (b) { b.hidden = !filtered; });
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(st.lineas.indexOf(c.getAttribute("data-linea")) > -1)); });
      if (mineBtn) mineBtn.setAttribute("aria-pressed", String(st.mine));
    }
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var l = c.getAttribute("data-linea"), i = st.lineas.indexOf(l);
        i > -1 ? st.lineas.splice(i, 1) : st.lineas.push(l); apply();
      });
    });
    if (fmt) fmt.addEventListener("change", function () { st.fmt = fmt.value; apply(); });
    if (search) search.addEventListener("input", function () { st.q = search.value; apply(); });
    if (mineBtn) mineBtn.addEventListener("click", function () {
      if (!fav.length && !st.mine) { A.toast("Marque sesiones con la estrella para armar su agenda"); return; }
      st.mine = !st.mine; apply();
    });
    $$("[data-areset],[data-areset2]", box).forEach(function (b) {
      b.addEventListener("click", function () { st = { lineas: [], fmt: "", q: "", mine: false }; if (fmt) fmt.value = ""; if (search) search.value = ""; apply(); });
    });
    sessions.forEach(function (s) {
      var star = $("[data-star]", s), ics = $("[data-ics]", s);
      if (star) star.addEventListener("click", function () {
        var i = fav.indexOf(s.id);
        if (i > -1) { fav.splice(i, 1); A.toast("Quitada de su agenda"); } else { fav.push(s.id); A.toast("Agregada a su agenda"); }
        paintFav(); apply();
      });
      if (ics) ics.addEventListener("click", function () { download(s.id + ".ics", vevent(s)); });
    });
    $$("[data-mine-ics]").forEach(function (b) {
      b.addEventListener("click", function () {
        var picked = sessions.filter(function (s) { return fav.indexOf(s.id) > -1; });
        if (!picked.length) { A.toast("Primero marque con la estrella las sesiones que quiere"); return; }
        var lines = []; picked.forEach(function (s) { lines = lines.concat(vevent(s)); });
        download("mi-agenda-andesco.ics", lines);
      });
    });

    /* Al imprimir se muestran todos los días */
    var hiddenBefore = [];
    window.addEventListener("beforeprint", function () { hiddenBefore = days.filter(function (d) { return d.hidden; }); hiddenBefore.forEach(function (d) { d.hidden = false; }); });
    window.addEventListener("afterprint", function () { hiddenBefore.forEach(function (d) { d.hidden = true; }); });

    paintFav();
    var target = location.hash && document.getElementById(location.hash.slice(1));
    var targetDay = target && target.closest ? target.closest(".aday") : null;
    var startTab = targetDay ? tabs[days.indexOf(targetDay)] : tabs[0];
    if (startTab) selectDay(startTab); else apply();
    if (target && targetDay) setTimeout(function () { target.scrollIntoView({ block: "center" }); target.style.boxShadow = "0 0 0 3px var(--focus)"; }, 120);
  });
})();
