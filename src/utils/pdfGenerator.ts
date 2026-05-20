import { jsPDF } from 'jspdf';

export const generateMergedPDF = async (documents: any[], title: string = 'Enterprise Document Bundle') => {
  const doc = new jsPDF();
  let currentPage = 1;

  // 1. Cover Page
  doc.setFontSize(30);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('LogiCore TMS', 105, 100, { align: 'center' });
  
  doc.setFontSize(20);
  doc.text(title, 105, 120, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 140, { align: 'center' });
  
  // Add QR Code Placeholder (could use a library if needed)
  doc.rect(85, 160, 40, 40);
  doc.text('QR VALIDATION', 105, 180, { align: 'center' });

  // 2. Iterate through documents
  for (const item of documents) {
    doc.addPage();
    currentPage++;
    
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(item.name, 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Category: ${item.type} | Expiry: ${item.expiry_date || 'N/A'}`, 20, 30);
    
    // In a real app, we would fetch the image/PDF content and embed it
    // For now, we add a placeholder for the document image
    doc.rect(20, 40, 170, 220);
    doc.text('DOCUMENT PREVIEW ATTACHED', 105, 150, { align: 'center' });
  }

  // 3. Save
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};
