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