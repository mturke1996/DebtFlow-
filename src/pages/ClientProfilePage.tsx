import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Container,
  Avatar,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  useTheme,
  Snackbar,
  InputAdornment,
  Alert,
  Paper,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import {
  ArrowBack,
  Payment,
  Business,
  Person,
  Store,
  ChevronLeft,
  Phone,
  Add,
  TrendingDown,
  TrendingUp,
  Edit,
  Delete,
  CreditCard,
  PictureAsPdf,
  Search,
  Assessment,
  Engineering,
  ChatBubbleOutline,
} from "@mui/icons-material";
import { useDataStore } from "@/store/useDataStore";
import { useForm, Controller } from "react-hook-form";
import { formatCurrency } from "@/utils/calculations";
import { ClientFinalStyledPDF, ExpensesStyledPDF, PaymentsStyledPDF } from "@/components/pdf/StyledPDFs";
import { downloadPdf } from "@/utils/pdfService";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import type {
  Payment as PaymentType,
  Expense,
  StandaloneDebt,
  DebtParty,
  Worker,
} from "@/types";

dayjs.locale("ar");

/** Emil-style ease: responsive deceleration, no mushy default ease-in-out */
const EASE_OUT = [0.32, 0.72, 0, 1] as const;

function ProfileSectionHeading({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Box sx={{ px: 0.5, mb: 3 }}>
      <Typography
        variant="overline"
        sx={{
          letterSpacing: "0.22em",
          color: "text.secondary",
          fontWeight: 600,
          fontSize: "0.68rem",
          display: "block",
          mb: 0.75,
        }}
      >
        {kicker}
      </Typography>
      <Typography
        variant="h5"
        fontWeight={800}
        sx={{ letterSpacing: "-0.03em", lineHeight: 1.25, mb: subtitle ? 0.5 : 0 }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: "42ch", lineHeight: 1.6 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

type MenuTone = "error" | "success" | "warning" | "secondary" | "info";

function menuToneSurface(theme: Theme, tone: MenuTone) {
  const m = theme.palette[tone].main;
  return {
    accent: m,
    soft: alpha(m, theme.palette.mode === "light" ? 0.12 : 0.2),
    ring: alpha(m, theme.palette.mode === "light" ? 0.22 : 0.35),
  };
}

const clientSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(10, "رقم الهاتف غير صحيح"),
  address: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل"),
  type: z.enum(["company", "individual"]),
});

type ClientFormData = z.infer<typeof clientSchema>;

export const ClientProfilePage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    clients,
    payments,
    expenses,
    standaloneDebts,
    invoices,
    debtParties,
    workers,
    addPayment,
    updatePayment,
    deletePayment,
    addExpense,
    updateExpense,
    deleteExpense,
    addStandaloneDebt,
    updateStandaloneDebt,
    deleteStandaloneDebt,
    addDebtParty,
    updateDebtParty,
    updateClient,
    addWorker,
    updateWorker,
    deleteWorker,
  } = useDataStore();

  // Menu items for quick navigation
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [debtDialogOpen, setDebtDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingDebt, setEditingDebt] = useState<StandaloneDebt | null>(null);
  const [expensesListDialogOpen, setExpensesListDialogOpen] = useState(false);
  const [paymentsListDialogOpen, setPaymentsListDialogOpen] = useState(false);
  const [debtsListDialogOpen, setDebtsListDialogOpen] = useState(false);
  const [workersListDialogOpen, setWorkersListDialogOpen] = useState(false);
  const [workerDialogOpen, setWorkerDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentType | null>(
    null
  );
  const [payDebtDialogOpen, setPayDebtDialogOpen] = useState(false);
  const [selectedDebtForPay, setSelectedDebtForPay] =
    useState<StandaloneDebt | null>(null);
  const [payDebtAmount, setPayDebtAmount] = useState<string>("");
  const [partyProfileDialogOpen, setPartyProfileDialogOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<DebtParty | null>(null);
  const [partyDialogOpen, setPartyDialogOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<DebtParty | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [profitDialogOpen, setProfitDialogOpen] = useState(false);
  const [profitPercentage, setProfitPercentage] = useState<string>("");
  const [expensesSearchQuery, setExpensesSearchQuery] = useState("");
  const [paymentsSearchQuery, setPaymentsSearchQuery] = useState("");
  const [debtsSearchQuery, setDebtsSearchQuery] = useState("");
  const [workersSearchQuery, setWorkersSearchQuery] = useState("");
  const [editClientDialogOpen, setEditClientDialogOpen] = useState(false);
  const [workerForm, setWorkerForm] = useState({
    fullName: "",
    phone: "",
    role: "",
    dailyRate: "",
    notes: "",
    isActive: true,
  });

  const client = clients.find((c) => c.id === clientId);

  const menuItems = useMemo(
    () => [
      {
        title: "المصروفات",
        subtitle: "تسجيل ومتابعة الصرف",
        Icon: TrendingDown,
        tone: "error" as MenuTone,
        onClick: () => setExpensesListDialogOpen(true),
      },
      {
        title: "المدفوعات",
        subtitle: "دفعات مرتبطة بالعميل",
        Icon: Payment,
        tone: "success" as MenuTone,
        onClick: () => setPaymentsListDialogOpen(true),
      },
      {
        title: "الديون",
        subtitle: "ديون مستقلة وأقساط",
        Icon: CreditCard,
        tone: "warning" as MenuTone,
        onClick: () => setDebtsListDialogOpen(true),
      },
      {
        title: "النسبة المتفق عليها",
        subtitle: "نسبة من المصروفات",
        Icon: TrendingUp,
        tone: "secondary" as MenuTone,
        onClick: () => setProfitDialogOpen(true),
      },
      {
        title: "العمال",
        subtitle: "فريق العمل والأجور",
        Icon: Engineering,
        tone: "info" as MenuTone,
        onClick: () => setWorkersListDialogOpen(true),
      },
    ],
    [
      setExpensesListDialogOpen,
      setPaymentsListDialogOpen,
      setDebtsListDialogOpen,
      setProfitDialogOpen,
      setWorkersListDialogOpen,
    ]
  );

  // Client Edit Form
  const {
    control: clientControl,
    handleSubmit: handleClientSubmit,
    reset: resetClient,
    formState: { errors: clientErrors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
      phone: client?.phone || "",
      address: client?.address || "",
      type: client?.type || "individual",
    },
  });

  // Update form when client changes
  useEffect(() => {
    if (client && editClientDialogOpen) {
      resetClient({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        type: client.type,
      });
    }
  }, [client, editClientDialogOpen, resetClient]);

  const onSubmitClient = async (data: ClientFormData) => {
    if (!clientId) return;
    try {
      await updateClient(clientId, data);
      setSnackbarMessage("تم تحديث بيانات العميل بنجاح");
      setSnackbarOpen(true);
      setEditClientDialogOpen(false);
    } catch (error: any) {
      setSnackbarMessage(error?.message || "حدث خطأ أثناء التحديث");
      setSnackbarOpen(true);
    }
  };

  // Payment Form
  const {
    control: paymentControl,
    handleSubmit: handlePaymentSubmit,
    reset: resetPayment,
    setValue: setPaymentValue,
  } = useForm<{
    amount: string | number;
    paymentMethod: "cash" | "check" | "bank_transfer" | "credit_card";
    paymentDate: string;
    invoiceId: string;
    notes: string;
  }>({
    defaultValues: {
      amount: "" as any,
      paymentMethod: "cash",
      paymentDate: dayjs().format("YYYY-MM-DD"),
      invoiceId: "",
      notes: "",
    },
  });

  // Expense Form
  const {
    control: expenseControl,
    handleSubmit: handleExpenseSubmit,
    reset: resetExpense,
    setValue: setExpenseValue,
  } = useForm({
    defaultValues: {
      description: "",
      amount: "" as any,
      category: "مواد",
      date: dayjs().format("YYYY-MM-DD"),
      notes: "",
    },
  });

  // Debt Form
  const {
    control: debtControl,
    handleSubmit: handleDebtSubmit,
    reset: resetDebt,
    setValue: setDebtValue,
  } = useForm({
    defaultValues: {
      partyType: "person" as "person" | "shop" | "company",
      partyName: "",
      description: "",
      amount: "" as any,
      date: dayjs().format("YYYY-MM-DD"),
      notes: "",
    },
  });

  // Party Form
  const {
    control: partyControl,
    handleSubmit: handlePartySubmit,
    reset: resetParty,
    setValue: setPartyValue,
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      type: "person" as "person" | "shop" | "company",
    },
  });

  // Update party form when editing
  useEffect(() => {
    if (editingParty) {
      setPartyValue("name", editingParty.name);
      setPartyValue("phone", editingParty.phone);
      setPartyValue("address", editingParty.address);
      setPartyValue("type", editingParty.type);
    } else {
      resetParty({
        name: "",
        phone: "",
        address: "",
        type: "person",
      });
    }
  }, [editingParty, setPartyValue, resetParty]);

  // Load profit percentage for this client from database
  useEffect(() => {
    if (!client) {
      setProfitPercentage("");
      return;
    }
    const percentage = client.profitPercentage;
    if (percentage !== undefined && percentage !== null) {
      setProfitPercentage(percentage.toString());
    } else {
      setProfitPercentage("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.id, client?.profitPercentage]);

  // Handle save profit percentage for this client
  const handleSaveProfitPercentage = async () => {
    if (!clientId || !client) return;

    const percentage = parseFloat(profitPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      setSnackbarMessage("النسبة يجب أن تكون بين 0 و 100");
      setSnackbarOpen(true);
      return;
    }

    try {
      // Save to database
      await updateClient(clientId, {
        profitPercentage: percentage,
      });

      // Dispatch custom event to update HomePage
      window.dispatchEvent(new Event("profitPercentageUpdated"));
      setSnackbarMessage("تم حفظ النسبة بنجاح");
      setSnackbarOpen(true);
      setProfitDialogOpen(false);
    } catch (error: any) {
      setSnackbarMessage(error?.message || "حدث خطأ أثناء حفظ النسبة");
      setSnackbarOpen(true);
    }
  };

  const clientExpenses = useMemo(
    () =>
      expenses
        .filter((exp) => exp.clientId === clientId)
        .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt))),
    [expenses, clientId]
  );

  const clientPayments = useMemo(
    () =>
      payments
        .filter((pay) => pay.clientId === clientId)
        .sort((a, b) => dayjs(b.paymentDate).diff(dayjs(a.paymentDate))),
    [payments, clientId]
  );

  const clientDebts = useMemo(
    () =>
      standaloneDebts
        .filter((debt) => debt.clientId === clientId)
        .sort((a, b) => dayjs(b.date).diff(dayjs(a.date))),
    [standaloneDebts, clientId]
  );

  // Filtered data for search
  const filteredExpenses = useMemo(() => {
    if (!expensesSearchQuery) return clientExpenses;
    const query = expensesSearchQuery.toLowerCase();
    return clientExpenses.filter(
      (exp) =>
        exp.description.toLowerCase().includes(query) ||
        exp.category.toLowerCase().includes(query) ||
        exp.notes?.toLowerCase().includes(query) ||
        formatCurrency(exp.amount).includes(query)
    );
  }, [clientExpenses, expensesSearchQuery]);

  const filteredPayments = useMemo(() => {
    if (!paymentsSearchQuery) return clientPayments;
    const query = paymentsSearchQuery.toLowerCase();
    return clientPayments.filter(
      (pay) =>
        formatCurrency(pay.amount).includes(query) ||
        pay.paymentMethod.toLowerCase().includes(query) ||
        pay.notes?.toLowerCase().includes(query) ||
        dayjs(pay.paymentDate).format("DD/MM/YYYY").includes(query)
    );
  }, [clientPayments, paymentsSearchQuery]);

  const clientWorkers = useMemo(
    () =>
      workers
        .filter((worker) => worker.clientId === clientId)
        .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt))),
    [workers, clientId]
  );

  const filteredWorkers = useMemo(() => {
    if (!workersSearchQuery) return clientWorkers;
    const query = workersSearchQuery.toLowerCase();
    return clientWorkers.filter(
      (worker) =>
        worker.fullName.toLowerCase().includes(query) ||
        worker.phone.includes(query) ||
        worker.role.toLowerCase().includes(query)
    );
  }, [clientWorkers, workersSearchQuery]);

  const getNextExpenseNumber = () => {
    const maxNumber = clientExpenses.reduce((max, expense) => {
      if (!expense.expenseNumber) return max;
      const match = expense.expenseNumber.match(/EXP-(\d+)/);
      if (!match) return max;
      return Math.max(max, parseInt(match[1], 10));
    }, 0);
    return `EXP-${String(maxNumber + 1).padStart(4, "0")}`;
  };

  // Get debt parties for this client
  const clientDebtParties = useMemo(() => {
    return debtParties.filter((p) => p.clientId === clientId);
  }, [debtParties, clientId]);

  // Group debts by party (using debt parties)
  const parties = useMemo(() => {
    return clientDebtParties
      .map((party) => {
        const partyDebts = clientDebts.filter(
          (d) =>
            (d as any).partyId === party.id ||
            ((d as any).partyName === party.name &&
              (d as any).partyType === party.type)
        );
        const totalAmount = partyDebts.reduce((sum, d) => sum + d.amount, 0);
        const totalPaid = partyDebts.reduce((sum, d) => sum + d.paidAmount, 0);
        const totalRemaining = partyDebts.reduce(
          (sum, d) => sum + d.remainingAmount,
          0
        );
        return {
          ...party,
          debts: partyDebts,
          totalAmount,
          totalPaid,
          totalRemaining,
        };
      })
      .sort((a, b) => dayjs(b.createdAt || "").diff(dayjs(a.createdAt || "")));
  }, [clientDebtParties, clientDebts]);

  // Filtered parties based on search
  const filteredParties = useMemo(() => {
    if (!debtsSearchQuery) return parties;
    const query = debtsSearchQuery.toLowerCase();
    return parties.filter(
      (party) =>
        party.name.toLowerCase().includes(query) ||
        party.phone?.toLowerCase().includes(query) ||
        party.address?.toLowerCase().includes(query) ||
        party.debts.some(
          (debt) =>
            debt.description?.toLowerCase().includes(query) ||
            formatCurrency(debt.amount).includes(query) ||
            formatCurrency(debt.remainingAmount).includes(query)
        )
    );
  }, [parties, debtsSearchQuery]);

  // Get debts for selected party
  const partyDebts = useMemo(() => {
    if (!selectedParty) return [];
    return clientDebts.filter(
      (debt) =>
        (debt as any).partyId === selectedParty.id ||
        ((debt as any).partyName === selectedParty.name &&
          (debt as any).partyType === selectedParty.type)
    );
  }, [clientDebts, selectedParty]);

  const partyStats = useMemo(() => {
    const totalAmount = partyDebts.reduce((sum, d) => sum + d.amount, 0);
    const totalPaid = partyDebts.reduce((sum, d) => sum + d.paidAmount, 0);
    const totalRemaining = partyDebts.reduce(
      (sum, d) => sum + d.remainingAmount,
      0
    );
    return { totalAmount, totalPaid, totalRemaining };
  }, [partyDebts]);

  const summary = useMemo(() => {
    const totalExpenses = clientExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const totalDebts = clientDebts.reduce(
      (sum, debt) => sum + (debt.remainingAmount || 0),
      0
    );
    const totalPaid = clientPayments.reduce((sum, pay) => sum + pay.amount, 0);

    // النسبة المتفق عليها
    const profitPercentage = client?.profitPercentage || 0;
    const profit =
      totalExpenses > 0 && profitPercentage > 0
        ? (totalExpenses * profitPercentage) / 100
        : 0;

    const totalDue = totalExpenses + profit;
    const remaining = Math.max(totalDue - totalPaid, 0);
    const overpaid = Math.max(totalPaid - totalDue, 0);

    return {
      totalExpenses,
      totalDebts,
      totalPaid,
      totalDue,
      remaining,
      overpaid,
      profit,
      profitPercentage,
      expenseCount: clientExpenses.length,
      debtCount: clientDebts.length,
      paymentCount: clientPayments.length,
    };
  }, [clientExpenses, clientDebts, clientPayments, client]);

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseValue("description", expense.description);
    setExpenseValue("amount", expense.amount);
    setExpenseValue("category", expense.category);
    setExpenseValue("date", expense.date);
    setExpenseValue("notes", expense.notes || "");
    setExpenseDialogOpen(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
      try {
        await deleteExpense(expenseId);
        setSnackbarMessage("تم الحذف بنجاح");
        setSnackbarOpen(true);
      } catch (error: any) {
        const errorMessage =
          error?.message || error?.toString() || "حدث خطأ أثناء الحذف";
        setSnackbarMessage(errorMessage);
        setSnackbarOpen(true);
      }
    }
  };

  const handleEditDebt = (debt: StandaloneDebt) => {
    setEditingDebt(debt);
    setDebtValue("partyType", debt.partyType || "person");
    setDebtValue("partyName", debt.partyName || "");
    setDebtValue("description", debt.description);
    setDebtValue("amount", debt.amount);
    setDebtValue("date", debt.date);
    setDebtValue("notes", debt.notes || "");
    setDebtDialogOpen(true);
  };

  const handleDeleteDebt = async (debtId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الدين؟")) {
      try {
        await deleteStandaloneDebt(debtId);
        setSnackbarMessage("تم الحذف بنجاح");
        setSnackbarOpen(true);
      } catch (error: any) {
        const errorMessage =
          error?.message || error?.toString() || "حدث خطأ أثناء الحذف";
        setSnackbarMessage(errorMessage);
        setSnackbarOpen(true);
      }
    }
  };

  const handleOpenPayDebtDialog = (debt: StandaloneDebt) => {
    setSelectedDebtForPay(debt);
    setPayDebtAmount("");
    setPayDebtDialogOpen(true);
  };

  const handleOpenPartyProfile = (party: DebtParty) => {
    setSelectedParty(party);
    setPartyProfileDialogOpen(true);
  };

  const handleAddParty = () => {
    setEditingParty(null);
    setPartyDialogOpen(true);
  };

  const onSubmitParty = async (data: {
    name: string;
    phone: string;
    address: string;
    type: "person" | "shop" | "company";
  }) => {
    try {
      if (editingParty) {
        await updateDebtParty(editingParty.id, {
          name: data.name,
          phone: data.phone,
          address: data.address,
          type: data.type,
        });
        setSnackbarMessage("تم التحديث بنجاح");
      } else {
        await addDebtParty({
          id: crypto.randomUUID(),
          clientId: clientId!,
          name: data.name,
          phone: data.phone,
          address: data.address,
          type: data.type,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setSnackbarMessage("تم الإضافة بنجاح");
      }
      setPartyDialogOpen(false);
      setEditingParty(null);
      setSnackbarOpen(true);
    } catch (error: any) {
      setSnackbarMessage(error?.message || "حدث خطأ أثناء الحفظ");
      setSnackbarOpen(true);
    }
  };

  const handlePayDebt = async () => {
    if (!selectedDebtForPay) return;
    const pay = parseFloat(payDebtAmount) || 0;

    // Get the latest debt data from clientDebts to ensure we have current values
    const currentDebt = clientDebts.find((d) => d.id === selectedDebtForPay.id);
    if (!currentDebt && !selectedDebtForPay.id.startsWith("party_")) {
      setSnackbarMessage("الدين غير موجود");
      setSnackbarOpen(true);
      return;
    }

    const debtToPay = currentDebt || selectedDebtForPay;
    const maxPayable = debtToPay.remainingAmount;

    if (pay <= 0 || pay > maxPayable) {
      setSnackbarMessage(
        `المبلغ غير صحيح. الحد الأقصى: ${formatCurrency(maxPayable)}`
      );
      setSnackbarOpen(true);
      return;
    }

    try {
      // Check if this is a party-level payment (virtual debt)
      if (selectedDebtForPay.id.startsWith("party_")) {
        // Distribute payment across all debts for this party
        const partyName = selectedDebtForPay.partyName;
        const partyType = selectedDebtForPay.partyType;
        const partyDebtsToPay = clientDebts
          .filter(
            (d) =>
              ((d as any).partyName || "") === partyName &&
              ((d as any).partyType || "person") === partyType &&
              d.remainingAmount > 0
          )
          .sort((a, b) => b.remainingAmount - a.remainingAmount); // Pay larger debts first

        let remainingPay = pay;
        for (const debt of partyDebtsToPay) {
          if (remainingPay <= 0) break;
          const payForThisDebt = Math.min(remainingPay, debt.remainingAmount);
          const newPaid = debt.paidAmount + payForThisDebt;
          const newRemaining = Math.max(0, debt.amount - newPaid);
          await updateStandaloneDebt(debt.id, {
            paidAmount: newPaid,
            remainingAmount: newRemaining,
            status: newRemaining <= 0 ? "paid" : "active",
          });
          remainingPay -= payForThisDebt;
        }
      } else {
        // Regular single debt payment - use current debt data
        const newPaid = debtToPay.paidAmount + pay;
        const newRemaining = Math.max(0, debtToPay.amount - newPaid);
        await updateStandaloneDebt(debtToPay.id, {
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: newRemaining <= 0 ? "paid" : "active",
        });
      }
      setPayDebtDialogOpen(false);
      setSelectedDebtForPay(null);
      setPayDebtAmount("");
      setSnackbarMessage("تم الدفع بنجاح");
      setSnackbarOpen(true);
      if (partyProfileDialogOpen) {
        // Keep party profile open to see updated stats
      } else {
        setDebtsListDialogOpen(true);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.toString() || "حدث خطأ أثناء الدفع";
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  const getPaymentMethodLabel = (
    method: PaymentType["paymentMethod"]
  ): string => {
    switch (method) {
      case "cash":
        return "نقدي";
      case "bank_transfer":
        return "تحويل بنكي";
      case "check":
        return "شيك";
      case "credit_card":
        return "بطاقة ائتمان";
      default:
        return method as string;
    }
  };

  const handleEditPayment = (payment: PaymentType) => {
    setEditingPayment(payment);
    setPaymentValue("amount", payment.amount);
    setPaymentValue("paymentMethod", payment.paymentMethod);
    setPaymentValue("paymentDate", payment.paymentDate);
    setPaymentValue("invoiceId", payment.invoiceId || "");
    setPaymentValue("notes", payment.notes || "");
    setPaymentDialogOpen(true);
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الدفعة؟")) {
      try {
        await deletePayment(paymentId);
        setSnackbarMessage("تم الحذف بنجاح");
        setSnackbarOpen(true);
      } catch (error: any) {
        const errorMessage =
          error?.message || error?.toString() || "حدث خطأ أثناء الحذف";
        setSnackbarMessage(errorMessage);
        setSnackbarOpen(true);
      }
    }
  };

  const onSubmitPayment = async (data: any) => {
    try {
      const amount = parseFloat(data.amount) || 0;
      if (editingPayment) {
        await updatePayment(editingPayment.id, {
          amount: amount,
          paymentMethod: data.paymentMethod || "cash",
          paymentDate: data.paymentDate || dayjs().format("YYYY-MM-DD"),
          invoiceId: data.invoiceId || "",
          notes: data.notes || "",
        });
        setEditingPayment(null);
        setSnackbarMessage("تم التعديل بنجاح");
      } else {
        const newPayment: PaymentType = {
          id: crypto.randomUUID(),
          invoiceId: data.invoiceId || "",
          clientId: clientId!,
          amount: amount,
          paymentMethod: data.paymentMethod,
          paymentDate: data.paymentDate,
          notes: data.notes || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await addPayment(newPayment);
        setSnackbarMessage("تمت الإضافة بنجاح");
      }
      setPaymentDialogOpen(false);
      resetPayment({
        amount: "" as any,
        paymentMethod: "cash",
        paymentDate: dayjs().format("YYYY-MM-DD"),
        invoiceId: "",
        notes: "",
      });
      // إعادة فتح قائمة المدفوعات
      setPaymentsListDialogOpen(true);
      setSnackbarOpen(true);
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.toString() || "حدث خطأ أثناء الحفظ";
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  const onSubmitExpense = async (data: any) => {
    try {
      const amount = parseFloat(data.amount) || 0;
      if (editingExpense) {
        await updateExpense(editingExpense.id, {
          description: data.description || "",
          amount: amount,
          category: data.category || "مواد",
          date: data.date || dayjs().format("YYYY-MM-DD"),
          notes: data.notes || "",
        });
        setEditingExpense(null);
        setSnackbarMessage("تم التعديل بنجاح");
      } else {
        const newExpense: Expense = {
          id: crypto.randomUUID(),
          clientId: clientId!,
          expenseNumber: getNextExpenseNumber(),
          description: data.description,
          amount: amount,
          category: data.category,
          date: data.date,
          notes: data.notes,
          isClosed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addExpense(newExpense);
        setEditingExpense(null);
        setSnackbarMessage("تمت الإضافة بنجاح");
      }
      setExpenseDialogOpen(false);
      resetExpense({
        description: "",
        amount: "" as any,
        category: "مواد",
        date: dayjs().format("YYYY-MM-DD"),
        notes: "",
      });
      // إعادة فتح قائمة المصروفات
      setExpensesListDialogOpen(true);
      setSnackbarOpen(true);
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.toString() || "حدث خطأ أثناء الحفظ";
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  const onSubmitDebt = async (data: any) => {
    try {
      const amount = parseFloat(data.amount) || 0;
      if (!data.partyName || !data.description || amount <= 0) {
        setSnackbarMessage("يرجى ملء جميع الحقول المطلوبة");
        setSnackbarOpen(true);
        return;
      }

      if (editingDebt) {
        // عند التعديل، نحافظ على المبلغ المدفوع الحالي إذا كان المبلغ الجديد أكبر منه
        // وإلا نعدل المبلغ المدفوع ليكون مساوياً للمبلغ الجديد
        const newPaidAmount = Math.min(editingDebt.paidAmount, amount);
        const newRemaining = Math.max(0, amount - newPaidAmount);
        // Find party if exists
        const existingParty = clientDebtParties.find(
          (p) => p.name === data.partyName && p.type === data.partyType
        );
        await updateStandaloneDebt(editingDebt.id, {
          partyId: existingParty?.id || (editingDebt as any).partyId || "",
          partyType: data.partyType || "person",
          partyName: data.partyName,
          description: data.description,
          amount: amount,
          paidAmount: newPaidAmount,
          remainingAmount: newRemaining,
          status: newRemaining <= 0 ? "paid" : "active",
          date: data.date,
          notes: data.notes || "",
        });
        setEditingDebt(null);
        setSnackbarMessage("تم التعديل بنجاح");
      } else {
        // Find party if exists
        const existingParty = clientDebtParties.find(
          (p) => p.name === data.partyName && p.type === data.partyType
        );
        const newDebt: StandaloneDebt = {
          id: crypto.randomUUID(),
          clientId: clientId!,
          partyId: existingParty?.id || "",
          partyType: data.partyType || "person",
          partyName: data.partyName,
          description: data.description,
          amount: amount,
          paidAmount: 0,
          remainingAmount: amount,
          status: "active",
          date: data.date,
          notes: data.notes || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addStandaloneDebt(newDebt);
        setSnackbarMessage("تمت الإضافة بنجاح");
      }
      setDebtDialogOpen(false);
      resetDebt({
        partyType: "person",
        partyName: "",
        description: "",
        amount: "" as any,
        date: dayjs().format("YYYY-MM-DD"),
        notes: "",
      });
      setDebtsListDialogOpen(true);
      setSnackbarOpen(true);
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.toString() || "حدث خطأ أثناء الحفظ";
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  const openCreateWorkerDialog = () => {
    setEditingWorker(null);
    setWorkerForm({
      fullName: "",
      phone: "",
      role: "",
      dailyRate: "",
      notes: "",
      isActive: true,
    });
    setWorkerDialogOpen(true);
  };

  const openEditWorkerDialog = (worker: Worker) => {
    setEditingWorker(worker);
    setWorkerForm({
      fullName: worker.fullName,
      phone: worker.phone,
      role: worker.role,
      dailyRate: worker.dailyRate.toString(),
      notes: worker.notes || "",
      isActive: worker.isActive,
    });
    setWorkerDialogOpen(true);
  };

  const saveWorker = async () => {
    if (!workerForm.fullName.trim() || !workerForm.phone.trim() || !workerForm.role.trim()) {
      setSnackbarMessage("يرجى تعبئة الاسم والهاتف والدور");
      setSnackbarOpen(true);
      return;
    }

    const dailyRate = parseFloat(workerForm.dailyRate) || 0;

    try {
      if (editingWorker) {
        await updateWorker(editingWorker.id, {
          fullName: workerForm.fullName.trim(),
          phone: workerForm.phone.trim(),
          role: workerForm.role.trim(),
          dailyRate,
          notes: workerForm.notes.trim(),
          isActive: workerForm.isActive,
        });
        setSnackbarMessage("تم تحديث بيانات العامل");
      } else {
        const newWorker: Worker = {
          id: crypto.randomUUID(),
          clientId: clientId!,
          fullName: workerForm.fullName.trim(),
          phone: workerForm.phone.trim(),
          role: workerForm.role.trim(),
          dailyRate,
          notes: workerForm.notes.trim(),
          isActive: workerForm.isActive,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addWorker(newWorker);
        setSnackbarMessage("تمت إضافة العامل");
      }
      setWorkerDialogOpen(false);
      setSnackbarOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "تعذر حفظ بيانات العامل";
      setSnackbarMessage(message);
      setSnackbarOpen(true);
    }
  };

  const handleDeleteWorker = async (worker: Worker) => {
    if (!window.confirm(`حذف العامل ${worker.fullName}؟`)) return;
    try {
      await deleteWorker(worker.id);
      setSnackbarMessage("تم حذف العامل");
      setSnackbarOpen(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "تعذر حذف العامل";
      setSnackbarMessage(message);
      setSnackbarOpen(true);
    }
  };

  if (!client) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>العميل غير موجود</Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/clients")}
          sx={{ mt: 2 }}
        >
          العودة
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "background.default",
        pb: { xs: 12, md: 8 },
      }}
    >
      {/* Hero Header */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          pt: { xs: 'calc(16px + env(safe-area-inset-top))', sm: 'calc(24px + env(safe-area-inset-top))' },
          pb: { xs: 5, sm: 6 },
          px: 2,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: theme.palette.mode === "light"
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0.04)} 50%, ${alpha(theme.palette.background.default, 0.9)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.25)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 50%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
            zIndex: 0,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: theme.palette.mode === "light"
              ? `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.15)}, transparent)`
              : `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.2)}, transparent)`,
          },
        }}
      >
        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
          {/* Top Bar */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 2.5 }}
          >
            <IconButton
              onClick={() => navigate("/clients")}
              sx={{
                color: "text.primary",
                marginLeft: "8px",
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: "blur(8px)",
                transition:
                  "transform 160ms cubic-bezier(0.23,1,0.32,1), background-color 160ms ease-out",
                "&:hover": { bgcolor: alpha(theme.palette.background.paper, 0.95) },
                "&:active": { transform: "scale(0.96)" },
              }}
              aria-label="رجوع"
            >
              <ArrowBack />
            </IconButton>
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={async () => {
                  if (!client) return;
                  await downloadPdf(
                    <ClientFinalStyledPDF
                      client={client}
                      expenses={clientExpenses}
                      payments={clientPayments}
                      debts={clientDebts}
                      profitPercentage={client.profitPercentage || 0}
                    />,
                    `final-report-${client.name}.pdf`
                  );
                }}
                sx={{
                  color: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  width: 42,
                  height: 42,
                  transition:
                    "transform 160ms cubic-bezier(0.23,1,0.32,1), background-color 160ms ease-out",
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.16) },
                  "&:active": { transform: "scale(0.96)" },
                }}
                aria-label="التقرير النهائي"
                title="التقرير النهائي"
              >
                <Assessment sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton
                component="a"
                href={`https://wa.me/${client.phone?.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener"
                sx={{
                  color: "#25d366",
                  bgcolor: alpha("#25d366", 0.08),
                  width: 42,
                  height: 42,
                  transition:
                    "transform 160ms cubic-bezier(0.23,1,0.32,1), background-color 160ms ease-out",
                  "&:hover": { bgcolor: alpha("#25d366", 0.16) },
                  "&:active": { transform: "scale(0.96)" },
                }}
                aria-label="واتساب"
                title="واتساب"
              >
                <ChatBubbleOutline sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton
                onClick={() => setEditClientDialogOpen(true)}
                sx={{
                  color: "text.secondary",
                  bgcolor: alpha(theme.palette.text.secondary, 0.06),
                  width: 42,
                  height: 42,
                  transition:
                    "transform 160ms cubic-bezier(0.23,1,0.32,1), background-color 160ms ease-out",
                  "&:hover": { bgcolor: alpha(theme.palette.text.secondary, 0.12) },
                  "&:active": { transform: "scale(0.96)" },
                }}
                aria-label="تعديل بيانات العميل"
              >
                <Edit sx={{ fontSize: 20 }} />
              </IconButton>
            </Stack>
          </Stack>

          {/* Client Identity */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          >
            <Stack direction="row" alignItems="center" sx={{ mb: 3, gap: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: "primary.main",
                  fontWeight: 800,
                  fontSize: "1.4rem",
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                {client.type === "company" ? (
                  <Business sx={{ fontSize: 28 }} />
                ) : (
                  client.name?.charAt(0)
                )}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{
                    letterSpacing: "-0.03em",
                    lineHeight: 1.2,
                    mb: 0.5,
                    fontSize: { xs: "1.3rem", sm: "1.5rem" },
                  }}
                >
                  {client.name}
                </Typography>
                <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
                  <Chip
                    icon={<Phone sx={{ fontSize: "14px !important" }} />}
                    label={client.phone}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      color: "text.primary",
                      height: 28,
                      "& .MuiChip-icon": {
                        color: "primary.main",
                        marginInlineStart: "6px",
                        marginInlineEnd: "4px",
                        marginLeft: 0,
                        marginRight: 0,
                      },
                      "& .MuiChip-label": { px: 0.75 },
                    }}
                  />
                  <Chip
                    label={client.type === "company" ? "شركة" : "فرد"}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: "primary.main",
                      height: 24,
                    }}
                  />
                </Stack>
              </Box>
            </Stack>
          </motion.div>

          {/* Financial Summary — 2x2 Grid */}
          <Grid container spacing={1.5}>
            {[
              {
                label: "المصروفات + النسبة",
                value: formatCurrency(summary.totalExpenses + summary.profit),
                icon: <TrendingDown sx={{ fontSize: 18 }} />,
                color: theme.palette.error.main,
                delay: 0,
              },
              {
                label: "المدفوع",
                value: formatCurrency(summary.totalPaid),
                icon: <Payment sx={{ fontSize: 18 }} />,
                color: theme.palette.success.main,
                delay: 0.05,
              },
              {
                label: "المتبقي",
                value: formatCurrency(summary.remaining),
                icon: summary.remaining > 0 ? <TrendingUp sx={{ fontSize: 18 }} /> : <TrendingDown sx={{ fontSize: 18 }} />,
                color: summary.remaining > 0 ? theme.palette.warning.main : theme.palette.success.main,
                delay: 0.1,
              },
              {
                label: `النسبة المتفق عليها${summary.profitPercentage > 0 ? ` (${summary.profitPercentage}%)` : ""}`,
                value: summary.profitPercentage > 0 ? formatCurrency(summary.profit) : "غير محدد",
                icon: <TrendingUp sx={{ fontSize: 18 }} />,
                color: theme.palette.info.main,
                delay: 0.15,
              },
            ].map((stat, i) => (
              <Grid key={i} size={{ xs: 6 }}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{
                    duration: 0.35,
                    delay: stat.delay,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      position: "relative",
                      borderRadius: 3,
                      border: `1px solid ${alpha(stat.color, 0.14)}`,
                      bgcolor: alpha(
                        theme.palette.background.paper,
                        theme.palette.mode === "light" ? 1 : 0.65
                      ),
                      overflow: "hidden",
                      transition:
                        "border-color 220ms cubic-bezier(0.32,0.72,0,1), box-shadow 220ms cubic-bezier(0.32,0.72,0,1)",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: 3,
                        bgcolor: alpha(stat.color, 0.6),
                      },
                      "&:hover": {
                        borderColor: alpha(stat.color, 0.32),
                        boxShadow: `0 8px 24px -16px ${alpha(stat.color, 0.45)}`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 } }}>
                      <Stack direction="row" alignItems="center" sx={{ mb: 0.75, gap: 1 }}>
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            borderRadius: 1.5,
                            bgcolor: alpha(stat.color, 0.12),
                            display: "grid",
                            placeItems: "center",
                            color: stat.color,
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.66rem",
                            lineHeight: 1.3,
                            letterSpacing: 0.2,
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body1"
                        fontWeight={800}
                        sx={{
                          fontSize: { xs: "0.95rem", sm: "1rem" },
                          letterSpacing: "-0.02em",
                          fontFamily: '"Outfit", "Cairo", sans-serif',
                          fontVariantNumeric: "tabular-nums",
                          color: stat.color,
                        }}
                      >
                        {stat.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* شريط نسبة التحصيل + آخر نشاط — تفصيل أنيق ومدهش */}
          {(() => {
            const dueTotal = summary.totalExpenses + summary.profit;
            const collection = dueTotal > 0
              ? Math.min(100, (summary.totalPaid / dueTotal) * 100)
              : 0;
            const lastExpenseAt =
              clientExpenses[0]?.date || clientExpenses[0]?.createdAt;
            const lastPaymentAt =
              clientPayments[0]?.paymentDate || clientPayments[0]?.createdAt;
            const lastActivityIso =
              [lastExpenseAt, lastPaymentAt]
                .filter(Boolean)
                .map((d) => +new Date(d as string))
                .sort((a, b) => b - a)[0] ?? null;
            const lastActivityLabel =
              lastActivityIso !== null
                ? dayjs(lastActivityIso).fromNow()
                : "—";

            return (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25, ease: [0.32, 0.72, 0, 1] }}
              >
                <Card
                  elevation={0}
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                    bgcolor: alpha(
                      theme.palette.background.paper,
                      theme.palette.mode === "light" ? 0.95 : 0.6
                    ),
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        letterSpacing: 0.3,
                        color: "text.secondary",
                        textTransform: "uppercase",
                        fontSize: "0.65rem",
                      }}
                    >
                      نسبة التحصيل
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        fontFamily: '"Outfit", "Cairo", sans-serif',
                        fontVariantNumeric: "tabular-nums",
                        color: collection >= 100 ? "success.main" : "primary.main",
                      }}
                    >
                      {collection.toFixed(1)}%
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      position: "relative",
                      height: 8,
                      borderRadius: 999,
                      bgcolor: alpha(theme.palette.text.primary, 0.06),
                      overflow: "hidden",
                    }}
                    role="progressbar"
                    aria-valuenow={Math.round(collection)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${collection}%` }}
                      transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1], delay: 0.4 }}
                      style={{
                        height: "100%",
                        borderRadius: 999,
                        background:
                          collection >= 100
                            ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
                            : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      }}
                    />
                  </Box>

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mt: 1.25 }}
                  >
                    <Stack direction="row" alignItems="center" sx={{ gap: 0.75 }}>
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          bgcolor:
                            lastActivityIso !== null ? "success.main" : "text.disabled",
                          boxShadow:
                            lastActivityIso !== null
                              ? `0 0 0 3px ${alpha(theme.palette.success.main, 0.18)}`
                              : "none",
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.7rem" }}
                      >
                        آخر نشاط: {lastActivityLabel}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        fontFamily: '"Outfit", "Cairo", sans-serif',
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {summary.expenseCount} مصروف · {summary.paymentCount} دفعة
                    </Typography>
                  </Stack>
                </Card>
              </motion.div>
            );
          })()}
        </Container>
      </Box>

      {/* Content — bento grid quick actions (single accent system, no rainbow cards) */}
      <Container maxWidth="sm" sx={{ mt: -2, pb: 4 }}>
        <ProfileSectionHeading
          kicker="العميل"
          title="لوحة التحكم السريعة"
          subtitle="اختر قسماً للعرض أو الإضافة دون البحث في القوائم."
        />

        <Grid container spacing={2}>
          {menuItems.map((item, index) => {
            const { accent, soft, ring } = menuToneSurface(theme, item.tone);
            const Icon = item.Icon;
            return (
              <Grid key={item.title} size={{ xs: 12, sm: 6 }}>
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.42,
                    delay: index * 0.06,
                    ease: EASE_OUT,
                  }}
                  style={{ height: "100%" }}
                >
                  <Paper
                    component="button"
                    type="button"
                    onClick={item.onClick}
                    elevation={0}
                    sx={{
                      height: "100%",
                      width: "100%",
                      cursor: "pointer",
                      textAlign: "right",
                      borderRadius: 3,
                      overflow: "hidden",
                      bgcolor: "background.paper",
                      border: `1px solid ${ring}`,
                      p: "3px",
                      display: "block",
                      font: "inherit",
                      color: "inherit",
                      transition:
                        "box-shadow 220ms cubic-bezier(0.32, 0.72, 0, 1), transform 220ms cubic-bezier(0.32, 0.72, 0, 1)",
                      boxShadow:
                        theme.palette.mode === "light"
                          ? `0 2px 0 ${alpha("#1c1917", 0.04)}, 0 18px 40px ${alpha("#1c1917", 0.06)}`
                          : `0 2px 0 ${alpha("#fff", 0.06)}, 0 12px 32px ${alpha("#000", 0.35)}`,
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow:
                          theme.palette.mode === "light"
                            ? `0 2px 0 ${alpha(accent, 0.12)}, 0 22px 48px ${alpha(accent, 0.14)}`
                            : `0 2px 0 ${alpha(accent, 0.25)}, 0 16px 40px ${alpha("#000", 0.45)}`,
                      },
                      "&:active": {
                        transform: "scale(0.98) translateY(0)",
                      },
                      "@media (prefers-reduced-motion: reduce)": {
                        transition: "none",
                        "&:hover": { transform: "none" },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: 2.5,
                        bgcolor: alpha(theme.palette.background.paper, 1),
                        p: 2,
                        border: `1px solid ${alpha(accent, 0.08)}`,
                      }}
                    >
                      <Stack direction="row" alignItems="flex-start" sx={{ gap: 2 }}>
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2,
                            bgcolor: soft,
                            border: `1px solid ${alpha(accent, 0.35)}`,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon sx={{ fontSize: 26, color: accent }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={800}
                            sx={{ letterSpacing: "-0.02em", mb: 0.25 }}
                          >
                            {item.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", lineHeight: 1.5 }}
                          >
                            {item.subtitle}
                          </Typography>
                        </Box>
                        <ChevronLeft
                          sx={{
                            color: "text.disabled",
                            fontSize: 22,
                            mt: 0.5,
                            flexShrink: 0,
                          }}
                        />
                      </Stack>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* Expenses List Dialog — layout: قائمة قابلة للتمرير + ملخص وب PDF ثابتان في الأسفل */}
      <Dialog
        open={expensesListDialogOpen}
        onClose={() => setExpensesListDialogOpen(false)}
        fullScreen
        PaperProps={{
          sx: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            maxHeight: "100dvh",
            overflow: "hidden",
            bgcolor: "background.default",
          },
        }}
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: "background.default",
          },
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            background: theme.palette.mode === "light"
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)} 0%, ${alpha(theme.palette.primary.dark, 0.4)} 100%)`,
            color: theme.palette.mode === "light" ? "#fff" : theme.palette.primary.light,
            px: 2,
            pt: "max(16px, env(safe-area-inset-top, 0px))",
            pb: 2,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1.5}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
              <IconButton
                onClick={() => setExpensesListDialogOpen(false)}
                sx={{ color: "inherit", bgcolor: "rgba(255,255,255,0.12)", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}
                aria-label="إغلاق"
              >
                <ArrowBack />
              </IconButton>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" fontWeight={800} noWrap sx={{ letterSpacing: "-0.02em" }}>
                  المصروفات
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: "0.7rem" }}>
                  {clientExpenses.length} عملية — {client.name}
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              onClick={() => {
                setEditingExpense(null);
                resetExpense({
                  description: "",
                  amount: "" as any,
                  category: "مواد",
                  date: dayjs().format("YYYY-MM-DD"),
                  notes: "",
                });
                setExpenseDialogOpen(true);
              }}
              sx={{
                bgcolor: "rgba(255,255,255,0.95)",
                color: theme.palette.primary.dark,
                fontWeight: 700,
                boxShadow: "none",
                borderRadius: 2.5,
                whiteSpace: "nowrap",
                px: 2,
                py: 1,
                fontSize: "0.85rem",
                "&:hover": { bgcolor: "rgba(255,255,255,0.85)", boxShadow: "none" },
              }}
              startIcon={<Add />}
            >
              إضافة
            </Button>
          </Stack>
        </Box>

        <Box sx={{ flexShrink: 0, px: 2, pt: 1.5, pb: 1 }}>
          <TextField
            fullWidth
            placeholder="ابحث في المصروفات..."
            value={expensesSearchQuery}
            onChange={(e) => setExpensesSearchQuery(e.target.value)}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
                borderRadius: 2.5,
                border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === "light" ? 1 : 0.3)}`,
                "& fieldset": { border: "none" },
                "&.Mui-focused": {
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "text.secondary", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          {clientExpenses.length > 0 && expensesSearchQuery.trim().length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75, px: 0.5, fontSize: "0.7rem" }}>
              نتائج البحث: {filteredExpenses.length} من {clientExpenses.length}
            </Typography>
          )}
        </Box>

        {/* منطقة التمرير: البطاقات فقط */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            px: 2,
            pb: { xs: 1, sm: 1.5 },
            WebkitOverflowScrolling: "touch",
          }}
        >
          {filteredExpenses.length === 0 ? (
            <Card
              sx={{
                borderRadius: 2.5,
                textAlign: "center",
                py: 6,
                bgcolor: "background.paper",
                border: `1px solid ${alpha(theme.palette.divider, 1)}`,
              }}
            >
              <TrendingDown
                sx={{
                  fontSize: 56,
                  color: "text.secondary",
                  opacity: 0.35,
                  mb: 2,
                }}
              />
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                {clientExpenses.length === 0
                  ? "لا توجد مصروفات لهذا العميل بعد"
                  : "لا توجد نتائج مطابقة للبحث"}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => {
                  setEditingExpense(null);
                  resetExpense({
                    description: "",
                    amount: "" as any,
                    category: "مواد",
                    date: dayjs().format("YYYY-MM-DD"),
                    notes: "",
                  });
                  setExpenseDialogOpen(true);
                }}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                {clientExpenses.length === 0 ? "إضافة أول مصروف" : "إضافة مصروف"}
              </Button>
            </Card>
          ) : (
            (() => {
              /**
               * عرض احترافي ومريح للمصروفات:
               * - الترقيم تصاعدي حقيقي: أقدم مصروف رقم 1 (في الأسفل)، الأحدث رقم N (في الأعلى).
               * - شريط جانبي رفيع بدل الدوائر الثقيلة (less visual noise).
               * - فاصل تاريخي ناعم عند تغيّر اليوم.
               * - أرقام بـ tabular-nums لمحاذاة عمودية.
               */
              const totalCount = clientExpenses.length;
              const expenseGetNumber = (exp: typeof filteredExpenses[number]) =>
                totalCount - clientExpenses.indexOf(exp);

              let lastDayKey: string | null = null;

              return (
                <Stack spacing={1}>
                  {filteredExpenses.map((expense) => {
                    const rowNum = expenseGetNumber(expense);
                    const dayKey = dayjs(expense.date).format("YYYY-MM-DD");
                    const isFirstOfDay = dayKey !== lastDayKey;
                    lastDayKey = dayKey;
                    return (
                      <React.Fragment key={expense.id}>
                        {isFirstOfDay && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.25,
                              mt: 0.5,
                              mb: 0.25,
                              px: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                fontFamily: '"Outfit", "Cairo", sans-serif',
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                letterSpacing: 0.4,
                                color: "text.secondary",
                                textTransform: "uppercase",
                              }}
                            >
                              {dayjs(expense.date).format("dddd · DD MMM YYYY")}
                            </Box>
                            <Box
                              sx={{
                                flex: 1,
                                height: 1,
                                bgcolor: alpha(theme.palette.divider, 0.6),
                              }}
                            />
                          </Box>
                        )}

                        <motion.div
                          whileHover={{ y: -1 }}
                          transition={{ type: "spring", stiffness: 350, damping: 26 }}
                        >
                          <Box
                            sx={{
                              position: "relative",
                              display: "flex",
                              alignItems: "stretch",
                              p: 1.5,
                              pr: 2,
                              borderRadius: 2.5,
                              bgcolor: "background.paper",
                              border: `1px solid ${alpha(
                                theme.palette.divider,
                                theme.palette.mode === "light" ? 0.7 : 0.25
                              )}`,
                              overflow: "hidden",
                              transition:
                                "border-color 200ms cubic-bezier(0.32,0.72,0,1), box-shadow 200ms cubic-bezier(0.32,0.72,0,1)",
                              "&:hover": {
                                borderColor: alpha(theme.palette.error.main, 0.35),
                                boxShadow: `0 6px 18px -10px ${alpha(theme.palette.error.main, 0.35)}`,
                              },
                              "&::before": {
                                content: '""',
                                position: "absolute",
                                insetBlock: 8,
                                right: 0,
                                width: 3,
                                borderRadius: 999,
                                bgcolor: alpha(theme.palette.error.main, 0.55),
                              },
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* الرقم */}
                            <Box
                              sx={{
                                minWidth: 34,
                                pl: 1.5,
                                pr: 0.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: '"Outfit", "Cairo", sans-serif',
                                fontWeight: 700,
                                fontSize: "0.78rem",
                                color: alpha(theme.palette.text.primary, 0.55),
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              #{String(rowNum).padStart(2, "0")}
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.4 }}>
                                <Typography variant="body2" fontWeight={700} noWrap sx={{ letterSpacing: "-0.01em" }}>
                                  {expense.description || "بدون وصف"}
                                </Typography>
                                {expense.category && (
                                  <Box
                                    sx={{
                                      fontSize: "0.62rem",
                                      fontWeight: 700,
                                      letterSpacing: 0.3,
                                      bgcolor: alpha(theme.palette.error.main, 0.08),
                                      color: "error.dark",
                                      px: 0.75,
                                      py: 0.2,
                                      borderRadius: 999,
                                    }}
                                  >
                                    {expense.category}
                                  </Box>
                                )}
                              </Stack>
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" rowGap={0.5}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    fontSize: "0.7rem",
                                    fontFamily: '"Outfit", "Cairo", sans-serif',
                                    fontVariantNumeric: "tabular-nums",
                                  }}
                                >
                                  {dayjs(expense.date).format("YYYY/MM/DD")}
                                </Typography>
                                {expense.notes && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                    sx={{ fontSize: "0.7rem", opacity: 0.85, maxWidth: 160 }}
                                  >
                                    — {expense.notes}
                                  </Typography>
                                )}
                              </Stack>
                            </Box>

                            <Stack alignItems="flex-end" spacing={0.5} sx={{ ml: 1, flexShrink: 0 }}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={800}
                                color="error.main"
                                sx={{
                                  fontFamily: '"Outfit", "Cairo", sans-serif',
                                  fontSize: "0.98rem",
                                  fontVariantNumeric: "tabular-nums",
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                {formatCurrency(expense.amount)}
                              </Typography>
                              <Stack direction="row" spacing={0.5}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditExpense(expense);
                                    setExpensesListDialogOpen(false);
                                  }}
                                  sx={{
                                    p: 0.5,
                                    color: "text.secondary",
                                    transition: "transform 160ms ease-out, color 160ms ease-out",
                                    "&:active": { transform: "scale(0.94)" },
                                    "&:hover": {
                                      color: "primary.main",
                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    },
                                  }}
                                  aria-label="تعديل المصروف"
                                >
                                  <Edit sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteExpense(expense.id);
                                  }}
                                  sx={{
                                    p: 0.5,
                                    color: "text.secondary",
                                    transition: "transform 160ms ease-out, color 160ms ease-out",
                                    "&:active": { transform: "scale(0.94)" },
                                    "&:hover": {
                                      color: "error.main",
                                      bgcolor: alpha(theme.palette.error.main, 0.1),
                                    },
                                  }}
                                  aria-label="حذف المصروف"
                                >
                                  <Delete sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Stack>
                            </Stack>
                          </Box>
                        </motion.div>
                      </React.Fragment>
                    );
                  })}
                </Stack>
              );
            })()
          )}
        </Box>

        {clientExpenses.length > 0 && (
          <Box
            component="footer"
            sx={{
              flexShrink: 0,
              px: 2,
              pt: 1.5,
              pb: "max(16px, env(safe-area-inset-bottom, 0px))",
              bgcolor:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.background.paper, 0.92)
                  : theme.palette.background.paper,
              borderTop: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === "light" ? 1 : 0.2)}`,
              boxShadow:
                theme.palette.mode === "light"
                  ? "0 -10px 28px rgba(28,25,23,0.06)"
                  : "0 -8px 28px rgba(0,0,0,0.35)",
            }}
          >
            <Card
              sx={{
                borderRadius: 2.5,
                bgcolor: "transparent",
                border: "none",
                boxShadow: "none",
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      إجمالي المصروفات
                    </Typography>
                    <Typography variant="body1" fontWeight={800} sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatCurrency(summary.totalExpenses)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      النسبة المتفق عليها ({summary.profitPercentage}%)
                    </Typography>
                    <Typography variant="body1" fontWeight={800} color="warning.main" sx={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatCurrency(summary.profit)}
                    </Typography>
                  </Stack>

                  <Divider sx={{ borderStyle: "dashed" }} />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={900} color="text.primary">
                      المجموع الكلي
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={900}
                      color="error.main"
                      sx={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatCurrency(summary.totalExpenses + summary.profit)}
                    </Typography>
                  </Stack>
                </Stack>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  startIcon={<PictureAsPdf />}
                  onClick={async () => {
                    if (!client) return;
                    await downloadPdf(
                      <ExpensesStyledPDF client={client} expenses={clientExpenses} />,
                      `expenses-${client.name}.pdf`
                    );
                  }}
                  sx={{ borderRadius: 2, py: 1.5, fontWeight: 700 }}
                >
                  فتح PDF احترافي
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}
      </Dialog>

      {/* Payments List Dialog */}
      <Dialog
        open={paymentsListDialogOpen}
        onClose={() => setPaymentsListDialogOpen(false)}
        fullScreen
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: "background.default",
          },
        }}
      >
        <Box
          sx={{
            background: theme.palette.mode === "light"
              ? `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.3)} 0%, ${alpha(theme.palette.success.dark, 0.4)} 100%)`,
            color: theme.palette.mode === "light" ? "#fff" : theme.palette.success.light,
            px: 2,
            pt: "max(16px, env(safe-area-inset-top, 0px))",
            pb: 2,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1.5}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton
                onClick={() => setPaymentsListDialogOpen(false)}
                sx={{ color: "inherit", bgcolor: "rgba(255,255,255,0.12)", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}
              >
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h6" fontWeight={800} noWrap sx={{ letterSpacing: "-0.02em" }}>
                  المدفوعات
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: "0.7rem" }}>
                  {clientPayments.length} دفعة — {client.name}
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              onClick={() => {
                setEditingPayment(null);
                resetPayment({
                  amount: "" as any,
                  paymentMethod: "cash",
                  paymentDate: dayjs().format("YYYY-MM-DD"),
                  invoiceId: "",
                  notes: "",
                });
                setPaymentDialogOpen(true);
              }}
              sx={{
                bgcolor: "rgba(255,255,255,0.95)",
                color: theme.palette.success.dark,
                fontWeight: 700,
                "&:hover": { bgcolor: "rgba(255,255,255,0.85)", boxShadow: "none" },
                borderRadius: 2.5,
                boxShadow: "none",
                px: 2,
                py: 1,
                fontSize: "0.85rem",
              }}
              startIcon={<Add />}
            >
              إضافة
            </Button>
          </Stack>
        </Box>

        <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
          <TextField
            fullWidth
            placeholder="ابحث في المدفوعات..."
            value={paymentsSearchQuery}
            onChange={(e) => setPaymentsSearchQuery(e.target.value)}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
                borderRadius: 2.5,
                border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === "light" ? 1 : 0.3)}`,
                "& fieldset": { border: "none" },
                "&.Mui-focused": {
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.success.main, 0.1)}`,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "text.secondary", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", pb: 2 }}>
          {filteredPayments.length === 0 ? (
            <Container maxWidth="sm" sx={{ mt: -2 }}>
              <Card
                sx={{
                  borderRadius: 2.5,
                  textAlign: "center",
                  py: 6,
                  bgcolor: "background.paper",
                }}
              >
                <Payment
                  sx={{
                    fontSize: 60,
                    color: "text.secondary",
                    opacity: 0.3,
                    mb: 2,
                  }}
                />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  لا توجد مدفوعات
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Add />}
                  onClick={() => {
                    setEditingPayment(null);
                    resetPayment({
                      amount: "" as any,
                      paymentMethod: "cash",
                      paymentDate: dayjs().format("YYYY-MM-DD"),
                      invoiceId: "",
                      notes: "",
                    });
                    setPaymentDialogOpen(true);
                  }}
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  إضافة أول دفعة
                </Button>
              </Card>
            </Container>
          ) : (
            <Container maxWidth="sm" sx={{ mt: 1.5 }}>
              <Stack spacing={1.5}>
                {filteredPayments.map((payment, index) => {
                  const rowNum = clientPayments.indexOf(payment) + 1;
                  return (
                  <Box
                    key={payment.id}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      p: 1.5,
                      borderRadius: 2.5,
                      bgcolor: "background.paper",
                      border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === "light" ? 0.8 : 0.3)}`,
                      transition: "all 0.2s cubic-bezier(0.32,0.72,0,1)",
                      "&:hover": {
                        borderColor: alpha(theme.palette.success.main, 0.3),
                        boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.08)}`,
                      },
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: "success.main",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        fontFamily: '"Outfit", "Cairo", sans-serif',
                        flexShrink: 0,
                        mr: 1.5,
                        mt: 0.25,
                      }}
                    >
                      {rowNum}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={700} noWrap>
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" rowGap={0.5}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", fontFamily: '"Outfit", "Cairo", sans-serif' }}>
                          {dayjs(payment.paymentDate).format("YYYY/MM/DD")}
                        </Typography>
                        {payment.notes && (
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: "0.7rem", opacity: 0.8, maxWidth: 120 }}>
                            — {payment.notes}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                    <Stack alignItems="flex-end" spacing={0.5} sx={{ ml: 1, flexShrink: 0 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={800}
                        color="success.main"
                        sx={{
                          fontFamily: '"Outfit", "Cairo", sans-serif',
                          fontSize: "0.95rem",
                        }}
                      >
                        {formatCurrency(payment.amount)}
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditPayment(payment);
                            setPaymentsListDialogOpen(false);
                          }}
                          sx={{ p: 0.5, color: "text.secondary", "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
                        >
                          <Edit sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeletePayment(payment.id);
                          }}
                          sx={{ p: 0.5, color: "text.secondary", "&:hover": { color: "error.main", bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                        >
                          <Delete sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                  );
                })}

                {/* Total Summary */}
                <Card
                  sx={{
                    borderRadius: 2.5,
                    bgcolor: "background.paper",
                    border:
                      theme.palette.mode === "dark"
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(0,0,0,0.12)",
                    boxShadow:
                      theme.palette.mode === "light"
                        ? "0 2px 8px rgba(0,0,0,0.06)"
                        : "0 2px 8px rgba(0,0,0,0.3)",
                    mt: 2,
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1.5 }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight={900}
                        color="text.primary"
                      >
                        المجموع الكلي
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight={900}
                        color="success.main"
                      >
                        {formatCurrency(
                          clientPayments.reduce((sum, p) => sum + p.amount, 0)
                        )}
                      </Typography>
                    </Stack>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={<PictureAsPdf />}
                      onClick={async () => {
                        if (!client) return;
                        await downloadPdf(
                          <PaymentsStyledPDF client={client} payments={clientPayments} />,
                          `payments-${client.name}.pdf`
                        );
                      }}
                      sx={{ borderRadius: 2, py: 1.5, fontWeight: 700 }}
                    >
                      فتح PDF احترافي
                    </Button>
                  </CardContent>
                </Card>
              </Stack>
            </Container>
          )}
        </Box>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog
        open={expenseDialogOpen}
        onClose={() => {
          setExpenseDialogOpen(false);
          setEditingExpense(null);
        }}
        fullScreen
      >
        <form onSubmit={handleExpenseSubmit(onSubmitExpense)}>
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              p: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => {
                  setExpenseDialogOpen(false);
                  setEditingExpense(null);
                }}
                sx={{ color: "white" }}
              >
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" fontWeight={700}>
                {editingExpense ? "تعديل مصروف" : "إضافة مصروف"}
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ p: 3.5 }}>
            <Stack spacing={3.5}>
              <Controller
                name="description"
                control={expenseControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="الوصف"
                    placeholder="مثال: شراء إسمنت"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="amount"
                control={expenseControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="المبلغ"
                    type="number"
                    placeholder="أدخل المبلغ"
                    value={
                      field.value === 0 || field.value === "" ? "" : field.value
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : value);
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="category"
                control={expenseControl}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>الفئة</InputLabel>
                    <Select {...field} label="الفئة" sx={{ borderRadius: 2 }}>
                      <MenuItem value="مواد">🧱 مواد بناء</MenuItem>
                      <MenuItem value="إسمنت">⚫ إسمنت</MenuItem>
                      <MenuItem value="حديد">🔩 حديد</MenuItem>
                      <MenuItem value="رمل">🏖️ رمل وزلط</MenuItem>
                      <MenuItem value="عمالة">👷 عمالة</MenuItem>
                      <MenuItem value="معدات">⚙️ معدات</MenuItem>
                      <MenuItem value="نقل">🚚 نقل</MenuItem>
                      <MenuItem value="وقود">⛽ وقود</MenuItem>
                      <MenuItem value="كهرباء">💡 كهرباء</MenuItem>
                      <MenuItem value="ماء">💧 ماء</MenuItem>
                      <MenuItem value="أخرى">📋 أخرى</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="date"
                control={expenseControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="التاريخ"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="notes"
                control={expenseControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="ملاحظات"
                    multiline
                    rows={3}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                onClick={() => {
                  setExpenseDialogOpen(false);
                  setEditingExpense(null);
                }}
                fullWidth
                size="large"
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                {editingExpense ? "حفظ" : "إضافة"}
              </Button>
            </Stack>
          </Box>
        </form>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => {
          setPaymentDialogOpen(false);
          setEditingPayment(null);
        }}
        fullScreen
      >
        <form onSubmit={handlePaymentSubmit(onSubmitPayment)}>
          <Box
            sx={{
              bgcolor: "success.main",
              color: "success.contrastText",
              p: 2,
              borderBottom: `1px solid ${alpha(theme.palette.success.dark, 0.22)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => {
                  setPaymentDialogOpen(false);
                  setEditingPayment(null);
                }}
                sx={{ color: "inherit" }}
              >
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" fontWeight={700}>
                {editingPayment ? "تعديل دفعة" : "إضافة دفعة جديدة"}
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ p: 3.5 }}>
            <Stack spacing={3.5}>
              <Controller
                name="invoiceId"
                control={paymentControl}
                render={({ field }) => {
                  const clientInvoices = invoices.filter(
                    (inv) => inv.clientId === clientId && inv.status !== "paid"
                  );

                  return (
                    <FormControl fullWidth>
                      <InputLabel>الفاتورة (اختياري)</InputLabel>
                      <Select
                        {...field}
                        value={field.value || ""}
                        label="الفاتورة (اختياري)"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">بدون فاتورة</MenuItem>
                        {clientInvoices.map((invoice) => (
                          <MenuItem key={invoice.id} value={invoice.id}>
                            {invoice.invoiceNumber} -{" "}
                            {formatCurrency(invoice.total)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                }}
              />

              <Controller
                name="amount"
                control={paymentControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="المبلغ"
                    type="number"
                    placeholder="أدخل المبلغ"
                    value={
                      field.value === 0 || field.value === "" ? "" : field.value
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : value);
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="paymentMethod"
                control={paymentControl}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>طريقة الدفع</InputLabel>
                    <Select
                      {...field}
                      label="طريقة الدفع"
                      sx={{ borderRadius: 2 }}
                    >
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
                control={paymentControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="تاريخ الدفع"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="notes"
                control={paymentControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="ملاحظات"
                    multiline
                    rows={3}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                onClick={() => {
                  setPaymentDialogOpen(false);
                  setEditingPayment(null);
                }}
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
                {editingPayment ? "حفظ" : "إضافة"}
              </Button>
            </Stack>
          </Box>
        </form>
      </Dialog>

      {/* Debt Dialog */}
      <Dialog
        open={debtDialogOpen}
        onClose={() => {
          setDebtDialogOpen(false);
          setEditingDebt(null);
        }}
        fullScreen
      >
        <form onSubmit={handleDebtSubmit(onSubmitDebt)}>
          <Box
            sx={{
              bgcolor: "warning.main",
              color: "warning.contrastText",
              p: 2,
              borderBottom: `1px solid ${alpha(theme.palette.warning.dark, 0.22)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => {
                  setDebtDialogOpen(false);
                  setEditingDebt(null);
                }}
                sx={{ color: "inherit" }}
              >
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" fontWeight={700}>
                {editingDebt ? "تعديل دين" : "إضافة دين جديد"}
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ p: 3.5 }}>
            <Stack spacing={3.5}>
              <Controller
                name="partyType"
                control={debtControl}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>نوع الطرف</InputLabel>
                    <Select
                      {...field}
                      label="نوع الطرف"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="person">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Person sx={{ fontSize: 18 }} />
                          <Typography>شخص</Typography>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="shop">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Store sx={{ fontSize: 18 }} />
                          <Typography>محل</Typography>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="company">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Business sx={{ fontSize: 18 }} />
                          <Typography>شركة</Typography>
                        </Stack>
                      </MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="partyName"
                control={debtControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="اسم الشخص/المحل/الشركة"
                    placeholder="مثال: محمد أحمد، محل الأجهزة، شركة البناء"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="description"
                control={debtControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="وصف الدين"
                    placeholder="مثال: دين على مواد بناء"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="amount"
                control={debtControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="المبلغ"
                    type="number"
                    placeholder="أدخل المبلغ"
                    value={
                      field.value === 0 || field.value === "" ? "" : field.value
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : value);
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="date"
                control={debtControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="تاريخ الدين"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="notes"
                control={debtControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="ملاحظات"
                    multiline
                    rows={3}
                    placeholder="أي ملاحظات إضافية..."
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                onClick={() => {
                  setDebtDialogOpen(false);
                  setEditingDebt(null);
                }}
                fullWidth
                size="large"
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="warning"
                fullWidth
                size="large"
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                {editingDebt ? "حفظ" : "إضافة"}
              </Button>
            </Stack>
          </Box>
        </form>
      </Dialog>

      {/* Debts List Dialog */}
      <Dialog
        open={debtsListDialogOpen}
        onClose={() => setDebtsListDialogOpen(false)}
        fullScreen
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: "background.default",
          },
        }}
      >
        <Box
          sx={{
            bgcolor: "warning.main",
            color: "warning.contrastText",
            p: 2,
            borderBottom: `1px solid ${alpha(theme.palette.warning.dark, 0.22)}`,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => setDebtsListDialogOpen(false)}
                sx={{ color: "inherit" }}
              >
                <ArrowBack />
              </IconButton>
              <Typography variant="h5" fontWeight={800} sx={{ flexGrow: 1 }}>
                الديون ({filteredParties.length})
              </Typography>
            </Stack>
            <Button
              variant="contained"
              onClick={handleAddParty}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                fontWeight: 700,
                "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                borderRadius: 2,
              }}
              startIcon={<Add />}
            >
              إضافة
            </Button>
          </Stack>
        </Box>

        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <TextField
            fullWidth
            placeholder="ابحث في الديون..."
            value={debtsSearchQuery}
            onChange={(e) => setDebtsSearchQuery(e.target.value)}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
                borderRadius: 2,
                "& fieldset": { border: "none" },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", pb: 2 }}>
          {filteredParties.length === 0 ? (
            <Container
              maxWidth="sm"
              sx={{ mt: { xs: 4, sm: 6 }, px: { xs: 1.5, sm: 2 } }}
            >
              <Card
                sx={{
                  borderRadius: 2.5,
                  textAlign: "center",
                  py: 6,
                  bgcolor: "background.paper",
                  border:
                    theme.palette.mode === "dark"
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 3, fontWeight: 600 }}
                >
                  لا توجد ديون
                </Typography>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<Add />}
                  onClick={() => {
                    setEditingDebt(null);
                    resetDebt({
                      partyType: "person",
                      partyName: "",
                      description: "",
                      amount: "" as any,
                      date: dayjs().format("YYYY-MM-DD"),
                      notes: "",
                    });
                    setDebtDialogOpen(true);
                  }}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 700,
                  }}
                >
                  أضف أول دين
                </Button>
              </Card>
            </Container>
          ) : (
            <Container
              maxWidth="sm"
              sx={{ mt: { xs: 1.5, sm: 2 }, px: { xs: 1.5, sm: 2 } }}
            >
              <Stack spacing={{ xs: 2, sm: 2.5 }}>
                {filteredParties.map((party, index) => (
                  <Card
                    key={`${party.type}_${party.name}_${index}`}
                    onClick={() => handleOpenPartyProfile(party)}
                    sx={{
                      borderRadius: { xs: 2.5, sm: 3 },
                      boxShadow:
                        theme.palette.mode === "light"
                          ? "0 2px 12px rgba(0,0,0,0.06)"
                          : "0 2px 12px rgba(0,0,0,0.3)",
                      bgcolor: "background.paper",
                      border:
                        theme.palette.mode === "dark"
                          ? "1px solid rgba(255,255,255,0.08)"
                          : "1px solid rgba(0,0,0,0.05)",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      "&:active": {
                        transform: "scale(0.98)",
                      },
                      "@media (hover: hover)": {
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow:
                            theme.palette.mode === "light"
                              ? "0 8px 24px rgba(0,0,0,0.12)"
                              : "0 8px 24px rgba(0,0,0,0.4)",
                        },
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 2.5, sm: 3 },
                        "&:last-child": { pb: { xs: 2.5, sm: 3 } },
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        spacing={2}
                      >
                        <Avatar
                          sx={{
                            bgcolor:
                              party.type === "company"
                                ? "primary.light"
                                : party.type === "shop"
                                ? "secondary.light"
                                : "warning.light",
                            width: { xs: 52, sm: 56 },
                            height: { xs: 52, sm: 56 },
                            flexShrink: 0,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        >
                          {party.type === "company" ? (
                            <Business
                              sx={{
                                color: "primary.main",
                                fontSize: { xs: 24, sm: 28 },
                              }}
                            />
                          ) : party.type === "shop" ? (
                            <Store
                              sx={{
                                color: "secondary.main",
                                fontSize: { xs: 24, sm: 28 },
                              }}
                            />
                          ) : (
                            <Person
                              sx={{
                                color: "warning.main",
                                fontSize: { xs: 24, sm: 28 },
                              }}
                            />
                          )}
                        </Avatar>

                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={{ xs: 1, sm: 1.5 }}
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            sx={{ mb: 2 }}
                            flexWrap="wrap"
                          >
                            <Chip
                              icon={
                                party.type === "company" ? (
                                  <Business sx={{ fontSize: 14 }} />
                                ) : party.type === "shop" ? (
                                  <Store sx={{ fontSize: 14 }} />
                                ) : (
                                  <Person sx={{ fontSize: 14 }} />
                                )
                              }
                              label={
                                party.type === "company"
                                  ? "شركة"
                                  : party.type === "shop"
                                  ? "محل"
                                  : "شخص"
                              }
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{
                                height: 24,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}
                            />
                            <Typography
                              variant="h6"
                              fontWeight={800}
                              sx={{
                                fontSize: { xs: "1rem", sm: "1.25rem" },
                                wordBreak: "break-word",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {party.name}
                            </Typography>
                            <Chip
                              label={`${party.debts.length} دين`}
                              size="small"
                              color="info"
                              sx={{ height: 22, fontSize: "0.7rem" }}
                            />
                          </Stack>

                          <Grid
                            container
                            spacing={{ xs: 1.5, sm: 2 }}
                            sx={{ mt: { xs: 1, sm: 1.5 } }}
                          >
                            <Grid size={{ xs: 4 }}>
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  sx={{
                                    mb: 0.5,
                                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                  }}
                                >
                                  إجمالي الدين
                                </Typography>
                                <Typography
                                  variant="body1"
                                  fontWeight={800}
                                  color="primary.main"
                                  sx={{
                                    fontSize: { xs: "0.875rem", sm: "1rem" },
                                  }}
                                >
                                  {formatCurrency(party.totalAmount)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  sx={{
                                    mb: 0.5,
                                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                  }}
                                >
                                  المدفوع
                                </Typography>
                                <Typography
                                  variant="body1"
                                  fontWeight={800}
                                  color="success.main"
                                  sx={{
                                    fontSize: { xs: "0.875rem", sm: "1rem" },
                                  }}
                                >
                                  {formatCurrency(party.totalPaid)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  sx={{
                                    mb: 0.5,
                                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                  }}
                                >
                                  المتبقي
                                </Typography>
                                <Typography
                                  variant="body1"
                                  fontWeight={800}
                                  color="warning.main"
                                  sx={{
                                    fontSize: { xs: "0.875rem", sm: "1rem" },
                                  }}
                                >
                                  {formatCurrency(party.totalRemaining)}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>

                        <Box
                          sx={{
                            flexShrink: 0,
                            display: { xs: "none", sm: "block" },
                          }}
                        >
                          <ChevronLeft
                            sx={{ color: "text.secondary", fontSize: 28 }}
                          />
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>

              {/* Total Summary */}
              <Card
                sx={{
                  mt: 3,
                  mb: 2,
                  borderRadius: 2.5,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(245, 158, 11, 0.1)",
                  border: `2px solid ${theme.palette.warning.main}`,
                }}
              >
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    إجمالي الديون
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    color="warning.main"
                  >
                    {formatCurrency(
                      clientDebts.reduce((sum, d) => sum + d.remainingAmount, 0)
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Container>
          )}
        </Box>
      </Dialog>

      {/* Pay Debt Dialog */}
      <Dialog
        open={payDebtDialogOpen}
        onClose={() => {
          setPayDebtDialogOpen(false);
          setSelectedDebtForPay(null);
          setPayDebtAmount("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            دفع جزء من الدين
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedDebtForPay && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Chip
                  icon={
                    ((selectedDebtForPay as any).partyType || "person") ===
                    "company" ? (
                      <Business sx={{ fontSize: 14 }} />
                    ) : ((selectedDebtForPay as any).partyType || "person") ===
                      "shop" ? (
                      <Store sx={{ fontSize: 14 }} />
                    ) : (
                      <Person sx={{ fontSize: 14 }} />
                    )
                  }
                  label={
                    ((selectedDebtForPay as any).partyType || "person") ===
                    "company"
                      ? "شركة"
                      : ((selectedDebtForPay as any).partyType || "person") ===
                        "shop"
                      ? "محل"
                      : "شخص"
                  }
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="body1" fontWeight={700}>
                  {(selectedDebtForPay as any).partyName || "غير محدد"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  الوصف: {selectedDebtForPay.description}
                </Typography>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                المبلغ الكلي: {formatCurrency(selectedDebtForPay.amount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                المدفوع: {formatCurrency(selectedDebtForPay.paidAmount)}
              </Typography>
              <Typography variant="body2" fontWeight={700} color="warning.main">
                المتبقي: {formatCurrency(selectedDebtForPay.remainingAmount)}
              </Typography>
              <TextField
                fullWidth
                label="المبلغ المدفوع"
                type="number"
                value={payDebtAmount}
                onChange={(e) => setPayDebtAmount(e.target.value)}
                placeholder={`أقصى مبلغ: ${formatCurrency(
                  selectedDebtForPay.remainingAmount
                )}`}
                inputProps={{
                  max: selectedDebtForPay.remainingAmount,
                  min: 0,
                }}
                sx={{ mt: 2 }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => {
              setPayDebtDialogOpen(false);
              setSelectedDebtForPay(null);
              setPayDebtAmount("");
            }}
            sx={{ borderRadius: 2 }}
          >
            إلغاء
          </Button>
          <Button
            onClick={handlePayDebt}
            variant="contained"
            color="success"
            sx={{ borderRadius: 2 }}
          >
            دفع
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Party Dialog */}
      <Dialog
        open={partyDialogOpen}
        onClose={() => {
          setPartyDialogOpen(false);
          setEditingParty(null);
          resetParty({
            name: "",
            phone: "",
            address: "",
            type: "person",
          });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            {editingParty ? "تعديل البروفايل" : "إضافة بروفايل جديد"}
          </Typography>
        </DialogTitle>
        <form onSubmit={handlePartySubmit(onSubmitParty)}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Controller
                name="type"
                control={partyControl}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>نوع البروفايل</InputLabel>
                    <Select
                      {...field}
                      label="نوع البروفايل"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="person">شخص</MenuItem>
                      <MenuItem value="shop">محل</MenuItem>
                      <MenuItem value="company">شركة</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="name"
                control={partyControl}
                rules={{ required: "الاسم مطلوب" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="الاسم"
                    required
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="phone"
                control={partyControl}
                rules={{ required: "رقم الهاتف مطلوب" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="رقم الهاتف"
                    required
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="address"
                control={partyControl}
                rules={{ required: "العنوان مطلوب" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="العنوان"
                    required
                    multiline
                    rows={2}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button
              onClick={() => {
                setPartyDialogOpen(false);
                setEditingParty(null);
                resetParty({
                  name: "",
                  phone: "",
                  address: "",
                  type: "person",
                });
              }}
              sx={{ borderRadius: 2 }}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ borderRadius: 2 }}
            >
              {editingParty ? "حفظ" : "إضافة"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Party Profile Dialog */}
      <Dialog
        open={partyProfileDialogOpen}
        onClose={() => {
          setPartyProfileDialogOpen(false);
          setSelectedParty(null);
        }}
        fullScreen
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: "background.default",
          },
        }}
      >
        <Box
          sx={{
            bgcolor: "warning.main",
            color: "warning.contrastText",
            p: 2,
            borderBottom: `1px solid ${alpha(theme.palette.warning.dark, 0.22)}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              onClick={() => {
                setPartyProfileDialogOpen(false);
                setSelectedParty(null);
              }}
              sx={{ color: "inherit" }}
            >
              <ArrowBack />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                {selectedParty?.type === "company" ? (
                  <Business sx={{ fontSize: 28 }} />
                ) : selectedParty?.type === "shop" ? (
                  <Store sx={{ fontSize: 28 }} />
                ) : (
                  <Person sx={{ fontSize: 28 }} />
                )}
                <Typography variant="h5" fontWeight={800}>
                  {selectedParty?.name}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                {selectedParty?.type === "company"
                  ? "شركة"
                  : selectedParty?.type === "shop"
                  ? "محل"
                  : "شخص"}
              </Typography>
            </Box>
          </Stack>

          {/* Stats Cards */}
          <Grid
            container
            spacing={{ xs: 1.5, sm: 2 }}
            sx={{ mt: { xs: 1.5, sm: 2 }, px: { xs: 0.5, sm: 0 } }}
          >
            <Grid size={{ xs: 4 }}>
              <Card
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: { xs: 1.5, sm: 2 },
                  color: "white",
                  height: "100%",
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    textAlign: "center",
                    "&:last-child": { pb: { xs: 1.5, sm: 2 } },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: "0.65rem", sm: "0.7rem" },
                      display: "block",
                    }}
                  >
                    إجمالي الدين
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{
                      mt: 0.5,
                      fontSize: { xs: "0.875rem", sm: "1.25rem" },
                    }}
                  >
                    {formatCurrency(partyStats.totalAmount)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Card
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: { xs: 1.5, sm: 2 },
                  color: "white",
                  height: "100%",
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    textAlign: "center",
                    "&:last-child": { pb: { xs: 1.5, sm: 2 } },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: "0.65rem", sm: "0.7rem" },
                      display: "block",
                    }}
                  >
                    المدفوع
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{
                      mt: 0.5,
                      fontSize: { xs: "0.875rem", sm: "1.25rem" },
                    }}
                  >
                    {formatCurrency(partyStats.totalPaid)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Card
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: { xs: 1.5, sm: 2 },
                  color: "white",
                  height: "100%",
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    textAlign: "center",
                    "&:last-child": { pb: { xs: 1.5, sm: 2 } },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: "0.65rem", sm: "0.7rem" },
                      display: "block",
                    }}
                  >
                    المتبقي
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{
                      mt: 0.5,
                      fontSize: { xs: "0.875rem", sm: "1.25rem" },
                    }}
                  >
                    {formatCurrency(partyStats.totalRemaining)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box
            sx={{
              mt: { xs: 1.5, sm: 2 },
              px: { xs: 1.5, sm: 2 },
              pb: { xs: 1, sm: 1.5 },
            }}
          >
            <Stack spacing={{ xs: 1.2, sm: 1.5 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<Add />}
                onClick={() => {
                  if (selectedParty) {
                    setEditingDebt(null);
                    resetDebt({
                      partyType: selectedParty.type,
                      partyName: selectedParty.name,
                      description: "",
                      amount: "" as any,
                      date: dayjs().format("YYYY-MM-DD"),
                      notes: "",
                    });
                    setDebtDialogOpen(true);
                    setPartyProfileDialogOpen(false);
                  }
                }}
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  fontWeight: 700,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                  "&:active": { transform: "scale(0.98)" },
                  borderRadius: { xs: 1.5, sm: 2 },
                  py: { xs: 1.2, sm: 1.5 },
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                إضافة دين جديد
              </Button>
              {partyStats.totalRemaining > 0 && (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<Payment />}
                  onClick={() => {
                    // Create a virtual debt for the entire party
                    const virtualDebt: StandaloneDebt = {
                      id: `party_${selectedParty?.id}`,
                      clientId: clientId!,
                      partyId: selectedParty?.id || "",
                      partyName: selectedParty?.name || "",
                      partyType: selectedParty?.type || "person",
                      description: `إجمالي ديون ${selectedParty?.name}`,
                      amount: partyStats.totalAmount,
                      paidAmount: partyStats.totalPaid,
                      remainingAmount: partyStats.totalRemaining,
                      status: partyStats.totalRemaining > 0 ? "active" : "paid",
                      date: dayjs().format("YYYY-MM-DD"),
                      createdAt: "",
                      updatedAt: "",
                    };
                    setSelectedDebtForPay(virtualDebt);
                    setPayDebtAmount("");
                    setPayDebtDialogOpen(true);
                  }}
                  sx={{
                    bgcolor: "white",
                    color: "warning.main",
                    fontWeight: 700,
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                    "&:active": { transform: "scale(0.98)" },
                    borderRadius: { xs: 1.5, sm: 2 },
                    py: { xs: 1.2, sm: 1.5 },
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <Box
                    component="span"
                    sx={{ display: { xs: "none", sm: "inline" } }}
                  >
                    دفع من إجمالي الدين (
                    {formatCurrency(partyStats.totalRemaining)})
                  </Box>
                  <Box
                    component="span"
                    sx={{ display: { xs: "inline", sm: "none" } }}
                  >
                    دفع ({formatCurrency(partyStats.totalRemaining)})
                  </Box>
                </Button>
              )}
            </Stack>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", pb: { xs: 2, sm: 3 } }}>
          <Container
            maxWidth="sm"
            sx={{ mt: { xs: 1.5, sm: 2 }, px: { xs: 1.5, sm: 2 } }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                mb: { xs: 1.5, sm: 2 },
                px: 0.5,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              سجل الديون ({partyDebts.length})
            </Typography>

            {partyDebts.length === 0 ? (
              <Card
                sx={{
                  borderRadius: { xs: 2, sm: 2.5 },
                  textAlign: "center",
                  py: { xs: 5, sm: 6 },
                  bgcolor: "background.paper",
                }}
              >
                <CreditCard
                  sx={{
                    fontSize: { xs: 50, sm: 60 },
                    color: "text.secondary",
                    opacity: 0.3,
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1.25rem" } }}
                >
                  لا توجد ديون
                </Typography>
              </Card>
            ) : (
              <Stack spacing={{ xs: 2, sm: 2.5 }}>
                {partyDebts.map((debt) => (
                  <Card
                    key={debt.id}
                    sx={{
                      borderRadius: { xs: 2, sm: 2.5 },
                      boxShadow:
                        theme.palette.mode === "light"
                          ? "0 2px 8px rgba(0,0,0,0.06)"
                          : "0 2px 8px rgba(0,0,0,0.3)",
                      bgcolor: "background.paper",
                      border:
                        theme.palette.mode === "dark"
                          ? "1px solid rgba(255,255,255,0.1)"
                          : "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 2, sm: 2.5 },
                        "&:last-child": { pb: { xs: 2, sm: 2.5 } },
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        spacing={{ xs: 1.5, sm: 2 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "warning.light",
                            width: { xs: 44, sm: 48 },
                            height: { xs: 44, sm: 48 },
                            flexShrink: 0,
                          }}
                        >
                          <CreditCard
                            sx={{
                              color: "warning.main",
                              fontSize: { xs: 18, sm: 20 },
                            }}
                          />
                        </Avatar>

                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={{ xs: 0.75, sm: 1.5 }}
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            sx={{ mb: { xs: 1, sm: 1.25 } }}
                            flexWrap="wrap"
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                wordBreak: "break-word",
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              {debt.description}
                            </Typography>
                            <Chip
                              label={debt.status === "paid" ? "مدفوع" : "نشط"}
                              size="small"
                              color={
                                debt.status === "paid" ? "success" : "warning"
                              }
                              sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                flexShrink: 0,
                              }}
                            />
                          </Stack>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{
                              mb: { xs: 1, sm: 1.25 },
                              fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            }}
                          >
                            {dayjs(debt.date).format("DD/MM/YYYY")}
                          </Typography>

                          {debt.notes && (
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="flex-start"
                              sx={{
                                mb: 1,
                                px: 1.25,
                                py: 1,
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.warning.main, 0.1),
                              }}
                            >
                              <ChatBubbleOutline
                                sx={{ fontSize: 18, color: "warning.dark", mt: "2px", opacity: 0.9 }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontStyle: "italic", lineHeight: 1.65 }}
                              >
                                {debt.notes}
                              </Typography>
                            </Stack>
                          )}

                          <Typography
                            variant="h6"
                            fontWeight={800}
                            color="primary.main"
                            sx={{
                              fontSize: { xs: "1rem", sm: "1.25rem" },
                              mb: { xs: 1, sm: 0 },
                            }}
                          >
                            {formatCurrency(debt.amount)}
                          </Typography>
                        </Box>

                        <Stack
                          direction="row"
                          spacing={{ xs: 1, sm: 1.5 }}
                          sx={{
                            flexShrink: 0,
                            alignSelf: { xs: "flex-start", sm: "center" },
                          }}
                        >
                          {debt.remainingAmount > 0 && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleOpenPayDebtDialog(debt);
                              }}
                              sx={{
                                bgcolor: "success.main",
                                color: "white",
                                width: { xs: 36, sm: 32 },
                                height: { xs: 36, sm: 32 },
                                "&:hover": { bgcolor: "success.dark" },
                                "&:active": { transform: "scale(0.9)" },
                              }}
                            >
                              <Payment sx={{ fontSize: { xs: 18, sm: 16 } }} />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEditDebt(debt);
                              setPartyProfileDialogOpen(false);
                            }}
                            sx={{
                              bgcolor: "primary.main",
                              color: "white",
                              width: { xs: 36, sm: 32 },
                              height: { xs: 36, sm: 32 },
                              "&:hover": { bgcolor: "primary.dark" },
                              "&:active": { transform: "scale(0.9)" },
                            }}
                          >
                            <Edit sx={{ fontSize: { xs: 18, sm: 16 } }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteDebt(debt.id);
                            }}
                            sx={{
                              bgcolor: "error.main",
                              color: "white",
                              width: { xs: 36, sm: 32 },
                              height: { xs: 36, sm: 32 },
                              "&:hover": { bgcolor: "error.dark" },
                              "&:active": { transform: "scale(0.9)" },
                            }}
                          >
                            <Delete sx={{ fontSize: { xs: 18, sm: 16 } }} />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Container>
        </Box>
      </Dialog>

      {/* Profit Calculation Dialog */}
      <Dialog
        open={profitDialogOpen}
        onClose={() => setProfitDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "secondary.main",
            color: "secondary.contrastText",
            fontWeight: 800,
            py: 2.5,
            borderBottom: `1px solid ${alpha(theme.palette.secondary.dark, 0.2)}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <TrendingUp sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={800}>
              النسبة المتفق عليها
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                أدخل النسبة المتفق عليها من المصروفات (مثال: 10)
              </Typography>
              <TextField
                fullWidth
                label="النسبة المئوية (%)"
                type="number"
                value={profitPercentage}
                onChange={(e) => setProfitPercentage(e.target.value)}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
            {profitPercentage && !isNaN(parseFloat(profitPercentage)) && (
              <Card
                sx={{
                  bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === "light" ? 0.08 : 0.15),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.35)}`,
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي المصروفات للعميل ({client?.name}):
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    color="primary.main"
                  >
                    {formatCurrency(
                      clientExpenses.reduce((sum, exp) => sum + exp.amount, 0)
                    )}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ opacity: 0.8 }}
                  >
                    عدد المصروفات: {clientExpenses.length}
                  </Typography>
                  <Divider />
                  <Typography variant="body2" color="text.secondary">
                    النسبة المئوية: {profitPercentage}%
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    color="success.main"
                  >
                    قيمة النسبة المتفق عليها:{" "}
                    {formatCurrency(
                      (clientExpenses.reduce(
                        (sum, exp) => sum + exp.amount,
                        0
                      ) *
                        parseFloat(profitPercentage)) /
                        100
                    )}
                  </Typography>
                </Stack>
              </Card>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={() => setProfitDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSaveProfitPercentage}
            variant="contained"
            sx={{
              borderRadius: 2,
              bgcolor: "#8b5cf6",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            حفظ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog
        open={editClientDialogOpen}
        onClose={() => setEditClientDialogOpen(false)}
        fullScreen
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: "background.default",
          },
        }}
      >
        <form onSubmit={handleClientSubmit(onSubmitClient)}>
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              p: 2,
              borderBottom: `1px solid ${alpha(theme.palette.primary.dark, 0.22)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => setEditClientDialogOpen(false)}
                sx={{ color: "inherit" }}
              >
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" fontWeight={700}>
                تعديل بيانات العميل
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ p: 3.5 }}>
            <Stack spacing={3}>
              <Controller
                name="name"
                control={clientControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="الاسم"
                    error={!!clientErrors.name}
                    helperText={clientErrors.name?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="type"
                control={clientControl}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>النوع</InputLabel>
                    <Select {...field} label="النوع" sx={{ borderRadius: 2 }}>
                      <MenuItem value="individual">فرد</MenuItem>
                      <MenuItem value="company">شركة</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="phone"
                control={clientControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="رقم الهاتف"
                    error={!!clientErrors.phone}
                    helperText={clientErrors.phone?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="email"
                control={clientControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="البريد الإلكتروني"
                    type="email"
                    error={!!clientErrors.email}
                    helperText={clientErrors.email?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="address"
                control={clientControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="العنوان"
                    multiline
                    rows={3}
                    error={!!clientErrors.address}
                    helperText={clientErrors.address?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 5 }}>
              <Button
                onClick={() => setEditClientDialogOpen(false)}
                fullWidth
                size="large"
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                حفظ التعديلات
              </Button>
            </Stack>
          </Box>
        </form>
      </Dialog>

      <Dialog
        open={workersListDialogOpen}
        onClose={() => setWorkersListDialogOpen(false)}
        fullScreen
        sx={{
          "& .MuiDialog-paper": { bgcolor: "background.default" },
        }}
      >
        <Box
          sx={{
            bgcolor: "info.main",
            color: "info.contrastText",
            p: 2,
            borderBottom: `1px solid ${alpha(theme.palette.info.dark, 0.22)}`,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton onClick={() => setWorkersListDialogOpen(false)} sx={{ color: "inherit" }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h5" fontWeight={800}>
                العمال ({clientWorkers.length})
              </Typography>
            </Stack>
            <Button
              variant="contained"
              onClick={openCreateWorkerDialog}
              startIcon={<Add />}
              sx={{
                bgcolor: "background.paper",
                color: "info.dark",
                boxShadow: "none",
                "&:hover": { bgcolor: alpha("#fcfbfa", 0.94) },
              }}
            >
              عامل جديد
            </Button>
          </Stack>
        </Box>

        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            value={workersSearchQuery}
            onChange={(e) => setWorkersSearchQuery(e.target.value)}
            placeholder="ابحث باسم العامل أو الدور أو الهاتف..."
          />
        </Box>

        <Container maxWidth="sm" sx={{ pb: 3 }}>
          <Stack spacing={2}>
            {filteredWorkers.length === 0 ? (
              <Card sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">لا يوجد عمال لهذا العميل</Typography>
              </Card>
            ) : (
              filteredWorkers.map((worker) => (
                <Card key={worker.id} sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6" fontWeight={800}>
                          {worker.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {worker.role}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {worker.phone}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 700, color: "info.main" }}>
                          اليومية: {formatCurrency(worker.dailyRate)}
                        </Typography>
                        {!!worker.notes && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            {worker.notes}
                          </Typography>
                        )}
                      </Box>
                      <Stack alignItems="flex-end" spacing={1}>
                        <Chip
                          size="small"
                          label={worker.isActive ? "نشط" : "غير نشط"}
                          color={worker.isActive ? "success" : "default"}
                        />
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" onClick={() => openEditWorkerDialog(worker)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteWorker(worker)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </Container>
      </Dialog>

      <Dialog open={workerDialogOpen} onClose={() => setWorkerDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingWorker ? "تعديل بيانات عامل" : "إضافة عامل جديد"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="اسم العامل"
              value={workerForm.fullName}
              onChange={(e) => setWorkerForm((prev) => ({ ...prev, fullName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="الهاتف"
              value={workerForm.phone}
              onChange={(e) => setWorkerForm((prev) => ({ ...prev, phone: e.target.value }))}
              fullWidth
            />
            <TextField
              label="الدور"
              value={workerForm.role}
              onChange={(e) => setWorkerForm((prev) => ({ ...prev, role: e.target.value }))}
              fullWidth
            />
            <TextField
              label="الأجر اليومي"
              type="number"
              value={workerForm.dailyRate}
              onChange={(e) => setWorkerForm((prev) => ({ ...prev, dailyRate: e.target.value }))}
              fullWidth
            />
            <TextField
              label="ملاحظات"
              value={workerForm.notes}
              onChange={(e) => setWorkerForm((prev) => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={2}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>الحالة</InputLabel>
              <Select
                label="الحالة"
                value={workerForm.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  setWorkerForm((prev) => ({ ...prev, isActive: e.target.value === "active" }))
                }
              >
                <MenuItem value="active">نشط</MenuItem>
                <MenuItem value="inactive">غير نشط</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkerDialogOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={saveWorker}>
            حفظ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for success message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
