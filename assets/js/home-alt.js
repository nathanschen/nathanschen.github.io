(() => {
	'use strict';

	const home = document.querySelector('#home-section');
	if (!home) return;
	// The section router replaces className when a subpage is loaded directly.
	home.classList.add('alt-homepage');

	const cards = [...home.querySelectorAll('[data-alt-project]')];
	const links = [...home.querySelectorAll('[data-alt-nav]')];
	const logoFish = home.querySelector('.alt-home-logo');
	const routeHeader = document.querySelector('#header.alt-route-header');
	const identityRow = logoFish.closest('[data-alt-project="about"]');
	const logoHomeMarker = document.createComment('Homepage identity row position');
	identityRow.before(logoHomeMarker);
	let departureRect = null;

	// Capture the visible origin before the section router hides the old page.
	document.addEventListener('click', (event) => {
		const link = event.target.closest('a[href^="#"]');
		if (link && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
			departureRect = logoFish.getBoundingClientRect();
		}
	}, true);


	home.querySelectorAll('.alt-expanding-fish').forEach((expandingFish) => {
		const project = expandingFish.closest('[data-alt-project]').dataset.altProject;
		const photoSources = [...new Set(
			[...document.querySelectorAll(`#${project}-section img`)]
				.map((image) => image.dataset.src || image.getAttribute('src'))
				.filter((src) => src && !src.startsWith('data:'))
		)];
		const photoStrip = expandingFish.querySelector('.alt-fish-photos');

		function randomizePhotos() {
			if (!photoStrip) return;
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
		photoStrip?.querySelectorAll('img').forEach((image) => image.addEventListener('load', fitFishBody, { once: true }));
		document.fonts.ready.then(fitFishBody);
		fitFishBody();
	});

	function updateHomeChrome() {
		const hash = window.location.hash;
		const isHome = !hash || hash === '#home';
		const wasInHeader = identityRow.parentElement === routeHeader;
		const origin = departureRect || logoFish.getBoundingClientRect();
		departureRect = null;
		document.body.classList.toggle('alt-home-active', isHome);

		if (isHome) logoHomeMarker.after(identityRow);
		else routeHeader.append(identityRow);
		logoFish.setAttribute('href', isHome ? '#about' : '#home');
		logoFish.setAttribute('aria-label', isHome ? 'About Nathan S. Chen and CV' : 'Return to homepage');

		if (wasInHeader === isHome && origin.width && origin.height
			&& !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			const destination = logoFish.getBoundingClientRect();
			if (destination.width && destination.height) {
				logoFish.getAnimations().forEach((animation) => animation.cancel());
				logoFish.animate([
					{ transform: `translate(${origin.left - destination.left}px, ${origin.top - destination.top}px)` },
					{ transform: 'translate(0, 0)' }
				], { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
			}
		}
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
