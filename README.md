# Portfolio — Obinna Akpulonu

Plain HTML/CSS/JS, no build step, no framework dependency. `index.html` +
`styles.css` + `script.js` + `assets/`.

## Run it locally

```bash
python3 -m http.server 4173 --directory .
```

Then open `http://localhost:4173`.

## Updating content

- **Case files** (the 3D folder carousel and the project pop-ups) live in the
  `CASE_FILES` and `projects` arrays in `script.js`. EstatePadi and Anwrk are
  written out in `CASE_FILES`; the five open-source case studies pull their
  write-ups from `projects`.
- **Live / Code links**: set a case study's `live` or `repo` field in `projects`.
  `repo` currently points every case study at the GitHub profile; switch each to
  its own repo once those are public.
- **Social links and booking**: `SOCIAL_LINKS` at the top of `script.js` holds the
  X profile and the Google Calendar booking page.
- **Résumé**: replace `assets/Obinna_Akpulonu_Resume.pdf`.
- **Open-source contributions**: the `oss-card` articles under the GitHub card
  in `index.html` (Skills section). Copy one `<article class="oss-card">` per
  merged PR, newest first.

## Your photo

Two small web crops are used (the large originals are never loaded by the page):

- `assets/profile-face.jpg` (320×320): face crop of `profile1.jpeg`, the circle
  beside your name in the hero, full colour.
- `assets/profile-pass.jpg` (900×1125, 4:5): crop of `profile.png`, the access
  pass in About, colour-graded to navy by the CSS.

To swap a photo, replace that file (search `index.html` for "YOUR PHOTO").
Keep each under ~300 KB.

## GitHub contributions card

The Skills section shows your GitHub contribution calendar. The site is static and
GitHub doesn't allow its contributions page to be fetched from the browser, so the
data is a snapshot in `assets/github-contributions.json`. Refresh it before each
deploy (Node 18+):

```bash
node scripts/update-github-contributions.mjs joshyvibe
```

The card shows the snapshot date, so it never pretends to be live. Once this folder
is in a GitHub repo, a scheduled GitHub Action can run the same command daily and
commit the result.

## SEO & link previews

The site is set up for `https://joshyvibe.midi8.app/`:

- `index.html` head: title, description, canonical URL, Open Graph + X card tags,
  and JSON-LD (Person + WebSite) so search engines know who the site is about.
- `assets/og-image.jpg` (1200×630): the card shown when the link is shared.
- `robots.txt`, `sitemap.xml`, `site.webmanifest`, and icons in `assets/`
  (`favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192/512.png`).

If the domain changes, replace `https://joshyvibe.midi8.app/` in
`index.html`, `robots.txt` and `sitemap.xml` (search and replace all three).
After going live, submit `sitemap.xml` in Google Search Console and check the share
card with LinkedIn's Post Inspector and an X post preview.

## Deploying the site itself

Static files, so any static host works. Simplest options:

- **Vercel / Netlify**: drag-and-drop this folder, or connect the repo and
  set the root directory to `portfolio-website/`. No build command needed.
- **GitHub Pages**: push this folder to a repo and enable Pages on it.

## Structure

```
index.html          markup + copy (hero, case files, About, Experience, Skills, How I work, Contact)
styles.css          design system: navy theme + film grain, light mode, all components
script.js           theme, nav, case-files carousel + pop-ups, booking pop-up,
                    GitHub calendar, clock, copy-email, animations
robots.txt          crawler rules + sitemap location
sitemap.xml         single-page sitemap
site.webmanifest    app name, colours and icons
scripts/
  update-github-contributions.mjs   refreshes assets/github-contributions.json
assets/
  Obinna_Akpulonu_Resume.pdf   served by "Download résumé"
  og-image.jpg                 link-preview card (1200×630)
  favicon.svg, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png
  profile-face.jpg, profile-pass.jpg   hero circle + access-pass photos
  github-contributions.json    snapshot for the contributions card
  conflict-resolution.gif      demo clip used in the Kanban case file
  projects/                    screenshots used by the case files
```

## Motion / interaction notes

- Everything respects `prefers-reduced-motion`: the case-files carousel stops
  being scroll-driven, and the blobs, tilt, sway, sheen, typing terminal and
  count-ups fall back to static states.
- Hover-only effects (spotlight glow, magnetic buttons, pass tilt) only run on
  devices that report `(hover: hover)`, so touch devices don't get stuck states.
- On phones the case files follow the finger and snap one file per swipe.
