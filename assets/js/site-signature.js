(() => {
	'use strict';

	const headerInner = document.querySelector('#container01 .wrapper > .inner');
	const signature = document.querySelector('#text34');
	const homeLink = document.querySelector('#header #text46 a[href="#home"]');
	const aboutIntro = document.querySelector('#text65');
	const aboutClosing = document.querySelector('#text30');

	if (headerInner && signature) {
		signature.classList.add('header-signature');
		headerInner.insertBefore(signature, headerInner.children[1]);
		headerInner.classList.add('has-header-signature');
	}

	if (homeLink) {
		homeLink.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();

			if (window.location.hash !== '#home') {
				window.location.hash = 'home';
			} else {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		});
	}

	if (aboutIntro) {
		aboutIntro.innerHTML = [
			'<span class="p">Hi! I&#39;m <strong>Nathan Chen</strong>. I am a 1st-year Masters student at <strong>NYU</strong> studying Data Science. Previously, I studied Math-CS and Stats-DS at UCLA. My interests range from photography and image processing to sustainability and climate modeling. I am always seeking new challenges and working to make an interdisciplinary, human impact.</span>',
			'<span class="p">I am currently conducting <strong>applied AI research</strong> at UCLA, Stanford, and JPL.</span>',
		].join('');
	}

	if (aboutClosing) {
		aboutClosing.textContent = 'I\'m always open to new opportunities and connections. Reach out through Instagram, Linkedin, or Email below.';
	}
})();
