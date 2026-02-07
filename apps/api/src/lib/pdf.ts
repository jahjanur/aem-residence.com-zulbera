/**
 * Backend PDF generation for orders — professional, print-ready layout.
 * A4 portrait, 20–25mm margins. Helpers: drawHeader, drawMeta, drawItemsTable, drawTotals, drawNotes, drawFooter.
 * addPage() is only called when there is remaining table content that does not fit on the current page.
 */

import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import * as fs from 'fs';
import * as path from 'path';

function getDejaVuPath(filename: string): string | null {
  try {
    return require.resolve(`dejavu-fonts-ttf/ttf/${filename}`);
  } catch {
    return path.join(process.cwd(), 'node_modules/dejavu-fonts-ttf/ttf', filename);
  }
}

/** Order shape as returned by Prisma findUnique with include: { orderItems: true }. Dates may be Date or ISO string. */
type OrderWithItems = {
  orderNumber: string;
  orderDate: Date | string;
  supplierName: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  orderItems: Array<{ name: string; unit: string; price: number; quantity: number }>;
};

// A4: 595.28 x 841.89 pt. Margins 20mm ≈ 56.7 pt.
const MARGIN_PT = 57;
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN_PT;
const FOOTER_HEIGHT = 22;
const FOOTER_Y = PAGE_HEIGHT - MARGIN_PT - 12;
const BODY_TOP = 100; // after company header block
const TABLE_BOTTOM = PAGE_HEIGHT - MARGIN_PT - FOOTER_HEIGHT;

// Company details — North Macedonia, Gostivar
const COMPANY = {
  name: 'AEM Residence',
  address: 'ul. Marshal Tito 123',
  city: 'Gostivar',
  postcode: '1230',
  email: 'info@aem-residence.mk',
  phone: '+389 42 123 456',
  regNo: 'Mat. Br. 1234567890123',
};

const colors = {
  black: '#0a0a0a',
  darkGray: '#3d3d3d',
  gray: '#6b7280',
  gold: '#d4af37',
  text: '#1a1a1a',
  textMuted: '#4b5563',
  rowAlt: '#f9fafb',
  border: '#e5e7eb',
  headerBg: '#f3f4f6',
};

// MKD (Makedon Denarı) — Turkish locale, no decimals, e.g. "120.000 MKD"
function formatMKD(n: number): string {
  const num = n.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return `${num} MKD`;
}

type Doc = InstanceType<typeof PDFDocument>;

const STD_FONT = 'Helvetica';
const STD_FONT_BOLD = 'Helvetica-Bold';
const FONT_DEJAVU = 'DejaVu';
const FONT_DEJAVU_BOLD = 'DejaVuBold';
let PDF_FONT = STD_FONT;
let PDF_FONT_BOLD = STD_FONT_BOLD;

/** Transliterate Turkish chars to ASCII for Helvetica (no custom font needed). */
function toAscii(s: string): string {
  const map: Record<string, string> = {
    ş: 's', Ş: 'S', ı: 'i', İ: 'I', ğ: 'g', Ğ: 'G', ü: 'u', Ü: 'U', ö: 'o', Ö: 'O', ç: 'c', Ç: 'C',
  };
  return s.replace(/[şŞıİğĞüÜöÖçÇ]/g, (c) => map[c] ?? c);
}

/** Invoice-style header: logo + company name left; company details (address, etc.) right. */
function drawHeader(doc: Doc): void {
  const projectRoot = path.resolve(__dirname, '../../../..');
  const logoSvgPath = path.join(projectRoot, 'apps/web/src/assets/KAKAKAK.svg');
  const logoPngPath = path.join(projectRoot, 'apps/web/src/assets/AemResidence.png');

  const logoHeight = 44;
  const logoWidth = 44;
  const nameX = MARGIN_PT + logoWidth + 12;
  const detailsWidth = 180;
  const detailsX = PAGE_WIDTH - MARGIN_PT - detailsWidth;
  const blockTop = 38;
  const logoY = blockTop;
  const nameY = blockTop + 14;

  let logoDrawn = false;
  if (fs.existsSync(logoSvgPath)) {
    try {
      const svgString = fs.readFileSync(logoSvgPath, 'utf-8');
      SVGtoPDF(doc, svgString, MARGIN_PT, logoY, { width: logoWidth, height: logoHeight });
      logoDrawn = true;
    } catch {
      // fall through to PNG or text
    }
  }
  if (!logoDrawn && fs.existsSync(logoPngPath)) {
    try {
      doc.image(logoPngPath, MARGIN_PT, logoY, { width: (704 / 1080) * logoHeight, height: logoHeight });
      logoDrawn = true;
    } catch {
      // fall through to text
    }
  }
  if (!logoDrawn) {
    doc.fillColor(colors.gold).fontSize(16).font(PDF_FONT_BOLD).text(COMPANY.name, MARGIN_PT, nameY);
  }

  doc.fillColor(colors.textMuted).fontSize(9).font(PDF_FONT);
  let lineY = blockTop;
  doc.text(COMPANY.address, detailsX, lineY, { width: detailsWidth, align: 'right' }); lineY += 12;
  doc.text(`${COMPANY.city}, ${COMPANY.postcode}`, detailsX, lineY, { width: detailsWidth, align: 'right' }); lineY += 12;
  doc.text(COMPANY.email, detailsX, lineY, { width: detailsWidth, align: 'right' }); lineY += 12;
  doc.text(COMPANY.phone, detailsX, lineY, { width: detailsWidth, align: 'right' }); lineY += 12;
  doc.text(COMPANY.regNo, detailsX, lineY, { width: detailsWidth, align: 'right' });

  doc.moveTo(MARGIN_PT, 96).lineTo(PAGE_WIDTH - MARGIN_PT, 96).strokeColor(colors.border).stroke();
}

// Macedonian labels for PDF (MK locale)
const PDF_LABELS = {
  orderDetails: 'Детали за нарачка',
  orderNo: 'Бр. нарачка',
  date: 'Датум',
  supplier: 'Добавувач',
  status: 'Статус',
  item: 'Ставка',
  unit: 'Ед.',
  price: 'Ед. цена',
  qty: 'Кол.',
  total: 'Вкупен износ',
  subtotal: 'Меѓузбир',
  notes: 'Забелешки',
  page: 'Страница',
  generated: 'Генерирано',
  statusPending: 'Чека',
  statusDelivered: 'Испорачано',
  statusReconciled: 'Ускладено',
};

function orderStatusTr(s: string | null | undefined): string {
  if (s === 'PENDING') return PDF_LABELS.statusPending;
  if (s === 'DELIVERED') return PDF_LABELS.statusDelivered;
  if (s === 'RECONCILED') return PDF_LABELS.statusReconciled;
  return String(s ?? '');
}

/** Order details block — invoice-style: grey bar, two columns. */
function drawMeta(doc: Doc, order: OrderWithItems): number {
  const boxTop = BODY_TOP;
  const boxHeight = 52;
  doc.rect(MARGIN_PT, boxTop, CONTENT_WIDTH, boxHeight).fill(colors.headerBg).stroke(colors.border);
  doc.fillColor(colors.darkGray).fontSize(10).font(PDF_FONT_BOLD).text(PDF_LABELS.orderDetails, MARGIN_PT + 10, boxTop + 10);
  doc.fillColor(colors.text).fontSize(9).font(PDF_FONT);
  const leftX = MARGIN_PT + 10;
  const rightX = MARGIN_PT + CONTENT_WIDTH * 0.55;
  const lineH = 14;
  const orderDateObj = order.orderDate instanceof Date ? order.orderDate : new Date(order.orderDate);
  const dateStr = orderDateObj.toISOString().split('T')[0].replace(/-/g, '.');
  doc.text(`${PDF_LABELS.orderNo}: ${String(order.orderNumber ?? '')}`, leftX, boxTop + 26);
  doc.text(`${PDF_LABELS.date}: ${dateStr}`, leftX, boxTop + 26 + lineH);
  doc.text(toAscii(`${PDF_LABELS.supplier}: ${String(order.supplierName ?? '')}`), rightX, boxTop + 26);
  doc.text(`${PDF_LABELS.status}: ${orderStatusTr(order.status)}`, rightX, boxTop + 26 + lineH);
  return boxTop + boxHeight + 10;
}

// Full width table; column widths sum to CONTENT_WIDTH
const COL = {
  name: 200,
  unit: 52,
  price: 88,
  qty: 52,
  total: Math.floor(CONTENT_WIDTH - 200 - 52 - 88 - 52),
};
const ROW_HEIGHT = 20;
const HEADER_ROW_HEIGHT = 24;
const TABLE_WIDTH = CONTENT_WIDTH;

function drawTableHeaderRow(doc: Doc, x: number, y: number): void {
  doc.rect(x, y, TABLE_WIDTH, HEADER_ROW_HEIGHT).fill(colors.darkGray).stroke(colors.border);
  doc.fillColor('#fff').fontSize(9).font(PDF_FONT_BOLD);
  doc.text(PDF_LABELS.item, x + 8, y + 6, { width: COL.name - 8 });
  doc.text(PDF_LABELS.unit, x + COL.name, y + 6, { width: COL.unit, align: 'right' });
  doc.text(PDF_LABELS.price, x + COL.name + COL.unit, y + 6, { width: COL.price, align: 'right' });
  doc.text(PDF_LABELS.qty, x + COL.name + COL.unit + COL.price, y + 6, { width: COL.qty, align: 'right' });
  doc.text(PDF_LABELS.total, x + COL.name + COL.unit + COL.price + COL.qty, y + 6, { width: COL.total - 4, align: 'right' });
}

/** Items table: full width, header repeats on new page, alternating rows, right-aligned numbers.
 * addPage() only when there is a row to draw and it does not fit on the current page. */
function drawItemsTable(
  doc: Doc,
  order: OrderWithItems,
  startY: number
): { endY: number } {
  const x = MARGIN_PT;
  let y = startY;

  doc.fillColor(colors.text).font(PDF_FONT).fontSize(9);

  const items = order.orderItems ?? [];
  for (let i = 0; i < items.length; i++) {
    const rowWouldOverflow = y + ROW_HEIGHT > TABLE_BOTTOM;
    if (rowWouldOverflow) {
      doc.addPage({ size: 'A4', margin: MARGIN_PT });
      y = BODY_TOP;
      drawTableHeaderRow(doc, x, y);
      y += HEADER_ROW_HEIGHT;
    }

    const item = items[i];
    const price = Number(item.price);
    const qty = Number(item.quantity) || 0;
    const total = price * qty;
    const rowY = y;
    const fill = i % 2 === 1 ? colors.rowAlt : '#fff';
    doc.rect(x, rowY, TABLE_WIDTH, ROW_HEIGHT).fill(fill).stroke(colors.border);
    doc.fillColor(colors.text);
    doc.text(toAscii(String(item.name ?? '')), x + 8, rowY + 5, { width: COL.name - 10 });
    doc.text(toAscii(String(item.unit ?? '')), x + COL.name, rowY + 5, { width: COL.unit, align: 'right' });
    doc.text(formatMKD(price), x + COL.name + COL.unit, rowY + 5, { width: COL.price, align: 'right' });
    doc.text(String(qty), x + COL.name + COL.unit + COL.price, rowY + 5, { width: COL.qty, align: 'right' });
    doc.text(formatMKD(total), x + COL.name + COL.unit + COL.price + COL.qty, rowY + 5, { width: COL.total - 4, align: 'right' });
    y += ROW_HEIGHT;
  }

  return { endY: y };
}

/** Totals block: invoice-style, right-aligned, MKD. */
function drawTotals(doc: Doc, totalAmount: number, startY: number): number {
  const boxWidth = 200;
  const numbersWidth = 95;
  const rightPadding = 10;
  const boxRight = PAGE_WIDTH - MARGIN_PT - rightPadding;
  const boxX = boxRight - boxWidth;
  const lineY = startY + 18;
  doc.fillColor(colors.text).fontSize(9).font(PDF_FONT);
  doc.text(PDF_LABELS.subtotal, boxX + 8, startY + 4);
  doc.text(formatMKD(totalAmount), boxRight - 8 - numbersWidth, startY + 4, { width: numbersWidth, align: 'right' });
  doc.moveTo(boxX, lineY).lineTo(boxX + boxWidth, lineY).strokeColor(colors.border).stroke();
  doc.font(PDF_FONT_BOLD).fontSize(10);
  doc.text(PDF_LABELS.total, boxX + 8, lineY + 6);
  doc.text(formatMKD(totalAmount), boxRight - 8 - numbersWidth, lineY + 6, { width: numbersWidth, align: 'right' });
  return lineY + 22;
}

/** Notes section: only if notes exist; invoice-style bordered box. */
function drawNotes(doc: Doc, notes: string | null, startY: number): number {
  if (!notes || !notes.trim()) return startY;
  const padding = 10;
  const cardHeight = 36;
  doc.rect(MARGIN_PT, startY, CONTENT_WIDTH, cardHeight).fill(colors.rowAlt).stroke(colors.border);
  doc.fillColor(colors.textMuted).fontSize(8).font(PDF_FONT_BOLD).text(PDF_LABELS.notes, MARGIN_PT + padding, startY + 6);
  doc.fillColor(colors.text).font(PDF_FONT).fontSize(9).text(toAscii(notes), MARGIN_PT + padding, startY + 16, { width: CONTENT_WIDTH - 2 * padding });
  return startY + cardHeight + 10;
}

function drawFooter(doc: Doc, pageNum: number, totalPages: number): void {
  const generated = new Date();
  const d = generated.getDate(); const m = generated.getMonth() + 1; const y = generated.getFullYear();
  const h = generated.getHours(); const min = generated.getMinutes();
  const generatedStr = `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y} ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  doc.fillColor(colors.textMuted).fontSize(7).font(PDF_FONT);
  doc.text(`${COMPANY.name} | ${COMPANY.regNo}`, MARGIN_PT, FOOTER_Y - 8);
  doc.text(`${PDF_LABELS.generated}: ${generatedStr}`, MARGIN_PT, FOOTER_Y);
  doc.text(`${PDF_LABELS.page} ${pageNum} / ${totalPages}`, PAGE_WIDTH - MARGIN_PT - 50, FOOTER_Y, { width: 50, align: 'right' });
}

export function generateOrderPdf(order: OrderWithItems): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: MARGIN_PT, size: 'A4', bufferPages: true }) as Doc;
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      PDF_FONT = STD_FONT;
      PDF_FONT_BOLD = STD_FONT_BOLD;
      const dejaVuPath = getDejaVuPath('DejaVuSans.ttf');
      const dejaVuBoldPath = getDejaVuPath('DejaVuSans-Bold.ttf');
      if (dejaVuPath && fs.existsSync(dejaVuPath)) {
        doc.registerFont(FONT_DEJAVU, dejaVuPath);
        PDF_FONT = FONT_DEJAVU;
        doc.font(FONT_DEJAVU);
      }
      if (dejaVuBoldPath && fs.existsSync(dejaVuBoldPath)) {
        doc.registerFont(FONT_DEJAVU_BOLD, dejaVuBoldPath);
        PDF_FONT_BOLD = FONT_DEJAVU_BOLD;
      }

      drawHeader(doc);
      let y = drawMeta(doc, order);

      drawTableHeaderRow(doc, MARGIN_PT, y);
      y += HEADER_ROW_HEIGHT;

      const { endY } = drawItemsTable(doc, order, y);
      y = endY + 8;

      const totalsHeight = 44 + 6;
      const notesHeight = order.notes && order.notes.trim() ? 34 + 6 : 0;
      const requiredHeight = totalsHeight + notesHeight;
      const spaceLeft = TABLE_BOTTOM - y;

      // Only add a new page if totals/notes truly don't fit (avoid extra blank or near-empty page)
      if (spaceLeft < requiredHeight && spaceLeft < totalsHeight) {
        doc.addPage({ size: 'A4', margin: MARGIN_PT });
        drawHeader(doc);
        y = BODY_TOP;
      }

      y = drawTotals(doc, Number(order.totalAmount), y);
      y = drawNotes(doc, order.notes ?? null, y);

      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        drawFooter(doc, i + 1, totalPages);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
