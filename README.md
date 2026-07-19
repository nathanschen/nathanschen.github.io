# Nathan Chen Portfolio

This is a static, self-hosted export of the public Carrd portfolio. It is ready to publish from a GitHub repository; no Carrd scripts, image hosting, font requests, or email-decoding endpoint are required at runtime.

## Edit the site

- Edit page copy, links, and layout in `index.html`.
- Replace or add images in `assets/images/`. Each gallery folder corresponds to one gallery in the page. The files ending in `_original.jpg` are the lightbox/full-size images.
- Locally hosted font definitions and font files are in `assets/css/fonts.css` and `assets/fonts/`.
- The Carrd export remains intentionally close to the original so the responsive layout, gallery lightboxes, scroll animations, and anchor navigation keep working.

## Preview locally

From this folder, run:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

This repository is named `nathanschen.github.io`, so GitHub Pages serves the site at `https://nathanschen.github.io/`.

The social-share and canonical metadata in `index.html` use that GitHub Pages URL as the primary public address. If you later purchase a custom domain, add a `CNAME` file and update those metadata values together.

## Export notes

- Captured locally: the full public HTML, all 89 public Carrd image assets, and all 22 webfont files used by the page.
- Kept external: article, social-media, Wix, Google Drive, and other outbound links, because those destinations are separate sites rather than portfolio assets.
- Replaced: the Carrd/Cloudflare-obfuscated email button is now a normal `mailto:` link; the Carrd credit and Carrd-only runtime references were removed.
- Not recoverable from a public page: the private Carrd editor/project configuration and any account-level Carrd settings. The visible, published site and public assets are included here.
