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
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Modern gradient header background
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(0, 0, pageWidth, 55, "F");
  
  // Accent strip
  doc.setFillColor(99, 102, 241); // Indigo-500
  doc.rect(0, 50, pageWidth, 5, "F");
  
  // App name with modern styling
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("MENTORSHIP", pageWidth / 2, 22, { align: "center" });
  
  doc.setFontSize(18);
  doc.setFont("helvetica", "normal");
  doc.text("Management System", pageWidth / 2, 32, { align: "center" });
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "italic");
  doc.text("Review Performance Report", pageWidth / 2, 43, { align: "center" });
  
  let yPos = 65;
  
  // Report metadata section with modern cards
  const metaCardWidth = (pageWidth - 42) / 2;
  
  // Date range card
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(14, yPos, metaCardWidth, 18, 2, 2, "F");
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.roundedRect(14, yPos, metaCardWidth, 18, 2, 2, "S");
  
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("REPORT PERIOD", 18, yPos + 7);
  
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const periodText = startDate || endDate 
    ? `${startDate ? startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Start"} - ${endDate ? endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Present"}`
    : "All Time";
  doc.text(periodText, 18, yPos + 14);
  
  // Generated date card
  const genCardX = 14 + metaCardWidth + 14;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(genCardX, yPos, metaCardWidth, 18, 2, 2, "F");
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.roundedRect(genCardX, yPos, metaCardWidth, 18, 2, 2, "S");
  
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("GENERATED ON", genCardX + 4, yPos + 7);
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const generatedText = `${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  doc.text(generatedText, genCardX + 4, yPos + 14);
  
  yPos += 28;
  
  // Dashboard KPI Cards with modern design
  const cardWidth = (pageWidth - 42) / 2;
  const cardHeight = 36;
  
  // Reviews card with gradient effect
  doc.setFillColor(239, 246, 255); // Blue-50
  doc.roundedRect(14, yPos, cardWidth, cardHeight, 4, 4, "F");
  
  // Accent bar
  doc.setFillColor(59, 130, 246); // Blue-500
  doc.roundedRect(14, yPos, 4, cardHeight, 4, 4, "F");
  
  doc.setDrawColor(191, 219, 254); // Blue-200
  doc.setLineWidth(1);
  doc.roundedRect(14, yPos, cardWidth, cardHeight, 4, 4, "S");
  
  // Icon circle background
  doc.setFillColor(219, 234, 254); // Blue-100
  doc.circle(24, yPos + 12, 6, "F");
  
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("📊", 21, yPos + 14);
  
  doc.setTextColor(30, 58, 138); // Blue-900
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL REVIEWS", 34, yPos + 12);
  
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(reviews.length.toString(), 20, yPos + 28);
  
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("reviews completed", 20, yPos + 33);
  
  // Payments card with gradient effect
  const payCardX = 14 + cardWidth + 14;
  doc.setFillColor(240, 253, 244); // Green-50
  doc.roundedRect(payCardX, yPos, cardWidth, cardHeight, 4, 4, "F");
  
  // Accent bar
  doc.setFillColor(34, 197, 94); // Green-500
  doc.roundedRect(payCardX, yPos, 4, cardHeight, 4, 4, "F");
  
  doc.setDrawColor(187, 247, 208); // Green-200
  doc.setLineWidth(1);
  doc.roundedRect(payCardX, yPos, cardWidth, cardHeight, 4, 4, "S");
  
  // Icon circle background
  doc.setFillColor(220, 252, 231); // Green-100
  doc.circle(payCardX + 10, yPos + 12, 6, "F");
  
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("💰", payCardX + 7, yPos + 14);
  
  doc.setTextColor(20, 83, 45); // Green-900
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL PAYMENTS", payCardX + 20, yPos + 12);
  
  const totalPayments = reviews.length * PAYMENT_RATE_PER_REVIEW;
  doc.setTextColor(22, 163, 74); // Green-600
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(`$${totalPayments.toLocaleString()}`, payCardX + 6, yPos + 28);
  
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`${reviews.length} reviews × $${PAYMENT_RATE_PER_REVIEW}`, payCardX + 6, yPos + 33);
  
  yPos += cardHeight + 20;
  
  // Table section header
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.roundedRect(14, yPos, pageWidth - 28, 10, 2, 2, "F");
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DETAILED REVIEW BREAKDOWN", 18, yPos + 7);
  
  yPos += 14;
  
  // Table data
  const tableData = reviews.map((review) => [
    new Date(review.review_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    review.intern_name,
    review.mentor_name,
    review.review_topic,
    `⭐ ${review.review_score}`,
    `$${PAYMENT_RATE_PER_REVIEW}`,
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [["Date", "Intern", "Mentor", "Topic", "Score", "Payment"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: [79, 70, 229], // Indigo-600
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
      halign: "left",
      cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85], // Slate-700
      cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate-50
    },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: "bold" },
      1: { cellWidth: 32 },
      2: { cellWidth: 32 },
      3: { cellWidth: 48 },
      4: { cellWidth: 22, halign: "center" },
      5: { cellWidth: 22, halign: "right", fontStyle: "bold", textColor: [22, 163, 74] },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer on every page
      const footerY = pageHeight - 15;
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
      
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.setFont("helvetica", "normal");
      doc.text(
        `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
        pageWidth / 2,
        footerY,
        { align: "center" }
      );
      
      doc.text("Mentorship Management System", 14, footerY);
      doc.text(
        new Date().getFullYear().toString(),
        pageWidth - 14,
        footerY,
        { align: "right" }
      );
    },
  });
  
  // Save the PDF
  const fileName = `mentorship-report-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};
