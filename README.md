# Neeraj Sisodiya — Portfolio

A fast, premium personal portfolio. **Zero dependencies, zero build step** — plain
HTML, CSS and JavaScript you can open, edit and deploy anywhere.

**Live sections:** Hero → About → Projects (bento grid + case-study modals) → Skills →
Background → Contact (validated form) → Footer. Dark charcoal theme with an electric
violet accent, Inter (self-hosted), reveal-on-scroll animations that respect
`prefers-reduced-motion`.

---

## Run it locally

No installs needed.

- **Easiest:** double-click `index.html` — the site works from the file system.
- **Recommended (serves like production):**

  ```
  python -m http.server 8123
  ```

  then open [http://127.0.0.1:8123](http://127.0.0.1:8123)

---

## Make it yours — 10-minute checklist

### 1. Connect your details → `site.config.js`

This one file powers every "connection point" on the site. Anything left as `""`
is hidden automatically, so nothing looks broken while it's empty.

| Setting | What it does | Status |
|---|---|---|
| `email` | Contact links, footer, and the form's email fallback | ✅ set |
| `phone` | Tap-to-call link in Contact + Footer | ✅ set |
| `instagram` | Instagram links in hero, contact, footer | ✅ set |
| `linkedin` | All LinkedIn links | ✅ set |
| `github` | GitHub icons in hero, contact, footer, and the portfolio card | ⚠️ placeholder — add when ready |
| `resumeUrl` | "Download resume" buttons (drop `resume.pdf` in the root first) | ⚠️ placeholder |
| `formEndpoint` | Where the contact form POSTs (see below) | ⚠️ optional |
| `availability` | The green "Open to work" badges | ✅ done |
| `avatar` | Hero portrait (already set to `assets/img/portrait.jpg`) | ✅ done |

### 2. Connect the contact form (optional)

Right now (no endpoint) the form **opens the visitor's email app** addressed to
neeraj.raj.07360@gmail.com with the message pre-filled — honest and functional. To
receive messages on the web instead:

1. Create a free form at [formspree.io](https://formspree.io) (or use Getform / Web3Forms).
2. Put your endpoint in `site.config.js` → `formEndpoint: "https://formspree.io/f/xxxxxx"`.
3. That's it — the form switches to server submission with loading/success/error states.
   It never shows "sent" unless the server actually accepted the message.

### 3. Replace the sample projects → `index.html`

**PromptDeck and InsightBoard are fictional examples** — they're labeled with an
"Example" badge on the site so they can't be mistaken for real work. To replace one,
find its `<article class="project-card">` block in `index.html`:

- Edit the name, summary, tech chips and the `<template id="case-…">` case study
  (Situation / Task / Action / Result).
- Delete the `<span class="chip chip--example">Example</span>` line and the yellow
  warning note under the grid (`<p class="bento__note">`) once everything is real.
- Add live/repo links inside `project-card__actions` when you have them.

"This portfolio" is a real entry — keep it, update it as the site evolves.

### 4. Polish the text → `index.html`

Every section is marked with `<!-- ============ Section ============ -->` comments.
Rewrite the hero lede, about paragraphs, skills and background in your own words.

### 5. Ship a new portrait

Replace `assets/img/portrait.jpg` (640×704 works best — the card is 10:11). To
re-optimize a new photo the same way: put it at `assets/img/portrait-src.jpg` and run
`python scripts/optimize_portrait.py`.

### 6. Update SEO

In `index.html` `<head>`: page `<title>`, meta description, and `og:url` once you have
a domain. If you change the site meaningfully, bump the `?v=2` query strings on the
CSS/JS links so returning visitors get the fresh files.

---

## Deploy (free)

| Host | How |
|---|---|
| **Netlify** | Drag the folder onto [app.netlify.com/drop](https://app.netlify.com/drop). Done. |
| **Vercel** | `npx vercel` in this folder, or import the repo in the dashboard (no framework preset — it's static). |
| **GitHub Pages** | Push this folder to a repo named `your-username.github.io` → Settings → Pages → deploy from branch. The included `404.html` works automatically. |

All three hosts serve `404.html` for unknown URLs automatically. (Python's built-in
dev server does not — that's expected.)

---

## Project structure

```
├── index.html            ← all content & sections (edit text here)
├── site.config.js        ← email / links / form / availability (edit settings here)
├── 404.html              ← styled not-found page (standalone)
├── robots.txt
├── assets/
│   ├── css/style.css     ← design system + all styles (tokens at the top)
│   ├── js/main.js        ← nav, menu, scroll-spy, reveals, modal, form
│   ├── fonts/inter-var.woff2   (self-hosted Inter, 48 KB)
│   └── img/              ← portrait, favicon, OG image
└── scripts/
    ├── generate_assets.py       ← regenerates og.png / icons (pure Python)
    ├── optimize_portrait.py     ← resize + strip EXIF from a new photo
    └── test_endpoint_server.py  ← local mock for testing the form (optional)
```

## Design tokens

Defined once at the top of `style.css`: background `#06070b`, surfaces, text tiers,
accent `#7c5cff`, radii, shadows, easing. Change a token there and it propagates
everywhere.

## Testing the form locally

```
python scripts/test_endpoint_server.py     # mock endpoint on :8124
```

Then in the browser console: `SITE.formEndpoint = "http://127.0.0.1:8124/submit"`
(success path) or `".../8124/fail"` (error path).

## Verified

- Desktop + mobile (390 px) rendering, no horizontal overflow
- Keyboard: skip link, focus-visible rings, Esc closes menu & dialog, focus management
- Form: required/email/min-length validation, honeypot, success & error states, mailto fallback
- Case-study dialogs (native `<dialog>`, backdrop + Esc close, scroll lock)
- Reduced-motion support, semantic landmarks, ARIA states, JSON-LD person schema
- No failed network requests; total page weight ≈ 210 KB (≈ 53 KB portrait, 48 KB font,
  62 KB OG image, ~15 KB code)

Run Lighthouse yourself: Chrome DevTools → Lighthouse → Performance/Accessibility/
Best Practices/SEO (use the `python -m http.server` URL).
