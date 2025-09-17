# Kim Martini Website

Deze website is een moderne, responsieve one-pager voor Kim Martini, elektronische muziekproducer en DJ. De site is ontworpen voor een optimale ervaring op zowel desktop als mobiel, met veel aandacht voor visuele details, animatie en gebruiksgemak.

## Functionaliteiten & Opbouw

### Events
- Stijlvolle event cards met event-afbeelding als banner, datum-badge, locatie, line-up en Facebook-link.
- Events staan altijd van laatst naar eerst (meest recente bovenaan), op alle schermformaten.
- Klik op de eventfoto of titel opent direct het Facebook event in een nieuw tabblad.
- Afbeeldingen voor events staan in `assets/events/`.
- Events zijn eenvoudig uit te breiden of aan te passen in `index.html`.
### Music (SoundCloud)
- SoundCloud player met cover-art (track thumbnail) direct naast de soundwave, voor een moderne look.
- Op mobiel wordt de cover-art automatisch verborgen voor een compactere layout.
- De player schaalt automatisch breder op mobiel voor optimale touch-ervaring.


### Mixer (uitgebreid)
- Mixer-popup opent direct onder de navbar/logo, met moderne transparante/blur-stijl.
- Mixer werkt met SVG draaiknoppen (met duidelijke streepjes) en PNG-iconen voor play/pause/stop.
- Hamburger/hide-knop onderaan in de mixer sluit de popup.
- Thema-detectie: mixer-iconen wisselen automatisch bij dark/light mode.
- Mixer-knop in de navbar werkt als toggle (openen én sluiten).
- Mixer-popup is altijd perfect uitgelijnd en responsief.
- Thema-toggle knop altijd zichtbaar.
- Mix-wisselknop (rechts als lipje/index-tab) met swap-icoon, in dezelfde stijl als de mixer.
- Mix-wissel submenu opent als popup direct naast de mixer, met dezelfde blur/transparantie.
- Mix-wissel submenu toont beschikbare mixes (mix_1, mix_2) en laadt direct de juiste samples.
- Sluitknop in het submenu is verwijderd; menu sluit automatisch bij keuze.
- Alle paden naar audio-bestanden zijn up-to-date en makkelijk uit te breiden.
- Volledige ondersteuning voor meerdere mix-sets via assets/mixer/mix_1, mix_2, etc.
- Mixer werkt volledig zonder page reloads.

#### Mixer gebruiken
- Open/sluit de mixer met het mixer-icoon in de navbar (toggle).
- Kies een mix via het lipje aan de rechterkant van de mixer-module.
- Het submenu sluit automatisch na je keuze en laadt direct de juiste samples.
- Sluit de mixer met de hamburger/hide-knop onderaan.

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

### Link preview & delen
- De site bevat Open Graph en Twitter meta tags zodat bij het delen van de website (in WhatsApp, Messenger, Facebook, X/Twitter, LinkedIn, enz.) automatisch een eigen preview-afbeelding verschijnt.
- De preview/thumbnail is `assets/link_logo.png` en wordt getoond als klikbare afbeelding bij de link in chats en social media.
- Zie `<head>` in `index.html` voor de gebruikte meta tags.

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
1. **Events**: Klik op een eventfoto of titel om het Facebook event te openen.
2. **Events toevoegen**: Zie uitleg hierboven.
3. **Mixer samples vervangen**: Zie uitleg hierboven.
4. **Start de site** door `index.html` te openen in een browser.
5. **Thema wisselen**: Klik op de "DARK"/"LIGHT" knop rechtsonder.
6. **About slideshow**: Bekijk de foto's en raster-animatie in de About-sectie.
7. **Mixer**: Op desktop kun je de live mixer bedienen.
8. **SoundCloud player**: Luister naar tracks, zie de cover-art naast de soundwave (desktop/tablet), op mobiel alleen de player.
9. **Responsief**: De site past zich automatisch aan elk schermformaat aan.

## Aanpassen
- Voeg nieuwe foto's toe aan de About-slideshow door het `images`-array in `app.js` aan te vullen.
- Pas kleuren aan via de CSS custom properties in `style.css`.
- Voeg nieuwe secties of content toe in `index.html`.

## Licentie
Deze site is gemaakt voor Kim Martini. Gebruik en aanpassingen in overleg.

Gemaakt met liefde en zorg, 
