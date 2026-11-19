"use client";

/**
 * Turns the on-screen plan (#plan-sheet) into a real A4 PDF file and downloads it.
 * Each card is captured as an image by the browser, so Sinhala and Tamil are
 * shaped exactly as on screen; cards are never split across pages.
 */
export async function downloadPlanPdf(sheet: HTMLElement, filename: string) {
  const [{ toCanvas }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
  await document.fonts.ready;

  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const W = 210;
  const H = 297;
  const M = 10;
  const BG = "#0b0820";
  const paint = () => {
    pdf.setFillColor(BG);
    pdf.rect(0, 0, W, H, "F");
  };
  paint();
  let y = M;

  const blocks = Array.from(sheet.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && !el.classList.contains("no-print"),
  );

  for (const el of blocks) {
    const canvas = await toCanvas(el, {
      pixelRatio: 2,
      backgroundColor: BG,
      cacheBust: false,
      filter: (n) => !(n instanceof HTMLElement && n.classList.contains("no-print")),
      style: { transform: "none", animation: "none", opacity: "1" },
    });
    let w = W - M * 2;
    let h = (canvas.height / canvas.width) * w;
    const maxH = H - M * 2;
    if (h > maxH) {
      w = (w * maxH) / h;
      h = maxH;
    }
    if (y + h > H - M) {
      pdf.addPage();
      paint();
      y = M;
    }
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", (W - w) / 2, y, w, h);
    y += h + 5;
  }

  pdf.setTextColor("#a9a3d6");
  pdf.setFontSize(8);
  const pages = pdf.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i);
    pdf.text(`Connecting Universe  ·  ${i}/${pages}`, W / 2, H - 4, { align: "center" });
  }
  pdf.save(filename);
}
