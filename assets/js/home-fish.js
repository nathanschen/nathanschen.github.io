(() => {
	'use strict';

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const home = document.querySelector('#home-section');
	const surface = document.querySelector('#divider07');
	const signature = document.querySelector('#text34');
	const swimLayer = document.createElement('div');
	const fishPairs = [
		['#text01', '#text35', -1, 0.22, 1],
		['#text38', '#text36', 1, 1.34, 1.5],
		['#text45', '#text29', -1, 2.48, 1],
		['#text62', '#text27', 1, 3.56, 1],
		['#text60', '#text28', -1, 4.71, 1],
		['#text61', '#text25', -1, 5.82, 1]
	];

	if (!home || !surface || !signature) return;

	swimLayer.id = 'home-swim-layer';
	document.body.append(swimLayer);

	const fish = [];
	let previousTime = performance.now();
	let animationFrame;
	let entryAnimationFrame;
	let swimTime = 0;
	let resumeAt = performance.now();
	let homeWasActive = isHomeVisible();
	let layerWasVisible = false;

	function isHomeRoute() {
		return !window.location.hash || window.location.hash === '#home';
	}

	function updateLayerVisibility() {
		const visible = isHomeVisible();

		if (visible === layerWasVisible) return;

		layerWasVisible = visible;
		swimLayer.classList.toggle('is-visible', visible);

		if (visible) {
			playHomeEntry();
		} else {
			window.cancelAnimationFrame(entryAnimationFrame);
			swimLayer.classList.remove('is-entering');
			fish.forEach((item) => item.entryAnimation?.cancel());
		}
	}

	function isHomeVisible() {
		return home.classList.contains('active') && isHomeRoute() && performance.now() >= resumeAt;
	}

	function playHomeEntry() {
		swimLayer.classList.add('is-entering');
		window.cancelAnimationFrame(entryAnimationFrame);
		entryAnimationFrame = window.requestAnimationFrame(() => {
			if (!layerWasVisible) return;

			fish.forEach((item) => {
				item.entryAnimation?.cancel();
				item.entryAnimation = item.element.animate([
					{ maskSize: '0% 100%', maskImage: 'linear-gradient(90deg, black 100%, transparent 100%)' },
					{ maskSize: '110% 110%', maskImage: 'linear-gradient(90deg, black 100%, transparent 100%)' }
				], {
					duration: 1000,
					easing: 'ease',
					fill: 'both'
				});
			});
			swimLayer.classList.remove('is-entering');
		});
	}

	function measure(item) {
		item.width = item.element.offsetWidth;
		item.height = item.element.offsetHeight;
		item.glyphWidth = item.glyph.offsetWidth;
		item.glyphHeight = item.glyph.offsetHeight;
		const glyphDiagonal = Math.hypot(item.glyphWidth, item.glyphHeight);

		// The label stays horizontal while the glyph turns, so reserve the
		// glyph's full diagonal in addition to the label's vertical space.
		item.safeWidth = Math.max(item.width, glyphDiagonal) + 32;
		item.safeHeight = item.height + Math.max(0, glyphDiagonal - item.glyphHeight) + 32;
	}

	function waterBounds() {
		const surfaceBounds = surface.getBoundingClientRect();
		const signatureBounds = signature.getBoundingClientRect();
		const top = Math.max(24, surfaceBounds.bottom + 24);
		const bottom = Math.max(top + 80, Math.min(window.innerHeight - 24, signatureBounds.top - 24));

		return { top, bottom };
	}

	function layoutRoutes() {
		const water = waterBounds();
		const columns = window.innerWidth >= 900 ? 3 : (window.innerWidth < 320 ? 1 : 2);
		const rows = Math.ceil(fish.length / columns);
		const outerX = 24;
		const outerY = 12;
		const gapX = 28;
		const gapY = 24;
		const cellWidth = (window.innerWidth - (outerX * 2) - (gapX * (columns - 1))) / columns;
		const cellHeight = (water.bottom - water.top - (outerY * 2) - (gapY * (rows - 1))) / rows;
		const inset = 8;

		fish.forEach((item, index) => {
			const column = index % columns;
			const row = Math.floor(index / columns);
			const left = outerX + column * (cellWidth + gapX);
			const top = water.top + outerY + row * (cellHeight + gapY);
			const scale = Math.max(0, Math.min(1, (cellWidth - (inset * 2)) / item.safeWidth, (cellHeight - (inset * 2)) / item.safeHeight));
			const safeWidth = item.safeWidth * scale;
			const safeHeight = item.safeHeight * scale;

			item.route = {
				scale,
				centerX: left + (cellWidth / 2),
				centerY: top + (cellHeight / 2),
				amplitudeX: Math.max(0, (cellWidth - safeWidth - (inset * 2)) / 2),
				amplitudeY: Math.max(0, (cellHeight - safeHeight - (inset * 2)) / 2),
				speed: 0.000043 + ((index % 3) * 0.000004),
				waveOffset: index * 0.91,
				yFlip: index % 2 === 0 ? 1 : -1
			};
		});
	}

	function matchLabelSizes() {
		fish.forEach((item) => {
			const scale = Math.max(item.route.scale, 0.25);
			item.label.style.fontSize = `${((item.labelBaseFontSize * item.labelSizeMultiplier) / scale).toFixed(2)}px`;
		});
	}

	function layoutFish() {
		for (let iteration = 0; iteration < 3; iteration += 1) {
			fish.forEach(measure);
			layoutRoutes();
			matchLabelSizes();
		}

		fish.forEach(measure);
		layoutRoutes();
		matchLabelSizes();
		fish.forEach(position);
	}

	function orientGlyph(item, velocityX, velocityY) {
		const movingRight = velocityX >= 0;
		const mirror = movingRight ? item.initialEyeDirection : -item.initialEyeDirection;
		const rotation = movingRight
			? Math.atan2(velocityY, velocityX)
			: Math.atan2(-velocityY, -velocityX);

		item.glyph.style.transform = `rotate(${rotation.toFixed(4)}rad) scaleX(${mirror})`;
	}

	function position(item) {
		const route = item.route;
		const time = (swimTime * route.speed) + item.phase;
		const wobble = route.waveOffset;
		const xWave = (0.68 * Math.sin(time)) + (0.32 * Math.sin((time * 2.73) + wobble));
		const yWave = route.yFlip * ((0.56 * Math.sin((time * 1.61) + wobble)) + (0.26 * Math.sin((time * 3.17) - wobble)));
		const velocityX = route.amplitudeX * ((0.68 * Math.cos(time)) + (0.8736 * Math.cos((time * 2.73) + wobble)));
		const velocityY = route.amplitudeY * route.yFlip * ((0.9016 * Math.cos((time * 1.61) + wobble)) + (0.8242 * Math.cos((time * 3.17) - wobble)));
		const centerX = route.centerX + (route.amplitudeX * xWave);
		const centerY = route.centerY + (route.amplitudeY * yWave);
		const horizontal = centerX - ((item.width * route.scale) / 2);
		const vertical = centerY - ((item.height * route.scale) / 2);

		item.element.style.transform = `translate3d(${horizontal.toFixed(2)}px, ${vertical.toFixed(2)}px, 0) scale(${route.scale.toFixed(3)})`;
		orientGlyph(item, velocityX || 1, velocityY);
	}

	function initializeFish() {
		fishPairs.forEach(([glyphSelector, labelSelector, initialEyeDirection, phase, labelSizeMultiplier]) => {
			const glyph = document.querySelector(glyphSelector);
			const label = document.querySelector(labelSelector);
			const element = glyph?.parentElement;

			if (!glyph || !label || !element || label.parentElement !== element) return;

			element.classList.add('home-swimming-fish');
			element.style.setProperty('height', 'auto', 'important');
			element.style.setProperty('min-height', '0', 'important');
			swimLayer.append(element);
			fish.push({
				element,
				glyph,
				label,
				initialEyeDirection,
				phase,
				labelBaseFontSize: parseFloat(window.getComputedStyle(label).fontSize),
				labelSizeMultiplier,
				width: 0,
				height: 0,
				glyphWidth: 0,
				glyphHeight: 0,
				safeWidth: 0,
				safeHeight: 0,
				entryAnimation: null,
				route: null
			});
		});

		layoutFish();
	}

	function animate(time) {
		if (document.hidden) return;

		const seconds = Math.min((time - previousTime) / 1000, 0.05);
		previousTime = time;
		const homeIsActive = isHomeVisible();
		updateLayerVisibility();

		if (homeIsActive && homeWasActive) {
			swimTime += seconds * 1000;
			fish.forEach(position);
		}
		homeWasActive = homeIsActive;
		animationFrame = window.requestAnimationFrame(animate);
	}

	function resize() {
		layoutFish();
	}

	function resumeAnimation() {
		if (document.hidden) return;
		previousTime = performance.now();
		window.cancelAnimationFrame(animationFrame);
		animationFrame = window.requestAnimationFrame(animate);
	}

	initializeFish();
	window.addEventListener('resize', resize, { passive: true });
	if (document.fonts?.ready) document.fonts.ready.then(resize);
	window.addEventListener('hashchange', () => {
		resumeAt = (!window.location.hash || window.location.hash === '#home') ? performance.now() + 900 : Infinity;
		homeWasActive = false;
		updateLayerVisibility();
	});
	document.addEventListener('visibilitychange', resumeAnimation);
	updateLayerVisibility();
	resumeAnimation();
})();
