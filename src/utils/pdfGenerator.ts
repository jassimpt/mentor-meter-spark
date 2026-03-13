import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Review {
  mentor_name: string;
  intern_name: string;
  review_date: string;
  review_topic: string;
  review_score: number;
}

export const generateReviewsPdf = (
  reviews: Review[],
  paymentRate: number,
  filterMonth?: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(88, 80, 236);
  doc.roundedRect(14, 15, pageWidth - 28, 30, 8, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Review Reports", 24, 32);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const generatedDate = new Date().toLocaleString('en-US', { 
    month: 'long', 
    day: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  }).replace(",", " at");
  doc.text(`Generated on ${generatedDate}`, 24, 40);

  // Summary Cards
  const totalReviews = reviews.length;
  const totalPayment = totalReviews * paymentRate;

  // Total Reviews Card
  doc.setDrawColor(230, 230, 230);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 55, (pageWidth / 2) - 20, 35, 8, 8, "FD");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.text("Total Reviews", 22, 65);
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(totalReviews.toString(), 22, 80);
  doc.setDrawColor(34, 177, 76);
  doc.setLineWidth(1.5);
  doc.line(22, 84, 37, 84);
  doc.setFillColor(34, 177, 76);
  doc.roundedRect((pageWidth / 2) - 32, 62, 10, 10, 3, 3, "F");

  // Total Payment Card (Green)
  doc.setFillColor(34, 177, 76);
  doc.roundedRect((pageWidth / 2) + 6, 55, (pageWidth / 2) - 20, 35, 8, 8, "F");
  doc.setTextColor(235, 245, 235);
  doc.setFontSize(10);
  doc.text("Total Payment", (pageWidth / 2) + 14, 65);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(`Rs ${totalPayment.toLocaleString()}`, (pageWidth / 2) + 14, 80);
  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(1.5);
  doc.line((pageWidth / 2) + 14, 84, (pageWidth / 2) + 42, 84);
  doc.setFillColor(139, 92, 246);
  doc.roundedRect(pageWidth - 32, 62, 10, 10, 3, 3, "F");

  // Review Details Title
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Review Details", 14, 110);
  doc.setDrawColor(88, 80, 236);
  doc.setLineWidth(1);
  doc.line(14, 113, 50, 113);

  // Table
  const tableData = reviews.map(review => [
    new Date(review.review_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    review.mentor_name,
    review.intern_name,
    review.review_topic
  ]);

  autoTable(doc, {
    startY: 120,
    head: [["Date", "Mentor Name", "Intern Name", "Review Topic"]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [88, 80, 236],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 3,
      lineWidth: 0.1,
      lineColor: [221, 221, 221]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth - 14,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
    }
  });

  // Save the PDF
  const fileName = `mentorship-report-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};