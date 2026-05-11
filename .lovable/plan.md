# Customer UI Refresh — "Lagos Editorial"

The current customer surfaces (Landing, Name prompt, Menu, Cart, Tracking, Reservation) are functional but visually flat: solid backgrounds, generic shadcn cards, no imagery, no motion, predictable layouts. This plan turns the customer journey into something that feels crafted, warm, and unmistakably XYZ Foods — without changing any business logic, data model, or order flow.

## Design Direction

**"Lagos Editorial"** — a fusion of magazine-grade typography, vibrant African color, and tactile warmth.

- **Palette**: keep the existing red/green/gold tokens, but introduce layered surfaces — warm cream paper, deep terracotta, forest ink, golden highlights. Add subtle ankara-inspired pattern accents (SVG, low opacity) as background texture, never as noise.
- **Typography**: keep Playfair Display for display, Inter for body, but use much larger editorial headlines, mixed weights, and an accent script-or-serif italic for category labels ("Nigerian", "Continental"). Add a small uppercase tracked label style for section eyebrows.
- **Imagery**: replace the empty `ChefHat` placeholders with generated dish/hero imagery (warm, food-photography style) used as hero, signature dish thumbnails, and category banners.
- **Motion**: add framer-motion for one signature hero animation, staggered card entrances on the menu, smooth tab transitions, and a delightful cart-add micro-interaction.
- **Surfaces**: replace flat cards with layered surfaces — soft inner shadows, warm borders, subtle gradient overlays on imagery, golden accent rules.

## Scope (frontend/presentation only)

### 1. Landing page (`src/pages/Index.tsx`)
- New hero: full-bleed warm food photograph + large editorial headline overlay, eyebrow label, dual CTAs, scroll indicator.
- Replace "Why Choose" generic icon cards with an editorial 2-column block: large image + numbered story items.
- Signature dishes: real generated dish images, asymmetric grid (one large + three smaller), price-on-hover overlay.
- New "Our Story" strip with golden divider and a script accent.
- Contact section: redesign as a dark forest-green band with gold rules instead of solid red.
- Footer: keep staff link visible but refine spacing/typography.

### 2. Name prompt (`src/pages/Menu.tsx` welcome card)
- Convert from a centered shadcn card to a split-screen welcome: left = warm food image with brand mark + table badge, right = elegant form with editorial heading "Welcome to the table".

### 3. Menu page chrome (`src/pages/Menu.tsx`)
- Sticky nav: add brand wordmark with gold underline accent, table + greeting chips redesigned as pill-shaped tokens, tab bar restyled with an animated underline indicator (replacing default shadcn tabs look).
- Add a slim category filter strip under the tabs (All / Nigerian / Continental / Custom).

### 4. Menu items (`src/components/menu/MenuItems.tsx`, `CustomMealBuilder.tsx`)
- Item cards: image-led layout with dish photo, category eyebrow, serif name, price as gold tag, prep-time as small chip, "Add" as a circular accent button. Stagger entrance animation.
- Custom Meal Builder: redesign as a step-by-step builder with progress indicator and a live preview panel.

### 5. Cart (`src/components/menu/OrderCart.tsx`)
- Reframe as a "Your Table" panel with editorial header, line items as compact rows with thumb + price, sticky total bar with gradient CTA.
- Empty state: illustrated/iconographic empty state instead of plain text.

### 6. Order tracking (`src/components/menu/OrderTracking.tsx`)
- Pending payment, active, and history as visually distinct sections with editorial headers.
- Active orders: redesign the live countdown as a circular progress ring with status pill and a horizontal status timeline (Paid → Preparing → Ready → Completed).
- Empty state per section.

### 7. Reservation (`src/components/menu/ReservationForm.tsx`)
- Two-mode toggle (Dine In / Bulk Pickup) restyled as a segmented control with imagery preview per mode.
- Form grouped into clearly labeled sections with editorial headings.

### 8. Shared
- Add 4–6 generated images via `imagegen--generate_image` into `src/assets/` (hero, story, signature dishes, reservation banners).
- Add a reusable `<SectionEyebrow>` and `<EditorialHeading>` pattern via Tailwind utility classes — no new design tokens needed since the palette already covers it; only add a couple of gradient/shadow tokens to `index.css` (`--shadow-warm`, `--gradient-sun`).
- Install `framer-motion` for entrance + micro-interactions.

## Out of scope (won't touch)

- Order flow logic, cart state, table numbering, name onboarding rules.
- Supabase schema, auth, RLS, admin/staff pages.
- Payment simulation behavior.

## Technical notes

- New deps: `framer-motion`.
- New tokens in `src/index.css`: `--gradient-sun`, `--gradient-forest`, `--shadow-warm`, `--shadow-card`. All HSL.
- New assets in `src/assets/`: `hero-jollof.jpg`, `story-chef.jpg`, `dish-jollof.jpg`, `dish-egusi.jpg`, `dish-grill.jpg`, `dish-pasta.jpg`, `reservation-dinein.jpg`, `reservation-pickup.jpg`.
- All colors via semantic tokens — no raw hex/`text-white`/`bg-black` in components.
- Mobile-first: current viewport is 753px; cards collapse to single column under `md`, hero text scales down, sticky cart becomes a bottom drawer trigger on mobile.

## Deliverable

A cohesive, image-rich, motion-enhanced customer journey that no longer looks like a default shadcn template — while preserving every existing interaction.
