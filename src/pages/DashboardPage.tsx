import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Stack,
  IconButton,
  useTheme,
  LinearProgress,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowBack,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Receipt,
  People,
  Warning,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useDataStore } from '@/store/useDataStore';
import { useThemeStore } from '@/store/useThemeStore';
import { calculateFinancialSummary, formatCurrency } from '@/utils/calculations';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

dayjs.locale('ar');

export const DashboardPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { clients, invoices, payments, debts } = useDataStore();
  const { mode, toggleTheme } = useThemeStore();

  const summary = useMemo(() => {
    return calculateFinancialSummary(invoices, payments, debts);
  }, [invoices, payments, debts]);

  const recentInvoices = invoices
    .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))
    .slice(0, 5);

  const topDebtors = useMemo(() => {
    const clientDebts = new Map<string, number>();
    
    debts.forEach((debt) => {
      const current = clientDebts.get(debt.clientId) || 0;
      clientDebts.set(debt.clientId, current + debt.remainingAmount);
    });

    return Array.from(clientDebts.entries())
      .map(([clientId, amount]) => ({
        client: clients.find((c) => c.id === clientId),
        amount,
      }))
      .filter((item) => item.client && item.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [clients, debts]);

  const kpis = [
    {
      label: 'إجمالي الديون',
      value: summary.totalDebt,
      icon: AccountBalance,
      fg: theme.palette.error.main,
      bg: alpha(theme.palette.error.main, theme.palette.mode === 'light' ? 0.1 : 0.18),
    },
    {
      label: 'المبالغ المحصلة',
      value: summary.totalPaid,
      icon: TrendingUp,
      fg: theme.palette.success.main,
      bg: alpha(theme.palette.success.main, theme.palette.mode === 'light' ? 0.1 : 0.18),
    },
    {
      label: 'المتبقي',
      value: summary.totalRemaining,
      icon: TrendingDown,
      fg: theme.palette.warning.main,
      bg: alpha(theme.palette.warning.main, theme.palette.mode === 'light' ? 0.1 : 0.18),
    },
    {
      label: 'المتأخرات',
      value: summary.overdueAmount,
      icon: Warning,
      fg: theme.palette.error.light,
      bg: alpha(theme.palette.error.main, theme.palette.mode === 'light' ? 0.08 : 0.15),
    },
  ];

  const quickStats = [
    { icon: People, label: 'عميل', value: clients.length, color: 'primary' as const },
    { icon: Receipt, label: 'فاتورة', value: invoices.length, color: 'success' as const },
    {
      icon: AccountBalance,
      label: 'دين نشط',
      value: debts.filter((d) => d.status !== 'paid').length,
      color: 'warning' as const,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.default',
        pb: 4,
      }}
    >
      <Box
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.1 : 0.22),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          pt: 'calc(16px + env(safe-area-inset-top))',
          pb: 3,
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => navigate('/')}
                sx={{ color: 'text.primary', marginLeft: '8px' }}
                aria-label="رجوع"
              >
                <ArrowBack />
              </IconButton>
              <Typography variant="h5" fontWeight={800} color="text.primary">
                لوحة التحكم
              </Typography>
            </Stack>
            <IconButton onClick={toggleTheme} sx={{ color: 'text.secondary' }}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ mt: -1 }}>
        {/* Stats */}
        <Stack
          direction="row"
          flexWrap="wrap"
          gap={2}
          sx={{ mb: 3, '& > *': { flexGrow: 1, minWidth: 'calc(50% - 8px)' } }}
        >
          {kpis.map((kpi) => {
            const KpiIcon = kpi.icon;
            return (
              <Card key={kpi.label} sx={{ borderRadius: 2.5, overflow: 'visible' }}>
                <CardContent sx={{ p: 2.25 }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                        {kpi.label}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        sx={{
                          fontFeatureSettings: '"tnum"',
                          fontVariantNumeric: 'tabular-nums',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {formatCurrency(kpi.value)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: kpi.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <KpiIcon sx={{ fontSize: 26, color: kpi.fg }} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>

        {/* Quick counts */}
        <Stack direction="row" gap={2} sx={{ mb: 4 }}>
          {quickStats.map((qs) => {
            const QsIcon = qs.icon;
            return (
              <Card key={qs.label} sx={{ flex: 1, borderRadius: 2.5, textAlign: 'center' }}>
                <CardContent sx={{ py: 2 }}>
                  <QsIcon sx={{ fontSize: 28, mb: 1, color: `${qs.color}.main` }} />
                  <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                    {qs.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {qs.label}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Stack>

        {/* Top Debtors */}
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, px: 0.5 }}>
          أكبر المدينين
        </Typography>
        <Card sx={{ mb: 5, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              {topDebtors.length > 0 ? (
                topDebtors.map((item, index) => (
                  <Box key={index}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {item.client?.name}
                      </Typography>
                      <Typography variant="body2" color="error.main" fontWeight={800}>
                        {formatCurrency(item.amount)}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(item.amount / summary.totalRemaining) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'error.main',
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  لا توجد ديون نشطة
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, px: 0.5 }}>
          آخر الفواتير
        </Typography>
        <Stack spacing={3.5}>
          {recentInvoices.length > 0 ? (
            recentInvoices.map((invoice) => {
              const client = clients.find((c) => c.id === invoice.clientId);
              return (
                <Card
                  key={invoice.id}
                  sx={{
                    borderRadius: 2.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body1" fontWeight={700}>
                          {invoice.invoiceNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {client?.name} • {dayjs(invoice.issueDate).format('DD/MM/YYYY')}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="h6" fontWeight={800} color="primary.main">
                          {formatCurrency(invoice.total)}
                        </Typography>
                        <Chip
                          label={
                            invoice.status === 'paid'
                              ? 'مدفوعة'
                              : invoice.status === 'overdue'
                              ? 'متأخرة'
                              : 'نشطة'
                          }
                          size="small"
                          color={
                            invoice.status === 'paid'
                              ? 'success'
                              : invoice.status === 'overdue'
                              ? 'error'
                              : 'default'
                          }
                          sx={{ height: 22, fontSize: '0.7rem' }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card sx={{ borderRadius: 2.5, textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                لا توجد فواتير بعد
              </Typography>
            </Card>
          )}
        </Stack>
      </Container>
    </Box>
  );
};
