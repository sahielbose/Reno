import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

import { formatCurrency } from "@/lib/format";
import type { ProposalSnapshot } from "@/server/services/proposal-from-budget";

const BRAND = rgb(0.118, 0.278, 0.847); // #1E47D8
const INK = rgb(0.055, 0.09, 0.149); // #0E1726
const MUTED = rgb(0.29, 0.35, 0.47); // #4a5878
const FAINT = rgb(0.54, 0.59, 0.68); // #8a96ad
const LINE = rgb(0.82, 0.85, 0.9);

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;

export async function buildProposalPdf(opts: {
  orgName: string;
  number: string;
  clientName: string;
  projectName: string;
  total: number;
  scope: string;
  snapshot: ProposalSnapshot;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const left = (text: string, size: number, f: PDFFont, color = INK) => {
    page.drawText(text, { x: MARGIN, y, size, font: f, color });
  };
  const right = (text: string, size: number, f: PDFFont, color = INK) => {
    const w = f.widthOfTextAtSize(text, size);
    page.drawText(text, { x: PAGE_W - MARGIN - w, y, size, font: f, color });
  };
  const ensure = (needed: number) => {
    if (y - needed < MARGIN) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  };

  // Header
  left(opts.orgName, 18, bold, BRAND);
  right(`Proposal ${opts.number}`, 10, font, FAINT);
  y -= 26;
  left(opts.projectName, 14, bold);
  y -= 16;
  left(`Prepared for ${opts.clientName}`, 10, font, MUTED);
  y -= 30;

  // Section pricing
  left("SCOPE & PRICING", 9, bold, FAINT);
  y -= 18;
  for (const section of opts.snapshot.sections) {
    ensure(20);
    left(section.name, 11, bold);
    right(formatCurrency(section.total), 11, bold);
    y -= 16;
    for (const item of section.items) {
      ensure(14);
      left(`    ${item.name}  ·  ${item.qty} ${item.unit}`, 9, font, MUTED);
      right(formatCurrency(item.lineTotal), 9, font, MUTED);
      y -= 13;
    }
    y -= 8;
  }

  // Total
  ensure(40);
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 1,
    color: LINE,
  });
  y -= 22;
  left("Total contract value", 13, bold);
  right(formatCurrency(opts.total), 14, bold, BRAND);
  y -= 36;

  // Scope of work (wrapped)
  ensure(40);
  left("SCOPE OF WORK", 9, bold, FAINT);
  y -= 16;
  for (const lineText of wrap(opts.scope, font, 10, PAGE_W - 2 * MARGIN)) {
    ensure(14);
    left(lineText, 10, font, MUTED);
    y -= 14;
  }

  return doc.save();
}

/** Greedy word-wrap to a pixel width. */
function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}
