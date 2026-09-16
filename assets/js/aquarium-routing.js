(() => {
	'use strict';

	// Aquarium owns only its fish home. All other routes use the shared
	// sections in the standard homepage, so their content stays in one place.
	const sharedRoutes = new Set([
		'about',
		'client',
		'fastatucla',
		'mebrand',
		'articles',
		'personal',
		'studio',
	]);

	function routeToStandard(hash, replace = false) {
		const route = hash.slice(1);
		if (!sharedRoutes.has(route)) return false;

		const destination = `index.html${hash}`;
		if (replace) window.location.replace(destination);
		else window.location.assign(destination);
		return true;
	}

	if (routeToStandard(window.location.hash, true)) return;

	document.addEventListener('click', (event) => {
		const link = event.target.closest('a[href^="#"]');
		if (!link || link.target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

		const hash = link.getAttribute('href');
		if (!hash || !routeToStandard(hash)) return;

		event.preventDefault();
		event.stopImmediatePropagation();
	}, true);

	window.addEventListener('hashchange', () => routeToStandard(window.location.hash, true));
})();
