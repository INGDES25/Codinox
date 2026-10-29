/* Codinox / CNX : affichage des versions et des vidéos à partir de data/releases.js (aucune dépendance). */
(function () {
  "use strict";
  var DATA = window.CODINOX_SITE || { products: {}, videos: [], repo: "" };
  var PLATFORM = { windows: "Windows", linux: "Linux", mac: "macOS" };

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  /* identifiant d'une vidéo YouTube (youtu.be/ID, watch?v=ID, shorts/ID, embed/ID) ; "" si ce n'est pas YouTube */
  function ytId(u) {
    var m = /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#\/]|$)/.exec(u || "");
    return m ? m[1] : "";
  }
  function safeUrl(u) { return /^(https?:\/\/|\.{0,2}\/|[A-Za-z0-9_\-][^:]*$)/.test(u || "") ? u : ""; }

  /* ---------- thème ---------- */
  function setTheme(t) {
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
  }
  try { setTheme(localStorage.getItem("codinox-theme")); } catch (e) {}
  function isDark() {
    var t = document.documentElement.getAttribute("data-theme");
    return t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function initThemeButton() {
    var b = document.querySelector(".theme-btn");
    if (!b) return;
    function label() { b.textContent = isDark() ? "☀ Clair" : "☾ Sombre"; }
    label();
    b.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      setTheme(next);
      try { localStorage.setItem("codinox-theme", next); } catch (e) {}
      label();
    });
  }

  /* ---------- versions ---------- */
  function osGuess() {
    var s = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "") + " " + (navigator.userAgent || "");
    s = s.toLowerCase();
    if (s.indexOf("win") >= 0) return "windows";
    if (s.indexOf("mac") >= 0 || s.indexOf("iphone") >= 0 || s.indexOf("ipad") >= 0) return "mac";
    if (s.indexOf("linux") >= 0 || s.indexOf("x11") >= 0 || s.indexOf("android") >= 0) return "linux";
    return "";
  }
  var OS = osGuess();

  function cmpVersion(a, b) {
    var x = String(a).split(/[.\-]/), y = String(b).split(/[.\-]/);
    for (var i = 0; i < Math.max(x.length, y.length); i++) {
      var p = parseInt(x[i] || "0", 10), q = parseInt(y[i] || "0", 10);
      if (isNaN(p)) p = 0; if (isNaN(q)) q = 0;
      if (p !== q) return p - q;
    }
    return 0;
  }
  function versionsOf(key) {
    var p = DATA.products[key];
    var list = (p && p.versions ? p.versions.slice() : []);
    list.sort(function (a, b) { return cmpVersion(b.version, a.version); });
    return list;
  }
  function frDate(s) {
    var m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(s || "");
    if (!m) return s || "";
    var mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    var txt = mois[parseInt(m[2], 10) - 1] + " " + m[1];
    return m[3] ? (parseInt(m[3], 10) === 1 ? "1er" : String(parseInt(m[3], 10))) + " " + txt : txt;
  }
  function fileButton(f, small) {
    var url = safeUrl(f.url);
    var plat = PLATFORM[f.platform] || "";
    var label = f.label || plat || "Télécharger";
    var btn = url
      ? el("a", { "class": "btn" + (small ? " small" : ""), href: url, rel: "noopener" }, ["⬇ " + label])
      : el("span", { "class": "btn" + (small ? " small" : ""), "aria-disabled": "true" }, ["Bientôt disponible : " + (plat || label)]);
    var meta = [];
    if (url && f.size) meta.push(f.size);
    var box = el("div", { "class": "file" }, [btn]);
    if (url && f.platform && f.platform === OS) box.appendChild(el("small", { "class": "reco", text: "✓ Recommandé pour votre système" }));
    else if (meta.length) box.appendChild(el("small", { text: meta.join(" · ") }));
    if (url && f.platform === OS && f.size) box.appendChild(el("small", { text: f.size }));
    return box;
  }
  function sortedFiles(v) {
    return (v.files || []).slice().sort(function (a, b) { return (b.platform === OS) - (a.platform === OS); });
  }
  function notesList(v) {
    if (!v.notes || !v.notes.length) return null;
    var ul = el("ul", { "class": "notes" });
    v.notes.forEach(function (n) { ul.appendChild(el("li", { text: n })); });
    return ul;
  }

  function renderLatest(node) {
    var key = node.getAttribute("data-latest");
    var list = versionsOf(key);
    var name = (DATA.products[key] || {}).name || key;
    node.textContent = "";
    if (!list.length) { node.appendChild(el("div", { "class": "empty", text: "Aucune version publiée pour le moment." })); return; }
    var v = list[0];
    var compact = node.getAttribute("data-mode") === "compact";
    if (compact) {
      var files = el("div", { "class": "files" });
      sortedFiles(v).forEach(function (f) { files.appendChild(fileButton(f, true)); });
      node.appendChild(el("p", { "class": "card-ver" }, [el("span", { "class": "badge ok", text: "Dernière version : " + v.version })]));
      node.appendChild(files);
      return;
    }
    var head = el("div", {}, [el("span", { "class": "ver", text: name + " " + v.version }),
      v.date ? el("span", { "class": "meta", text: frDate(v.date) }) : null,
      el("span", { "class": "badge ok", style: "margin-left:12px", text: "Dernière version" })]);
    node.appendChild(head);
    var files2 = el("div", { "class": "files" });
    sortedFiles(v).forEach(function (f) { files2.appendChild(fileButton(f, false)); });
    node.appendChild(files2);
    var nl = notesList(v);
    if (nl) { node.appendChild(el("strong", { text: "Nouveautés" })); node.appendChild(nl); }
  }

  function renderHistory(node) {
    var key = node.getAttribute("data-history");
    var list = versionsOf(key);
    var name = (DATA.products[key] || {}).name || key;
    node.textContent = "";
    if (list.length < 2) {
      node.appendChild(el("p", { "class": "sub", text: "Les versions précédentes apparaîtront ici à chaque mise à jour." }));
      return;
    }
    list.slice(1).forEach(function (v) {
      var d = el("details", { "class": "release" });
      d.appendChild(el("summary", {}, [name + " " + v.version, v.date ? el("span", { "class": "date", text: frDate(v.date) }) : null]));
      var body = el("div", { "class": "body" });
      var nl = notesList(v);
      if (nl) body.appendChild(nl);
      var files = el("div", { "class": "files" });
      sortedFiles(v).forEach(function (f) { files.appendChild(fileButton(f, true)); });
      body.appendChild(files);
      d.appendChild(body);
      node.appendChild(d);
    });
  }

  function initHeroButtons() {
    document.querySelectorAll("[data-hero-dl]").forEach(function (a) {
      var key = a.getAttribute("data-hero-dl");
      var list = versionsOf(key);
      var name = (DATA.products[key] || {}).name || key;
      if (!list.length) return;
      var v = list[0];
      var f = (v.files || []).filter(function (x) { return x.platform === OS && safeUrl(x.url); })[0];
      a.textContent = "⬇ Télécharger " + name + " " + v.version;
      a.setAttribute("href", f ? safeUrl(f.url) : "telechargements.html#" + key);
    });
  }

  /* ---------- vidéos ---------- */
  function renderVideos(node) {
    var vids = (DATA.videos || []).slice();
    var tabsNode = document.getElementById("video-tabs");
    var current = "all";
    function draw() {
      node.textContent = "";
      var shown = vids.filter(function (v) { return current === "all" || v.product === current; });
      if (!shown.length) {
        node.appendChild(el("div", { "class": "empty" }, [
          el("p", { text: vids.length ? "Aucune vidéo dans cette catégorie." : "Les vidéos de prise en main arrivent bientôt." }),
          el("p", { text: "Elles seront à regarder ici et sur notre chaîne YouTube dès leur publication." })]));
        return;
      }
      var grid = el("div", { "class": "grid three" });
      shown.forEach(function (v) {
        var card = el("article", { "class": "card video" });
        card.appendChild(el("span", { "class": "badge tag", text: ({ codinox: "Codinox", cnx: "CNX" })[v.product] || "Général" }));
        card.appendChild(el("h3", { text: v.title || "Sans titre" }));
        if (v.description) card.appendChild(el("p", { text: v.description }));
        var meta = [v.duration, v.date ? frDate(v.date) : "", v.size].filter(Boolean).join(" · ");
        if (meta) card.appendChild(el("p", { text: meta }));
        var id = ytId(v.watch);
        if (id) {
          var box = el("div", { "class": "player" });
          var play = el("button", { "class": "player-btn", type: "button", "aria-label": "Lire la vidéo : " + (v.title || "") }, [el("span", { "aria-hidden": "true", text: "▶" }), el("span", { text: "Lire la vidéo ici" })]);
          play.addEventListener("click", function () {
            box.textContent = "";
            box.appendChild(el("iframe", { src: "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0", title: v.title || "Vidéo",
              allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen", allowfullscreen: "", referrerpolicy: "strict-origin-when-cross-origin" }));
          });
          box.appendChild(play);
          card.insertBefore(box, card.firstChild);
        }
        var act = el("div", { "class": "actions" });
        if (safeUrl(v.url)) act.appendChild(el("a", { "class": "btn small", href: safeUrl(v.url), rel: "noopener" }, ["⬇ Télécharger"]));
        if (safeUrl(v.watch)) act.appendChild(el("a", { "class": "btn small secondary", href: safeUrl(v.watch), rel: "noopener" }, [(id ? "▶ Ouvrir sur YouTube" : "▶ Voir en ligne")]));
        card.appendChild(act);
        grid.appendChild(card);
      });
      node.appendChild(grid);
    }
    if (tabsNode) {
      [["all", "Toutes"], ["codinox", "Codinox"], ["cnx", "CNX"]].forEach(function (t) {
        var b = el("button", { "class": "tab", type: "button", "aria-pressed": t[0] === "all" ? "true" : "false", text: t[1] });
        b.addEventListener("click", function () {
          current = t[0];
          tabsNode.querySelectorAll(".tab").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
          draw();
        });
        tabsNode.appendChild(b);
      });
    }
    draw();
  }

  function init() {
    initThemeButton();
    document.querySelectorAll("[data-latest]").forEach(renderLatest);
    document.querySelectorAll("[data-history]").forEach(renderHistory);
    initHeroButtons();
    var vn = document.getElementById("videos");
    if (vn) renderVideos(vn);
    document.querySelectorAll(".repo-link").forEach(function (a) { if (DATA.repo) a.setAttribute("href", DATA.repo); });
    document.querySelectorAll(".yt-link, .yt-btn").forEach(function (a) { if (/^https:\/\/(www\.)?youtube\.com\//.test(DATA.youtube || "")) a.setAttribute("href", DATA.youtube); });
    document.querySelectorAll("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
