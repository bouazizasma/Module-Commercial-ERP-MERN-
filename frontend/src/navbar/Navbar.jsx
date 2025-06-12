import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import {
  Logout as LogoutIcon,  Notifications as NotificationsIcon,  AccountCircle,  Menu as MenuIcon,  Settings as SettingsIcon,  Inventory as InventoryIcon,  DoneAll as DoneAllIcon,} from '@mui/icons-material';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../appStore";
import { useNotifications } from "./NotificationContext";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
  color: '#1e293b',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  borderBottom: '1px solid #e2e8f0',
  backdropFilter: 'blur(10px)',
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: "70px",
  padding: "0 24px",
  justifyContent: 'space-between',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: "#64748b",
  "&:hover": {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    color: "#3b82f6",
  },
  transition: "all 0.2s ease",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  color: "rgba(255, 255, 255, 0.9)",
  textTransform: "none",
  fontWeight: 500,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  fontFamily: 'cursive',
  fontStyle: "oblique",
  fontSize: '1.2rem',
  background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '0.5px',
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 5,
    border: `2px solid ${theme.palette.primary.main}`,
    padding: '0 4px',
    backgroundColor: '#ff4081',
  },
}));

export default function Navbar() {
  const navigate = useNavigate();
  const dopen = useAppStore((state) => state.dopen);
  const UpdateOpen = useAppStore((state) => state.UpdateOpen);
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [anchorElNotif, setAnchorElNotif] = React.useState(null);
  
  const { 
    notifications = [], 
    unreadCount = 0, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications() || {};

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleOpenNotifMenu = (event) => {
    setAnchorElNotif(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleCloseNotifMenu = () => {
    setAnchorElNotif(null);
  };

  const handleNotificationClick = (notification) => {
    markAsRead?.(notification._id);
    if (notification.articleId) {
      navigate(`/article/${notification.articleId}`);
    }
    handleCloseNotifMenu();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead?.();
    handleCloseNotifMenu();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <StyledAppBar position="fixed">
      <Container maxWidth="xl">
        <StyledToolbar disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StyledIconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => UpdateOpen(!dopen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </StyledIconButton>

            <LogoText
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                textDecoration: "none",
                color: '#1e293b',
              }}
            >
              COMMERCIAL
            </LogoText>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip title="Notifications">
              <StyledIconButton
                size="large"
                aria-label="show notifications"
                color="inherit"
                onClick={handleOpenNotifMenu}
              >
                <NotificationBadge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </NotificationBadge>
              </StyledIconButton>
            </Tooltip>
            
            <Menu
              anchorEl={anchorElNotif}
              open={Boolean(anchorElNotif)}
              onClose={handleCloseNotifMenu}
              PaperProps={{
                sx: {
                  maxHeight: 400,
                  width: 360,
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                },
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Notifications</Typography>
                {notifications.length > 0 && (
                  <Chip 
                    label="Tout marquer comme lu" 
                    size="small" 
                    onClick={handleMarkAllAsRead}
                    icon={<DoneAllIcon fontSize="small" />}
                    sx={{ color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  />
                )}
              </Box>
              
              <Divider sx={{ borderColor: '#e2e8f0' }} />
              
              <List sx={{ p: 0, maxHeight: 300, overflow: 'auto' }}>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <React.Fragment key={notification._id}>
                      <ListItem 
                        button 
                        onClick={() => handleNotificationClick(notification)}
                        sx={{
                          backgroundColor: notification.read ? 'inherit' : 'rgba(59, 130, 246, 0.05)',
                          '&:hover': {
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: notification.type === 'stock' ? '#ff4081' : '#1976d2',
                            width: 32, 
                            height: 32 
                          }}>
                            {notification.type === 'stock' ? (
                              <InventoryIcon fontSize="small" />
                            ) : (
                              <NotificationsIcon fontSize="small" />
                            )}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={notification.message}
                          secondary={formatDistanceToNow(new Date(notification.createdAt), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                          primaryTypographyProps={{
                            color: notification.read ? 'text.secondary' : 'text.primary',
                            fontWeight: notification.read ? 'normal' : 'medium'
                          }}
                          secondaryTypographyProps={{ color: '#64748b' }}
                        />
                      </ListItem>
                      <Divider sx={{ borderColor: '#e2e8f0' }} />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText 
                      primary="Aucune notification" 
                      sx={{ textAlign: 'center', color: '#64748b' }}
                    />
                  </ListItem>
                )}
              </List>
            </Menu>

            <Tooltip title="Paramètres du compte">
              <StyledIconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                  color: "#3b82f6",
                  '&:hover': {
                    transform: 'scale(1.1)',
                    transition: 'transform 0.2s ease',
                    bgcolor: "rgba(59, 130, 246, 0.2)",
                  }
                }}>
                  <AccountCircle sx={{ fontSize: 28 }} />
                </Avatar>
              </StyledIconButton>
            </Tooltip>
            
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              PaperProps={{
                sx: {
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  '& .MuiMenuItem-root': {
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    },
                  },
                },
              }}
            >
              <StyledMenuItem onClick={() => { 
                handleCloseUserMenu(); 
                navigate('/profile'); 
              }}>
                <AccountCircle>
                  <SettingsIcon fontSize="small" color=" #FFFFFF"/>
                </AccountCircle>
                <Typography textAlign="center">Profil</Typography>
              </StyledMenuItem>
              <StyledMenuItem onClick={() => { 
                handleCloseUserMenu(); 
                navigate('/settings'); 
              }}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small"  color=" #FFFFFF"/>
                </ListItemIcon>
                <Typography textAlign="center">Paramètres</Typography>
              </StyledMenuItem>
              <StyledMenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon color=" #FFFFFF" />
                </ListItemIcon>
                <Typography textAlign="center">Déconnexion</Typography>
              </StyledMenuItem>
            </Menu>
          </Box>
        </StyledToolbar>
      </Container>
    </StyledAppBar>
  );
}