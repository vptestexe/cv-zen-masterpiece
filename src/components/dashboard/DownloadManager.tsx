
import jsPDF from "jspdf";

export const downloadCvAsPdf = async (cv: any, downloadId: string) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  pdf.setFontSize(16);
  pdf.text(cv.title, 20, 20);
  pdf.setFontSize(12);
  pdf.text(`Dernière modification: ${new Date(cv.lastUpdated).toLocaleDateString()}`, 20, 30);
  // Real preview logic; here we'd render the same content as preview—this is a placeholder.
  pdf.setFontSize(10);
  pdf.setTextColor(200, 200, 200);
  pdf.text(`CV Zen Masterpiece - ID: ${downloadId}`, 20, 285);
  pdf.save(`cv-${cv.id}.pdf`);
};

export const downloadCvAsWord = (cv: any, downloadId: string) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${cv.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        h1 { color: #333; }
        .watermark { color: #cccccc; font-size: 8pt; margin-top: 40px; }
      </style>
    </head>
    <body>
      <h1>${cv.title}</h1>
      <p>Dernière modification: ${new Date(cv.lastUpdated).toLocaleDateString()}</p>
      <div class="watermark">CV Zen Masterpiece - ID: ${downloadId}</div>
    </body>
    </html>
  `;
  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-word' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `cv-${cv.id}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
