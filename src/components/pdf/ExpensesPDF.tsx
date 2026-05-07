import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import dayjs from "dayjs";
import type { Client, Expense } from "@/types";
import { registerPdfFonts } from "./pdfFonts";
import { PdfMoneyText } from "./pdfBrandKit";

registerPdfFonts();

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", padding: 24, fontSize: 10 },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 10, textAlign: "right" },
  head: { flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 8 },
  row: { flexDirection: "row-reverse", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingVertical: 6 },
  c1: { width: "18%" },
  c2: { width: "30%" },
  c3: { width: "18%" },
  c4: { width: "16%", textAlign: "left" },
  c5: { width: "18%" },
  headerRow: { flexDirection: "row-reverse", backgroundColor: "#ef4444", color: "#fff", padding: 6 },
});

export const ExpensesPDF = ({ client, expenses }: { client: Client; expenses: Expense[] }) => {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>كشف المصروفات</Text>
        <View style={styles.head}>
          <Text>العميل: {client.name}</Text>
          <Text>{dayjs().format("DD/MM/YYYY")}</Text>
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.c1}>رقم</Text>
          <Text style={styles.c2}>الوصف</Text>
          <Text style={styles.c3}>الفئة</Text>
          <Text style={styles.c4}>المبلغ</Text>
          <Text style={styles.c5}>التاريخ</Text>
        </View>
        {expenses.map((e, i) => (
          <View key={e.id} style={styles.row}>
            <Text style={styles.c1}>{e.expenseNumber || `EXP-${String(i + 1).padStart(4, "0")}`}</Text>
            <Text style={styles.c2}>{e.description}</Text>
            <Text style={styles.c3}>{e.category}</Text>
            <PdfMoneyText amount={e.amount} containerStyle={styles.c4} />
            <Text style={styles.c5}>{dayjs(e.date).format("DD/MM/YYYY")}</Text>
          </View>
        ))}
        <View style={[styles.head, { marginTop: 10 }]}>
          <Text>الإجمالي</Text>
          <PdfMoneyText amount={total} />
        </View>
      </Page>
    </Document>
  );
};
