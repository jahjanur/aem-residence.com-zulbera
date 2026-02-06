# UX Upgrades — Where Changes Were Made

## TASK 1 — PDF style & structure

**File:** `apps/api/src/lib/pdf.ts`

- **drawHeader()** — Dark header bar with “AEM Residence” and “Operations & Procurement”.
- **drawMetaBox()** — Order details block (Order #, Date, Supplier, Status) with strong contrast.
- **drawTableHeader()** — Table header with gold/dark styling.
- **drawTable()** — Items table with alternating row fill (`#f5f5f5` / white), right-aligned numbers, `formatCurrency()` for thousands separators. Adds new page when `y` exceeds body bottom; repeats table header on each new page.
- **drawTotals()** — Summary box at bottom right: Subtotal, Total (formatted).
- **drawNotes()** — Notes card only when notes exist.
- **addFooter()** — Generated date/time (UTC) and “Page X of Y” on every page.
- **generateOrderPdf()** — Uses `bufferPages: true`, then loops pages to add footers.
- Body text uses dark `#1a1a1a` for readability; A4 margins (50pt); no large blank gaps.

---

## TASK 2 — Dashboard: recent reconciliation incidents

**API:** `apps/api/src/routes/reconciliations.ts`

- **GET /reconciliations/recent?limit=5&onlyWithDiscrepancies=true** — Returns last N reconciliations with `totalLossValue > 0`, including `order` and `items` for summary. Route is defined **before** GET `/` and GET `/:id` so `/recent` is not treated as an id.

**Frontend:** `apps/web/src/pages/Dashboard.tsx`

- New section **“Recent discrepancies”** below stats.
- Fetches `GET /reconciliations/recent?limit=5&onlyWithDiscrepancies=true`.
- Table: Date, Order #, Supplier, Loss (formatted), Missing (e.g. “Metal: -10 pcs, Cement: -5 bags”).
- **“View all”** links to `control-panel`.
- Empty state: “All clear — no discrepancies detected recently.”
- Loading: “Loading…” in a card.
- Row click opens a **modal** with incident details (date, supplier, total loss, list of missing items). Modal has “Close” and “Open Control Panel”.
- Currency and dates use consistent formatting.

---

## TASK 3 — Create Order: recent products + search

**API:** `apps/api/src/routes/products.ts`

- **GET /products/recent?limit=5** — “Recently ordered” = product IDs from recent orders (last 20 orders, then distinct product IDs from their items, up to `limit`). Only ACTIVE products returned.
- **GET /products/search?q=...&limit=20** — Search by name or category (Prisma `contains`); ACTIVE only; `limit` default 20.

**Frontend:** `apps/web/src/pages/CreateOrder.tsx`

- **Recent products** — Separate query to `GET /products/recent?limit=5`; shown as pill buttons (same “Add products” area). Documented in code: “Recent products (5 most recently ordered); active only.”
- **Search** — Single input; debounce 300ms; when `debouncedQ.length >= 2`, calls `GET /products/search?q=...&limit=20`. Results in a dropdown; selecting a result adds the product to the order and closes the dropdown.
- “Add products” block now: (1) Recent products pills, (2) Search input + dropdown, (3) Order lines table. Full product list removed.

---

## TASK 4 — Dashboard quick actions navigate

**File:** `apps/web/src/pages/Dashboard.tsx`

- Quick action cards are already **Link** to `create-order` and `reconciliation` (relative under `/app`). No placeholder `onClick`.
- Added **hover/active feedback**: `hover:shadow-card`, `cursor-pointer`, `active:scale-[0.99]` so cards feel clickable.
- Routing: React Router routes in `App.tsx` are `path="create-order"` and `path="reconciliation"` under the `/app` layout, so navigation works on click and on refresh when the URL is `/app/create-order` or `/app/reconciliation`.

---

## How to test

1. **PDF** — Create an order with 2+ items → “View / Download PDF” → Check: header, meta box, table with alternating rows and right-aligned numbers, totals box, notes (if any), footer “Page 1 of N” and generated time. Print or print preview to confirm layout.
2. **Dashboard incidents** — Reconcile an order with a shortage (received &lt; ordered) → Open Dashboard → “Recent discrepancies” shows the incident with date, order #, supplier, loss, missing summary. Click row → modal with details. “View all” → Control Panel.
3. **Create Order recent + search** — Open Create Order → See “Recent products” (up to 5 pills) if there is order history. Type 2+ characters in search → after ~300ms a dropdown appears → Select a product → It is added to the order table.
4. **Dashboard actions** — On Dashboard, click “Create order” card → navigates to Create Order. Click “Reconciliation” card → navigates to Reconciliation. Confirm URL and that content loads; refresh and confirm the same.

---

## Bonus (QR code)

Not implemented: no QR library is in the project. To add later, install e.g. `qrcode`, generate a QR for `https://aem-residence.com/zulbera/orders/{orderId}` (or your base URL), and draw it in the PDF (e.g. in the header or meta area) using PDFKit’s image API with the QR buffer.
