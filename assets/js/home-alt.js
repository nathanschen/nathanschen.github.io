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
	const identityName = identityRow.querySelector('h2');
	const logoHomeMarker = document.createComment('Homepage identity row position');
	identityRow.before(logoHomeMarker);
	let departureRect = null;
	let departureNameRect = null;
	let cancelLogoReturn = null;
	let releaseHeaderHold = null;

	// Capture the visible origin before the section router hides the old page.
	document.addEventListener('click', (event) => {
		const link = event.target.closest('a[href^="#"]');
		if (link && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
			departureRect = logoFish.getBoundingClientRect();
			departureNameRect = identityName.getBoundingClientRect();
		}
	}, true);


	let closeActiveFish = null;
	home.querySelectorAll('.alt-expanding-fish').forEach((expandingFish) => {
		const project = expandingFish.closest('[data-alt-project]').dataset.altProject;
		const fixedPhotos = expandingFish.hasAttribute('data-fixed-photos');
		const photoSources = [...new Set(
			[...document.querySelectorAll(`#${project}-section img`)]
				.map((image) => image.dataset.src || image.getAttribute('src'))
				.filter((src) => src && !src.startsWith('data:'))
		)];
		const photoStrip = expandingFish.querySelector('.alt-fish-photos');
		// Keep hit testing independent of the animated visual.
		const trigger = document.createElement('a');
		trigger.className = 'alt-fish-trigger';
		trigger.href = expandingFish.getAttribute('href');
		trigger.setAttribute('aria-label', expandingFish.getAttribute('aria-label'));
		const visualFish = document.createElement('span');
		visualFish.className = expandingFish.className;
		visualFish.setAttribute('aria-hidden', 'true');
		visualFish.append(...expandingFish.childNodes);
		expandingFish.replaceWith(trigger);
		expandingFish = visualFish;
		trigger.append(expandingFish);
		let closeTimer;
		let pointerInside = false;

		function closeFish() {
			clearTimeout(closeTimer);
			trigger.classList.remove('is-open', 'is-interactive');
			if (closeActiveFish === closeFish) closeActiveFish = null;
		}

		function scheduleClose() {
			clearTimeout(closeTimer);
			closeTimer = setTimeout(() => {
				if (!pointerInside && !trigger.contains(document.activeElement)) closeFish();
			}, 450);
		}



		function randomizePhotos() {
			if (!photoStrip || fixedPhotos) return;
			const shuffled = [...photoSources];
			for (let i = shuffled.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
			}
			photoStrip.replaceChildren(...shuffled.slice(0, 2).map((src) => {
				const image = document.createElement('img');
				image.addEventListener('load', fitFishBody, { once: true });
				image.src = src;
				image.alt = '';
				return image;
			}));
		}

		function openFish() {
			clearTimeout(closeTimer);
			trigger.classList.add('is-interactive');
			if (trigger.classList.contains('is-open')) return;
			if (closeActiveFish) closeActiveFish();
			closeActiveFish = closeFish;
			randomizePhotos();
			fitFishBody();
			trigger.classList.add('is-open');
		}

		function fitFishBody() {
			const head = expandingFish.querySelector('.alt-fish-head');
			const tail = expandingFish.querySelector('.alt-fish-tail');
			const page = expandingFish.closest('.site-main');
			const rightEdge = Math.min(page.getBoundingClientRect().right, document.documentElement.clientWidth) - 16;
			const baseX = trigger.getBoundingClientRect().left;
			const closedWidth = head.getBoundingClientRect().width + tail.getBoundingClientRect().width;
			const fontSize = parseFloat(getComputedStyle(expandingFish).fontSize);
			const otherFishWidth = Math.max(...[...home.querySelectorAll('.alt-project-fish')].map((fish) => {
				const fishHead = fish.querySelector('.alt-fish-head');
				const fishTail = fish.querySelector('.alt-fish-tail');
				return fishHead ? fishHead.getBoundingClientRect().width + fishTail.getBoundingClientRect().width : fish.getBoundingClientRect().width;
			}));
			const available = Math.max(0, rightEdge - baseX - closedWidth);
			const shift = Math.min(otherFishWidth + fontSize * 0.4, Math.max(0, available - 64));
			const images = [...photoStrip.querySelectorAll('img')];
			const ratios = images.map((image) => image.naturalHeight ? image.naturalWidth / image.naturalHeight : 1.5);
			const ratioSum = ratios.reduce((sum, ratio) => sum + ratio, 0);
			const availableForBody = Math.max(0, available - shift);
			const gap = Math.min(fontSize * 0.16, availableForBody / (images.length + 1));
			const spacing = gap * (images.length + 1);
			const height = ratioSum ? Math.max(0, Math.min(
				fontSize * 2.8812 * 2,
				window.innerHeight - 48,
				(availableForBody - spacing) / ratioSum
			)) : 0;
			const bodyWidth = Math.min(availableForBody, height * ratioSum + spacing);
			expandingFish.style.setProperty('--fish-photo-gap', `${gap}px`);
			expandingFish.style.setProperty('--fish-body-width', `${bodyWidth}px`);
			expandingFish.style.setProperty('--fish-photo-height', `${height}px`);
			trigger.style.setProperty('--fish-closed-width', `${closedWidth}px`);
			trigger.style.setProperty('--fish-open-width', `${closedWidth + bodyWidth + shift}px`);
			trigger.style.setProperty('--fish-shift', `${shift}px`);
			const centerY = trigger.getBoundingClientRect().top + trigger.getBoundingClientRect().height / 2;
			const halfHeight = height / 2;
			const shiftY = Math.max(16 + halfHeight - centerY, Math.min(0, window.innerHeight - 16 - halfHeight - centerY));
			trigger.style.setProperty('--fish-shift-y', `${shiftY}px`);
			trigger.style.setProperty('--fish-hit-left', `${shift + head.getBoundingClientRect().width}px`);
			trigger.style.setProperty('--fish-hit-top', `${trigger.getBoundingClientRect().height / 2 - halfHeight + shiftY}px`);
			trigger.style.setProperty('--fish-hit-width', `${bodyWidth + tail.getBoundingClientRect().width}px`);
			trigger.style.setProperty('--fish-hit-height', `${height}px`);
			images.forEach((image, index) => {
				image.style.height = `${height}px`;
				image.style.width = `${height * ratios[index]}px`;
			});
		}

		const resizeObserver = new ResizeObserver(fitFishBody);
		resizeObserver.observe(home);
		window.addEventListener('resize', fitFishBody);
		trigger.addEventListener('pointerenter', () => {
			pointerInside = true;
			openFish();
		});
		trigger.addEventListener('pointerleave', () => {
			pointerInside = false;
			trigger.classList.remove('is-interactive');
			scheduleClose();
		});
		trigger.addEventListener('focusin', openFish);
		trigger.addEventListener('focusout', () => {
			if (!pointerInside) trigger.classList.remove('is-interactive');
			scheduleClose();
		});
		photoStrip?.querySelectorAll('img').forEach((image) => image.addEventListener('load', fitFishBody, { once: true }));
		document.fonts.ready.then(fitFishBody);
		fitFishBody();
	});

	function animateLogoReturn(origin, nameOrigin) {
		// Keep both identity elements outside the section fade until Home is opaque.
		const items = [[logoFish, origin], [identityName, nameOrigin]].map(([element, start]) => {
			const overlay = document.createElement('span');
			const style = getComputedStyle(element);
			overlay.textContent = element.textContent;
			overlay.setAttribute('aria-hidden', 'true');
			Object.assign(overlay.style, {
				position: 'fixed', left: `${start.left}px`, top: `${start.top}px`,
				width: `${start.width}px`, height: `${start.height}px`,
				display: element === logoFish ? 'inline-flex' : 'block',
				alignItems: 'center', pointerEvents: 'none', margin: '0',
				fontFamily: style.fontFamily, fontSize: style.fontSize,
				fontWeight: style.fontWeight, lineHeight: style.lineHeight,
				color: style.color, whiteSpace: 'nowrap', zIndex: '9999'
			});
			document.body.append(overlay);
			element.style.visibility = 'hidden';
			return { element, overlay, start, animation: null };
		});
		let frame;
		const cleanup = () => {
			observer.disconnect();
			cancelAnimationFrame(frame);
			items.forEach(({ element, overlay, animation }) => {
				animation?.cancel();
				overlay.remove();
				element.style.removeProperty('visibility');
			});
			if (cancelLogoReturn === cleanup) cancelLogoReturn = null;
		};
		const observer = new MutationObserver(() => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(tryStart);
		});
		function tryStart() {
			if (home.classList.contains('inactive') || !logoFish.getBoundingClientRect().width) return;
			observer.disconnect();
			items.forEach((item) => {
				const destination = item.element.getBoundingClientRect();
				item.animation = item.overlay.animate([
					{ transform: 'translate(0, 0)' },
					{ transform: `translate(${destination.left - item.start.left}px, ${destination.top - item.start.top}px)` }
				], { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' });
			});
			function finishWhenHomeIsVisible() {
				if (cancelLogoReturn !== cleanup) return;
				if (parseFloat(getComputedStyle(home).opacity) >= 0.999) cleanup();
				else frame = requestAnimationFrame(finishWhenHomeIsVisible);
			}
			Promise.all(items.map((item) => item.animation.finished)).then(finishWhenHomeIsVisible, () => {});
		}
		cancelLogoReturn = cleanup;
		observer.observe(home, { attributes: true, attributeFilter: ['class', 'style'] });
		frame = requestAnimationFrame(tryStart);
	}

	function holdHeaderDuringFade() {
		const outgoing = document.querySelector('.site-main > .inner > section.active:not(#home-section)');
		if (!outgoing || outgoing.style.display === 'none') return;
		routeHeader.style.height = `${routeHeader.getBoundingClientRect().height}px`;
		document.body.classList.add('logo-returning');
		const observer = new MutationObserver(() => {
			if (outgoing.style.display === 'none') release();
		});
		function release() {
			observer.disconnect();
			document.body.classList.remove('logo-returning');
			routeHeader.style.removeProperty('height');
			if (releaseHeaderHold === release) releaseHeaderHold = null;
		}
		releaseHeaderHold = release;
		observer.observe(outgoing, { attributes: true, attributeFilter: ['style'] });
	}

	function updateHomeChrome() {
		if (cancelLogoReturn) cancelLogoReturn();
		if (releaseHeaderHold) releaseHeaderHold();
		const hash = window.location.hash;
		if (closeActiveFish) closeActiveFish();
		const isHome = !hash || hash === '#home';
		const wasInHeader = identityRow.parentElement === routeHeader;
		const origin = departureRect || logoFish.getBoundingClientRect();
		const nameOrigin = departureNameRect || identityName.getBoundingClientRect();
		departureRect = null;
		departureNameRect = null;
		if (isHome && wasInHeader) holdHeaderDuringFade();
		document.body.classList.toggle('alt-home-active', isHome);

		if (isHome) logoHomeMarker.after(identityRow);
		else routeHeader.append(identityRow);
		logoFish.setAttribute('href', isHome ? '#about' : '#home');
		logoFish.setAttribute('aria-label', isHome ? 'About Nathan S. Chen and CV' : 'Return to homepage');

		if (wasInHeader === isHome && origin.width && origin.height
			&& !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			if (isHome) {
				animateLogoReturn(origin, nameOrigin);
				return;
			}
			[[logoFish, origin], [identityName, nameOrigin]].forEach(([element, start]) => {
				element.getAnimations().forEach((animation) => animation.cancel());
				const destination = element.getBoundingClientRect();
				if (!destination.width || !destination.height) return;
				const base = getComputedStyle(element).transform;
				const restingTransform = base === 'none' ? '' : base;
				element.animate([
					{ transform: `translate(${start.left - destination.left}px, ${start.top - destination.top}px) ${restingTransform}` },
					{ transform: restingTransform || 'translate(0, 0)' }
				], { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
			});
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
