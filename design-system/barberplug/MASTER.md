# BarberPlug Design System — MASTER

Global source of truth for all pages. A file in `pages/<page>.md` overrides these rules for that page only.
Built with the ui-ux-pro-max skill, curated for this project:
- Style: **Exaggerated Minimalism** (oversized type, big negative space, black/white dominant).
- Palette: **Photography Studio** row (pure black + white), extended with light sections.
- Fonts: chosen for **Cyrillic support** (the generic recommendation, Outfit/Work Sans, has no Cyrillic).
- The generic blue accent (`#2563EB`) is **rejected**: the brand is strictly monochrome.

## Principles
1. Monochrome only. Colour comes from photos, never from UI.
2. Photography first: haircuts sell the shop. Big images, minimal chrome.
3. Type does the work: oversized uppercase headings, calm body text.
4. One primary action everywhere: **Book Now** (opens Fresha in new tab).
5. Same layout in BG and EN. Bulgarian strings run ~15–25% longer: never fix text widths.

## Colour tokens
Sections alternate dark and light surfaces (like menspire.com). Components use tokens, never raw hex.

| Token | Dark surface (default) | Light surface | Use |
|---|---|---|---|
| `--color-bg` | `#000000` | `#FFFFFF` | Page/section background |
| `--color-surface` | `#0C0C0C` | `#F4F4F5` | Cards, inputs |
| `--color-surface-2` | `#18181B` | `#E4E4E7` | Hover, raised |
| `--color-fg` | `#FAFAFA` | `#09090B` | Main text |
| `--color-fg-muted` | `#A1A1AA` | `#52525B` | Secondary text (≥4.5:1 on bg) |
| `--color-border` | `#3F3F46` | `#D4D4D8` | Dividers, input borders |
| `--color-cta` | `#FFFFFF` | `#000000` | Primary button fill |
| `--color-on-cta` | `#000000` | `#FFFFFF` | Primary button text |
| `--color-ring` | `#FFFFFF` | `#000000` | Focus ring |
| `--color-danger` | `#EF4444` | `#DC2626` | Errors, delete (admin + form errors only) |
| `--color-success` | `#22C55E` | `#16A34A` | Saved/sent confirmation only |

Apply the light set with a `.surface-light` class on a section; the default is dark.

## Typography
- Headings: **Oswald** 500–700, UPPERCASE, `letter-spacing: 0.02em`.
- Body/UI: **Manrope** 400/500/700.
- Load: `https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Manrope:wght@400;500;700&display=swap&subset=cyrillic,latin`

| Token | Size | Use |
|---|---|---|
| `--type-display` | `clamp(3rem, 9vw, 8rem)` / lh 0.95 | Hero headline |
| `--type-h1` | `clamp(2.25rem, 5vw, 4rem)` / lh 1.05 | Page title |
| `--type-h2` | `clamp(1.75rem, 3.5vw, 2.75rem)` / lh 1.1 | Section title |
| `--type-h3` | `1.25rem` / lh 1.3 | Card title |
| `--type-body` | `1rem` (16px) / lh 1.6 | Paragraphs, max 65ch |
| `--type-small` | `0.875rem` / lh 1.5 | Captions, meta |
| `--type-label` | `0.8125rem`, 700, uppercase, `letter-spacing: 0.12em` | Buttons, nav, eyebrows |

Never below 12px. Use `text-wrap: balance` on headings.

## Spacing & layout (spacious)
- Scale: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128` px.
- Section padding: 96px vertical desktop, 64px mobile.
- Container: `max-width: 1280px`, side padding 24px (16px under 400px).
- Grid: 12 columns desktop, 4 mobile, gap 24px.
- Breakpoints: 375, 768, 1024, 1440. Mobile-first.
- Radius: `0` on images and buttons (sharp, editorial). `4px` on inputs and admin cards.
- Shadows: none on the public site. Admin only: `0 1px 2px rgb(0 0 0 / 0.3)`.

## Components
**Header**: transparent over the hero, solid `--color-bg` after 80px of scroll. Logo left; nav (Learn More, Shop, Gallery, Location, Help); BG/EN switcher; **Book Now** button right. Under 1024px: burger, full-screen black menu, Book Now always visible.

**Buttons**
- Primary: `--color-cta` fill, `--color-on-cta` text, `--type-label`, padding `16px 32px`, min height 48px. Hover: inverts to outline over 200ms.
- Secondary: 1px `--color-fg` outline, transparent fill. Hover: fills.
- External links (Book Now, Directions) show a small arrow-up-right icon and `rel="noopener"`.

**Hero (Home)**: full-viewport photo/video, 40–60% black gradient overlay so text keeps ≥4.5:1. Display headline, one-line sub, Book Now + Learn More.

**Section teaser (Home)**: alternating image/text rows or 3-tile grid (Gallery, Location, Shop). Each tile is a full-bleed image + uppercase label + arrow.

**Gallery**: CSS grid, 1/2/3/4 columns at 375/768/1024/1440. Fixed `aspect-ratio: 4/5` thumbs with `object-fit: cover` (no layout shift). Lazy load WebP thumbs; lightbox loads large. Lightbox: black backdrop, arrows + swipe + Esc + arrow keys, caption under the image, focus trapped and returned.

**Location**: two columns (map | details), stacked on mobile. Map iframe lazy-loaded with a title. Hours as a definition list; today's row bold.

**Shop (coming soon)**: full-height dark section, display "COMING SOON", one line of text, optional Instagram link.

**Contact form (Help)**: visible labels above fields, never placeholder-only. Fields: name, email or phone, message. Inline errors under the field on blur, focus moves to the first error on submit. Button shows a spinner and is disabled while sending. Success replaces the form with a confirmation message.

**Footer**: black; logo, address, hours summary, phone, socials, BG/EN switcher, small © line.

## Icons
Lucide React only. No emoji. Stroke 1.5, 20/24px. Decorative icons `aria-hidden`; icon-only buttons need `aria-label`.

## Motion (standard, restrained)
- Durations: 150ms micro (hover), 250ms UI (menus), 400ms reveal. Exits faster than entries.
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` for enters.
- Scroll reveal: fade + 16px rise, stagger 60ms on gallery/teaser grids.
- Animate only `opacity` and `transform`.
- `prefers-reduced-motion: reduce` → no reveals or parallax; show the final state.

## Accessibility
- Text contrast ≥4.5:1 (all tokens above pass on their surface).
- Visible focus: 2px `--color-ring` outline, 2px offset. Never remove it.
- Touch targets ≥44×44px.
- `lang="bg"` / `lang="en"` on `<html>` per Locale.
- Alt text: gallery captions double as alt; fallback "Haircut by BarberPlug" / "Подстригване в BarberPlug".
- Skip-to-content link.

## Admin area
Same tokens, but always **dark surface** with a denser layout (spacing 8–32px) and 4px radius.
- Layout: left sidebar (Gallery, Texts, Log out), content on the right. Under 768px the sidebar becomes a top bar.
- **Gallery manager**: grid of cards (thumb, BG/EN caption fields, delete). Drag handle for reorder, plus keyboard reorder (move up/down buttons) as the non-drag alternative. Upload dropzone with progress per file and type/size errors (JPEG/PNG/WebP, ≤15 MB). Delete asks for confirmation. Changes autosave with a "Saved" toast.
- **Text editor**: one row per Editable Text: key label (human name), BG and EN textareas side by side (stacked on mobile), character count, Save per row, unsaved-changes warning on leave.
- **Login**: centered card, email + password, show-password toggle, generic error message, rate limited.

## Anti-patterns (do not)
- Colour accents (blue, gold) on UI elements.
- Glassmorphism, neumorphism, gradients on UI (photo overlays are fine).
- Emoji as icons.
- Rounded "SaaS" pill buttons.
- Carousels for core content (the gallery grid is the content).
- Placeholder-only form labels.
- Text baked into images (it breaks BG/EN).

## Pre-delivery checklist
- [ ] No emoji icons; Lucide only
- [ ] `cursor-pointer` + hover state (150–300ms) on every clickable element
- [ ] Contrast ≥4.5:1 on dark and light surfaces
- [ ] Visible keyboard focus everywhere
- [ ] `prefers-reduced-motion` respected
- [ ] Checked at 375, 768, 1024, 1440; no horizontal scroll
- [ ] BG strings checked for overflow (long words wrap, buttons grow)
- [ ] Images: WebP, lazy, reserved aspect ratio (CLS < 0.1)
