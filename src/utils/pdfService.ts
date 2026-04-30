import { pdf } from "@react-pdf/renderer";
import React from "react";
import toast from "react-hot-toast";

export const generatePdfBlob = async (document: React.ReactElement): Promise<Blob> => {
  const asPdf = pdf();
  asPdf.updateContainer(document);
  const blob = await asPdf.toBlob();
  return blob;
};

export const downloadPdf = async (document: React.ReactElement, filename: string) => {
  const toastId = toast.loading("جاري إنشاء ملف PDF...");
  try {
    const blob = await generatePdfBlob(document);
    const url = URL.createObjectURL(blob);

    const tab = window.open(url, "_blank");
    if (!tab) {
      window.location.href = url;
    }

    setTimeout(() => URL.revokeObjectURL(url), 120000);
    toast.success("تم فتح ملف PDF", { id: toastId });
  } catch (error) {
    toast.error("فشل إنشاء ملف PDF", { id: toastId });
    throw error;
  }
};

export const sharePdf = async (document: React.ReactElement, filename: string) => {
  const toastId = toast.loading("جاري تجهيز الملف للمشاركة...");
  try {
    const blob = await generatePdfBlob(document);
    const file = new File([blob], filename, { type: "application/pdf" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: filename.replace(".pdf", ""),
        files: [file],
      });
      toast.success("تمت المشاركة", { id: toastId });
      return;
    }

    toast.dismiss(toastId);
    await downloadPdf(document, filename);
  } catch (error) {
    toast.error("فشل تجهيز ملف المشاركة", { id: toastId });
    throw error;
  }
};
