const PdfPrinter = require("pdfmake");
const fs = require("fs");
const fonts = require("./fonts");

const printer = new PdfPrinter(fonts);

function generatePayslip(data, filePath) {
  const docDefinition = {
    content: [
      // Header
      {
        columns: [
          { text: "A2Z FINSERVE INSURANCE MARKETING LLP", style: "header" },
          {
            image: data.logo, // base64 logo if available
            width: 80,
            alignment: "right",
          },
        ],
      },
      {
        text: "ASO 303, Astra Tower, 3rd Floor, Newtown, pin 700161",
        fontSize: 10,
        margin: [0, 0, 0, 10],
      },

      { text: `Pay Slip for ${data.month} ${data.year}`, style: "subheader" },

      // Employee Details
      {
        style: "table",
        table: {
          widths: ["*", "*"],
          body: [
            [
              { text: `Name: ${data.employee.name}`, bold: true },
              { text: `Phone Number: ${data.employee.phone}` },
            ],
            [
              { text: `Salary Amount: ₹${data.employee.salary}/Month` },
              { text: `Branch: ${data.employee.branch}` },
            ],
            [
              { text: `Bank Name: ${data.employee.bank}` },
              { text: `Account No: ${data.employee.account}` },
            ],
          ],
        },
        margin: [0, 10, 0, 20],
      },

      // Salary Calculations
      { text: "Salary Calculations", style: "subheader" },
      {
        style: "table",
        table: {
          widths: ["*", "auto", "*", "auto"],
          body: [
            [
              { text: "EARNINGS", bold: true },
              { text: "AMOUNT", bold: true },
              { text: "DEDUCTIONS", bold: true },
              { text: "AMOUNT", bold: true },
            ],
            ...data.salary.map((s) => [
              s.earning,
              `₹${s.amount}`,
              s.deduction || "",
              s.deductionAmount || "",
            ]),
            [
              { text: "Total Earnings", bold: true },
              `₹${data.totalEarnings}`,
              { text: "Total Deductions", bold: true },
              `₹${data.totalDeductions}`,
            ],
          ],
        },
        margin: [0, 10, 0, 20],
      },

      // Net Salary
      {
        style: "table",
        table: {
          widths: ["*", "*"],
          body: [
            ["Net Salary", `₹${data.netSalary}`],
            ["Paid Amount", `₹${data.paidAmount}`],
            ["Pending Salary", `₹${data.pendingSalary}`],
          ],
        },
        margin: [0, 10, 0, 20],
      },

      // Attendance Summary
      { text: "Attendance Summary", style: "subheader" },
      {
        style: "table",
        table: {
          widths: ["*", "*", "*", "*", "*", "*"],
          body: [
            [
              "Present",
              "Absent",
              "Half Days",
              "Paid Leaves",
              "Unpaid Leaves",
              "Overtime",
            ],
            [
              data.attendance.present,
              data.attendance.absent,
              data.attendance.halfDays,
              data.attendance.paidLeaves,
              data.attendance.unpaidLeaves,
              data.attendance.overtime,
            ],
          ],
        },
        margin: [0, 10, 0, 20],
      },

      {
        text: `Report date: ${new Date().toLocaleString()}`,
        fontSize: 8,
        alignment: "right",
      },
    ],
    styles: {
      header: { fontSize: 14, bold: true },
      subheader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
      table: { fontSize: 10, margin: [0, 5, 0, 15] },
    },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(fs.createWriteStream(filePath));
  pdfDoc.end();
}

module.exports = generatePayslip;
