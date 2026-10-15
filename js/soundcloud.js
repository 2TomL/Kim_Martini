const mixesContainer = document.getElementById("mixes-container");
let loadingAttempts = 0;
const MAX_LOADING_ATTEMPTS = 3;

// Pagination variables
let allTracks = [];
let currentPage = 0;
const TRACKS_PER_PAGE = 5;
let tracksFetchInFlight = false;

const RSS_URL = "https://feeds.soundcloud.com/users/soundcloud:users:1593052395/sounds.rss";

// Cache for successful proxy
let workingProxy = null;
let lastSuccessfulFetch = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = 'sc_working_proxy';
const STORAGE_TIMESTAMP_KEY = 'sc_proxy_timestamp';

// Cache for the actual track data, so we have something to show instantly
// (even offline / while proxies are flaky) while a fresh fetch runs in the background
const TRACKS_STORAGE_KEY = 'sc_tracks_cache';
const TRACKS_TIMESTAMP_KEY = 'sc_tracks_cache_timestamp';

// Built-in list so the Music section always has players on first paint,
// without waiting for CORS proxies. Background fetch keeps it up to date.
const FALLBACK_TRACKS = [
  { title: "GGGGroovy - MixTape 014", link: "https://soundcloud.com/kimmartini-202436244/ggggroovy-mixtape-014", pubDate: "Tue, 08 Sep 2026 15:53:56 +0000", duration: "01:21:18", image: "https://i1.sndcdn.com/artworks-Kj5jnWCrrPXQ9Eyw-OUs72Q-t500x500.jpg" },
  { title: "ddddon't GO - Mixtape 013", link: "https://soundcloud.com/kimmartini-202436244/ddddont-go-mixtape-013", pubDate: "Sat, 20 Jun 2026 20:43:14 +0000", duration: "01:33:40", image: "https://i1.sndcdn.com/artworks-uQMQD53rPN7KNoaW-ijUoFg-t500x500.jpg" },
  { title: "the lowrider-mixtape012", link: "https://soundcloud.com/kimmartini-202436244/the-lowrider-mixtape012", pubDate: "Fri, 19 Jun 2026 19:29:11 +0000", duration: "01:44:49", image: "https://i1.sndcdn.com/artworks-wjIi2gUGYsE4FBzD-yp6oRg-t500x500.png" },
  { title: "'Nous sommes' - Kim Martini - Mixtape 011", link: "https://soundcloud.com/kimmartini-202436244/nous-sommes-kim-martini", pubDate: "Sat, 30 May 2026 17:21:52 +0000", duration: "01:00:48", image: "https://i1.sndcdn.com/artworks-gSTjNszslUSdkH5N-yNcNsg-t500x500.png" },
  { title: "I keep loving TECHNO", link: "https://soundcloud.com/kimmartini-202436244/i-keep-loving-techno", pubDate: "Sun, 15 Feb 2026 17:02:22 +0000", duration: "01:51:31", image: "https://i1.sndcdn.com/artworks-9bxUtVMtlTNOyG4t-VpKjLQ-t500x500.jpg" },
  { title: "Mixtape 009 @ home", link: "https://soundcloud.com/kimmartini-202436244/mixtape-009-home", pubDate: "Fri, 26 Dec 2025 18:17:01 +0000", duration: "00:48:04", image: "https://i1.sndcdn.com/artworks-Mm2eearOU9Bdq8xZ-AyNAaQ-t500x500.png" },
  { title: "Mixtape 008 @ Home", link: "https://soundcloud.com/kimmartini-202436244/mixtape-008-home", pubDate: "Mon, 22 Dec 2025 21:35:28 +0000", duration: "01:29:43", image: "https://i1.sndcdn.com/artworks-D0s6b0DVrL3lQncE-5dIJHA-t500x500.png" },
  { title: "MIXTAPE 007 @ Home - Part 2", link: "https://soundcloud.com/kimmartini-202436244/251202-kimmartini-mixtape007-1", pubDate: "Wed, 10 Dec 2025 17:45:26 +0000", duration: "01:01:53", image: "https://i1.sndcdn.com/artworks-8F32W4FsysPMdAO2-u0Ocgg-t500x500.png" },
  { title: "MIXTAPE 007 @ Home - Part 1", link: "https://soundcloud.com/kimmartini-202436244/251202-kimmartini-mixtape007", pubDate: "Wed, 10 Dec 2025 17:42:11 +0000", duration: "01:12:18", image: "https://i1.sndcdn.com/artworks-HTFj09AY2V0waLm7-pqNYMQ-t500x500.png" },
  { title: "MIXTAPE 006 @ home - ' Dance, Step, Shuffle & REPEAT'", link: "https://soundcloud.com/kimmartini-202436244/mixtape-006-home-dance-step-shuffle-repeat", pubDate: "Fri, 21 Nov 2025 00:02:01 +0000", duration: "01:36:52", image: "https://i1.sndcdn.com/artworks-Ihzx6Mf8Oapk6yZL-IiZk3A-t500x500.png" },
  { title: "MIXTAPE @ Home 005", link: "https://soundcloud.com/kimmartini-202436244/mixtape-home-005", pubDate: "Wed, 05 Nov 2025 17:04:11 +0000", duration: "01:04:48", image: "https://i1.sndcdn.com/artworks-Ac96gS0bzJIFY9v6-dp3rSg-t500x500.png" },
  { title: "Part 6 OF SIX HOURS - MIXTAPE 004", link: "https://soundcloud.com/kimmartini-202436244/part-6-of-six-hours-mixtape-004", pubDate: "Tue, 21 Oct 2025 16:46:44 +0000", duration: "00:58:58", image: "https://i1.sndcdn.com/artworks-NTWX7iiCiDQeXX1p-XV3XtA-t500x500.png" },
  { title: "Part 5 OF SIX HOURS - MIXTAPE 004", link: "https://soundcloud.com/kimmartini-202436244/part-5-of-six-hours-mixtape-004", pubDate: "Tue, 21 Oct 2025 16:35:56 +0000", duration: "01:07:24", image: "https://i1.sndcdn.com/artworks-3tny0qYyIQri198M-cWEVYg-t500x500.png" },
  { title: "Part 4 OF SIX HOURS - MIXTAPE 004", link: "https://soundcloud.com/kimmartini-202436244/part-4-of-six-hours-mixtape-004", pubDate: "Mon, 20 Oct 2025 23:01:28 +0000", duration: "01:14:35", image: "https://i1.sndcdn.com/artworks-SGQ0acwc9jfImnYj-QyBAow-t500x500.png" },
  { title: "Part 3 OF SIX HOURS - MIXTAPE 004", link: "https://soundcloud.com/kimmartini-202436244/part-3-of-six-hours-mixtape-004", pubDate: "Mon, 20 Oct 2025 22:24:10 +0000", duration: "01:09:08", image: "https://i1.sndcdn.com/artworks-OuKL1p53whFU5rjO-dAjydQ-t500x500.png" },
  { title: "Part 2 OF SIX HOURS - MIXTAPE 004", link: "https://soundcloud.com/kimmartini-202436244/part-2-of-six-hours-mixtape-004", pubDate: "Mon, 20 Oct 2025 21:44:52 +0000", duration: "01:12:11", image: "https://i1.sndcdn.com/artworks-8eh9GAKWOUy5WYLM-8dKHxQ-t500x500.png" },
  { title: "Part 1 OF SIX HOURS - MIXTAPE 004", link: "https://soundcloud.com/kimmartini-202436244/part-1-of-six-hours-mixtape-004", pubDate: "Mon, 20 Oct 2025 18:46:36 +0000", duration: "01:07:37", image: "https://i1.sndcdn.com/artworks-BGT0YwAMqSJdQOzM-MysZbA-t500x500.png" },
  { title: "MIXTAPE @ HOME 003 - 100% vinyl only - KIM MARTINI", link: "https://soundcloud.com/kimmartini-202436244/mixtape-home-003-100-vinyl-only-kim-martini", pubDate: "Sun, 05 Oct 2025 17:32:46 +0000", duration: "01:55:09", image: "https://i1.sndcdn.com/artworks-H5aAtrKKumUcpKOU-8Rc2hg-t500x500.jpg" },
  { title: "MIXTAPE @ HOME 002 - 100% vinyl only - KIM MARTINI", link: "https://soundcloud.com/kimmartini-202436244/mixtape-home-002-100-vinyl-only-kim-martini", pubDate: "Sun, 14 Sep 2025 15:57:01 +0000", duration: "01:24:12", image: "https://i1.sndcdn.com/artworks-73k6drkvl0COm8bd-NxHy1w-t500x500.jpg" },
  { title: "MIX TAPE @ Home 001 - KYM will house you - 100% vinyl only", link: "https://soundcloud.com/kimmartini-202436244/mix-tape-home-001-kym-will-house-you-100-vinyl-only", pubDate: "Sun, 24 Aug 2025 16:04:48 +0000", duration: "01:57:56", image: "https://i1.sndcdn.com/artworks-MThy2httOzClfchz-CoJ3Sw-t500x500.jpg" }
];

// Initialize proxy from localStorage if available and fresh
function initializeProxyFromStorage() {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_DURATION) {
        workingProxy = cached;
        lastSuccessfulFetch = parseInt(timestamp);
        console.log(`✓ Using cached proxy from localStorage: ${cached}`);
        return true;
      }
    }
  } catch (e) {
    console.warn('Failed to read localStorage:', e);
  }
  return false;
}

// Save working proxy to localStorage
function saveProxyToStorage(proxy) {
  try {
    localStorage.setItem(STORAGE_KEY, proxy);
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

// Save the parsed track data itself so we can render instantly next time
function saveTracksToStorage(tracks) {
  try {
    localStorage.setItem(TRACKS_STORAGE_KEY, JSON.stringify(tracks));
    localStorage.setItem(TRACKS_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    console.warn('Failed to save tracks to localStorage:', e);
  }
}

// Read previously cached track data, if any (regardless of age - better a stale list than none)
function getCachedTracks() {
  try {
    const cached = localStorage.getItem(TRACKS_STORAGE_KEY);
    if (!cached) return null;
    const tracks = JSON.parse(cached);
    if (!Array.isArray(tracks) || tracks.length === 0) return null;
    return tracks;
  } catch (e) {
    console.warn('Failed to read cached tracks:', e);
    return null;
  }
}

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

// Multiple proxy URLs (ordered by speed and reliability)
// These are free public CORS proxies - individually unreliable/rate-limited,
// so we race them in parallel instead of waiting on each one sequentially.
const proxyUrls = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://proxy.cors.sh/',
  'https://thingproxy.freeboard.io/fetch/',
  'https://api.codetabs.com/v1/proxy?quest='
];

function getImmediateTracks() {
  const cached = getCachedTracks();
  if (!cached || cached.length === 0) return FALLBACK_TRACKS;

  const cachedTime = Date.parse(cached[0].pubDate) || 0;
  const fallbackTime = Date.parse(FALLBACK_TRACKS[0].pubDate) || 0;
  return fallbackTime > cachedTime ? FALLBACK_TRACKS : cached;
}

function tracksListChanged(next) {
  if (!Array.isArray(next) || next.length === 0) return false;
  if (allTracks.length !== next.length) return true;
  return allTracks.some((track, i) => track.link !== next[i].link);
}

function showTracksImmediately() {
  const immediate = getImmediateTracks();
  if (!immediate.length) {
    showLoadingState();
    return false;
  }
  allTracks = immediate.slice();
  currentPage = 0;
  renderPaginatedTracks();
  return true;
}

async function loadSoundcloudTracks() {
  if (tracksFetchInFlight) return;
  tracksFetchInFlight = true;
  loadingAttempts++;

  // Paint players immediately from cache or the built-in list,
  // then refresh from SoundCloud in the background.
  const hasImmediateTracks = allTracks.length > 0 || showTracksImmediately();

  const proxyList = workingProxy
    ? [workingProxy, ...proxyUrls.filter(p => p !== workingProxy)]
    : proxyUrls;
  const freshRssUrl = `${RSS_URL}?_=${Date.now()}`;

  const attempts = proxyList.map(proxyBase =>
    tryProxy(proxyBase, freshRssUrl).then(result => {
      if (!result.success) throw result.error || new Error('Proxy failed');
      return { proxyBase, tracks: result.tracks };
    })
  );

  try {
    const { proxyBase, tracks } = await Promise.any(attempts);

    saveProxyToStorage(proxyBase);
    saveTracksToStorage(tracks);
    workingProxy = proxyBase;
    lastSuccessfulFetch = Date.now();
    loadingAttempts = 0;
    console.log(`✓ Successfully loaded tracks via ${proxyBase}`);

    if (tracksListChanged(tracks)) {
      allTracks = tracks;
      currentPage = 0;
      renderPaginatedTracks();
    }
  } catch (aggregateError) {
    const lastError = aggregateError?.errors?.[aggregateError.errors.length - 1] || aggregateError;
    console.error("All proxy attempts failed. Last error:", lastError);

    if (hasImmediateTracks) {
      console.warn('Keeping previously shown tracks visible after fetch failure.');
      if (loadingAttempts < MAX_LOADING_ATTEMPTS) {
        setTimeout(loadSoundcloudTracks, 2000 + (loadingAttempts * 1000));
      }
      return;
    }

    showErrorMessage(lastError);
  } finally {
    tracksFetchInFlight = false;
  }
}

// Try a single proxy with timeout, returns parsed plain-object track data (cacheable)
async function tryProxy(proxyBase, rssUrl) {
  try {
    const proxyUrl = `${proxyBase}${encodeURIComponent(rssUrl)}`;
    console.log(`Attempting to load from proxy: ${proxyBase}`);
    
    // Create fetch with timeout (8 seconds - proxies are raced in parallel now)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
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
    
    // Parse RSS XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Check for XML parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error(`XML parsing error: ${parserError.textContent}`);
    }
    
    const items = xmlDoc.querySelectorAll("item");
    console.log(`Found ${items.length} tracks`);
    
    if (items.length === 0) {
      throw new Error('No tracks found in RSS');
    }
    
    return {
      success: true,
      tracks: Array.from(items).map(parseTrackItem),
      error: null
    };
    
  } catch (error) {
    console.warn(`Proxy ${proxyBase} failed:`, error.message);
    return {
      success: false,
      tracks: [],
      error: error
    };
  }
}

// Convert an <item> DOM node into a plain, JSON-serializable object
function parseTrackItem(item) {
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
    const imgTags = item.getElementsByTagName("itunes:image");
    if (imgTags && imgTags.length > 0) {
      imgEl = imgTags[0];
    }
  }
  if (!imgEl) {
    const imgTags = item.getElementsByTagName("image");
    if (imgTags && imgTags.length > 0) {
      imgEl = imgTags[0];
    }
  }
  if (imgEl) {
    image = imgEl.getAttribute("href") || imgEl.getAttribute("url") || imgEl.textContent || "";
  }
  
  return { title, link, pubDate, duration, image };
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
    const { title, link, pubDate, duration } = item;
    let image = item.image || "";
    
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
        <img class="mix-thumb" src="${image}" alt="Cover art" loading="eager" fetchpriority="high" onerror="this.src='assets/KM_Logo3.png';" />
        <div class="soundcloud-player-iframe-wrap">
          <iframe width="100%" height="175" scrolling="no" frameborder="no" allow="autoplay" loading="eager"
            style="opacity:0;transition:opacity 0.3s ease-in-out;"
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
  
  // Safety net: some browsers never fire onload for cross-origin iframes,
  // which would otherwise leave the player invisible (opacity stuck at 0) forever.
  setTimeout(() => {
    document.querySelectorAll('.soundcloud-player-iframe-wrap iframe').forEach(iframe => {
      iframe.style.opacity = '1';
    });
  }, 1500);
  
  // Apply responsive player sizing now that iframes are in the DOM
  resizePlayers();
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

function initSoundcloud() {
  initializeProxyFromStorage();
  window.retryLoading = retryLoading;
  window.changePage = changePage;
  // Render players on first paint, then refresh RSS in the background
  showTracksImmediately();
  loadSoundcloudTracks();
  resizePlayers();
}

// Script sits below #mixes-container, so paint players immediately
// instead of waiting for DOMContentLoaded (and mixer.js).
initSoundcloud();

// Player breder op mobiel: pas iframe breedte aan na laden
window.addEventListener('resize', resizePlayers);

// Also try to reload tracks if window regains focus (user came back to tab)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && Date.now() - (lastSuccessfulFetch || 0) >= CACHE_DURATION) {
    console.log('Page became visible, refreshing tracks...');
    loadSoundcloudTracks();
  }
});

function resizePlayers() {
  const isMobile = window.innerWidth <= 600;
  document.querySelectorAll('.soundcloud-player-iframe-wrap iframe').forEach(iframe => {
    if (isMobile) {
      iframe.style.width = '100%';
      iframe.style.maxWidth = 'none';
      iframe.style.marginLeft = '0';
    } else {
      iframe.style.width = '100%';
      iframe.style.maxWidth = '';
      iframe.style.marginLeft = '';
    }
  });
}