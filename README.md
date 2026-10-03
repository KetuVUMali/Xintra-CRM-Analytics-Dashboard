# NimbusDesk — Mega Multi-Facility Admin Dashboard

An original, fully static admin dashboard system: **50 HTML pages**, one shared
design system, and zero build step. Built with HTML5, CSS3, Bootstrap 5,
vanilla JavaScript, Chart.js and AOS — everything is bundled locally, so it
works completely offline (just open `index.html`).

> **Note on originality:** this was built using a well-known admin dashboard
> style (dark sidebar, light content, KPI cards, colorful charts) as a
> *visual and structural reference point* — the same broad style used by
> dozens of commercial and open-source admin templates. All code, markup,
> CSS, JavaScript, copy, branding ("NimbusDesk") and image assets in this
> project are original and were written for this build; no proprietary
> source code, brand assets, or artwork were copied.

## Quick start

Unzip the project and double-click `index.html` — no server, no build step,
no dependencies to install. Every asset (Bootstrap, Bootstrap Icons, Chart.js,
AOS, the UI font) is self-hosted under `assets/`.

## What's included

**17 dashboards** — a master Overview plus 16 specialized facilities, each
with genuinely different KPIs, charts and tables (not the same widgets
re-skinned): Sales, Analytics, Ecommerce, CRM, HRM, NFT, Crypto, Jobs,
Projects, Courses, Stocks, Medical, POS System, Podcast, School, Social Media.

**18 application pages**: Blog, Blog Details, Chat, FAQ, File Manager, Mail,
Mail Settings, Pricing, Profile, Reviews, Search, Team, Timeline, Todo,
Terms & Conditions, Settings, Notifications, Activity Log.

**7 ecommerce pages**: Products, Product Details, Add Product, Cart,
Checkout, Orders, Order Details.

**8 auth / system pages**: Login, Register, Forgot Password, Reset Password,
Lock Screen, 404, 500, Maintenance.

Every sidebar link points to a real page — nothing is a dead `#` link.

## Folder structure

```
mega-dashboard/
├── index.html                  ← master dashboard (same as pages overview)
├── 404.html / 500.html / maintenance.html
├── pages/
│   ├── sales.html, analytics.html, crm.html, ... (16 facility dashboards)
│   ├── blog.html, chat.html, mail.html, ... (application pages)
│   ├── ecommerce/  (products, cart, checkout, orders, ...)
│   └── auth/       (login, register, lock-screen, ...)
└── assets/
    ├── css/   (bootstrap.min.css, bootstrap-icons, aos.css, fonts.css,
    │           main.css ← design system, responsive.css)
    ├── js/    (bootstrap.bundle.min.js, chart.umd.min.js, aos.js,
    │           main.js ← shell/theme/search, charts.js ← chart helpers,
    │           components.js ← todo/kanban/steppers/etc., tables.js,
    │           search-data.js ← local search dataset)
    └── images/ (avatars, products, banners, illustrations, logos — all
                 original SVGs generated for this project, no external
                 image dependencies)
```

## Responsive sidebar (and why it's built this way)

- **Desktop, expanded**: full 268px sidebar with icons + labels, nested
  "Dashboards" group expands/collapses accordion-style.
- **Desktop, collapsed** (toggle in the header or Customize panel): shrinks
  to an 84px icon rail. Hovering — or focusing via keyboard, or tapping on
  a touch laptop — any icon shows its label in a small flyout; group items
  like "Dashboards" show their full list of children in that flyout too.
  This flyout is positioned by JavaScript (`getBoundingClientRect`), not
  pure CSS `:hover`, because the sidebar's own scroll container needs
  `overflow-x: hidden` for its vertical scrollbar to behave correctly —
  and that would clip any absolutely-positioned popout trying to escape
  past its right edge. Rendering the flyout as its own fixed-position
  element outside that scroll container avoids the clipping entirely.
- **Tablet & mobile** (<992px): the sidebar becomes an off-canvas drawer,
  opened by the header's hamburger icon and closed via its own X button,
  tapping the dimmed overlay, or navigating to a new page. A compact brand
  mark appears in the mobile header since the full sidebar (and its logo)
  is off-screen until opened.

## Design system

All colors, radii and shadows are CSS custom properties defined once in
`assets/css/main.css` (`--md-primary`, `--md-sidebar-bg`, `--md-radius-lg`,
etc.) with a parallel dark-mode set under `[data-theme="dark"]`. Change the
palette in one place and it updates everywhere, including chart colors
(`--chart-1` … `--chart-8`, read at runtime by `charts.js`).

Typeface: **Plus Jakarta Sans**, self-hosted as woff2/woff under
`assets/css/fonts/` — no Google Fonts network request.

## Multi-theme system (Customize panel)

Click the gear icon in the header to open a real, functional SaaS-style
theme customizer — this is not a static mockup:

- **6 accent colors** (Purple, Blue, Green, Orange, Red, Teal) — changes
  `--md-primary` and the primary chart color everywhere at once. Since
  Chart.js bakes colors into the canvas at creation time, picking a new
  accent does one clean page reload so every chart repaints correctly
  with the new palette; this is a deliberate, documented tradeoff, not a
  missed detail.
- **3 sidebar styles** — Dark (default), Light, Gradient. Applies instantly.
- **2 layout widths** — Fluid (default) or Boxed. Applies instantly.
- **Light/dark mode** and **sidebar collapse** — both instant, both here too.

All four preferences persist in `localStorage` and are re-applied by a tiny
inline script in `<head>` *before* the page paints, so returning visitors
never see a flash of the wrong theme.

## Functional features

- **Global search** (`Ctrl/Cmd+K`) — searches a local dummy dataset of
  pages, users, products, projects and documents. No network calls.
- **Notifications, cart preview, profile menu** — all working Bootstrap
  dropdowns with realistic demo content.
- **Charts** — Chart.js via a shared `NimbusCharts` helper (`assets/js/charts.js`)
  so every dashboard shares one visual language and re-themes automatically
  on dark/light toggle.
- **Product & order management (Ecommerce dashboard + Products + Orders
  pages)** — genuinely working, not decorative:
  - **View** opens a read-only quick-view modal for that row.
  - **Edit** opens a pre-filled modal; saving updates the table row live.
  - **Delete** shows a SweetAlert2 confirmation, then removes the row and
    shows a toast (falls back to a plain `confirm()` if SweetAlert2 isn't
    loaded on a given page).
  - **Order status** is a click-to-change dropdown badge on the Orders
    page — pick a new status and the badge updates immediately.
  - **Products page** has a working Grid/List view toggle: List renders a
    full admin table (search, sort, pagination, the same view/edit/delete
    actions) alongside the customer-facing card grid.
  - The Ecommerce dashboard's "Sales Report" chart has a working
    Today/Weekly/Yearly toggle that swaps real chart data, not just button
    styling.
- **Other interactive widgets** — a working Todo list, drag-and-drop Kanban
  board (Projects), cart quantity steppers, star ratings, FAQ accordion,
  pricing monthly/yearly toggle, multi-step checkout, client-side table
  search / sort / pagination used throughout.
- **Forms** — Bootstrap validation states wired up on every form (login,
  register, add product, checkout, settings, etc.).

Every dashboard has genuinely different widgets for its domain (Sales ≠
Analytics ≠ CRM ≠ Medical, etc. — see the QA notes below); the Ecommerce
dashboard in particular was built to match the density of a real reference
admin panel: stacked KPIs, a sales chart with a period toggle, a promo
banner, top-selling products, recent orders, a fulfillment gauge, a
recent-activity feed, a visitors chart, payment methods, traffic sources,
and the admin products table described above.

## A note on the reveal animation (AOS)

Content uses AOS for a subtle on-load reveal. Because a scroll-reveal
library hiding content until JavaScript runs is a real fragility risk on a
data-heavy dashboard, `main.js` includes a safety net: if AOS fails to load
or errors out, or a browser has JavaScript disabled, all content is forced
visible instead of staying hidden. This was found and fixed during testing
(see below) rather than assumed to be fine.

## How this was tested

Every one of the 50 pages was validated for:
- No broken internal links or missing assets (automated link-checker).
- No duplicate element IDs.
- Real JavaScript execution with zero runtime errors, using `jsdom` +
  `node-canvas` to actually run Chart.js, AOS, and all custom scripts
  headlessly (not just eyeballing the code) — re-run after every round of
  changes described above, always ending at 0 errors / 50 pages.
- Working interactions exercised programmatically end-to-end, including:
  theme toggle, sidebar collapse/offcanvas, the full multi-theme
  customizer (skin/sidebar-style/layout-width, including the pre-paint
  script that avoids theme-flash for returning visitors), search index
  loading, notification "mark all read," the Todo widget, cart quantity
  steppers, the Ecommerce dashboard's chart period toggle, and the full
  View → Edit → Save and Delete → Confirm → Remove flows on the product
  tables, and the Orders page's inline status changer.
- One real bug was found this way and fixed: a stray duplicate copy of
  several dashboard page-generator functions in the build tooling (dead
  code, silently overridden by Python — harmless in the shipped HTML, but
  cleaned up for a maintainable codebase). Two smaller robustness fixes
  were also made based on testing: `localStorage` calls are now wrapped
  so a storage failure can never break the whole page, and the on-load
  reveal animation has a safety net so content can never get stuck
  invisible if the animation library has a problem.
- A real, user-visible sidebar bug was also found and fixed this way: the
  collapsed-sidebar hover flyout was being silently clipped by its own
  scroll container's `overflow-x: hidden` (needed for the vertical
  scrollbar to work), and a stray inline `style="display:none"` on the
  mobile sidebar's close button meant it never appeared. Both are fixed
  and covered by dedicated automated tests (`qa_flyout.js`-style checks:
  flyout positioning math, label visibility, click-to-toggle for
  touch/keyboard users, and confirming hover does nothing when the
  sidebar isn't collapsed).
- A significant dark-mode bug was found and fixed: Bootstrap 5.3 ships
  its own complete CSS-variable theming system (`--bs-body-color`,
  `--bs-table-color`, `--bs-card-bg`, etc.), and components this project
  hadn't explicitly re-styled — most visibly, every data table's body
  text — were reading Bootstrap's own fixed light-mode variables instead
  of this project's theme tokens, since Bootstrap's dark-mode CSS lives
  behind its own `data-bs-theme` attribute, which this project doesn't
  use. In light mode that was invisible (dark-on-light still reads fine
  by coincidence); in dark mode it meant table text rendered in
  Bootstrap's fixed dark-gray on a dark background — barely legible.
  Fixed at the root by bridging Bootstrap's variables to this project's
  own tokens once, so every current *and future* Bootstrap component
  (`.table`, `.card`, `.btn`, `.form-control`, `.dropdown-menu`,
  `.list-group`, `.popover`, `.accordion`, `.pagination`, `.nav-tabs`,
  `.modal`) stays theme-correct automatically, rather than needing
  one-off patches hunted down component by component. Also fixed in the
  same pass: `.modal-content` and SweetAlert2 popups previously ignored
  dark mode entirely (Bootstrap/SweetAlert2 defaults), `.btn-close` (✕)
  icons were invisible on dark backgrounds (a dark glyph with no
  dark-mode inversion), and the language dropdown's "active" item used
  Bootstrap's default blue instead of the site's accent color.
- Separately, a real crash bug was found in the chart re-theming logic
  itself: a defensive-looking guard (`x.ticks = x.ticks || {}`) that
  looked like a harmless no-op was actually re-assigning one of Chart.js
  v4's internal Proxy-backed option objects onto itself, which triggers
  infinite recursion inside Chart.js ("Maximum call stack size
  exceeded") specifically on combo (mixed bar+line) charts when toggling
  theme. Removed the unnecessary reassignment — Chart.js always
  provides these objects already, so mutating a property directly is
  both correct and safe — and confirmed the fix with automated
  light→dark→light toggling across all 17 dashboard pages.

## Customizing / extending

- **Add a new dashboard page**: duplicate a similar page under `pages/`,
  add a sidebar entry + breadcrumb in the nav, reuse `.card`, `.stat-card`,
  `NimbusCharts.*` helpers and the table markup patterns already in the file
  you copied from.
- **Change the accent color**: edit `--md-primary` (and `--chart-1..8`) in
  `assets/css/main.css`.
- **All data is local placeholder data** — there is no backend. Forms show
  a success toast on submit but don't persist anywhere; this is a frontend
  demonstration project only.

---
Built as an original UI concept for demonstration purposes.
