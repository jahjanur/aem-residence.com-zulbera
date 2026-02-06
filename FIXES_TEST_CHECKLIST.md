# Fixes — How to test

## ISSUE A — PDF export layout

**Changes:** `apps/api/src/lib/pdf.ts`

- Margins set to 25mm (71pt). Content width = full width inside margins.
- **drawHeader()** — Header bar; **drawMeta()** — 2-column order details (Order #, Date | Supplier, Status); **drawItemsTable()** — full-width table, header repeats on new page, alternating rows, right-aligned numbers; **drawTotals()** — box aligned to right margin (`boxX = MARGIN + CONTENT_WIDTH - boxWidth`), placed directly below table; **drawNotes()** — only if notes exist; **drawFooter()** — generated date/time + Page X of Y.
- Totals and notes are drawn on the last page only (after the table loop).

**Verify:**

1. Create order with **1 item** → Generate PDF → Check: header, meta block, table, totals box **aligned to right margin**, footer.
2. Create order with **10+ items** → Generate PDF → Check: table continues on next page(s) with **header repeated**, totals and notes on **last page**, footer on every page.
3. Create order **with notes** → PDF shows Notes section; **without notes** → no Notes section.

---

## ISSUE B — Dashboard quick actions (Create order / Reconciliation)

**Root cause:** `Link to="create-order"` and `to="reconciliation"` are **relative**. From URL `/app/dashboard`, React Router resolves them to `/app/dashboard/create-order` and `/app/dashboard/reconciliation`, which do not match any route, so the app stayed on dashboard or did a full reload.

**Fix:** Use **absolute** paths: `to="/app/create-order"` and `to="/app/reconciliation"`. All dashboard Links (stats, View all, quick actions) updated to `/app/...` for consistency.

**Files changed:** `apps/web/src/pages/Dashboard.tsx`

**Verify:**

1. Open Dashboard. Click **Create order** card → navigates to Create Order page (no full page refresh).
2. Go back to Dashboard. Click **Reconciliation** card → navigates to Reconciliation page (no full page refresh).

---

## ISSUE C — Order date icon (calendar) too dark

**Changes:** `apps/web/src/index.css`

- `input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.85; cursor: pointer; }` so the native calendar icon is visible on dark background.

**Verify:**

1. Open Create Order (or any page with a date input). Confirm the **calendar icon** next to the date field is clearly visible (bright).

---

## Before/after (brief)

- **PDF:** Before: large blank area, totals box floating. After: 25mm margins, full-width table, totals right-aligned below table, footer on every page, multi-page with repeated header.
- **Dashboard:** Before: clicking Create order / Reconciliation caused refresh and stayed on dashboard. After: same click navigates to the correct page without full refresh.
- **Date input:** Before: calendar icon hard to see. After: icon inverted and visible on dark theme.
