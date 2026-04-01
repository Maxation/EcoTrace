/*
  EcoTrace – overlay.css
  Solarpunk UI-Variablen & globale Hilfsstyles
  (Das Haupt-Styling ist inline im Shadow DOM via content.js)
*/

:root {
  --et-cream:       #F5F5DC;
  --et-green:       #228B22;
  --et-green-light: #4CAF50;
  --et-amber:       #FFBF00;
  --et-brown:       #5D4037;
  --et-text:        #2C2C1E;
  --et-text-muted:  #6B6B50;
  --et-border:      #D4D4AA;
}

/* Animations für das Host-Element */
#ecotrace-host {
  pointer-events: auto;
  transition: opacity 0.3s ease;
}
