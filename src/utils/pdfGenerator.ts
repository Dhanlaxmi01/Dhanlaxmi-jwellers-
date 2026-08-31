import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { OrderInquiry, SiteSettings, LiveRates } from '../types';
import { formatINR } from './pricing';
import { numberToWordsINR } from './numberToWords';

export async function generateShowroomQRDataUrl(showroomAddress: string): Promise<string> {
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(showroomAddress)}`;
  try {
    return await QRCode.toDataURL(mapsUrl, {
      width: 250,
      margin: 1,
      color: {
        dark: '#081816',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (e) {
    console.error('Failed to generate showroom QR', e);
    return '';
  }
}

/**
 * Downloads a high-resolution PDF of an invoice DOM element.
 */
export async function downloadReceiptPDF(
  receiptElement: HTMLElement,
  fileName: string = 'Dhanlaxmi_Jwellers_Invoice.pdf'
): Promise<boolean> {
  try {
    const canvas = await html2canvas(receiptElement, {
      scale: 2.5, // Crisp retina / print resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: 900,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const ratio = canvasWidth / canvasHeight;
    let renderWidth = pdfWidth - 16; // 8mm margin each side
    let renderHeight = renderWidth / ratio;

    if (renderHeight > pdfHeight - 16) {
      renderHeight = pdfHeight - 16;
      renderWidth = renderHeight * ratio;
    }

    const marginX = (pdfWidth - renderWidth) / 2;
    const marginY = 8;

    pdf.addImage(imgData, 'JPEG', marginX, marginY, renderWidth, renderHeight);
    pdf.save(fileName);
    return true;
  } catch (err) {
    console.error('Error generating PDF:', err);
    return false;
  }
}
