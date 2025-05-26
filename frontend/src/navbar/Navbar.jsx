import * as React from "react";
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

} from "@mui/material";

import ListItemIcon from '@mui/material/ListItemIcon';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from "@mui/icons-material/Menu";
import { useAppStore } from "../appStore";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#283593',
  background: 'linear-gradient(180deg, #1a237e 0%, #283593 100%)',
  color: 'rgba(255, 255, 255, 0.9)',
  boxShadow: 'none',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
  color: "rgba(255, 255, 255, 0.9)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
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
  fontWeight: 700,
  fontSize: '1.2rem',
  background: 'linear-gradient(90deg, #ffffff 0%, #e0e0e0 100%)',
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
                <NotificationBadge badgeContent={4} color="error">
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
                  maxHeight: 300,
                  width: 360,
                  backgroundColor: '#1a237e',
                  color: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <StyledMenuItem onClick={handleCloseNotifMenu}>
                <Typography>Notification 1</Typography>
              </StyledMenuItem>
              <StyledMenuItem onClick={handleCloseNotifMenu}>
                <Typography>Notification 2</Typography>
              </StyledMenuItem>
            </Menu>

            <Tooltip title="Paramètres du compte">
              <StyledIconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  '&:hover': {
                    transform: 'scale(1.1)',
                    transition: 'transform 0.2s ease',
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
                  backgroundColor: '#1a237e',
                  color: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '& .MuiMenuItem-root': {
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    <SettingsIcon fontSize="small" />
  </AccountCircle>
  <Typography textAlign="center">Profil</Typography>
</StyledMenuItem>
            <StyledMenuItem onClick={() => { 
  handleCloseUserMenu(); 
  navigate('/settings'); 
}}>
  <ListItemIcon>
    <SettingsIcon fontSize="small" />
  </ListItemIcon>
  <Typography textAlign="center">Paramètres</Typography>
</StyledMenuItem>
              <StyledMenuItem onClick={handleLogout}>
             
                <Typography textAlign="center">Déconnexion</Typography>
              </StyledMenuItem>
            </Menu>
          </Box>
        </StyledToolbar>
      </Container>
    </StyledAppBar>
  );
}