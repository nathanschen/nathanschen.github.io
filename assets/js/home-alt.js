(() => {
	'use strict';

	const home = document.querySelector('#home-section.alt-homepage');
	if (!home) return;

	const cards = [...home.querySelectorAll('[data-alt-project]')];
	const links = [...home.querySelectorAll('[data-alt-nav]')];

	function updateHomeChrome() {
		const hash = window.location.hash;
		document.body.classList.toggle('alt-home-active', !hash || hash === '#home');
	}

	function setCurrent(project) {
		links.forEach((link) => {
			const isCurrent = link.dataset.altNav === project;
			link.dataset.current = String(isCurrent);
			if (isCurrent) link.setAttribute('aria-current', 'true');
			else link.removeAttribute('aria-current');
		});
	}

	cards.forEach((card) => {
		const project = card.dataset.altProject;
		card.addEventListener('mouseenter', () => setCurrent(project));
		card.addEventListener('focusin', () => setCurrent(project));
	});

	if ('IntersectionObserver' in window) {
		const visibleCards = new Map();
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) visibleCards.set(entry.target, entry.intersectionRatio);
				else visibleCards.delete(entry.target);
			});

			const current = [...visibleCards.entries()]
				.sort((a, b) => b[1] - a[1])[0]?.[0];

			if (current) setCurrent(current.dataset.altProject);
		}, {
			rootMargin: '-20% 0px -35% 0px',
			threshold: [0.1, 0.25, 0.5, 0.75]
		});

		cards.forEach((card) => observer.observe(card));
	}

	links.forEach((link) => {
		link.addEventListener('mouseenter', () => setCurrent(link.dataset.altNav));
		link.addEventListener('focus', () => setCurrent(link.dataset.altNav));
	});

	window.addEventListener('hashchange', updateHomeChrome);
	updateHomeChrome();
	setCurrent('client');
})();
