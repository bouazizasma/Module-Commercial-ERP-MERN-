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
import MenuIcon from "@mui/icons-material/Menu";
import { useAppStore } from "../appStore";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  color: '#333',
  boxShadow: 'none',
  borderBottom: '1px solid #e0e0e0',
  zIndex: theme.zIndex.drawer + 1,
  '& .MuiIconButton-root': {
    color: '#333',
    '&:hover': {
      backgroundColor: '#e0e0e0',
    },
  },
  '& .MuiTypography-root': {
    color: '#333',
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: "70px",
  padding: "0 24px",
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: "white",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  color: "white",
  textTransform: "none",
  fontWeight: 500,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  "&:hover": {
    backgroundColor: "rgba(13, 71, 161, 0.1)",
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
          <StyledIconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => UpdateOpen(!dopen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </StyledIconButton>

          <Typography
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
              color: "inherit",
              textDecoration: "none",
            }}
          >
            COMMERCIAL
          </Typography>

          <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center", gap: 2, marginLeft: 'auto' }}>
            <StyledIconButton
              size="large"
              aria-label="show notifications"
              color="inherit"
              onClick={handleOpenNotifMenu}
            >
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </StyledIconButton>
            <Menu
              anchorEl={anchorElNotif}
              open={Boolean(anchorElNotif)}
              onClose={handleCloseNotifMenu}
              PaperProps={{
                sx: {
                  maxHeight: 300,
                  width: 360,
                },
              }}
            >
              <MenuItem onClick={handleCloseNotifMenu}>
                <Typography>Notification 1</Typography>
              </MenuItem>
              <MenuItem onClick={handleCloseNotifMenu}>
                <Typography>Notification 2</Typography>
              </MenuItem>
            </Menu>

            <Tooltip title="Paramètres du compte">
              <StyledIconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar sx={{ width: 35, height: 35, bgcolor: "rgba(255, 255, 255, 0.2)" }}>
                  <AccountCircle />
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
            >
              <StyledMenuItem onClick={handleCloseUserMenu}>
                <Typography textAlign="center">Profil</Typography>
              </StyledMenuItem>
              <StyledMenuItem onClick={handleCloseUserMenu}>
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
