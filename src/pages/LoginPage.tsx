import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, Login as LoginIcon } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error, clearError, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.email, data.password);
      navigate("/");
    } catch {
      // handled in store
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: { xs: 'calc(2rem + env(safe-area-inset-top))', md: 6 },
        pb: { xs: 'calc(2rem + env(safe-area-inset-bottom))', md: 6 },
        position: "relative",
        bgcolor: "#edece8",
        backgroundImage:
          "radial-gradient(ellipse 120% 80% at 100% 0%, rgba(15,118,110,0.14) 0%, transparent 55%), radial-gradient(ellipse 100% 60% at 0% 100%, rgba(87,83,78,0.06) 0%, transparent 50%)",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: "22px",
            border: "1px solid",
            borderColor: alpha("#1c1917", 0.08),
            bgcolor: alpha("#fdfcfa", 0.96),
            boxShadow:
              "0 4px 6px rgba(28,25,23,0.03), 0 24px 48px rgba(28,25,23,0.08)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ textAlign: "center", mb: 3.5 }}>
              <Typography
                variant="h4"
                fontWeight={800}
                gutterBottom
                sx={{ letterSpacing: "-0.03em", color: "text.primary" }}
              >
                DebtFlow Pro
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                نظام إدارة الديون والفواتير
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="البريد الإلكتروني"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    margin="normal"
                    autoComplete="email"
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="كلمة المرور"
                    type={showPassword ? "text" : "password"}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    margin="normal"
                    autoComplete="current-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            aria-label={
                              showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                            }
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={isLoading}
                startIcon={<LoginIcon />}
                sx={{ mt: 3, mb: 1, py: 1.5 }}
              >
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>

            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: alpha("#0f766e", 0.06),
                border: `1px solid ${alpha("#0f766e", 0.15)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                للدخول التجريبي:
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                البريد: admin@debtflow.com
              </Typography>
              <Typography variant="caption" color="text.secondary">
                كلمة المرور: admin123
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mt: 3 }}
        >
          DebtFlow Pro © 2026
        </Typography>
      </Container>
    </Box>
  );
};
