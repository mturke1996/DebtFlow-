import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  useTheme,
  IconButton,
  Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  People,
  Receipt,
  Payment,
  Brightness4,
  Brightness7,
  Logout,
  ChevronLeft,
  TrendingUp,
  CloudSync,
} from "@mui/icons-material";
import { BackupDialog } from "@/components/BackupDialog";
import { useDataStore } from "@/store/useDataStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { formatCurrency } from "@/utils/calculations";
import { useMemo, useEffect, useState } from "react";

export const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { payments, clients, expenses } = useDataStore();
  const { user, logout } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const [profitRecalcTrigger, setProfitRecalcTrigger] = useState(0);
  const [openBackup, setOpenBackup] = useState(false);

  // Listen for storage changes to update profit calculation
  useEffect(() => {
    const handleStorageChange = () => {
      // Force re-render by updating state
      setProfitRecalcTrigger((prev) => prev + 1);
    };
    window.addEventListener("storage", handleStorageChange);
    // Also listen for custom event for same-window updates
    window.addEventListener("profitPercentageUpdated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "profitPercentageUpdated",
        handleStorageChange
      );
    };
  }, []);

  const stats = useMemo(() => {
    const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);
    const clientsCount = clients.length;

    // Calculate profit for each client separately
    // Each client has their own percentage stored in database
    const totalProfit = clients.reduce((totalProfit, client) => {
      const clientPercentage = client.profitPercentage;
      if (
        !clientPercentage ||
        isNaN(clientPercentage) ||
        clientPercentage <= 0
      ) {
        return totalProfit;
      }

      // Get expenses for this client only
      const clientExpenses = expenses.filter(
        (exp) => exp.clientId === client.id
      );
      const clientTotalExpenses = clientExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
      const clientProfit = (clientTotalExpenses * clientPercentage) / 100;

      return totalProfit + clientProfit;
    }, 0);

    return { totalPaid, clientsCount, profit: totalProfit };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, clients, expenses, profitRecalcTrigger]);

  const menuItems = [
    {
      title: "العملاء",
      icon: People,
      path: "/clients",
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.2 : 0.12),
    },
    {
      title: "الفواتير",
      icon: Receipt,
      path: "/invoices",
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, theme.palette.mode === "dark" ? 0.22 : 0.12),
    },
    {
      title: "المدفوعات",
      icon: Payment,
      path: "/payments",
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, theme.palette.mode === "dark" ? 0.2 : 0.12),
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default", pb: 4 }}>
      <Box
        sx={{
          backgroundColor: alpha(
            theme.palette.primary.main,
            theme.palette.mode === "dark" ? 0.2 : 0.12
          ),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          pt: 'calc(24px + env(safe-area-inset-top))',
          pb: 4,
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          {/* Top Bar */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 45,
                    height: 45,
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                    color: "primary.main",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                  }}
                >
                  {user?.displayName?.charAt(0) ||
                    user?.email.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", fontSize: "0.8rem" }}
                  >
                    مرحباً
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "text.primary", fontWeight: 700, fontSize: "1rem" }}
                  >
                    {user?.displayName || user?.email.split("@")[0]}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <IconButton
                  onClick={toggleTheme}
                  sx={{
                    color: "text.primary",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.14) },
                    margin: "0 !important",
                  }}
                  size="small"
                >
                  {mode === "dark" ? (
                    <Brightness7 fontSize="small" />
                  ) : (
                    <Brightness4 fontSize="small" />
                  )}
                </IconButton>
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    color: "text.primary",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.14) },
                    margin: "0 !important",
                  }}
                  size="small"
                >
                  <Logout fontSize="small" />
                </IconButton>
              </Box>
            </Box>

          {/* Title */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: "text.primary",
                      fontWeight: 900,
                      mb: 0.5,
                      fontSize: { xs: "1.5rem", sm: "2rem" },
                      letterSpacing: "-0.02em",
                      textWrap: "balance",
                    }}
                  >
                    المهندس محمد التركي
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 500,
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      letterSpacing: 0.05,
                    }}
                  >
                    إدارة الديون والفواتير
                  </Typography>
          </Box>

          {/* Profit Card */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 4px 24px rgba(0,0,0,0.35)"
                  : "0 8px 32px rgba(28,25,23,0.06)",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            }}
          >
            <CardContent sx={{ py: 2.5 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "0.75rem", display: "block", mb: 0.5 }}
                  >
                    إجمالي النسبة المتفق عليها
                  </Typography>
                  <Typography variant="h5" fontWeight={900} color="text.primary">
                    {formatCurrency(stats.profit)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: "0.7rem",
                      mt: 0.5,
                      display: "block",
                    }}
                  >
                    من جميع العملاء
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2.5,
                    bgcolor: alpha(theme.palette.success.main, theme.palette.mode === "dark" ? 0.2 : 0.12),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUp sx={{ fontSize: 28, color: "success.main" }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ mt: -2 }}>
        {/* Menu Section */}
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 2, px: 0.5, mt: 3 }}
        >
          القوائم الرئيسية
        </Typography>

        <Stack spacing={1.5}>
          {menuItems.map((item, index) => (
            <Card
              key={index}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                cursor: "pointer",
                transition: "all 0.2s",
                border:
                  theme.palette.mode === "dark"
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "none",
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 2,
                        bgcolor: item.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0, // Prevent shrinking
                      }}
                    >
                      <item.icon sx={{ fontSize: 26, color: item.color }} />
                    </Box>
                    <Box>
                      <Typography variant="body1" fontWeight={700}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        اضغط للدخول
                      </Typography>
                    </Box>
                  </Box>
                  <ChevronLeft sx={{ color: "text.secondary" }} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Backup Section */}
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 2, px: 0.5, mt: 4 }}
        >
          النظام
        </Typography>

        <Card
          onClick={() => setOpenBackup(true)}
          sx={{
            borderRadius: 2.5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            cursor: "pointer",
            transition: "all 0.2s",
            border:
              theme.palette.mode === "dark"
                ? "1px solid rgba(255,255,255,0.1)"
                : "none",
            "&:active": {
              transform: "scale(0.98)",
            },
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.primary.main, 0.2)
                        : alpha(theme.palette.primary.main, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CloudSync sx={{ fontSize: 26, color: "primary.main" }} />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={700}>
                    النسخ الاحتياطي
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    حفظ واستعادة البيانات
                  </Typography>
                </Box>
              </Box>
              <ChevronLeft sx={{ color: "text.secondary" }} />
            </Box>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ textAlign: "center", mt: 4, opacity: 0.6 }}>
          <Typography variant="caption" color="text.secondary">
            المهندس محمد التركي © 2024
          </Typography>
        </Box>
      </Container>
      <BackupDialog open={openBackup} onClose={() => setOpenBackup(false)} />
    </Box>
  );
};
