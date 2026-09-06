import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SaleReceipt, DailyExpense, InventoryItem, DailyFinancialSummary, Quotation } from '../types';
import { CompanyInfo } from './storage';

export const exportDailySummaryPDF = (
  date: string,
  sales: SaleReceipt[],
  expenses: DailyExpense[],
  summary: DailyFinancialSummary,
  company: CompanyInfo,
  inventoryAlerts: { name: string; currentStock: number; unit: string; minThreshold: number }[],
  generatedBy: string
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const currency = company.currency || '$';

  // --- HEADER ---
  doc.setFillColor(26, 36, 56); // Deep slate navy
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name.toUpperCase(), 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 215, 235);
  doc.text(`${company.tagline} | Tel: ${company.phone} | ${company.email}`, 14, 19);
  doc.text(`Report Date: ${date} | Generated: ${new Date().toLocaleTimeString()} by ${generatedBy}`, 14, 25);

  // --- TITLE BADGE ---
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, 37, 182, 28, 2, 2, 'F');
  doc.setDrawColor(220, 226, 235);
  doc.roundedRect(14, 37, 182, 28, 2, 2, 'D');

  doc.setTextColor(26, 36, 56);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('DAILY SALES & FINANCIAL AUDIT SUMMARY', 18, 44);

  // KPI Mini-Cards
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL REVENUE', 18, 51);
  doc.text('TOTAL EXPENSES', 65, 51);
  doc.text('NET PROFIT', 112, 51);
  doc.text('CASH IN DRAWER', 158, 51);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 110, 60); // Green
  doc.text(`${currency}${summary.totalRevenue.toFixed(2)}`, 18, 59);

  doc.setTextColor(185, 28, 28); // Red
  doc.text(`${currency}${summary.totalExpenses.toFixed(2)}`, 65, 59);

  doc.setTextColor(summary.netProfit >= 0 ? 16 : 185, summary.netProfit >= 0 ? 110 : 28, summary.netProfit >= 0 ? 60 : 28);
  doc.text(`${currency}${summary.netProfit.toFixed(2)}`, 112, 59);

  doc.setTextColor(30, 64, 175); // Blue
  doc.text(`${currency}${summary.closingCashInDrawer.toFixed(2)}`, 158, 59);

  let currentY = 70;

  // --- SECTION 1: ITEMIZED SALES RECEIPTS ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 36, 56);
  doc.text(`1. Daily Sales & Orders (${sales.length} Receipts)`, 14, currentY);

  const salesRows = sales.flatMap(receipt => {
    return receipt.items.map((item, idx) => [
      idx === 0 ? receipt.receiptNumber : '',
      idx === 0 ? receipt.date.split('T')[1] || receipt.date : '',
      idx === 0 ? (receipt.customerName || 'Walk-in') : '',
      item.description,
      item.category,
      `${item.quantity}`,
      `${currency}${item.unitPrice.toFixed(2)}`,
      `${currency}${item.totalPrice.toFixed(2)}`,
      idx === 0 ? receipt.paymentMethod : ''
    ]);
  });

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Receipt #', 'Time', 'Customer', 'Description / Service', 'Category', 'Qty', 'Unit Price', 'Total', 'Payment']],
    body: salesRows.length > 0 ? salesRows : [['-', '-', '-', 'No sales recorded for this date', '-', '-', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [40, 53, 75], textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: [33, 37, 41] },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 14 },
      2: { cellWidth: 24 },
      3: { cellWidth: 42 },
      4: { cellWidth: 24 },
      5: { cellWidth: 10, halign: 'center' },
      6: { cellWidth: 14, halign: 'right' },
      7: { cellWidth: 14, halign: 'right', fontStyle: 'bold' },
      8: { cellWidth: 14 }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 8;

  // Check if we need page break
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  // --- SECTION 2: DAILY EXPENSES & COSTS ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 36, 56);
  doc.text(`2. Daily Operating & Material Costs (${expenses.length} Entries)`, 14, currentY);

  const expenseRows = expenses.map(exp => [
    exp.category,
    exp.description,
    exp.recordedBy,
    exp.receiptRef || 'N/A',
    exp.paymentMethod,
    `${currency}${exp.amount.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Expense Category', 'Description', 'Recorded By', 'Ref/Receipt', 'Paid Via', 'Amount']],
    body: expenseRows.length > 0 ? expenseRows : [['-', 'No expenses recorded for this date', '-', '-', '-', `${currency}0.00`]],
    theme: 'striped',
    headStyles: { fillColor: [153, 27, 27], textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 65 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 17, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 8;

  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  // --- SECTION 3: STOCK DEPLETION & LOW STOCK ALERTS ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 36, 56);
  doc.text('3. Low Stock & Critical Depletion Alerts', 14, currentY);

  const alertRows = inventoryAlerts.map(a => [
    a.name,
    `${a.currentStock} ${a.unit}`,
    `${a.minThreshold} ${a.unit}`,
    a.currentStock === 0 ? 'CRITICAL (OUT OF STOCK)' : 'LOW STOCK - REORDER'
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Material / Stock Name', 'Current Level', 'Min Threshold', 'Status']],
    body: alertRows.length > 0 ? alertRows : [['All inventory items are currently at healthy stock levels.', '-', '-', 'HEALTHY']],
    theme: 'plain',
    headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 32, fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 12;

  if (currentY > 260) {
    doc.addPage();
    currentY = 30;
  }

  // Signatures
  doc.setDrawColor(180, 190, 205);
  doc.line(14, currentY + 10, 80, currentY + 10);
  doc.line(120, currentY + 10, 190, currentY + 10);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Teller / Duty Officer Signature', 14, currentY + 14);
  doc.text('Manager / Administrator Approval', 120, currentY + 14);

  // Save PDF
  doc.save(`Daily_Summary_${date}_${company.name.replace(/\s+/g, '_')}.pdf`);
};

export const exportStockReportPDF = (
  inventoryAnalysis: {
    item: InventoryItem;
    depletionRate: number;
    daysOfStockLeft: number;
    status: 'critical' | 'low' | 'healthy' | 'overstocked';
    stockValuation: number;
  }[],
  company: CompanyInfo,
  generatedBy: string
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const currency = company.currency || '$';
  const totalValuation = inventoryAnalysis.reduce((sum, i) => sum + i.stockValuation, 0);

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVENTORY STOCK & DEPLETION AUDIT REPORT', 14, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`${company.name} | Total Valuation: ${currency}${totalValuation.toFixed(2)} | Date: ${new Date().toISOString().split('T')[0]} | By: ${generatedBy}`, 14, 19);

  const rows = inventoryAnalysis.map(item => [
    item.item.sku,
    item.item.name,
    item.item.category,
    `${item.item.currentStock} ${item.item.unit}`,
    `${item.item.minThreshold} ${item.item.unit}`,
    `${item.depletionRate} /day`,
    item.daysOfStockLeft > 365 ? '>1 yr' : `${item.daysOfStockLeft} days`,
    `${currency}${item.item.unitCost.toFixed(2)}`,
    `${currency}${item.stockValuation.toFixed(2)}`,
    item.status.toUpperCase()
  ]);

  autoTable(doc, {
    startY: 34,
    head: [['SKU', 'Item Name', 'Category', 'Current', 'Min', 'Depletion Rate', 'Est. Days Left', 'Unit Cost', 'Valuation', 'Status']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold' },
    bodyStyles: { fontSize: 6.5 },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 38 },
      2: { cellWidth: 26 },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 16, halign: 'center' },
      7: { cellWidth: 14, halign: 'right' },
      8: { cellWidth: 14, halign: 'right', fontStyle: 'bold' },
      9: { cellWidth: 16, fontStyle: 'bold' }
    },
    margin: { left: 11, right: 11 }
  });

  doc.save(`Stock_Depletion_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportReceiptPDF = (
  receipt: SaleReceipt,
  company: CompanyInfo
) => {
  // Standard 80mm thermal receipt or compact format
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 210]
  });

  const currency = company.currency || '$';

  // Navy Brand Header Band
  doc.setFillColor(12, 45, 100); // Magen Navy #0C2D64
  doc.rect(0, 0, 80, 24, 'F');

  // Green Accent Stripe
  doc.setFillColor(56, 142, 60); // Magen Leaf Green #388E3C
  doc.rect(0, 24, 80, 1.8, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text('MAGEN INTEGRATED SOLUTIONS', 40, 7.5, { align: 'center' });

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 240, 225);
  doc.text('MEDIA & PRINT SOLUTIONS | ENVIRONMENTAL CONSULTANCY', 40, 12, { align: 'center' });
  doc.text(`Tel: ${company.phone}`, 40, 16, { align: 'center' });
  doc.text(company.address, 40, 20, { align: 'center' });

  // Receipt Title Badge
  doc.setTextColor(12, 45, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL SALE RECEIPT', 40, 31, { align: 'center' });

  // Receipt Metadata Card
  doc.setFillColor(245, 248, 252);
  doc.roundedRect(5, 34, 70, 19, 1.5, 1.5, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(12, 45, 100);
  doc.text(`RECEIPT: ${receipt.receiptNumber}`, 8, 39);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Date: ${receipt.date.replace('T', ' ')}`, 8, 43.5);
  doc.text(`Client: ${receipt.customerName || 'Walk-in Client'}`, 8, 48);
  if (receipt.customerPhone) {
    doc.text(`Phone: ${receipt.customerPhone}`, 44, 48);
  }
  doc.text(`Cashier / Teller: ${receipt.tellerName}`, 44, 43.5);

  let currentY = 56;

  // Items table
  const itemRows = receipt.items.map(item => [
    item.description,
    `${item.quantity}x @ ${currency}${item.unitPrice.toFixed(2)}`,
    `${currency}${item.totalPrice.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Item Description', 'Qty / Rate', 'Total']],
    body: itemRows,
    theme: 'plain',
    headStyles: { fillColor: [12, 45, 100], textColor: [255, 255, 255], fontSize: 6.8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 6.5, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 20 },
      2: { cellWidth: 15, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 5, right: 5 }
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 4;

  doc.setDrawColor(203, 213, 225);
  doc.line(5, currentY, 75, currentY);
  currentY += 4;

  // Totals Breakdown
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', 40, currentY);
  doc.text(`${currency}${receipt.subtotal.toFixed(2)}`, 75, currentY, { align: 'right' });
  currentY += 4;

  if (receipt.discount > 0) {
    doc.setTextColor(185, 28, 28);
    doc.text('Discount:', 40, currentY);
    doc.text(`-${currency}${receipt.discount.toFixed(2)}`, 75, currentY, { align: 'right' });
    currentY += 4;
  }

  if (receipt.tax > 0) {
    doc.setTextColor(71, 85, 105);
    doc.text('Tax / VAT:', 40, currentY);
    doc.text(`${currency}${receipt.tax.toFixed(2)}`, 75, currentY, { align: 'right' });
    currentY += 4;
  }

  // TOTAL Box
  doc.setFillColor(12, 45, 100);
  doc.roundedRect(36, currentY - 1, 39, 7.5, 1, 1, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL PAID:', 38, currentY + 4);
  doc.text(`${currency}${receipt.totalAmount.toFixed(2)}`, 73, currentY + 4, { align: 'right' });
  currentY += 10;

  // Payment method badge
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(56, 142, 60); // Green
  doc.text(`✓ Paid in Full via ${receipt.paymentMethod}`, 5, currentY);
  currentY += 6;

  // Footer & Disclaimer
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(company.receiptFooter, 40, currentY, { align: 'center', maxWidth: 70 });
  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(12, 45, 100);
  doc.text('*** THANK YOU FOR YOUR VALUED BUSINESS ***', 40, currentY, { align: 'center' });

  doc.save(`Receipt_${receipt.receiptNumber}.pdf`);
};

export const exportQuotationPDF = (
  quotation: Quotation,
  company: CompanyInfo
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const currency = company.currency || '$';

  // --- BRAND HEADER BANNER ---
  // Navy banner
  doc.setFillColor(12, 45, 100); // Magen Navy #0C2D64
  doc.rect(0, 0, 210, 36, 'F');

  // Eco-Green stripe
  doc.setFillColor(56, 142, 60); // Magen Green #388E3C
  doc.rect(0, 36, 210, 2.5, 'F');

  // Header Typography
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MAGEN INTEGRATED SOLUTIONS', 14, 15);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 230, 195);
  doc.text('MEDIA & PRINT SOLUTIONS | ENVIRONMENTAL CONSULTANCY', 14, 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(220, 230, 245);
  doc.text(`Tel: ${company.phone}  |  Email: ${company.email}  |  Address: ${company.address}`, 14, 27);
  doc.text('Commercial Printing • Publishing • Branding • Environmental Impact Assessments', 14, 32);

  // --- QUOTATION BADGE & TITLE ---
  doc.setFillColor(245, 248, 253);
  doc.roundedRect(14, 43, 182, 34, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 43, 182, 34, 2, 2, 'D');

  // Left column: Quotation Title & Meta
  doc.setTextColor(12, 45, 100);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PRICE ESTIMATE & FORMAL QUOTATION', 20, 52);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(56, 142, 60);
  doc.text(`QUOTE REF: ${quotation.quoteNumber}`, 20, 58);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Date of Issue: ${quotation.date}`, 20, 64);
  doc.text(`Valid Until: ${quotation.validUntil} (14 Days)`, 20, 69);
  doc.text(`Prepared By: ${quotation.preparedBy}`, 20, 74);

  // Right column: Customer Information
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(12, 45, 100);
  doc.text('QUOTATION PREPARED FOR:', 108, 52);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(quotation.customerName, 108, 58);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  if (quotation.customerPhone) {
    doc.text(`Phone: ${quotation.customerPhone}`, 108, 64);
  }
  if (quotation.customerEmail) {
    doc.text(`Email: ${quotation.customerEmail}`, 108, 69);
  }
  if (quotation.customerAddress) {
    doc.text(`Address: ${quotation.customerAddress}`, 108, 74);
  }

  let currentY = 82;

  // --- ITEM TABLE ---
  const itemRows = quotation.items.map((item, index) => [
    `${index + 1}`,
    item.description + (item.notes ? `\nNote: ${item.notes}` : ''),
    item.category,
    `${item.quantity} ${item.unit || 'units'}`,
    `${currency}${item.unitPrice.toFixed(2)}`,
    `${currency}${item.totalPrice.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Service Description / Specifications', 'Category', 'Quantity', 'Unit Rate', 'Total Amount']],
    body: itemRows,
    theme: 'grid',
    headStyles: {
      fillColor: [12, 45, 100], // Magen Navy
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 253]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 35 },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 6;

  // Check page overflow
  if (currentY > 210) {
    doc.addPage();
    currentY = 25;
  }

  // --- TOTALS CALCULATION BOX ---
  const totalsX = 120;
  const totalsW = 76;

  doc.setFillColor(248, 250, 253);
  doc.roundedRect(totalsX, currentY, totalsW, 36, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(totalsX, currentY, totalsW, 36, 1.5, 1.5, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', totalsX + 6, currentY + 7);
  doc.text(`${currency}${quotation.subtotal.toFixed(2)}`, totalsX + totalsW - 6, currentY + 7, { align: 'right' });

  let lineY = currentY + 13;
  if (quotation.discount && quotation.discount > 0) {
    doc.setTextColor(185, 28, 28);
    doc.text('Discount Applied:', totalsX + 6, lineY);
    doc.text(`-${currency}${quotation.discount.toFixed(2)}`, totalsX + totalsW - 6, lineY, { align: 'right' });
    lineY += 6;
  }

  if (quotation.taxAmount && quotation.taxAmount > 0) {
    doc.setTextColor(71, 85, 105);
    doc.text(`VAT / Tax (${quotation.taxRate || 0}%):`, totalsX + 6, lineY);
    doc.text(`${currency}${quotation.taxAmount.toFixed(2)}`, totalsX + totalsW - 6, lineY, { align: 'right' });
    lineY += 6;
  }

  // Highlighted Grand Total
  doc.setFillColor(12, 45, 100);
  doc.roundedRect(totalsX + 4, lineY, totalsW - 8, 9, 1, 1, 'F');
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL QUOTE:', totalsX + 8, lineY + 6);
  doc.text(`${currency}${quotation.totalAmount.toFixed(2)}`, totalsX + totalsW - 8, lineY + 6, { align: 'right' });

  // --- TERMS & CONDITIONS BOX (Left side) ---
  const termsW = 100;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, currentY, termsW, 36, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, termsW, 36, 1.5, 1.5, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(12, 45, 100);
  doc.text('Terms & Order Conditions:', 18, currentY + 6);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const termsText = quotation.terms ||
    '1. Valid for 14 calendar days from date of issue.\n' +
    '2. 50% deposit required upon proof approval; balance upon final delivery.\n' +
    '3. Production turnaround starts once artwork is approved and deposit is received.\n' +
    '4. Eco-friendly inks and certified paper stocks are used by Magen Integrated Solutions.';

  doc.text(termsText, 18, currentY + 11, { maxWidth: termsW - 8, lineHeightFactor: 1.4 });

  currentY += 45;

  // --- SIGNATURES & ACCEPTANCE ---
  doc.setDrawColor(180, 195, 215);
  doc.line(14, currentY + 14, 85, currentY + 14);
  doc.line(125, currentY + 14, 196, currentY + 14);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(12, 45, 100);
  doc.text('Authorized Signatory & Official Stamp', 14, currentY + 19);
  doc.text('Client Acceptance Signature & Date', 125, currentY + 19);

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Magen Integrated Solutions Management', 14, currentY + 23);
  doc.text('I confirm acceptance of the quoted scope & terms above', 125, currentY + 23);

  // Footer bar
  doc.setFillColor(12, 45, 100);
  doc.rect(0, 288, 210, 9, 'F');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text(`${company.name}  •  ${company.tagline}  •  ${company.phone}  •  ${company.email}`, 105, 293.5, { align: 'center' });

  doc.save(`Quotation_${quotation.quoteNumber}_${company.name.replace(/\s+/g, '_')}.pdf`);
};

