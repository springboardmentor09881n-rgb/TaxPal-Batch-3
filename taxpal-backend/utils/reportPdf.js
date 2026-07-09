const PDFDocument = require('pdfkit');

function buildReportPdf({ label, period, summary, transactions }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('TaxPal Financial Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Period: ${label}`);
    doc.text(`Report Type: ${period}`);
    doc.moveDown();

    doc.fontSize(14).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Total Income: ₹${summary.totalIncome}`);
    doc.text(`Total Expenses: ₹${summary.totalExpenses}`);
    doc.text(`Net Income: ₹${summary.netIncome}`);
    doc.text(`Estimated Tax: ₹${summary.estimatedTax || 0}`);
    doc.text(`Transactions: ${summary.transactionCount || transactions.length}`);
    doc.moveDown();

    doc.fontSize(14).text('Transactions', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);

    if (transactions.length === 0) {
      doc.text('No transactions in this period.');
    } else {
      transactions.forEach((tx) => {
        const date = new Date(tx.date).toISOString().slice(0, 10);
        doc.text(
          `${date} | ${tx.type} | ${tx.category} | ₹${tx.amount} | ${tx.description || '-'}`
        );
      });
    }

    doc.end();
  });
}

module.exports = { buildReportPdf };
