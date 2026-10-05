import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { ArrowOutward, WhatsApp } from "@mui/icons-material";

const contactMessage = encodeURIComponent(
  "مرحباً، أود التواصل مع مطوّر موقع DebtFlow Pro.",
);

function MaintenanceMark() {
  return (
    <svg
      aria-hidden="true"
      className="closed-mark"
      viewBox="0 0 240 190"
      fill="none"
    >
      <path
        d="M25 152.5h190M42 152.5V89.8L120 43l78 46.8v62.7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M59 152.5V99l61-37 61 37v53.5" stroke="currentColor" strokeWidth="1.5" opacity=".36" />
      <path d="M91 152.5v-40a29 29 0 0 1 58 0v40" stroke="currentColor" strokeWidth="2" />
      <path d="M108 152.5v-37a12 12 0 0 1 24 0v37" stroke="currentColor" strokeWidth="2" />
      <path d="M35 81.5 120 30l85 51.5" stroke="#b89c5f" strokeWidth="2" strokeLinecap="round" />
      <circle cx="120" cy="113" r="39" fill="#f8f7f3" stroke="#d7d2c7" strokeWidth="1.5" />
      <path
        d="M131.6 95.8a15.6 15.6 0 0 0-22 22l18.4 18.4a15.6 15.6 0 0 0 22-22l-3.6-3.6"
        stroke="#0f766e"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="m106 137 28-28" stroke="#b89c5f" strokeWidth="5" strokeLinecap="round" />
      <circle cx="42" cy="55" r="3" fill="#b89c5f" />
      <circle cx="198" cy="54" r="2" fill="#0f766e" opacity=".55" />
      <path d="M120 18v-7m-82 56-6-3m164 0 6-3" stroke="#b89c5f" strokeWidth="1.5" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export function SiteClosedPage() {
  return (
    <Box component="main" className="site-closed" dir="rtl">
      <Container maxWidth="sm" className="site-closed__container">
        <Stack className="site-closed__content" alignItems="center" spacing={0}>
          <Box className="site-closed__brand" aria-label="DebtFlow Pro">
            <img src="/logo.png" alt="" />
            <span>DebtFlow <b>Pro</b></span>
          </Box>

          <Box className="site-closed__art" aria-hidden="true">
            <span className="site-closed__art-ring" />
            <MaintenanceMark />
          </Box>

          <Box className="site-closed__status">
            <span className="site-closed__status-dot" />
            الموقع غير متاح حالياً
          </Box>

          <Typography component="h1" className="site-closed__title">
            تم إغلاق هذا الموقع
          </Typography>
          <Typography component="p" className="site-closed__description">
            نعتذر، تم إيقاف الموقع حالياً. إذا كنت بحاجة إلى المساعدة أو ترغب في
            الاستفسار، يرجى التواصل مع مطوّر الموقع.
          </Typography>

          <Button
            className="site-closed__contact"
            component="a"
            href={`https://wa.me/?text=${contactMessage}`}
            target="_blank"
            rel="noreferrer"
            variant="contained"
            startIcon={<WhatsApp />}
            endIcon={<ArrowOutward />}
          >
            تواصل مع المطوّر عبر واتساب
          </Button>

          <Box className="site-closed__divider" />
          <Typography component="p" className="site-closed__footnote">
            شكراً لتفهمكم
          </Typography>
          <Typography component="p" className="site-closed__signature">
            DebtFlow Pro <span>·</span> لإدارة الحسابات والديون
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
