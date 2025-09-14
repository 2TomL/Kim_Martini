
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

themeToggle.addEventListener('click', () => {
	if (html.getAttribute('data-theme') === 'dark') {
		html.removeAttribute('data-theme');
		themeToggle.textContent = 'DARK';
	} else {
		html.setAttribute('data-theme', 'dark');
		themeToggle.textContent = 'LIGHT';
	}
});

		// Mobile menu functionality
		const hamburgerMenu = document.getElementById('hamburger-menu');
		const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
		const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

		hamburgerMenu.addEventListener('click', () => {
			hamburgerMenu.classList.toggle('active');
			mobileMenuOverlay.classList.toggle('active');
		});

		// Close mobile menu when clicking on a link
		mobileNavLinks.forEach(link => {
			link.addEventListener('click', () => {
				hamburgerMenu.classList.remove('active');
				mobileMenuOverlay.classList.remove('active');
			});
		});

		// Close mobile menu when clicking on overlay
		mobileMenuOverlay.addEventListener('click', (e) => {
			if (e.target === mobileMenuOverlay) {
				hamburgerMenu.classList.remove('active');
				mobileMenuOverlay.classList.remove('active');
			}
		});
		
	(function() {
			const images = [
				'assets/KM_Logo3.png',
				'assets/KimM1.png',
				'assets/4.gif',
				'assets/KimM4.jpg',
				'assets/KimM5.jpg',
				'assets/7.gif',
				'assets/KimM6.jpg',
				'assets/KimM7.jpg',
				'assets/muziq-2.png', // toegevoegd
				'assets/KimM8.jpg',
				'assets/6.gif',
				'assets/KimM9.jpeg',
				'assets/kYm2.jpg', // toegevoegd
				'assets/KimM10.jpg',
				'assets/KimM11.jpg',
				'assets/8b.gif',
				'assets/KimM12.jpg',
				'assets/KimM13.jpg',
				'assets/17.gif',
				'assets/KimM15.jpg',
				'assets/KimMs2.jpg',
				'assets/11.gif',
				'assets/Kopie van IMG_7165.JPG', // toegevoegd
				'assets/KimM14.jpeg', // toegevoegd
				'assets/Digitakt-2.png' // toegevoegd
			];
		let idx = 0;
		const img = document.getElementById('about-slideshow');
		const overlay = document.getElementById('raster-overlay');
		const side = 7;
		const nCell = side * side;

		// Toon eerste foto direct
		img.src = images[0];
				// Maak grid cellen met golf-diagonale animatievolgorde
				overlay.innerHTML = '';
				for (let i = 0; i < nCell; i++) {
					const cell = document.createElement('div');
					cell.className = 'raster-cell';
					const x = i % side;
					const y = Math.floor(i / side);
					// Delay per diagonaal: golf van linksboven naar rechtsonder
					const delay = ((x + y) * 0.09).toFixed(3);
					cell.style.animationDelay = delay + 's';
					overlay.appendChild(cell);
				}
		// Ensure overlay is last child so it sits above the image
		const aboutPhoto = document.querySelector('.about-photo');
		if (aboutPhoto && overlay) {
			aboutPhoto.appendChild(overlay);
		}
			function showNext() {
				// Raster overlay tonen vlak voor de foto wisselt
				overlay.style.display = 'grid';
				overlay.style.opacity = 1;
				overlay.querySelectorAll('.raster-cell').forEach(cell => {
					cell.style.animation = 'none';
					void cell.offsetWidth;
					cell.style.animation = '';
					cell.classList.remove('active');
				});
				setTimeout(() => {
					overlay.querySelectorAll('.raster-cell').forEach(cell => {
						cell.classList.add('active');
					});
				}, 10);
				// Na 1.2s (animatie), wissel foto zonder fade-out
				setTimeout(() => {
					idx = (idx + 1) % images.length;
					img.src = images[idx];
					img.style.opacity = 1;
					// Fade overlay out quickly, but keep image visible
					overlay.style.transition = 'opacity 0.3s';
					overlay.style.opacity = 0;
					setTimeout(() => {
						overlay.style.display = 'none';
						overlay.style.transition = '';
					}, 300);
				}, 1200);
			}
		// Start slideshow: 4s foto, dan raster, dan wissel
	setInterval(showNext, 4000);
	})();
