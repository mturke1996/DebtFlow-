import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import dayjs from "dayjs";
import type { Client, Invoice } from "@/types";
import { registerPdfFonts } from "./pdfFonts";
import { PdfMoneyText } from "./pdfBrandKit";

registerPdfFonts();

const styles = StyleSheet.create({
  page: { fontFamily: "Cairo", padding: 24, direction: "rtl", fontSize: 10 },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 10, textAlign: "right" },
  row: { flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 6 },
});

export const InvoicePDF = ({ invoice, client }: { invoice: Invoice; client: Client }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>فاتورة {invoice.invoiceNumber}</Text>
      <View style={styles.row}>
        <Text>العميل: {client.name}</Text>
        <Text>التاريخ: {dayjs(invoice.issueDate).format("DD/MM/YYYY")}</Text>
      </View>
      {invoice.items.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text>{item.description}</Text>
          <PdfMoneyText amount={item.total} />
        </View>
      ))}
      <View style={styles.row}>
        <Text>الإجمالي</Text>
        <PdfMoneyText amount={invoice.total} />
      </View>
    </Page>
  </Document>
);
