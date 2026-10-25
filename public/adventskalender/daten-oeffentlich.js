/* Adventskalender „Die Antwort der Stadt“ — öffentliche Vorab-Fassung
   Die Türchen sind bis zum jeweiligen Tag im Dezember verschlossen.
   Die Inhalte werden vor dem 1. Dezember eingespielt; diese Datei enthält
   nur den Rahmen. Seitenangaben folgen später der gedruckten Seitenzählung. */
window.RSV_ADVENT = {
  fassung: 'vorab',
  kicker: 'Adventskalender 2026',
  titel: '24 Türchen zur Antwort der Stadt',
  einleitung:
    '<p>In der Ortsbeiratssitzung am 22. Oktober 2026 wurde die Rückmeldung der Mobilitätsplanung der Stadt Erlangen zu 34 Punkten unserer Unterlage vorgestellt. Die berechtigten Punkte haben wir dankend aufgenommen und unsere Texte angepasst. Auf unsere Kernaussagen geht die Mobilitätsplanung dagegen nicht ein, oder sie antwortet auf eine andere Frage als die gestellte.</p>' +
    '<p>Vom 1. bis zum 24. Dezember öffnen wir deshalb jeden Tag ein Türchen: ein Zitat aus der Rückmeldung, unsere Einordnung und die Fundstellen.</p>',
  abschnitte: { stadt: 'Die Stadt schreibt', einordnung: 'Unsere Einordnung', belege: 'Fundstellen' },
  quelleStadt: 'Rückmeldung der Mobilitätsplanung der Stadt Erlangen vom 21.10.2026',
  fussnote:
    'Die Inhalte der Türchen werden am jeweiligen Tag im Dezember freigeschaltet. Grundlage: Rückmeldung der Stadt vom 21.10.2026 und die Unterlagen aus unserer <a href="/akteneinsicht">Akteneinsicht</a>.',
  urteile: {
    bald: { label: 'Öffnet im Dezember', icon: '🎄', farbe: '#14304f', hell: '#e6edf5' }
  },
  tueren: Array.from({ length: 24 }, function (_, i) {
    var nr = i + 1;
    return {
      nr: nr,
      titel: 'Türchen ' + nr,
      teaser: 'Öffnet am ' + nr + '. Dezember',
      urteil: 'bald',
      lfd: [],
      zitat: null,
      ohneZitat: 'Der Inhalt dieses Türchens wird am ' + nr + '. Dezember freigeschaltet.',
      kurz: '',
      text: '<p>Noch etwas Geduld: Dieses Türchen öffnet sich am ' + nr + '. Dezember.</p>',
      belege: []
    };
  })
};
