import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import dayjs from "dayjs";
import type { Client, Payment } from "@/types";
import { registerPdfFonts } from "./pdfFonts";
import { PdfMoneyText } from "./pdfBrandKit";

registerPdfFonts();

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", padding: 24, fontSize: 10 },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 10, textAlign: "right" },
  head: { flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 8 },
  row: { flexDirection: "row-reverse", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingVertical: 6 },
  c1: { width: "12%" },
  c2: { width: "22%" },
  c3: { width: "24%" },
  c4: { width: "16%", textAlign: "left" },
  c5: { width: "26%" },
  headerRow: { flexDirection: "row-reverse", backgroundColor: "#10b981", color: "#fff", padding: 6 },
});

const methodLabel = (m: Payment["paymentMethod"]) => {
  if (m === "cash") return "نقدي";
  if (m === "bank_transfer") return "تحويل بنكي";
  if (m === "check") return "شيك";
  if (m === "credit_card") return "بطاقة";
  return m;
};

export const PaymentsPDF = ({ client, payments }: { client: Client; payments: Payment[] }) => {
  const total = payments.reduce((s, p) => s + p.amount, 0);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>كشف المدفوعات</Text>
        <View style={styles.head}>
          <Text>العميل: {client.name}</Text>
          <Text>{dayjs().format("DD/MM/YYYY")}</Text>
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.c1}>#</Text>
          <Text style={styles.c2}>الطريقة</Text>
          <Text style={styles.c3}>ملاحظات</Text>
          <Text style={styles.c4}>المبلغ</Text>
          <Text style={styles.c5}>التاريخ</Text>
        </View>
        {payments.map((p, i) => (
          <View key={p.id} style={styles.row}>
            <Text style={styles.c1}>{i + 1}</Text>
            <Text style={styles.c2}>{methodLabel(p.paymentMethod)}</Text>
            <Text style={styles.c3}>{p.notes || "-"}</Text>
            <PdfMoneyText amount={p.amount} containerStyle={styles.c4} />
            <Text style={styles.c5}>{dayjs(p.paymentDate).format("DD/MM/YYYY")}</Text>
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
