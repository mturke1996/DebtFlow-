import { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Receipt,
  Payment,
  AccountBalance,
  Brightness4,
  Brightness7,
  Logout,
  AccountCircle,
  Home,
  CloudUpload,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { BackupDialog } from './BackupDialog';

const drawerWidth = 260;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  
  const themeMode = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { user, logout } = useAuthStore();

  const menuItems = [
    { text: 'الرئيسية', icon: <Home />, path: '/' },
    { text: 'العملاء', icon: <People />, path: '/clients' },
    { text: 'الفواتير', icon: <Receipt />, path: '/invoices' },
    { text: 'المدفوعات', icon: <Payment />, path: '/payments' },
    { text: 'الديون', icon: <AccountBalance />, path: '/debts' },
  ];

  // Bottom nav items for mobile (max 5)
  const bottomNavItems = menuItems.slice(0, 5);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: 'env(safe-area-inset-top)', pb: 'env(safe-area-inset-bottom)' }}>
      <Toolbar sx={{ py: 2.5, minHeight: 76, px: 2.5 }}>
        <Box>
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              color: 'text.secondary',
              letterSpacing: '0.18em',
              fontSize: '0.6rem',
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            إدارة مالية
          </Typography>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.03em',
              fontFamily: '"Outfit", "Cairo", sans-serif',
            }}
          >
            DebtFlow Pro
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ opacity: 0.5 }} />
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2.5,
                  py: 1.25,
                  px: 1.5,
                  transition: 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.06 : 0.1),
                  },
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.1 : 0.18),
                    color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
                    fontWeight: 700,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.14 : 0.22),
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? theme.palette.primary.main : 'text.secondary',
                    minWidth: 40,
                    transition: 'color 0.2s ease',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    textAlign: 'right',
                    '& .MuiTypography-root': {
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.9rem',
                    },
                  }} 
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 4,
                      height: 20,
                      borderRadius: 4,
                      bgcolor: 'primary.main',
                      position: 'absolute',
                      right: 0,
                      transition: 'all 0.3s ease',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      {/* Drawer footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
          <Tooltip title="النسخ الاحتياطي">
            <IconButton size="small" onClick={() => setBackupDialogOpen(true)}>
              <CloudUpload sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={themeMode === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}>
            <IconButton size="small" onClick={toggleTheme}>
              {themeMode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
          pt: 'env(safe-area-inset-top)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, md: 64 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ marginLeft: '8px' }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              letterSpacing: '-0.02em',
            }}
          >
            {isMobile ? 'DebtFlow Pro' : 'نظام إدارة الديون والفواتير'}
          </Typography>

          {!isMobile && (
            <>
              <Tooltip title="النسخ الاحتياطي">
                <IconButton 
                  color="inherit" 
                  onClick={() => setBackupDialogOpen(true)} 
                  sx={{ marginLeft: '4px' }}
                >
                  <CloudUpload />
                </IconButton>
              </Tooltip>

              <Tooltip title={themeMode === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}>
                <IconButton color="inherit" onClick={toggleTheme} sx={{ marginLeft: '4px' }}>
                  {themeMode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
              </Tooltip>
            </>
          )}

          <IconButton color="inherit" onClick={handleMenuClick} sx={{ marginLeft: '4px' }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.15),
                color: 'primary.main',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            >
              {user?.displayName?.charAt(0) || user?.email.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                sx: { minWidth: 200, mt: 1 },
              },
            }}
          >
            <MenuItem disabled sx={{ display: 'flex', gap: 1.5, opacity: '1 !important' }}>
              <AccountCircle sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" fontWeight={600}>{user?.displayName || 'مستخدم'}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
            </MenuItem>
            <Divider />
            {isMobile && (
              <>
                <MenuItem onClick={() => { setBackupDialogOpen(true); handleMenuClose(); }} sx={{ gap: 1.5 }}>
                  <CloudUpload sx={{ fontSize: 20 }} />
                  النسخ الاحتياطي
                </MenuItem>
                <MenuItem onClick={() => { toggleTheme(); handleMenuClose(); }} sx={{ gap: 1.5 }}>
                  {themeMode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
                  {themeMode === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
                </MenuItem>
                <Divider />
              </>
            )}
            <MenuItem onClick={handleLogout} sx={{ display: 'flex', gap: 1.5, color: 'error.main' }}>
              <Logout fontSize="small" />
              تسجيل الخروج
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Side Navigation */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 'calc(56px + env(safe-area-inset-top))', md: 'calc(64px + env(safe-area-inset-top))' },
          pb: { xs: 'calc(80px + env(safe-area-inset-bottom))', md: 4 },
          minHeight: '100dvh',
        }}
      >
        {children}
      </Box>

      {/* Mobile Bottom Navigation — Glassmorphic */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            bgcolor: theme.palette.mode === 'light'
              ? alpha(theme.palette.background.paper, 0.88)
              : alpha(theme.palette.background.paper, 0.82),
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderTop: `1px solid ${theme.palette.divider}`,
            boxShadow: `0 -4px 20px ${alpha('#000', theme.palette.mode === 'light' ? 0.04 : 0.15)}`,
            px: 1,
            py: 0.5,
            pb: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <Stack direction="row" justifyContent="space-around" alignItems="center">
            {bottomNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Box
                  key={item.path}
                  component="button"
                  onClick={() => navigate(item.path)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.25,
                    py: 0.75,
                    px: 1.5,
                    border: 'none',
                    bgcolor: 'transparent',
                    color: isActive ? 'primary.main' : 'text.secondary',
                    cursor: 'pointer',
                    borderRadius: 2,
                    transition: 'all 0.2s cubic-bezier(0.32,0.72,0,1)',
                    position: 'relative',
                    minWidth: 56,
                    font: 'inherit',
                    '&:active': { transform: 'scale(0.9)' },
                    ...(isActive && {
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -2,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 20,
                        height: 3,
                        borderRadius: 4,
                        bgcolor: 'primary.main',
                      },
                    }),
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      bgcolor: isActive ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                      transition: 'all 0.2s ease',
                      '& .MuiSvgIcon-root': {
                        fontSize: isActive ? 22 : 20,
                        transition: 'font-size 0.2s ease',
                      },
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '0.6rem',
                      fontWeight: isActive ? 700 : 500,
                      lineHeight: 1,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Backup Dialog */}
      <BackupDialog 
        open={backupDialogOpen} 
        onClose={() => setBackupDialogOpen(false)} 
      />
    </Box>
  );
};
