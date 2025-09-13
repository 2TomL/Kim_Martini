# Kim Martini Website

Deze website is een moderne, responsieve one-pager voor Kim Martini, elektronische muziekproducer en DJ. De site is ontworpen voor een optimale ervaring op zowel desktop als mobiel, met veel aandacht voor visuele details, animatie en gebruiksgemak.

## Functionaliteiten & Opbouw

### Events
- Stijlvolle event cards met event-afbeelding als banner, datum-badge, locatie, line-up en Facebook-link.
- Event cards zijn gesorteerd op datum (chronologisch).
- Klik op de eventfoto of titel opent direct het Facebook event in een nieuw tabblad.
- Afbeeldingen voor events staan in `assets/events/`.
- Events zijn eenvoudig uit te breiden of aan te passen in `index.html`.

### Mixer
- Live mixer met 3 kanalen (High, Mid, Low), elk met eigen sample.
- Samples zijn eenvoudig te vervangen via het `sampleUrls` object in `js/mixer.js`.
- Mixer start nu alle kanalen perfect synchroon en loopen altijd correct (mits juiste BPM).
- Master play/pause start of stopt alle kanalen tegelijk, altijd in sync.
- Volumeregelaars per kanaal en master.

### Dark Mode Iconen
- Alle social/contact iconen hebben een light én dark variant.
- Bij wisselen van thema veranderen de iconen automatisch mee.

### Accessibility
- Alle interactieve elementen hebben Engelse tooltips en aria-labels voor screenreaders.
- Buttons en links zijn goed toegankelijk en voorzien van duidelijke titels.

### Events of Mixer Samples Toevoegen
- Nieuwe events toevoegen: kopieer een event card in `index.html` en pas de inhoud aan (afbeelding, datum, link, line-up).
- Nieuwe mixer samples: vervang het pad in `js/mixer.js` bij het juiste kanaal (High, Mid, Low).

### Home (Hero)
- Groot logo en naam van Kim Martini, centraal in beeld.
- Subtitel: "Electronic Music Producer & DJ".
- Responsief ontwerp met animaties.

### Navigatie
- Bovenaan vaste navigatiebalk met logo (licht/donker afhankelijk van thema).
- Live Mixer (alleen zichtbaar op desktop): interactieve knoppen en volumeregelaars. 
- Thema-toggle knop (rechts onder): direct wisselen tussen licht en donker thema.

### About
- Flexibele layout met tekst en een slideshow van 14 foto's.
- Slideshow toont elke 4 seconden een andere foto.
- Overgang tussen foto's met een kleurrijke, geanimeerde raster-overlay (grid van blokjes).
- Raster-blokjes verschijnen in willekeurige volgorde en nemen subtiel de kleuren van de site aan.
- Raster-animatie past zich aan het gekozen thema aan (licht/donker).
- Op mobiel hebben alle foto's dezelfde hoogte voor een consistente look.


### Music & Events
- Secties met titels en ruimte voor toekomstige content (zoals SoundCloud embeds of event info).

### Contact & Socials
- Onderaan een modern, uitklappend kebab-menu met iconen voor Soundcloud, Facebook, Instagram, Resident Advisor en mail.
- De iconen zijn groot, kleurrijk en passen zich aan het thema (licht/donker) aan.
- Bij klikken op het menu verschijnen de social links in een halve cirkel naar onder.
- De gebruiker kan eenvoudig eigen links toevoegen.

### Favicon
- Eigen favicon zichtbaar in de browser-tab.

## Techniek
- **HTML5**: Semantische opbouw, duidelijke structuur.
- **CSS3**: Flexbox, grid, media queries, custom properties (CSS-variabelen), keyframe-animaties.
- **JavaScript**: Slideshow-logica, raster-overlay animatie, themaswitch, mixer-interactie.
- **Bestanden**:
  - `index.html`: Hoofdstructuur van de site.
  - `style.css`: Alle styling, inclusief thema's en animaties.
  - `font.css`: Custom fonts.
  - `app.js`: Slideshow, raster, themaswitch, menu.
  - `js/mixer.js`, `js/soundcloud.js`: Mixer en SoundCloud logica.
  - `assets/`: Afbeeldingen, logo's, favicon.

## Gebruik
6. **Events**: Klik op een eventfoto of titel om het Facebook event te openen.
7. **Events toevoegen**: Zie uitleg hierboven.
8. **Mixer samples vervangen**: Zie uitleg hierboven.
1. **Start de site** door `index.html` te openen in een browser.
2. **Thema wisselen**: Klik op de "DARK"/"LIGHT" knop rechtsonder.
3. **About slideshow**: Bekijk de foto's en raster-animatie in de About-sectie.
4. **Mixer**: Op desktop kun je de live mixer bedienen.
5. **Responsief**: De site past zich automatisch aan elk schermformaat aan.

## Aanpassen
- Voeg nieuwe foto's toe aan de About-slideshow door het `images`-array in `app.js` aan te vullen.
- Pas kleuren aan via de CSS custom properties in `style.css`.
- Voeg nieuwe secties of content toe in `index.html`.

## Licentie
Deze site is gemaakt voor Kim Martini. Gebruik en aanpassingen in overleg.
