# UI/UX Design System Update — Before/After

## What changed

### Visual system
- **Background:** `#0a0a0a` → `#0B0F14` (app-bg) for slightly softer black.
- **Surfaces:** Introduced clear hierarchy: Surface-1 (cards/sections `#111827`), Surface-2 (raised/modals `#0F172A`).
- **Borders:** Default `rgba(255,255,255,0.08)`, focus/active `rgba(212,175,55,0.35)` (gold).
- **Text:** Primary `#F8FAFC`, secondary/muted with defined opacity.
- **Gold:** Accent `#D4AF37`, hover `#E3C45F`; danger `#EF4444`, success `#22C55E`.
- **Depth:** Cards use `shadow-card`; modals use `shadow-modal` and strong overlay (`rgba(0,0,0,0.72)` + backdrop-blur).

### Components
- **Button:** Primary = gold background, dark text, rounded-xl, shadow, hover lift (`-translate-y-0.5`). Secondary = transparent + visible border + fill on hover. Danger = red outline + subtle red bg on hover. Disabled = 50% opacity. Added `size="sm"` for compact actions.
- **Card:** Surface-1, shadow-card, soft border; CardHeader supports optional `onClick` for collapsible sections.
- **Modal:** Overlay with blur; panel uses Surface-2, 1px border, shadow-2xl; sticky header (title + close button with aria-label); footer with right-aligned Cancel (secondary) + primary action.
- **Input / Select / Textarea:** Rounded-xl, clearer border, gold focus ring, padding; optional `error` prop with inline message.
- **Badge:** Variants use theme colors (success, warning, danger, outline).
- **Table:** Header uses Surface-2; row hover; TableActionButton for icon actions with aria-labels.
- **Toast:** Success/error variants with distinct styling; dismiss button with aria-label.

### Layout
- **Page container:** Main content wrapped in `page-container` (max-w-6xl mx-auto) for centered, readable width.
- **Title row:** Consistent “title left, actions right” with flex and gap.
- **Create Order:** Two-column layout on desktop: form (supplier, date, product picker) left; order summary card (items, total, Create order button) right. Primary button disabled until valid; product add uses obvious Button (secondary) chips.

### Screens
- **Suppliers:** Each supplier is a Card tile; Edit/Delete are icon buttons (pencil/trash) with aria-labels; Add/Edit use Modal with overlay and footer actions.
- **Products:** Category sections are collapsible cards (click header to expand/collapse); table inside card uses Table component; Edit/Delete as icon buttons in table.
- **Create Order:** Add-product controls are clear buttons; “Create order” in summary card is visibly disabled when invalid.
- **Reconciliation / Control Panel / Inventory / Analytics:** Use Card, Table, Modal, Button, and theme colors; Reconciliation modal uses same overlay + footer pattern.
- **Login / Dashboard:** Use Card, Button, Input, StatCard; theme colors throughout.
- **Global nav:** Sidebar and bottom nav use theme surfaces and borders; active state uses gold-muted background and gold border; Logout is a ghost Button.

### Accessibility
- Focus rings: Global `:focus-visible` uses gold ring (2px offset + 2px ring).
- Icon buttons: `TableActionButton` and modal close use `aria-label`.
- Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` for title; Escape closes.
- Toast: `role="alert"`; dismiss button has aria-label.

### Files added/updated
- **Added:** `src/styles/theme.css` (CSS variables), `src/components/ui/Input.tsx`, `Select.tsx`, `Textarea.tsx`, `Table.tsx` (with TableHeader, TableHead, TableBody, TableRow, TableCell, TableActionButton).
- **Updated:** `tailwind.config.js` (theme extend from vars), `index.css` (import theme, focus ring), all UI components in `src/components/ui/`, `AppLayout.tsx`, all pages under `src/pages/`, `ToastContext.tsx` (success/error type).

## Acceptance
- Clickable elements (buttons, links, icon buttons) are clearly identifiable.
- Modals sit above the page with strong overlay and elevation.
- Buttons are visibly buttons (primary gold, secondary bordered, danger red).
- UI reads as modern, minimal, and premium while keeping black/gold identity.
