import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { ExportColumn, ExportRow } from './columns';

function formatDateForPdf(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const BORDER_INSET = 12;
const CONTENT_PAD = 18;
const MARGIN = BORDER_INSET + CONTENT_PAD;
const INCIDENT_INDENT = 8;
const INCIDENT_TEXT_RIGHT_PAD = 20;
const TITLE_SIZE = 12;
const SUBTITLE_SIZE = 9;
const BODY_FONT_SIZE = 8;
const SECTION_HEADER_SIZE = 9;
const LINE_HEIGHT = 9;
const LABEL_VALUE_GAP = 2;
const SECTION_GAP = 12;
const INCIDENT_FIELD_GAP = 4;
const H_RULE_GAP = 12;
const BOTTOM_PAD = 28;

const DAILY_FIELDS: { key: keyof ExportRow; label: string }[] = [
  { key: 'diet', label: 'Diet' },
  { key: 'exercise', label: 'Exercise' },
  { key: 'medicine', label: 'Medicine' },
  { key: 'feelingMorning', label: 'Feeling (morning)' },
  { key: 'feelingAfternoon', label: 'Feeling (afternoon)' },
  { key: 'feelingNight', label: 'Feeling (night)' },
  { key: 'overallRating', label: 'Overall rating' },
];

function wrapLines(font: PDFFont, size: number, text: string, maxWidth: number): string[] {
  if (maxWidth <= 0) return [];
  const safeMax = Math.max(20, maxWidth - 2);
  const paragraphs = text.split(/\n/);
  const lines: string[] = [];
  for (const para of paragraphs) {
    const words = para.trim() ? para.split(/\s+/) : [''];
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      const w = font.widthOfTextAtSize(candidate, size);
      if (w <= safeMax) {
        current = candidate;
      } else {
        if (current) {
          lines.push(current);
          current = '';
        }
        if (font.widthOfTextAtSize(word, size) > safeMax) {
          for (const char of word) {
            const cw = font.widthOfTextAtSize(current + char, size);
            if (cw <= safeMax) {
              current += char;
            } else {
              if (current) lines.push(current);
              current = char;
            }
          }
        } else {
          current = word;
        }
      }
    }
    if (current) lines.push(current);
  }
  const result: string[] = [];
  for (const line of lines) {
    if (font.widthOfTextAtSize(line, size) <= safeMax) {
      result.push(line);
    } else {
      let remainder = line;
      while (remainder) {
        let chunk = '';
        for (const char of remainder) {
          if (font.widthOfTextAtSize(chunk + char, size) <= safeMax) {
            chunk += char;
          } else {
            break;
          }
        }
        if (chunk) {
          result.push(chunk);
          remainder = remainder.slice(chunk.length);
        } else {
          result.push(remainder.slice(0, 1));
          remainder = remainder.slice(1);
        }
      }
    }
  }
  return result;
}

function drawLabelValue(
  page: PDFPage,
  x: number,
  y: number,
  font: PDFFont,
  fontBold: PDFFont,
  size: number,
  lineHeight: number,
  label: string,
  value: string,
  valueMaxWidth: number,
  labelWidth: number
): number {
  page.drawText(`${label}: `, {
    x,
    y,
    size,
    font: fontBold,
  });
  const valueX = x + labelWidth;
  const displayValue = value.trim() || '—';
  const lines = wrapLines(font, size, displayValue, valueMaxWidth);
  if (lines.length === 0) {
    page.drawText('—', { x: valueX, y, size, font });
    return y - lineHeight;
  }
  lines.forEach((line, i) => {
    page.drawText(line, {
      x: valueX,
      y: y - i * lineHeight,
      size,
      font,
    });
  });
  return y - (lines.length - 1) * lineHeight - lineHeight;
}

function drawPageBorder(page: PDFPage, width: number, height: number): void {
  const x = BORDER_INSET;
  const y = BORDER_INSET;
  const w = width - 2 * BORDER_INSET;
  const h = height - 2 * BORDER_INSET;
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    borderWidth: 0.75,
    borderColor: rgb(0.75, 0.75, 0.78),
  });
}

function getMaxIncidentsFromRow(row: ExportRow): number {
  let max = 0;
  for (const key of Object.keys(row)) {
    const m = /^incident(\d+)Time$/.exec(key);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max;
}

function getIncident(
  row: ExportRow,
  n: number
): {
  time: string;
  symptoms: string;
  notes: string;
} {
  const t = row[`incident${n}Time`];
  const s = row[`incident${n}Symptoms`];
  const n_ = row[`incident${n}Notes`];
  return {
    time: t != null && String(t).trim() !== '' ? String(t) : '—',
    symptoms: s != null && String(s).trim() !== '' ? String(s) : '—',
    notes: n_ != null && String(n_).trim() !== '' ? String(n_) : '—',
  };
}

function hasIncidentData(row: ExportRow, n: number): boolean {
  const inc = getIncident(row, n);
  return inc.time !== '—' || inc.symptoms !== '—' || inc.notes !== '—';
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
  drawPageBorder(currentPage, width, height);
  const contentLeft = MARGIN;
  const contentRight = width - MARGIN;
  const contentWidth = Math.max(0, contentRight - contentLeft);
  const minY = BORDER_INSET + BOTTOM_PAD;
  const labelWidth = fontBold.widthOfTextAtSize('Feeling (afternoon): ', BODY_FONT_SIZE);
  const valueMaxWidth = Math.max(0, contentWidth - labelWidth - 8);
  const incidentTextWidth = Math.max(0, contentWidth - INCIDENT_INDENT - INCIDENT_TEXT_RIGHT_PAD);

  let y = height - MARGIN;

  function ensureSpace(needed: number): void {
    if (y - needed < minY) {
      currentPage = doc.addPage();
      const size = currentPage.getSize();
      drawPageBorder(currentPage, size.width, size.height);
      y = size.height - MARGIN;
    }
  }

  function drawTitleBlock(page: PDFPage, startY: number): number {
    let yy = startY;
    page.drawText('POTS Tracker – Doctor Report', {
      x: MARGIN,
      y: yy,
      size: TITLE_SIZE,
      font: fontBold,
    });
    yy -= TITLE_SIZE + 4;
    const dateRangeStr = `Date range: ${formatDateForPdf(from)} – ${formatDateForPdf(to)}`;
    page.drawText(dateRangeStr, {
      x: MARGIN,
      y: yy,
      size: SUBTITLE_SIZE,
      font,
    });
    yy -= SUBTITLE_SIZE + 10;
    return yy;
  }

  y = drawTitleBlock(currentPage, y);

  if (rows.length === 0) {
    currentPage.drawText('No data for this period.', {
      x: MARGIN,
      y,
      size: BODY_FONT_SIZE,
      font,
    });
    const pdfBytes = await doc.save();
    return Buffer.from(pdfBytes);
  }

  for (let dayIndex = 0; dayIndex < rows.length; dayIndex++) {
    const row = rows[dayIndex];
    if (y < minY) {
      currentPage = doc.addPage();
      const pageSize = currentPage.getSize();
      drawPageBorder(currentPage, pageSize.width, pageSize.height);
      y = pageSize.height - MARGIN;
      y = drawTitleBlock(currentPage, y);
    }

    if (dayIndex > 0) {
      currentPage.drawLine({
        start: { x: contentLeft, y },
        end: { x: contentRight, y },
        thickness: 0.35,
        color: rgb(0.88, 0.88, 0.9),
      });
      y -= H_RULE_GAP;
    }

    ensureSpace(LINE_HEIGHT + LABEL_VALUE_GAP);
    currentPage.drawText(formatDateForPdf(row.date), {
      x: MARGIN,
      y,
      size: SECTION_HEADER_SIZE,
      font: fontBold,
    });
    y -= LINE_HEIGHT + LABEL_VALUE_GAP;

    for (const { key, label } of DAILY_FIELDS) {
      let value: string;
      if (key === 'overallRating') {
        value = row.overallRating != null ? String(row.overallRating) : '';
      } else {
        value = (row[key] as string | null) ?? '';
      }
      const displayValue = (value ?? '').trim() || '—';
      const valueLines = wrapLines(font, BODY_FONT_SIZE, displayValue, valueMaxWidth);
      const blockHeight = LINE_HEIGHT + (valueLines.length || 1) * LINE_HEIGHT + LABEL_VALUE_GAP;
      ensureSpace(blockHeight);
      y = drawLabelValue(
        currentPage,
        MARGIN,
        y,
        font,
        fontBold,
        BODY_FONT_SIZE,
        LINE_HEIGHT,
        label,
        value,
        valueMaxWidth,
        labelWidth
      );
      y -= LABEL_VALUE_GAP;
    }

    const maxIncidents = getMaxIncidentsFromRow(row);
    let hasAnyIncident = false;
    for (let n = 1; n <= maxIncidents; n++) {
      if (!hasIncidentData(row, n)) continue;
      hasAnyIncident = true;
      break;
    }

    if (hasAnyIncident) {
      y -= 2;
      ensureSpace(LINE_HEIGHT + LABEL_VALUE_GAP);
      currentPage.drawText('Incidents', {
        x: MARGIN,
        y,
        size: BODY_FONT_SIZE,
        font: fontBold,
      });
      y -= LINE_HEIGHT + LABEL_VALUE_GAP;

      for (let n = 1; n <= maxIncidents; n++) {
        if (!hasIncidentData(row, n)) continue;
        const inc = getIncident(row, n);

        ensureSpace(LINE_HEIGHT + LABEL_VALUE_GAP);
        currentPage.drawText(`Time: ${inc.time}`, {
          x: MARGIN + 8,
          y,
          size: BODY_FONT_SIZE,
          font,
        });
        y -= LINE_HEIGHT + LABEL_VALUE_GAP;

        ensureSpace(LINE_HEIGHT);
        currentPage.drawText('Symptoms:', {
          x: MARGIN + 8,
          y,
          size: BODY_FONT_SIZE,
          font: fontBold,
        });
        y -= LINE_HEIGHT;
        const symptomsLines = wrapLines(font, BODY_FONT_SIZE, inc.symptoms, incidentTextWidth);
        if (symptomsLines.length > 0) {
          for (const line of symptomsLines) {
            ensureSpace(LINE_HEIGHT);
            currentPage.drawText(line, {
              x: MARGIN + 8,
              y,
              size: BODY_FONT_SIZE,
              font,
            });
            y -= LINE_HEIGHT;
          }
        } else {
          ensureSpace(LINE_HEIGHT);
          currentPage.drawText('—', {
            x: MARGIN + 8,
            y,
            size: BODY_FONT_SIZE,
            font,
          });
          y -= LINE_HEIGHT;
        }
        y -= INCIDENT_FIELD_GAP;

        ensureSpace(LINE_HEIGHT);
        currentPage.drawText('Notes:', {
          x: MARGIN + 8,
          y,
          size: BODY_FONT_SIZE,
          font: fontBold,
        });
        y -= LINE_HEIGHT;
        const notesLines = wrapLines(font, BODY_FONT_SIZE, inc.notes, incidentTextWidth);
        if (notesLines.length > 0) {
          for (const line of notesLines) {
            ensureSpace(LINE_HEIGHT);
            currentPage.drawText(line, {
              x: MARGIN + 8,
              y,
              size: BODY_FONT_SIZE,
              font,
            });
            y -= LINE_HEIGHT;
          }
        } else {
          ensureSpace(LINE_HEIGHT);
          currentPage.drawText('—', {
            x: MARGIN + 8,
            y,
            size: BODY_FONT_SIZE,
            font,
          });
          y -= LINE_HEIGHT;
        }
        y -= INCIDENT_FIELD_GAP;
      }
    }

    y -= SECTION_GAP;
  }

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
