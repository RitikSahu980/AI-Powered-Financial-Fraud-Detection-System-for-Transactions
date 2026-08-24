import jsPDF from "jspdf";

export function downloadReceipt(payment) {
  const doc = new jsPDF("p", "mm", "a4");

  const formatMoney = (amount) =>
    `Rs. ${Number(amount ?? 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const addRow = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 20, y);

    doc.setFont("helvetica", "normal");
    doc.text(String(value ?? "--"), 85, y);

    y += 9;
  };

  /* ===========================
        HEADER
     =========================== */

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(255, 255, 255);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Sentinel Pay", 20, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("AI Powered Financial Fraud Detection", 20, 23);

  doc.setFontSize(9);
  doc.text("Secure • Intelligent • Trusted", 20, 28);

  doc.setTextColor(0, 0, 0);

  /* ===========================
        TITLE
     =========================== */

  let y = 45;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);

  doc.text("PAYMENT RECEIPT", 20, y);

  y += 8;

  doc.setDrawColor(220);
  doc.line(20, y, 190, y);

  y += 10;

  /* ===========================
        RECEIPT DETAILS
     =========================== */

  const receiptNo =
    "RCP-" +
    new Date().toISOString().slice(0, 10).replace(/-/g, "") +
    "-" +
    payment.transactionId.slice(-6).toUpperCase();

  addRow("Receipt No.", receiptNo);

  addRow("Transaction ID", payment.transactionId);

  addRow("Recipient", payment.recipientName);

  addRow("Recipient Account", payment.recipientAccount);

  addRow("Amount", formatMoney(payment.amount));

  addRow("Payment Method", payment.paymentMethod);

  addRow("Payment Status", payment.paymentStatus);

  addRow("Risk Level", payment.riskLevel);

  addRow(
    "Fraud Probability",
    `${((payment.fraudProbability ?? 0) * 100).toFixed(2)} %`,
  );

  addRow("Confidence", `${((payment.confidence ?? 0) * 100).toFixed(2)} %`);

  addRow("Remaining Balance", formatMoney(payment.remainingBalance));

  addRow("Date", new Date().toLocaleString());

  /* ===========================
        AI FRAUD ANALYSIS BOX
     =========================== */

  y += 6;

  doc.setFillColor(240, 247, 255);
  doc.roundedRect(20, y, 170, 42, 4, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);

  doc.text("AI Fraud Analysis", 28, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  doc.text("This transaction was analysed by Sentinel Pay's", 28, y + 20);

  doc.text("Machine Learning Fraud Detection Engine.", 28, y + 27);

  doc.text(
    `Prediction : ${payment.predictionLabel ?? "NOT FRAUDULENT"}`,
    28,
    y + 35,
  );

  /* ===========================
        STATUS BADGE
     =========================== */

  y += 55;

  let badgeColor = [34, 197, 94];
  let badgeText = "SUCCESS";

  if (payment.paymentStatus === "UNDER_REVIEW") {
    badgeColor = [245, 158, 11];
    badgeText = "UNDER REVIEW";
  }

  if (payment.paymentStatus === "BLOCKED") {
    badgeColor = [239, 68, 68];
    badgeText = "BLOCKED";
  }

  doc.setFillColor(...badgeColor);
  doc.roundedRect(20, y, 55, 10, 3, 3, "F");

  doc.setTextColor(255, 255, 255);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);

  doc.text(badgeText, 31, y + 6.5);

  doc.setTextColor(0, 0, 0);

  /* ===========================
        FOOTER
     =========================== */

  doc.setDrawColor(220);

  doc.line(20, 275, 190, 275);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);

  doc.text(
    "This is a computer generated receipt. No signature is required.",
    20,
    283,
  );

  doc.setFont("helvetica", "bold");

  doc.text("Thank you for choosing Sentinel Pay.", 20, 290);

  doc.save(`Receipt_${payment.transactionId}.pdf`);
}
