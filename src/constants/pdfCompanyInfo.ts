/**
 * هوية المكتب لكل ملفات PDF — يُعدَّل من هنا فقط.
 */
export const PDF_COMPANY_INFO = {
  brandName: "المهندس محمد التركي",
  fullName: "المهندس محمد التركي",
  engineerName: "Eng. Mohamed El-Turki",
  taglineEn: "Engineering Office",

  /** سطر/سطران للعنوان */
  addressLines: ["تاجوراء", "طرابلس — ليبيا"],
  addressSingle: "تاجوراء، طرابلس، ليبيا",

  phones: ["0913041404"] as string[],
  email: "" as string,
  website: "" as string,

  /** خدمات تظهر في شريط الترويسة */
  services: [
    "إدارة المشاريع والمتابعة الميدانية",
    "حسابات المصروفات والدفعات والديون",
    "إعداد الفواتير والمستخلصات الرسمية",
    "تقارير شاملة لكل عميل بدقّة",
  ],

  footerNote: "وثيقة رسمية — يُعتد بالنسخ المطبوعة الموثّقة فقط.",
} as const;

/** للقوالب القديمة (HTML print). */
export const PRINT_COMPANY_INFO = {
  name: PDF_COMPANY_INFO.fullName,
  subtitle: PDF_COMPANY_INFO.engineerName,
  address: PDF_COMPANY_INFO.addressSingle,
  phone: PDF_COMPANY_INFO.phones.join(" — "),
  email: PDF_COMPANY_INFO.email,
  taxNumber: "",
};
