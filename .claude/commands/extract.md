# /extract — CMS Page Extraction

Extract and map every visible section of a web page into structured JSON + an interactive explorer.

**Usage**: `/extract <url>` (e.g. `/extract https://www.visitsaltlake.com/things-to-do/`)

## Prerequisites

- `agent-browser` installed globally (`npm i -g agent-browser && agent-browser install`)

## Output

All output goes into `reports/extractions/<slug>/` where `<slug>` is derived from the URL path (e.g. `things-to-do`).

Files produced:
- `screenshot.jpg` — Full-page screenshot (JPEG, quality 80)
- `sections.json` — Structured section map (positions, content, config)
- `deep-extraction.json` — Full DOM extraction (all attrs, children, innerHTML stats)
- `explorer.html` — Self-contained interactive explorer (hover overlays + JSON panel)

---

## Phase 1: Navigate & Prepare

Use `agent-browser` to navigate to the target URL.

```
agent-browser --url "<URL>" --task "Navigate to the page. Do NOT click anything yet."
```

Once loaded, run a preparation script to defeat lazy loading and hidden panels:

```javascript
// Force all lazy-loaded sections to render
document.querySelectorAll('[data-lazy-loading="true"]').forEach(el => {
  el.style.opacity = '1';
  el.classList.add('js-loaded');
});

// Force hidden accordion/tab panels visible for measurement
document.querySelectorAll('.activity, .ac-panel, [role="tabpanel"]').forEach(el => {
  el.style.display = 'block';
  el.style.height = 'auto';
  el.style.overflow = 'visible';
});

// Scroll to bottom and back to trigger IntersectionObservers
window.scrollTo(0, document.body.scrollHeight);
await new Promise(r => setTimeout(r, 2000));
window.scrollTo(0, 0);
await new Promise(r => setTimeout(r, 500));
```

Wait 3 seconds for rendering to settle.

## Phase 2: Identify Sections

Extract every major section on the page. Use multiple strategies to find section boundaries:

### Strategy A: CMS Widget Markers (SimpleView)
```javascript
document.querySelectorAll('[data-guid]').forEach(el => { /* ... */ });
```
Look for: `data-guid`, `ccl-widget` class, `data-widget-type`, `data-lazy-index`.

### Strategy B: Semantic HTML Sections
```javascript
document.querySelectorAll('header, nav, main, footer, section, article, aside').forEach(el => { /* ... */ });
```

### Strategy C: Large Container Divs
Any `div` that is (a) a direct child of `body` or `main`, and (b) has `offsetHeight > 40px`, and (c) is not already captured by A or B.

### Strategy D: Structural Gaps
After collecting all sections, sort by `offsetTop`. If there's a gap > 60px between consecutive sections, inspect the gap area for uncaptured content (headers, embeds, spacing blocks). Add overlay entries for these gaps.

For EACH section found, extract:

```json
{
  "index": 0,
  "guid": "from data-guid or generated slug",
  "className": "full class list",
  "allAttrs": { "every": "attribute" },
  "layout": {
    "width": "el.offsetWidth",
    "height": "el.offsetHeight",
    "top": "el.getBoundingClientRect().top + window.scrollY",
    "background": "computed backgroundColor",
    "padding": "computed padding",
    "margin": "computed margin"
  },
  "directChildren": [{ "tag": "DIV", "className": "...", "childCount": 3 }],
  "headings": ["all h1-h6 textContent"],
  "paragraphs": ["first 200 chars of each p"],
  "images": [{
    "src": "full URL",
    "alt": "alt text",
    "srcset": "if present",
    "loading": "eager|lazy",
    "width": "rendered width",
    "height": "rendered height"
  }],
  "links": [{ "text": "link text", "href": "full URL", "target": "_blank?" }],
  "buttons": [{ "text": "button text", "type": "submit?", "className": "..." }],
  "iframes": [{ "src": "URL", "width": "...", "height": "..." }],
  "videos": [{ "src": "URL", "poster": "..." }],
  "forms": [{ "action": "URL", "method": "POST", "inputCount": 3 }],
  "lists": [{ "type": "ul|ol", "itemCount": 5, "items": ["first 5 items"] }],
  "innerHTML_bytes": 4260,
  "totalElements": 17
}
```

Save this as `deep-extraction.json`:
```json
{
  "url": "https://...",
  "extractedAt": "ISO timestamp",
  "viewport": { "width": 1185, "height": "..." },
  "dpr": 2,
  "sectionCount": 19,
  "sections": [ /* array of section objects above */ ]
}
```

## Phase 3: Capture Screenshot

Capture a full-page screenshot BEFORE reverting any visibility overrides.

Important measurements to record:
- **Physical pixel dimensions** of the screenshot (e.g. 2370 x 14174)
- **Device pixel ratio** (DPR) — typically 2
- **Logical dimensions** = physical / DPR (e.g. 1185 x 7087)

These logical dimensions become `PAGE_WIDTH` and `PAGE_HEIGHT` in the explorer.

Save screenshot as `screenshot.jpg`.

## Phase 4: Build Section Map

From the deep extraction, produce a simplified `sections.json` — one entry per section with just what the explorer needs:

```json
[
  {
    "index": 0,
    "guid": "6bc396fa-...",
    "type": "core-hero-image",
    "label": "Hero Image",
    "position": { "top": 75, "height": 495 },
    "config": { "data-lazy-index": 0 },
    "headings": [],
    "content": {
      "imageCount": 1,
      "linkCount": 0,
      "slides": [{ "title": "...", "image": { "src": "...", "alt": "..." }, "href": "..." }]
    }
  }
]
```

### Labeling Rules

Assign a human-readable `label` to each section based on its content:
- If it has a single h1/h2 → use that as the label
- If it's a card grid → "Cards — {first heading or topic} ({N} items)"
- If it's a slider/carousel → "Slider — {heading} ({N} slides)"
- If it's a side-by-side → "Side by Side — {heading}"
- If it's a hero → "Hero Image" or "Hero Slider ({N} slides)"
- If it's FAQ → "FAQ Accordion — {N} Questions"
- If it's navigation → "Site Header & Navigation" / "Footer Navigation"
- If it's a third-party embed (iframe, external JS) → "{Provider} Embed" and set `cmsManaged: false`
- If it's a logo/partner row → "Partner Logo — {alt text or brand name}"
- If it's a content block → "Page Intro — H1 + Body Text" / "Section Heading" / "CTA Block"

### Handling Hidden Content

If sections have `height: 0` or `display: none` in the original page (accordion tabs, lazy panels):
1. Note them as hidden in the extraction
2. Merge their data into the parent section as `additionalTabs` or `hiddenPanels`
3. Do NOT assign them separate overlay positions (they don't appear in the screenshot)

### Gap Coverage

After mapping all CMS sections, check for visual gaps > 60px. Common gap fillers:
- **Site header/nav** (top of page, before first widget)
- **Tab navigation bars** (between a heading and a card grid)
- **Third-party embeds** (social galleries, maps, chat widgets)
- **Footer navigation** (below last content section, above copyright)
- **Copyright bar** (very bottom of page)

Add entries for these with appropriate types (`site-navigation`, `category-tab-navigation`, `third-party-embed`, `footer-navigation`, `copyright-bar`) and a `note` field explaining what they are and whether they're CMS-managed.

**Goal: 100% page coverage. Every visible pixel should fall within an overlay. No gaps.**

## Phase 5: Generate Explorer HTML

Generate a self-contained `explorer.html` file. This is a single HTML file with embedded CSS and JS — no external dependencies except the screenshot image.

### Layout
- Two-column: left = screenshot with overlays (65%), right = JSON inspection panel (35%)
- Dark theme (navy background, teal accents)
- Fixed header with page title

### Overlay System
- Each section gets a positioned `div` overlay on top of the screenshot
- Overlays have a subtle border + background tint (teal, `rgba(61,181,165,0.6)` border, `0.08` background)
- Each overlay shows a label badge in the top-left corner
- **Hover to select** (NOT click) — `onmouseenter` triggers selection
- Selected overlay gets a brighter border + background

### Coordinate Mapping
```javascript
const PAGE_WIDTH = {logical width from Phase 3};
const PAGE_HEIGHT = {logical height from Phase 3};

function refreshOverlays() {
  const img = document.getElementById('pageScreenshot');
  const scaleX = img.clientWidth / PAGE_WIDTH;
  const scaleY = img.clientHeight / PAGE_HEIGHT;

  sections.forEach(w => {
    overlay.style.top = (w.position.top * scaleY) + 'px';
    overlay.style.height = Math.max(w.position.height * scaleY, 20) + 'px';
  });
}
```

Call `refreshOverlays()` on:
- Image load event
- Window resize
- Tab switch (if explorer is in a tabbed layout)

### JSON Panel
When hovering a section, the right panel shows collapsible layers:
1. **Widget Identity** — index, guid, type, label
2. **Configuration** — data attributes and config props
3. **Headings** — all h1-h6 found in the section
4. **Content Items** — rendered differently per type:
   - Slides/cards: thumbnail + title + description + link
   - FAQ items: question + answer bullets
   - Links: text + href
   - Deals/lists: bulleted items
   - Text: rendered block
   - Partner logos: image + link
   - Tabs: tab buttons with active state
5. **Extraction Note** (if present) — italic yellow text explaining CMS-managed status
6. **Third-Party Info** (if present) — provider, embed type, cmsManaged flag
7. **Image CDN** — Cloudinary/CDN transform analysis (host, transforms, path pattern)
8. **Content Stats** — image/link/paragraph/slide counts
9. **Complete Widget JSON** — full exportable JSON (collapsed by default)

### Critical Requirements
- The explorer MUST work by opening the HTML file directly (no server needed)
- Screenshot path should be relative: `screenshot.jpg` (same directory)
- All CSS and JS must be inline in the HTML file
- The file should be < 100KB (excluding the screenshot reference)

## Phase 6: Verify

After generating all files:

1. **Count check**: Verify the number of overlays matches the number of sections in `sections.json`
2. **Gap check**: Sort all sections by `position.top`. Verify no gap > 60px between consecutive section boundaries (bottom of one to top of next). If gaps exist, go back and add entries.
3. **Boundary check**: First section should start at or near `top: 0`. Last section should end at or near `PAGE_HEIGHT`.
4. **Open the explorer** and visually confirm overlays cover the full page.

## Notes

- This skill is CMS-agnostic in principle but was built against SimpleView CMS. For other CMS platforms, Strategy A markers will differ — adapt the selectors.
- Some third-party embeds (CrowdRiff, Bazaarvoice, embedded maps) load content via external JS that can't be extracted. Mark these honestly as `cmsManaged: false`.
- Accordion/tab panels that are hidden in the screenshot should be merged into their parent section, not given their own overlay at `height: 0`.
- Always record the DPR. Screenshots from Retina displays are 2x physical pixels — all position math uses logical (physical / DPR) coordinates.
