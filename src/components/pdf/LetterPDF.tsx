import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import "./pdfFonts";
import { PdfBrandedFooter, PdfBrandedReportHeader, pdfBrandStyles as s } from "./pdfBrandKit";

/** خطاب مختصر أو مذكرة داخلية مع نفس ترويسة إطلالة. */
export const LetterPDF = ({ title, body }: { title: string; body: string }) => (
  <Document title={title} language="ar">
    <Page size="A4" style={s.page}>
      <PdfBrandedReportHeader titleEn="DOCUMENT" subtitleAr={title} />
      <View style={{ marginTop: 14 }}>
        <Text
          style={{
            fontSize: 10.5,
            lineHeight: 1.85,
            textAlign: "right",
          }}
        >
          {body}
        </Text>
      </View>
      <PdfBrandedFooter />
    </Page>
  </Document>
);
