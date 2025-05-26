import * as React from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Container,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Sidenav from "../navbar/Sidenav";
import Navbar from "../navbar/Navbar";
import { toast } from 'react-toastify';
import { useAppStore } from '../appStore';

const ProfileContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(4),
}));

const ProfilePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(8),
  height: theme.spacing(8),
  marginBottom: theme.spacing(2),
  backgroundColor: '#283593',
}));

const FormTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    '&:hover fieldset': {
      borderColor: '#283593',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#283593',
      borderWidth: '1px',
    },
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: '8px',
  backgroundColor: '#283593',
  color: 'white',
  fontWeight: 'bold',
  textTransform: 'none',
  fontSize: '1rem',
  '&:hover': {
    backgroundColor: '#1a237e',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  '&:disabled': {
    backgroundColor: '#9fa8da',
  },
}));

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Le nom est requis'),
  email: Yup.string().email('Email invalide').required('Email requis'),
  currentPassword: Yup.string(),
  newPassword: Yup.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: Yup.string().oneOf([Yup.ref('newPassword'), null], 'Les mots de passe doivent correspondre'),
});

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [userData, setUserData] = React.useState(null);
  const dopen = useAppStore((state) => state.dopen);
  const UpdateOpen = useAppStore((state) => state.UpdateOpen);

  // Récupérer les données de l'utilisateur
  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Utilisez une API pour décoder le token plutôt que de le faire côté client
        const response = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(response.data);
      } catch (error) {
        toast.error('Erreur lors du chargement du profil');
        console.error(error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const formik = useFormik({
    initialValues: {
      name: userData?.name || '',
      email: userData?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          '/api/users/me',
          {
            name: values.name,
            email: values.email,
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        toast.success('Profil mis à jour avec succès');
        setUserData(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <>
    <Navbar />
          <Box height={364} />
           <Sidenav />
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        marginLeft: dopen ? '240px' : '0',
        transition: 'margin-left 0.3s ease',
      }}
    >
      <ProfileContainer maxWidth="md">
        <ProfilePaper elevation={3}>
          <ProfileHeader>
            <ProfileAvatar>
              <AccountCircle sx={{ fontSize: 40 }} />
            </ProfileAvatar>
            <Typography variant="h6" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Mon Profil
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Gérez vos informations personnelles et votre mot de passe
            </Typography>
          </ProfileHeader>

          <Divider sx={{ my: 3 }} />

          <form onSubmit={formik.handleSubmit}>
            <Box mb={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'light', mb: 2 }}>
                Informations personnelles
              </Typography>

              <FormTextField
                fullWidth
                id="name"
                name="name"
                label="Nom complet"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />

              <FormTextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Box>

            <Box mb={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'light', mb: 2 }}>
                Changer le mot de passe
              </Typography>

              <FormTextField
                fullWidth
                id="currentPassword"
                name="currentPassword"
                label="Mot de passe actuel"
                type="password"
                value={formik.values.currentPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
                helperText={formik.touched.currentPassword && formik.errors.currentPassword}
              />

              <FormTextField
                fullWidth
                id="newPassword"
                name="newPassword"
                label="Nouveau mot de passe"
                type="password"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                helperText={formik.touched.newPassword && formik.errors.newPassword}
              />

              <FormTextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirmer le nouveau mot de passe"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              />
            </Box>

            <Box display="flex" justifyContent="flex-end">
              <SubmitButton
                type="submit"
                variant="contained"
                disabled={isLoading || !formik.dirty}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </SubmitButton>
            </Box>
          </form>
        </ProfilePaper>
      </ProfileContainer>
    </Box>
    </>
  );
}