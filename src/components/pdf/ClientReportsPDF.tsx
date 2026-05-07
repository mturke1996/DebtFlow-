import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import dayjs from "dayjs";
import type { Client, Expense, Payment } from "@/types";
import { registerPdfFonts } from "./pdfFonts";
import { PdfMoneyText } from "./pdfBrandKit";

registerPdfFonts();

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 24,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 10, textAlign: "right" },
  block: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 10,
    marginBottom: 10,
  },
  row: { flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 4 },
  tableHeader: {
    flexDirection: "row-reverse",
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
    padding: 6,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    padding: 6,
    backgroundColor: "#ffffff",
  },
  c1: { width: "16%" },
  c2: { width: "28%" },
  c3: { width: "18%" },
  c4: { width: "16%", textAlign: "left" },
  c5: { width: "22%" },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginBottom: 6, marginTop: 4, textAlign: "right" },
  bold: { fontWeight: 700 },
});

interface Props {
  client: Client;
  expenses: Expense[];
  payments: Payment[];
  profitPercentage: number;
}

export const ClientReportsPDF = ({ client, expenses, payments, profitPercentage }: Props) => {
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);
  const profit = (totalExpenses * (profitPercentage || 0)) / 100;
  const totalDue = totalExpenses + profit;
  const remaining = Math.max(totalDue - totalPaid, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>التقرير النهائي للعميل</Text>

        <View style={styles.block}>
          <View style={styles.row}>
            <Text>العميل: {client.name}</Text>
            <Text>التاريخ: {dayjs().format("DD/MM/YYYY")}</Text>
          </View>
          <View style={styles.row}>
            <Text>الهاتف: {client.phone || "-"}</Text>
            <Text>النسبة المتفق عليها: {profitPercentage || 0}%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>ملخص مالي</Text>
        <View style={styles.block}>
          <View style={styles.row}>
            <Text>إجمالي المصروفات</Text>
            <PdfMoneyText amount={totalExpenses} style={styles.bold} />
          </View>
          <View style={styles.row}>
            <Text>قيمة النسبة المتفق عليها</Text>
            <PdfMoneyText amount={profit} style={styles.bold} />
          </View>
          <View style={styles.row}>
            <Text>المدفوع</Text>
            <PdfMoneyText amount={totalPaid} style={styles.bold} />
          </View>
          <View style={styles.row}>
            <Text>المتبقي المستحق</Text>
            <PdfMoneyText amount={remaining} style={styles.bold} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>جدول المصروفات ({expenses.length})</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.c1}>رقم</Text>
          <Text style={styles.c2}>الوصف</Text>
          <Text style={styles.c3}>الفئة</Text>
          <Text style={styles.c4}>المبلغ</Text>
          <Text style={styles.c5}>التاريخ</Text>
        </View>
        {expenses.map((exp, idx) => (
          <View key={exp.id} style={styles.tableRow}>
            <Text style={styles.c1}>{exp.expenseNumber || `EXP-${String(idx + 1).padStart(4, "0")}`}</Text>
            <Text style={styles.c2}>{exp.description}</Text>
            <Text style={styles.c3}>{exp.category}</Text>
            <PdfMoneyText amount={exp.amount} containerStyle={styles.c4} />
            <Text style={styles.c5}>{dayjs(exp.date).format("DD/MM/YYYY")}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>جدول المدفوعات ({payments.length})</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.c1}>#</Text>
          <Text style={styles.c2}>طريقة الدفع</Text>
          <Text style={styles.c3}>ملاحظات</Text>
          <Text style={styles.c4}>المبلغ</Text>
          <Text style={styles.c5}>التاريخ</Text>
        </View>
        {payments.map((pay, idx) => (
          <View key={pay.id} style={styles.tableRow}>
            <Text style={styles.c1}>{idx + 1}</Text>
            <Text style={styles.c2}>{pay.paymentMethod}</Text>
            <Text style={styles.c3}>{pay.notes || "-"}</Text>
            <PdfMoneyText amount={pay.amount} containerStyle={styles.c4} />
            <Text style={styles.c5}>{dayjs(pay.paymentDate).format("DD/MM/YYYY")}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};
