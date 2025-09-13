const themeToggle = document.getElementById('theme-toggle');
		const body = document.body;

		themeToggle.addEventListener('click', () => {
			if (body.getAttribute('data-theme') === 'dark') {
				body.removeAttribute('data-theme');
				themeToggle.textContent = 'DARK';
			} else {
				body.setAttribute('data-theme', 'dark');
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
				'assets/KimM1.png',
				'assets/KimM3.jpg',
				'assets/KimM4.jpg',
				'assets/KimM5.jpg',
				'assets/KimM6.jpg',
				'assets/KimM7.jpg',
				'assets/KimM8.jpg',
				'assets/KimM9.jpeg',
				'assets/KimM10.jpg',
				'assets/KimM11.jpg',
				'assets/KimM12.jpg',
				'assets/KimM13.jpg',
				'assets/KimM15.jpg',
				'assets/KimMs2.jpg'
			];
		let idx = 0;
		const img = document.getElementById('about-slideshow');
		const overlay = document.getElementById('raster-overlay');
		const side = 7;
		const nCell = side * side;
				// Maak grid cellen met sterke random animatievolgorde
				overlay.innerHTML = '';
				for (let i = 0; i < nCell; i++) {
					const cell = document.createElement('div');
					cell.className = 'raster-cell';
					// Volledig willekeurige delay tussen 0 en 0.8s
					cell.style.animationDelay = (Math.random() * 0.8).toFixed(3) + 's';
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
