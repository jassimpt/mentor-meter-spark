import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Tables } from "@/integrations/supabase/types";

type Review = Tables<"review">;

const PAYMENT_RATE_PER_REVIEW = 50; // Configure this as needed

export const generateReviewReport = (
  reviews: Review[],
  startDate?: Date,
  endDate?: Date
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header - App Name
  doc.setFillColor(99, 102, 241); // Primary color
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Mentorship Management System", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Review Report", pageWidth / 2, 30, { align: "center" });
  
  // Date range info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  let yPos = 50;
  
  if (startDate || endDate) {
    const dateRangeText = `Report Period: ${
      startDate ? startDate.toLocaleDateString() : "Beginning"
    } - ${endDate ? endDate.toLocaleDateString() : "Present"}`;
    doc.text(dateRangeText, 14, yPos);
    yPos += 10;
  } else {
    doc.text("Report Period: All Time", 14, yPos);
    yPos += 10;
  }
  
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, yPos);
  yPos += 15;
  
  // Dashboard Cards
  const cardWidth = (pageWidth - 42) / 2;
  const cardHeight = 30;
  
  // Card 1 - Total Reviews
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(14, yPos, cardWidth, cardHeight, 3, 3, "F");
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, yPos, cardWidth, cardHeight, 3, 3, "S");
  
  doc.setTextColor(99, 102, 241);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total Reviews", 20, yPos + 10);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.text(reviews.length.toString(), 20, yPos + 22);
  
  // Card 2 - Total Payments
  const card2X = 14 + cardWidth + 14;
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(card2X, yPos, cardWidth, cardHeight, 3, 3, "F");
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.5);
  doc.roundedRect(card2X, yPos, cardWidth, cardHeight, 3, 3, "S");
  
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total Payments", card2X + 6, yPos + 10);
  
  const totalPayments = reviews.length * PAYMENT_RATE_PER_REVIEW;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.text(`$${totalPayments.toLocaleString()}`, card2X + 6, yPos + 22);
  
  yPos += cardHeight + 15;
  
  // Table
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Review Details", 14, yPos);
  yPos += 5;
  
  const tableData = reviews.map((review) => [
    new Date(review.review_date).toLocaleDateString(),
    review.intern_name,
    review.mentor_name,
    review.review_topic,
    review.review_score.toString(),
    `$${PAYMENT_RATE_PER_REVIEW}`,
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [["Date", "Intern", "Mentor", "Topic", "Score", "Payment"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 50 },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 25, halign: "right" },
    },
    margin: { top: 10, left: 14, right: 14 },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }
  
  // Save the PDF
  const fileName = `review-report-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};
