const mixesContainer = document.getElementById("mixes-container");
let loadingAttempts = 0;
const MAX_LOADING_ATTEMPTS = 3;

// Pagination variables
let allTracks = [];
let currentPage = 0;
const TRACKS_PER_PAGE = 5;

// Show loading state
function showLoadingState() {
  mixesContainer.innerHTML = `
    <div class="mix-card loading-card">
      <div class="mix-info" style="text-align: center; padding: 40px;">
        <div class="loading-spinner"></div>
        <div class="mix-title">Loading tracks...</div>
      </div>
    </div>`;
}

// Multiple proxy URLs for better reliability
const proxyUrls = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest='
];

async function loadSoundcloudTracks() {
  // SoundCloud RSS feed
  const rssUrl = "https://feeds.soundcloud.com/users/soundcloud:users:1593052395/sounds.rss";
  
  showLoadingState();
  loadingAttempts++;
  
  let lastError = null;
  
  // Try multiple proxies for better reliability
  for (const proxyBase of proxyUrls) {
    try {
      const proxyUrl = `${proxyBase}${encodeURIComponent(rssUrl)}`;
      console.log(`Attempting to load from proxy: ${proxyBase}`);
      
      // Create fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const xmlText = await response.text();
      
      if (!xmlText || xmlText.trim() === '') {
        throw new Error('Empty response received');
      }
      
      // Parse de RSS XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      // Check for XML parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error(`XML parsing error: ${parserError.textContent}`);
      }
      
      const items = xmlDoc.querySelectorAll("item");
      console.log(`Found ${items.length} tracks`);

      mixesContainer.innerHTML = ""; // clear loading state

      if (items.length === 0) {
        showNoTracksMessage();
        return;
      }
      
      // Successfully loaded tracks, break out of proxy loop
      allTracks = Array.from(items);
      currentPage = 0;
      renderPaginatedTracks();
      return;
      
    } catch (error) {
      console.warn(`Proxy ${proxyBase} failed:`, error.message);
      lastError = error;
      continue; // Try next proxy
    }
  }
  
  // All proxies failed
  console.error("All proxy attempts failed. Last error:", lastError);
  showErrorMessage(lastError);
}

function showNoTracksMessage() {
  mixesContainer.innerHTML = `
    <div class="mix-card">
      <div class="mix-info" style="text-align: center; padding: 40px;">
        <div class="mix-title">No tracks found</div>
        <div class="mix-meta">Check back later for new releases</div>
        <button class="cta-button" onclick="window.open('https://soundcloud.com/kimmartini-202436244','_blank')">Visit SoundCloud</button>
      </div>
    </div>`;
}

function showErrorMessage(error) {
  mixesContainer.innerHTML = `
    <div class="mix-card error-card">
      <div class="mix-info" style="text-align: center; padding: 40px;">
        <div class="mix-title">Unable to load tracks</div>
        <div class="mix-meta">Connection issue. ${loadingAttempts < MAX_LOADING_ATTEMPTS ? 'Retrying...' : 'Please try again later'}</div>
        ${loadingAttempts < MAX_LOADING_ATTEMPTS ? 
          '<button class="cta-button retry-btn" onclick="retryLoading()">Retry Now</button>' : 
          '<button class="cta-button" onclick="window.open(\'https://soundcloud.com/kimmartini-202436244\',\'_blank\')">Visit SoundCloud</button>'
        }
      </div>
    </div>`;
  
  // Auto-retry if we haven't exceeded max attempts
  if (loadingAttempts < MAX_LOADING_ATTEMPTS) {
    setTimeout(() => {
      loadSoundcloudTracks();
    }, 2000 + (loadingAttempts * 1000)); // Exponential backoff
  }
}

function retryLoading() {
  loadSoundcloudTracks();
}

function renderPaginatedTracks() {
  const startIndex = currentPage * TRACKS_PER_PAGE;
  const endIndex = startIndex + TRACKS_PER_PAGE;
  const tracksToShow = allTracks.slice(startIndex, endIndex);
  
  // Clear container
  mixesContainer.innerHTML = "";
  
  // Render tracks for current page
  tracksToShow.forEach(item => {
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
    
    // Fallback image if no image found
    if (!image || image === '') {
      image = 'assets/KM_Logo3.png'; // Use site logo as fallback
    }
    
    // Format date
    const date = pubDate ? new Date(pubDate).toLocaleDateString() : "";
    
    // Create metadata string, filtering out "Unknown" values
    let metaParts = [];
    if (duration && duration !== "Unknown" && duration.trim() !== "") {
      metaParts.push(duration);
    }
    if (date && date !== "Unknown date" && date.trim() !== "") {
      metaParts.push(date);
    }
    const metaText = metaParts.join(' • ');
    
    // Create track card with better error handling for iframe
    const card = document.createElement("div");
    card.className = "mix-card";
    card.innerHTML = `
      <div class="soundcloud-player-with-thumb">
        <img class="mix-thumb" src="${image}" alt="Cover art" loading="lazy" onerror="this.src='assets/KM_Logo3.png';" />
        <div class="soundcloud-player-iframe-wrap">
          <iframe width="100%" height="175" scrolling="no" frameborder="no" allow="autoplay"
            src="https://w.soundcloud.com/player/?url=${encodeURIComponent(link)}&color=%23ff5500&auto_play=false&show_user=false&hide_related=true&show_comments=false&show_teaser=false&enable_api=true"
            onload="this.style.opacity='1';"
            onerror="this.parentElement.innerHTML='<div style=\\'text-align:center;padding:20px;color:var(--text-secondary);\\'>Player unavailable</div>';">
          </iframe>
        </div>
      </div>
      <div class="mix-info">
        <div class="mix-title">${title}</div>
        ${metaText ? `<div class="mix-meta">${metaText}</div>` : ''}
      </div>
    `;
    mixesContainer.appendChild(card);
  });
  
  // Add pagination controls
  addPaginationControls();
  
  // Reset loading attempts on successful load
  loadingAttempts = 0;
  
  // Initialize iframe opacity for loading effect
  setTimeout(() => {
    document.querySelectorAll('.soundcloud-player-iframe-wrap iframe').forEach(iframe => {
      iframe.style.opacity = '0';
      iframe.style.transition = 'opacity 0.3s ease-in-out';
    });
  }, 100);
}

function addPaginationControls() {
  const totalPages = Math.ceil(allTracks.length / TRACKS_PER_PAGE);
  
  if (totalPages <= 1) return; // No pagination needed for single page
  
  const paginationDiv = document.createElement("div");
  paginationDiv.className = "pagination-controls";
  paginationDiv.innerHTML = `
    <button class="pagination-btn prev-btn" ${currentPage === 0 ? 'disabled' : ''} onclick="changePage(-1)">
      <img src="assets/icons/prev.png" alt="Previous" />
    </button>
    <span class="pagination-info">${currentPage + 1} / ${totalPages}</span>
    <button class="pagination-btn next-btn" ${currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="changePage(1)">
      <img src="assets/icons/next.png" alt="Next" />
    </button>
  `;
  
  mixesContainer.appendChild(paginationDiv);
}

function changePage(direction) {
  const totalPages = Math.ceil(allTracks.length / TRACKS_PER_PAGE);
  const newPage = currentPage + direction;
  
  if (newPage >= 0 && newPage < totalPages) {
    currentPage = newPage;
    renderPaginatedTracks();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Add retry functionality to window for global access
  window.retryLoading = retryLoading;
  window.changePage = changePage;
  
  // Start loading tracks
  loadSoundcloudTracks();
  
  // Initialize responsive players
  resizePlayers();
});

// Player breder op mobiel: pas iframe breedte aan na laden
window.addEventListener('resize', resizePlayers);

// Also try to reload tracks if window regains focus (user came back to tab)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && mixesContainer.querySelector('.error-card, .loading-card')) {
    console.log('Page became visible, retrying failed tracks...');
    loadSoundcloudTracks();
  }
});

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