// Hero blokjes animatie (constante, minder blokjes, random)

// Zachtere, minder felle kleuren geïnspireerd op about-blokjes
const colors = [
  'rgba(var(--primary-color-rgb), 0.32)',
  'rgba(var(--secondary-color-rgb), 0.22)',
  'rgba(var(--accent-color-rgb), 0.18)',
  'rgba(255, 255, 255, 0.48)',
  'rgba(0, 0, 0, 0.35)'
];

const overlay = document.getElementById('hero-blocks-overlay');
const rows = 12;
const cols = 12;
const total = rows * cols;
let blocks = [];

function createBlocks() {
  overlay.innerHTML = '';
  blocks = [];
  for (let i = 0; i < total; i++) {
    const div = document.createElement('div');
    div.className = 'hero-block';
    overlay.appendChild(div);
    blocks.push(div);
  }
}

function animateBlocks() {
  // Reset all
  blocks.forEach(b => {
    b.style.opacity = '0';
  });
  // Kies 7-12 random blokjes om op te lichten
  const n = Math.floor(Math.random() * 6) + 7;
  const indices = [];
  while (indices.length < n) {
    const idx = Math.floor(Math.random() * total);
    if (!indices.includes(idx)) indices.push(idx);
  }
  indices.forEach(idx => {
    const color = colors[Math.floor(Math.random() * colors.length)];
  blocks[idx].style.background = color;
  blocks[idx].style.opacity = '0.38';
  });
}

createBlocks();
setInterval(animateBlocks, 900);
animateBlocks();