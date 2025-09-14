const mixesContainer = document.getElementById("mixes-container");

async function loadSoundcloudTracks() {
  // SoundCloud RSS feed
  const rssUrl = "https://feeds.soundcloud.com/users/soundcloud:users:1593052395/sounds.rss";
  try {
    // Gebruik een CORS proxy die alleen de XML doorgeeft
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
    const response = await fetch(proxyUrl);
    const xmlText = await response.text();
    
    // Parse de RSS XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const items = xmlDoc.querySelectorAll("item");

    mixesContainer.innerHTML = ""; // clear

    if (items.length === 0) {
      mixesContainer.innerHTML = `<div class="mix-card"><div class="mix-info" style="text-align: center; padding: 40px;"><div class="mix-title">No tracks found</div><div class="mix-meta">Check back later for new releases</div><button class="cta-button" onclick="window.open('https://soundcloud.com/mickedy_mike/tracks','_blank')">Visit SoundCloud</button></div></div>`;
      return;
    }

    Array.from(items).slice(0, 10).forEach(item => {
      const title = item.querySelector("title")?.textContent || "Unknown Track";
      const link = item.querySelector("link")?.textContent || "";
      const pubDate = item.querySelector("pubDate")?.textContent || "";
      const duration = item.querySelector("itunes\\:duration")?.textContent || "Unknown";
      let image = "";
      // Probeer verschillende manieren om de image te vinden
      let imgEl = null;
      try {
        imgEl = item.querySelector("itunes\\:image");
      } catch (e) {}
      if (!imgEl) {
        // Fallback: zoek met getElementsByTagName
        const imgTags = item.getElementsByTagName("itunes:image");
        if (imgTags && imgTags.length > 0) {
          imgEl = imgTags[0];
        }
      }
      if (!imgEl) {
        // Fallback: zoek met getElementsByTagName("image")
        const imgTags = item.getElementsByTagName("image");
        if (imgTags && imgTags.length > 0) {
          imgEl = imgTags[0];
        }
      }
      if (imgEl) {
        image = imgEl.getAttribute("href") || imgEl.getAttribute("url") || imgEl.textContent || "";
      }
      
      // Format date
      const date = pubDate ? new Date(pubDate).toLocaleDateString() : "Unknown date";
      
      // Create track card
      const card = document.createElement("div");
      card.className = "mix-card";
      card.innerHTML = `
        <div class="soundcloud-player-with-thumb">
          <img class="mix-thumb" src="${image}" alt="Cover art" loading="lazy" />
          <div class="soundcloud-player-iframe-wrap">
            <iframe width="100%" height="175" scrolling="no" frameborder="no" allow="autoplay"
              src="https://w.soundcloud.com/player/?url=${encodeURIComponent(link)}&color=%23ff5500&auto_play=false&show_user=false&hide_related=true&show_comments=false&show_teaser=false"></iframe>
          </div>
        </div>
        <div class="mix-info">
          <div class="mix-title">${title}</div>
          <div class="mix-meta">${duration} • ${date}</div>
        </div>
      `;
      mixesContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading SoundCloud RSS:", err);
    mixesContainer.innerHTML = `<div class=\"mix-card\"><div class=\"mix-info\" style=\"text-align: center; padding: 40px;\"><div class=\"mix-title\">Unable to load tracks</div><div class=\"mix-meta\">Please check your SoundCloud RSS feed or try again later</div><button class=\"cta-button\" onclick=\"window.open('https://soundcloud.com/mickedy_mike/tracks','_blank')\">Visit SoundCloud</button></div></div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadSoundcloudTracks);

// Player breder op mobiel: pas iframe breedte aan na laden
window.addEventListener('resize', resizePlayers);
document.addEventListener('DOMContentLoaded', resizePlayers);

function resizePlayers() {
  const isMobile = window.innerWidth <= 600;
  document.querySelectorAll('.soundcloud-player-iframe-wrap iframe').forEach(iframe => {
    if (isMobile) {
      iframe.style.width = '77vw';
      iframe.style.maxWidth = 'none';
      iframe.style.marginLeft = '-0.5vw';
    } else {
      iframe.style.width = '100%';
      iframe.style.maxWidth = '';
      iframe.style.marginLeft = '';
    }
  });
}