import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Stack,
  useTheme,
  Divider,
  Avatar,
  Snackbar,
  Alert,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add,
  Search,
  Edit,
  Delete,
  ArrowBack,
  Payment as PaymentIcon,
  WhatsApp,
} from '@mui/icons-material';
import { useDataStore } from '@/store/useDataStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Payment } from '@/types';
import { formatCurrency } from '@/utils/calculations';
import { sharePdfToWhatsApp } from '@/utils/pdfService';
import { PaymentsSummaryStyledPDF } from '@/components/pdf/StyledPDFs';
import dayjs from 'dayjs';

const paymentSchema = z.object({
  clientId: z.string().min(1, 'يجب اختيار عميل'),
  invoiceId: z.string().optional(),
  amount: z.number().min(0.01, 'المبلغ يجب أن يكون أكبر من 0'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'check', 'credit_card']),
  paymentDate: z.string(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export const PaymentsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { clients, invoices, payments, addPayment, updatePayment, deletePayment } = useDataStore();
  
  const handleShareTotal = () => {
    sharePdfToWhatsApp(
      <PaymentsSummaryStyledPDF payments={payments} clients={clients} />,
      'payments-summary.pdf',
      {
        title: 'تقرير المدفوعات',
        text: 'تقرير المدفوعات بصيغة PDF جاهز للمراجعة.',
      }
    );
  };
  
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      clientId: '',
      invoiceId: '',
      amount: 0,
      paymentMethod: 'cash',
      paymentDate: dayjs().format('YYYY-MM-DD'),
      notes: '',
    },
  });

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const invoice = payment.invoiceId ? invoices.find((i) => i.id === payment.invoiceId) : null;
      const client = clients.find((c) => c.id === payment.clientId);
      const matchesSearch =
        invoice?.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery === '';
      const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
      return matchesSearch && matchesMethod;
    });
  }, [payments, invoices, clients, searchQuery, methodFilter]);

  const handleOpenDialog = (payment?: Payment) => {
    if (payment) {
      setEditingPayment(payment);
      reset({
        clientId: payment.clientId,
        invoiceId: payment.invoiceId || '',
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentDate: dayjs(payment.paymentDate).format('YYYY-MM-DD'),
        notes: payment.notes || '',
      });
    } else {
      setEditingPayment(null);
      reset({
        clientId: '',
        invoiceId: '',
        amount: 0,
        paymentMethod: 'cash',
        paymentDate: dayjs().format('YYYY-MM-DD'),
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPayment(null);
    reset();
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const client = clients.find((c) => c.id === data.clientId);
      if (!client) return;

      if (editingPayment) {
        await updatePayment(editingPayment.id, {
          clientId: data.clientId || '',
          invoiceId: data.invoiceId || '',
          amount: data.amount,
          paymentMethod: data.paymentMethod || 'cash',
          paymentDate: data.paymentDate || dayjs().format('YYYY-MM-DD'),
          notes: data.notes || '',
        });
        setEditingPayment(null);
        setSnackbarMessage("تم التعديل بنجاح");
      } else {
        const newPayment: Payment = {
          id: crypto.randomUUID(),
          invoiceId: data.invoiceId || '',
          clientId: data.clientId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          paymentDate: data.paymentDate,
          notes: data.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addPayment(newPayment);
        setSnackbarMessage("تمت الإضافة بنجاح");
      }
      handleCloseDialog();
      setSnackbarOpen(true);
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || "حدث خطأ أثناء الحفظ";
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الدفعة؟')) {
      await deletePayment(id);
    }
  };

  const getPaymentMethodLabel = (method: Payment['paymentMethod']) => {
    switch (method) {
      case 'cash':
        return 'نقدي';
      case 'bank_transfer':
        return 'تحويل بنكي';
      case 'check':
        return 'شيك';
      case 'credit_card':
        return 'بطاقة ائتمان';
      default:
        return method;
    }
  };

  const totalPayments = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', pb: 3 }}>
      <Box
        sx={{
          backgroundColor: alpha(theme.palette.success.main, theme.palette.mode === 'light' ? 0.11 : 0.2),
          borderBottom: `1px solid ${alpha(theme.palette.success.main, 0.25)}`,
          pt: 'calc(16px + env(safe-area-inset-top))',
          pb: 3,
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ mb: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={2}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <IconButton onClick={() => navigate('/')} sx={{ color: 'text.primary', ml: 1 }} aria-label="رجوع">
                  <ArrowBack />
                </IconButton>
                <Typography variant="h5" fontWeight={800} sx={{ color: 'text.primary', flexGrow: 1 }}>
                  المدفوعات ({payments.length})
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                {payments.length > 0 && (
                  <Button
                    variant="outlined"
                    onClick={handleShareTotal}
                    fullWidth={true}
                    sx={{
                      borderColor: alpha(theme.palette.success.dark, 0.45),
                      color: 'success.dark',
                      fontWeight: 700,
                      '&:hover': { borderColor: 'success.main', bgcolor: alpha(theme.palette.success.main, 0.08) },
                      borderRadius: 2,
                      flex: 1,
                    }}
                    startIcon={<WhatsApp />}
                  >
                    واتساب PDF
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleOpenDialog()}
                  fullWidth={true}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    flex: 1,
                    boxShadow: 'none',
                  }}
                  startIcon={<Add />}
                >
                  جديدة
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* Stats Card */}
          <Card
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2.5,
              border: `1px solid ${alpha(theme.palette.success.main, 0.22)}`,
              boxShadow: theme.palette.mode === 'light'
                ? `0 2px 12px ${alpha('#1c1917', 0.06)}`
                : `0 4px 24px ${alpha('#000', 0.35)}`,
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    إجمالي المدفوعات
                  </Typography>
                  <Typography variant="h5" fontWeight={900} color="text.primary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(totalPayments)}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.18),
                    width: { xs: 40, sm: 50 },
                    height: { xs: 40, sm: 50 },
                    flexShrink: 0,
                    marginLeft: { xs: '16px', sm: '24px' },
                  }}
                >
                  <PaymentIcon sx={{ fontSize: 28, color: 'success.dark' }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>

          {/* Search & Filter */}
          <Stack spacing={2} sx={{ mt: 2.5 }}>
            <TextField
              fullWidth
              placeholder="ابحث عن دفعة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  borderRadius: 2,
                  '& fieldset': { border: 'none' },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth size="small">
              <Select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                sx={{
                  bgcolor: 'white',
                  borderRadius: 2,
                  '& fieldset': { border: 'none' },
                }}
              >
                <MenuItem value="all">كل طرق الدفع</MenuItem>
                <MenuItem value="cash">💵 نقدي</MenuItem>
                <MenuItem value="bank_transfer">🏦 تحويل بنكي</MenuItem>
                <MenuItem value="check">📝 شيك</MenuItem>
                <MenuItem value="credit_card">💳 بطاقة ائتمان</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Container>
      </Box>

      {/* Payments List */}
      <Container maxWidth="sm" sx={{ mt: -2 }}>
        <Stack spacing={3.5}>
          {filteredPayments.length === 0 ? (
            <Card sx={{ borderRadius: 2.5, textAlign: 'center', py: 6, bgcolor: 'background.paper' }}>
              <PaymentIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                لا توجد مدفوعات
              </Typography>
              <Button
                variant="contained"
                color="success"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                إضافة أول دفعة
              </Button>
            </Card>
          ) : (
            filteredPayments.map((payment) => {
              const invoice = invoices.find((i) => i.id === payment.invoiceId);
              const client = clients.find((c) => c.id === payment.clientId);
              
              return (
                <Card
                  key={payment.id}
                  sx={{
                    borderRadius: 2.5,
                    boxShadow: theme.palette.mode === 'light'
                      ? '0 2px 8px rgba(0,0,0,0.06)'
                      : '0 2px 8px rgba(0,0,0,0.3)',
                    bgcolor: 'background.paper',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack direction="row" alignItems="flex-start" spacing={0}>
                      <Avatar
                        sx={{
                          bgcolor: 'success.light',
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          flexShrink: 0,
                          marginLeft: { xs: '12px', sm: '24px' },
                        }}
                      >
                        <PaymentIcon sx={{ color: 'success.main', fontSize: 20 }} />
                      </Avatar>
                      
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
                          <Typography variant="body2" fontWeight={700} noWrap>
                            {client?.name}
                          </Typography>
                          <Chip
                            label={getPaymentMethodLabel(payment.paymentMethod)}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        </Stack>
                        
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                          {payment.invoiceId && invoice ? `${invoice.invoiceNumber} • ` : ''}{dayjs(payment.paymentDate).format('DD/MM/YYYY')}
                        </Typography>

                        <Typography 
                          variant="h6" 
                          fontWeight={800}
                          color="success.main"
                        >
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(payment)}
                          sx={{ 
                            color: 'primary.main',
                            width: 32,
                            height: 32,
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(payment.id)}
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'rgba(211, 47, 47, 0.1)',
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    {payment.notes && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          fontStyle: "italic",
                          lineHeight: 1.6,
                          px: 1,
                          py: 0.5,
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.05)"
                              : "rgba(0,0,0,0.03)",
                          borderRadius: 1,
                          borderRight: `2px solid ${theme.palette.success.main}`,
                        }}
                      >
                        💬 {payment.notes}
                        </Typography>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </Stack>
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#fff',
          },
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              bgcolor: theme.palette.success.main,
              color: theme.palette.success.contrastText,
              p: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton onClick={handleCloseDialog} sx={{ color: 'inherit' }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" fontWeight={700}>
                {editingPayment ? 'تعديل دفعة' : 'إضافة دفعة جديدة'}
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ p: 3.5 }}>
            <Stack spacing={3}>
              <Controller
                name="clientId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.clientId}>
                    <InputLabel>العميل</InputLabel>
                    <Select {...field} label="العميل" sx={{ borderRadius: 2 }}>
                      {clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.name} - {client.phone}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="invoiceId"
                control={control}
                render={({ field }) => {
                  const selectedClientId = watch('clientId');
                  const clientInvoices = selectedClientId
                    ? invoices.filter(
                        (inv) => inv.clientId === selectedClientId && inv.status !== 'paid'
                      )
                    : [];
                  
                  return (
                    <FormControl fullWidth disabled={!selectedClientId}>
                      <InputLabel>الفاتورة (اختياري)</InputLabel>
                      <Select 
                        {...field} 
                        value={field.value || ''}
                        label="الفاتورة (اختياري)" 
                        sx={{ borderRadius: 2 }}
                        onChange={(e) => field.onChange(e.target.value || undefined)}
                      >
                        <MenuItem value="">بدون فاتورة</MenuItem>
                        {clientInvoices.map((invoice) => (
                          <MenuItem key={invoice.id} value={invoice.id}>
                            {invoice.invoiceNumber} - {formatCurrency(invoice.total)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                }}
              />

              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="المبلغ"
                    type="number"
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />

              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>طريقة الدفع</InputLabel>
                    <Select {...field} label="طريقة الدفع" sx={{ borderRadius: 2 }}>
                      <MenuItem value="cash">💵 نقدي</MenuItem>
                      <MenuItem value="bank_transfer">🏦 تحويل بنكي</MenuItem>
                      <MenuItem value="check">📝 شيك</MenuItem>
                      <MenuItem value="credit_card">💳 بطاقة ائتمان</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="paymentDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="تاريخ الدفع"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="ملاحظات"
                    multiline
                    rows={3}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                )}
              />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 5 }}>
              <Button
                onClick={handleCloseDialog}
                fullWidth
                size="large"
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="success"
                fullWidth
                size="large"
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                {editingPayment ? 'حفظ' : 'إضافة'}
              </Button>
            </Stack>
          </Box>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarMessage.includes('خطأ') ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

