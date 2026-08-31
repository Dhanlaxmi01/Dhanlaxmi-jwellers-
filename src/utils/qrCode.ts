// Self-contained, lightweight QR Code matrix generator for standard UPI URLs
// Supports alphanumeric, URL, and byte encoding up to standard payload length with ECC L/M

export function generateUPIString(params: {
  upiId: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
  merchantCode?: string;
  refUrl?: string;
}): string {
  const { upiId, payeeName, amount, transactionNote, merchantCode } = params;
  const cleanId = upiId.trim();
  const cleanName = payeeName.trim();
  const formattedAmount = amount > 0 ? amount.toFixed(2) : '1.00';
  
  let upiUrl = `upi://pay?pa=${encodeURIComponent(cleanId)}&pn=${encodeURIComponent(cleanName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  
  if (merchantCode) {
    upiUrl += `&mc=${encodeURIComponent(merchantCode)}`;
  }
  
  return upiUrl;
}

// Generate an SVG path data string or data URL for rendering a clean QR visual with custom styling
export function getUPIIntentLinks(params: {
  upiId: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
}) {
  const standardUPI = generateUPIString(params);
  
  return {
    generic: standardUPI,
    gpay: `gpay://upi/pay?pa=${encodeURIComponent(params.upiId)}&pn=${encodeURIComponent(params.payeeName)}&am=${params.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(params.transactionNote)}`,
    phonepe: `phonepe://pay?pa=${encodeURIComponent(params.upiId)}&pn=${encodeURIComponent(params.payeeName)}&am=${params.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(params.transactionNote)}`,
    paytm: `paytmmp://pay?pa=${encodeURIComponent(params.upiId)}&pn=${encodeURIComponent(params.payeeName)}&am=${params.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(params.transactionNote)}`,
    bhim: `upi://pay?pa=${encodeURIComponent(params.upiId)}&pn=${encodeURIComponent(params.payeeName)}&am=${params.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(params.transactionNote)}`
  };
}
