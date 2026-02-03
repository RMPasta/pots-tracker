import { PDFDocument, StandardFonts } from 'pdf-lib';
import type { ExportColumn, ExportRow } from './columns';

function formatDateForPdf(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MARGIN = 50;
const TITLE_SIZE = 14;
const SUBTITLE_SIZE = 10;
const TABLE_FONT_SIZE = 8;
const ROW_HEIGHT = 12;
const MAX_CELL_CHARS = 30;

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 2) + '..';
}

export async function buildPdf(
  columns: ExportColumn[],
  rows: ExportRow[],
  from: Date,
  to: Date
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  let currentPage = doc.addPage();
  const { width, height } = currentPage.getSize();

  let y = height - MARGIN;

  currentPage.drawText('POTS Tracker – Doctor Report', {
    x: MARGIN,
    y,
    size: TITLE_SIZE,
    font: fontBold,
  });
  y -= TITLE_SIZE + 8;

  const dateRangeStr = `Date range: ${formatDateForPdf(from)} – ${formatDateForPdf(to)}`;
  currentPage.drawText(dateRangeStr, {
    x: MARGIN,
    y,
    size: SUBTITLE_SIZE,
    font,
  });
  y -= SUBTITLE_SIZE + 16;

  const tableWidth = width - 2 * MARGIN;
  const colCount = columns.length;
  const colWidth = colCount > 0 ? tableWidth / colCount : tableWidth;

  function drawHeader(page: typeof currentPage, headerY: number) {
    columns.forEach((col, i) => {
      const x = MARGIN + i * colWidth + 2;
      page.drawText(truncate(col.label, MAX_CELL_CHARS), {
        x,
        y: headerY,
        size: TABLE_FONT_SIZE,
        font: fontBold,
      });
    });
  }

  drawHeader(currentPage, y);
  y -= ROW_HEIGHT;

  for (const row of rows) {
    if (y < MARGIN + ROW_HEIGHT) {
      currentPage = doc.addPage();
      y = currentPage.getHeight() - MARGIN;
      drawHeader(currentPage, y);
      y -= ROW_HEIGHT;
    }
    columns.forEach((col, i) => {
      const x = MARGIN + i * colWidth + 2;
      const value = col.getValue(row);
      currentPage.drawText(truncate(value, MAX_CELL_CHARS), {
        x,
        y,
        size: TABLE_FONT_SIZE,
        font,
      });
    });
    y -= ROW_HEIGHT;
  }

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
