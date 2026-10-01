// Stundenprofil der amtlichen Dauerzählstelle Nürnberg, Erlanger Straße (RZG003).
// Quelle: https://nuernberg.eco-counter.com — Export mit Intervall "Stunde" nötig.
// anteile: Anteil jeder Stunde (0–23) am Tagesverkehr, Mittel über Werktage (Mo–Fr, Schultage).
// bandLow/bandHigh: z. B. 15.- und 85.-Perzentil der Stundenanteile über die Einzeltage.
// Solange null: Die Ganglinien-Seite zeigt nur die Messwerte, keine Hochrechnung.
const STUNDENPROFIL = null;
/* Beispielstruktur nach Datenimport:
const STUNDENPROFIL = {
  quelle: 'Eco-Counter RZG003 Erlanger Straße, Werktage Schulzeit 2024-2025',
  anteile:  [0.002, ...],   // 24 Werte, Summe = 1
  bandLow:  [0.001, ...],   // 24 Werte
  bandHigh: [0.004, ...]    // 24 Werte
};
*/
