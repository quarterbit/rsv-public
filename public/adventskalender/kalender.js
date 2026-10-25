/* ==========================================================================
   Adventskalender „Antwort der Stadt“ — Komponente
   Erwartet window.RSV_ADVENT (Inhalte aus daten-*.js) und optional
   window.RSV_ADVENT_KONFIG = { ziel, sperre, jahr }.
   - ziel:   CSS-Selektor des Containers (Standard: #rsv-adventskalender)
   - sperre: true = Türchen öffnen sich erst an ihrem Datum (Dezember)
   - jahr:   Advents-Jahr für die Sperre
   URL-Parameter ?vorschau hebt die Sperre auf; #tuer-7 öffnet Türchen 7.
   ========================================================================== */
(function () {
  'use strict';

  var DATEN = window.RSV_ADVENT;
  var KONFIG = Object.assign(
    { ziel: '#rsv-adventskalender', sperre: false, jahr: 2026 },
    window.RSV_ADVENT_KONFIG || {}
  );
  var wurzel = document.querySelector(KONFIG.ziel);
  if (!DATEN || !wurzel) return;

  // Feste, „verstreute“ Anordnung wie bei einem echten Kalender.
  // Größere Türchen (24, 12, 6, 13) legt kalender.css je Spaltenzahl fest.
  var ANORDNUNG = [13, 7, 21, 2, 18, 10, 5, 24, 15, 1, 9, 20, 3, 16, 12, 6, 22, 11, 19, 4, 14, 8, 23, 17];

  var params = new URLSearchParams(window.location.search);
  var vorschau = params.has('vorschau');
  var imIframe = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  var wenigBewegung = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var speicherSchluessel = 'rsv-advent-' + KONFIG.jahr + '-' + DATEN.fassung;

  var tueren = {};
  DATEN.tueren.forEach(function (t) { tueren[t.nr] = t; });

  var geoeffnet = new Set(ladeGeoeffnet());
  var aktuelleNr = null;
  var letzteTuer = null;

  // ---------- Hilfen ----------
  function ladeGeoeffnet() {
    try {
      var roh = window.localStorage.getItem(speicherSchluessel);
      var liste = roh ? JSON.parse(roh) : [];
      return Array.isArray(liste) ? liste.filter(function (n) { return tueren[n]; }) : [];
    } catch (e) { return []; }
  }
  function speichereGeoeffnet() {
    try { window.localStorage.setItem(speicherSchluessel, JSON.stringify(Array.from(geoeffnet))); } catch (e) { /* egal */ }
  }
  function el(tag, klasse, html) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function urteil(schluessel) {
    return DATEN.urteile[schluessel] || { label: schluessel, icon: '•', farbe: '#4a5361', hell: '#eef0f3' };
  }
  function faerbe(e, u) {
    e.style.setProperty('--u-farbe', u.farbe);
    e.style.setProperty('--u-hell', u.hell);
  }
  function datumText(nr) { return nr + '. Dezember'; }
  function istVerfuegbar(nr) {
    if (!KONFIG.sperre || vorschau) return true;
    var heute = new Date();
    return heute >= new Date(KONFIG.jahr, 11, nr);
  }
  var ZAHLWORTE = ['keinem', 'einem', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'];
  function zahlwort(n) { return ZAHLWORTE[n] || String(n); }
  // {{anzahl:a,b}} → Anzahl der Türchen mit Urteil a oder b (als Zahlwort)
  function ersetzePlatzhalter(html) {
    return html.replace(/\{\{anzahl:([a-z0-9,]+)\}\}/g, function (_, liste) {
      var schluessel = liste.split(',');
      var n = DATEN.tueren.filter(function (t) { return schluessel.indexOf(t.urteil) >= 0; }).length;
      return zahlwort(n);
    });
  }
  function lfdText(lfd) {
    if (!lfd || !lfd.length) return '';
    return lfd.length === 1 ? 'Nr. ' + lfd[0] : 'Nr. ' + lfd.slice(0, -1).join(', ') + ' und ' + lfd[lfd.length - 1];
  }

  // ---------- Grundgerüst ----------
  wurzel.classList.add('rsv-ak');
  wurzel.innerHTML = '';
  var brett = el('section', 'ak-brett');
  brett.setAttribute('aria-label', DATEN.titel);

  var kopf = el('header', 'ak-kopf');
  kopf.appendChild(el('p', 'ak-kicker', DATEN.kicker));
  kopf.appendChild(el('h2', 'ak-titel', DATEN.titel));
  kopf.appendChild(el('div', 'ak-einleitung', DATEN.einleitung));
  var legende = el('ul', 'ak-legende');
  legende.setAttribute('aria-label', 'Legende');
  Object.keys(DATEN.urteile).forEach(function (k) {
    if (!DATEN.tueren.some(function (t) { return t.urteil === k; })) return;
    var u = urteil(k);
    var chip = el('li', 'ak-chip', '<span class="ak-icon" aria-hidden="true">' + u.icon + '</span>' + u.label);
    faerbe(chip, u);
    legende.appendChild(chip);
  });
  kopf.appendChild(legende);
  brett.appendChild(kopf);

  var raster = el('div', 'ak-raster');
  ANORDNUNG.forEach(function (nr) {
    var t = tueren[nr];
    if (!t) return;
    raster.appendChild(baueTuer(t));
  });
  brett.appendChild(raster);

  var hinweis = el('div', 'ak-hinweis');
  hinweis.setAttribute('role', 'status');
  hinweis.setAttribute('aria-live', 'polite');
  brett.appendChild(hinweis);

  if (DATEN.fussnote) brett.appendChild(el('p', 'ak-fuss', DATEN.fussnote));
  wurzel.appendChild(brett);

  // Popup
  var dialog = el('dialog', 'ak-dialog');
  dialog.setAttribute('aria-labelledby', 'ak-d-titel');
  dialog.innerHTML =
    '<div class="ak-d-kopf"><p class="ak-d-kicker"></p><h3 class="ak-d-titel" id="ak-d-titel"></h3>' +
    '<button type="button" class="ak-d-zu" aria-label="Schließen">×</button></div>' +
    '<div class="ak-d-inhalt"></div>' +
    '<div class="ak-d-navi"><button type="button" data-richtung="-1">← Vorheriges</button>' +
    '<button type="button" data-richtung="1">Nächstes →</button></div>';
  wurzel.appendChild(dialog);

  dialog.querySelector('.ak-d-zu').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (ev) {
    if (ev.target === dialog) dialog.close(); // Klick auf den abgedunkelten Hintergrund
  });
  dialog.addEventListener('close', function () {
    aktuelleNr = null;
    try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) { /* egal */ }
    if (letzteTuer) letzteTuer.focus();
  });
  dialog.querySelectorAll('.ak-d-navi button').forEach(function (b) {
    b.addEventListener('click', function () {
      var ziel = nachbar(aktuelleNr, Number(b.getAttribute('data-richtung')));
      if (ziel) oeffne(ziel, { sofort: true });
    });
  });

  // ---------- Türchen ----------
  function baueTuer(t) {
    var u = urteil(t.urteil);
    var b = el('button', 'ak-tuer ak-nr-' + t.nr);
    b.type = 'button';
    b.setAttribute('data-nr', t.nr);
    b.setAttribute('aria-haspopup', 'dialog');

    var innen = el('span', 'ak-innen');
    innen.setAttribute('aria-hidden', 'true');
    faerbe(innen, u);
    innen.appendChild(el('span', 'ak-innen-nr', String(t.nr)));
    innen.appendChild(el('span', 'ak-innen-urteil', '<span class="ak-innen-icon">' + u.icon + '</span><span class="ak-innen-label">' + u.label + '</span>'));
    innen.appendChild(el('span', 'ak-innen-teaser', t.teaser));

    var fluegel = el('span', 'ak-fluegel');
    fluegel.setAttribute('aria-hidden', 'true');
    var front = el('span', 'ak-front');
    front.appendChild(el('span', 'ak-zahl', t.nr + '<span class="ak-zahl-datum">' + datumText(t.nr) + '</span>'));
    front.appendChild(el('span', 'ak-schloss', '🔒'));
    fluegel.appendChild(front);
    fluegel.appendChild(el('span', 'ak-rueck'));

    b.appendChild(innen);
    b.appendChild(fluegel);
    aktualisiereTuer(b, t);
    b.addEventListener('click', function () { klickTuer(t.nr, b); });
    return b;
  }

  function aktualisiereTuer(b, t) {
    var verfuegbar = istVerfuegbar(t.nr);
    var offen = geoeffnet.has(t.nr) && verfuegbar;
    b.classList.toggle('ak-offen', offen);
    b.classList.toggle('ak-gesperrt', !verfuegbar);
    b.setAttribute('aria-label', !verfuegbar
      ? 'Türchen ' + t.nr + ': öffnet sich am ' + datumText(t.nr)
      : 'Türchen ' + t.nr + (offen ? ' (geöffnet): ' : ' öffnen: ') + t.titel);
  }

  function tuerElement(nr) { return raster.querySelector('.ak-tuer[data-nr="' + nr + '"]'); }

  var hinweisTimer = null;
  function zeigeHinweis(text) {
    hinweis.textContent = text;
    hinweis.classList.add('ak-sichtbar');
    clearTimeout(hinweisTimer);
    hinweisTimer = setTimeout(function () { hinweis.classList.remove('ak-sichtbar'); }, 2600);
  }

  function klickTuer(nr, b) {
    if (!istVerfuegbar(nr)) {
      b.classList.remove('ak-wackeln');
      void b.offsetWidth; // Animation neu starten
      b.classList.add('ak-wackeln');
      zeigeHinweis('Geduld! Dieses Türchen öffnet sich am ' + datumText(nr) + '.');
      return;
    }
    oeffne(nr, { sofort: geoeffnet.has(nr) });
  }

  function oeffne(nr, opt) {
    var t = tueren[nr];
    if (!t || !istVerfuegbar(nr)) return;
    var b = tuerElement(nr);
    letzteTuer = b;
    var warAuf = geoeffnet.has(nr);
    if (!warAuf) {
      geoeffnet.add(nr);
      speichereGeoeffnet();
      if (b) aktualisiereTuer(b, t);
    }
    var verzoegerung = (opt && opt.sofort) || warAuf || wenigBewegung ? 0 : 650;
    setTimeout(function () { zeigeDialog(t); }, verzoegerung);
  }

  function nachbar(nr, richtung) {
    var n = nr + richtung;
    while (n >= 1 && n <= 24) {
      if (tueren[n] && istVerfuegbar(n)) return n;
      n += richtung;
    }
    return null;
  }

  // ---------- Popup-Inhalt ----------
  function zeigeDialog(t) {
    var u = urteil(t.urteil);
    aktuelleNr = t.nr;
    dialog.querySelector('.ak-d-kicker').textContent = 'Türchen ' + t.nr + ' · ' + datumText(t.nr);
    dialog.querySelector('.ak-d-titel').textContent = t.titel;

    var inhalt = dialog.querySelector('.ak-d-inhalt');
    inhalt.innerHTML = '';
    var badge = el('p', 'ak-d-urteil', '<span class="ak-icon" aria-hidden="true">' + u.icon + '</span>' + u.label);
    faerbe(badge, u);
    inhalt.appendChild(badge);
    if (t.kurz) inhalt.appendChild(el('p', 'ak-d-kurz', ersetzePlatzhalter(t.kurz)));

    // Was die Stadt schreibt
    var zitate = t.zitat == null ? [] : (Array.isArray(t.zitat) ? t.zitat : [t.zitat]);
    var mitStadt = zitate.length || !t.bilanz; // Bilanz ohne Zitat braucht keinen Stadt-Block
    var stadt = el('section', 'ak-d-abschnitt');
    stadt.appendChild(el('h4', 'ak-d-h', DATEN.abschnitte.stadt));
    var bq = el('blockquote', 'ak-d-zitat');
    if (zitate.length) {
      zitate.forEach(function (z) { bq.appendChild(el('p', null, '„' + z + '“')); });
      bq.appendChild(el('footer', null, DATEN.quelleStadt + (t.lfd && t.lfd.length ? ', ' + lfdText(t.lfd) : '')));
    } else {
      bq.appendChild(el('p', null, t.ohneZitat || 'Dazu enthält die Rückmeldung keine Aussage.'));
      bq.appendChild(el('footer', null, DATEN.quelleStadt));
    }
    stadt.appendChild(bq);
    if (mitStadt) inhalt.appendChild(stadt);

    // Einordnung
    var einordnung = el('section', 'ak-d-abschnitt');
    einordnung.appendChild(el('h4', 'ak-d-h', DATEN.abschnitte.einordnung));
    einordnung.appendChild(el('div', 'ak-d-text', ersetzePlatzhalter(t.text)));
    if (t.bilanz) einordnung.appendChild(baueBilanz());
    inhalt.appendChild(einordnung);

    // Belege
    if (t.belege && t.belege.length) {
      var belege = el('section', 'ak-d-abschnitt');
      belege.appendChild(el('h4', 'ak-d-h', DATEN.abschnitte.belege));
      var ul = el('ul', 'ak-d-belege');
      t.belege.forEach(function (bl) { ul.appendChild(el('li', null, bl)); });
      belege.appendChild(ul);
      inhalt.appendChild(belege);
    }
    inhalt.scrollTop = 0;

    var zurueck = dialog.querySelector('[data-richtung="-1"]');
    var vor = dialog.querySelector('[data-richtung="1"]');
    var nZurueck = nachbar(t.nr, -1);
    var nVor = nachbar(t.nr, 1);
    zurueck.disabled = !nZurueck;
    vor.disabled = !nVor;
    zurueck.textContent = nZurueck ? '← Türchen ' + nZurueck : '← Vorheriges';
    vor.textContent = nVor ? 'Türchen ' + nVor + ' →' : 'Nächstes →';

    if (!dialog.open) dialog.showModal();
    if (imIframe) platziereImIframe();
    try { history.replaceState(null, '', '#tuer-' + t.nr); } catch (e) { /* egal */ }
  }

  function baueBilanz() {
    var box = el('div', 'ak-bilanz');
    Object.keys(DATEN.urteile).forEach(function (k) {
      var liste = DATEN.tueren.filter(function (t) { return t.urteil === k && !t.bilanz; });
      if (!liste.length) return;
      var u = urteil(k);
      var gruppe = el('div', 'ak-bilanz-gruppe');
      var chip = el('h4', 'ak-chip', '<span class="ak-icon" aria-hidden="true">' + u.icon + '</span>' + u.label + ' (' + liste.length + ')');
      faerbe(chip, u);
      gruppe.appendChild(chip);
      var ul = el('ul');
      liste.forEach(function (t) {
        var li = el('li');
        var btn = el('button', null, 'Türchen ' + t.nr + ': ' + t.titel);
        btn.type = 'button';
        if (!istVerfuegbar(t.nr)) { btn.disabled = true; btn.title = 'öffnet sich am ' + datumText(t.nr); }
        btn.addEventListener('click', function () { oeffne(t.nr, { sofort: true }); });
        li.appendChild(btn);
        ul.appendChild(li);
      });
      gruppe.appendChild(ul);
      box.appendChild(gruppe);
    });
    return box;
  }

  // ---------- Einbettung per iframe ----------
  // Im iframe läge ein zentriertes Popup ggf. außerhalb des sichtbaren
  // Bereichs. Es wird deshalb auf Höhe des angeklickten Türchens gesetzt;
  // die Elternseite kann per postMessage dorthin scrollen.
  var elternSichthoehe = null;
  function platziereImIframe() {
    var ref = letzteTuer || raster;
    var oben = ref.getBoundingClientRect().top + window.scrollY - 24;
    if (elternSichthoehe) dialog.style.maxHeight = Math.round(elternSichthoehe * 0.86) + 'px';
    var maxOben = document.documentElement.scrollHeight - dialog.offsetHeight - 12;
    oben = Math.max(12, Math.min(oben, maxOben));
    dialog.style.position = 'absolute';
    dialog.style.margin = '0 auto';
    dialog.style.top = oben + 'px';
    melde({ typ: 'rsv-advent-scroll', oben: oben });
  }
  function melde(nachricht) {
    if (!imIframe) return;
    try { window.parent.postMessage(nachricht, '*'); } catch (e) { /* egal */ }
  }
  function meldeHoehe() { melde({ typ: 'rsv-advent-hoehe', hoehe: document.documentElement.scrollHeight }); }
  if (imIframe) {
    window.addEventListener('message', function (ev) {
      if (ev.data && ev.data.typ === 'rsv-advent-sicht') elternSichthoehe = Number(ev.data.hoehe) || null;
    });
    if (window.ResizeObserver) new ResizeObserver(meldeHoehe).observe(wurzel);
    window.addEventListener('load', meldeHoehe);
    meldeHoehe();
  }

  // ---------- Direktlink #tuer-N ----------
  var treffer = /^#tuer-(\d{1,2})$/.exec(window.location.hash);
  if (treffer && tueren[Number(treffer[1])] && istVerfuegbar(Number(treffer[1]))) {
    oeffne(Number(treffer[1]), { sofort: true });
  }
})();
