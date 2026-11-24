(() => {
	'use strict';

	const home = document.querySelector('#home-section.alt-homepage');
	if (!home) return;

	const cards = [...home.querySelectorAll('[data-alt-project]')];
	const links = [...home.querySelectorAll('[data-alt-nav]')];

	home.querySelectorAll('.alt-expanding-fish').forEach((expandingFish) => {
		const project = expandingFish.closest('[data-alt-project]').dataset.altProject;
		const photoSources = [...new Set(
			[...document.querySelectorAll(`#${project}-section img`)]
				.map((image) => image.dataset.src || image.getAttribute('src'))
				.filter((src) => src && !src.startsWith('data:'))
		)];
		const photoStrip = expandingFish.querySelector('.alt-fish-photos');

		function randomizePhotos() {
			const shuffled = [...photoSources];
			for (let i = shuffled.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
			}
			photoStrip.replaceChildren(...shuffled.slice(0, 5).map((src) => {
				const image = document.createElement('img');
				image.addEventListener('load', fitFishBody, { once: true });
				image.src = src;
				image.alt = '';
				return image;
			}));
		}

		function openFish() {
			randomizePhotos();
			fitFishBody();
		}

		function fitFishBody() {
			const head = expandingFish.querySelector('.alt-fish-head');
			const tail = expandingFish.querySelector('.alt-fish-tail');
			const page = expandingFish.closest('.site-main');
			const rightEdge = Math.min(page.getBoundingClientRect().right, document.documentElement.clientWidth) - 16;
			const available = rightEdge - expandingFish.getBoundingClientRect().left
				- head.getBoundingClientRect().width - tail.getBoundingClientRect().width;
			const images = [...photoStrip.querySelectorAll('img')];
			const ratios = images.map((image) => image.naturalHeight ? image.naturalWidth / image.naturalHeight : 1.5);
			const ratioSum = ratios.reduce((sum, ratio) => sum + ratio, 0);
			const fontSize = parseFloat(getComputedStyle(expandingFish).fontSize);
			const desiredHeight = fontSize * 2.8812;
			const spacing = fontSize * 0.16 * (images.length + 1);
			const bodyWidth = Math.max(0, Math.min(available, desiredHeight * ratioSum + spacing));
			const height = ratioSum ? Math.max(0, Math.min(desiredHeight, (bodyWidth - spacing) / ratioSum)) : 0;
			expandingFish.style.setProperty('--fish-body-width', `${bodyWidth}px`);
			images.forEach((image, index) => {
				image.style.height = `${height}px`;
				image.style.width = `${height * ratios[index]}px`;
			});
		}

		const resizeObserver = new ResizeObserver(fitFishBody);
		resizeObserver.observe(home);
		window.addEventListener('resize', fitFishBody);
		expandingFish.addEventListener('pointerenter', openFish);
		expandingFish.addEventListener('focus', openFish);
		photoStrip.querySelectorAll('img').forEach((image) => image.addEventListener('load', fitFishBody, { once: true }));
		document.fonts.ready.then(fitFishBody);
		fitFishBody();
	});

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
