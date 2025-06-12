import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Fade,
  Divider
} from '@mui/material';
import { Delete } from '@mui/icons-material';

const ModernDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Confirmer la suppression",
  message = "Êtes-vous sûr de vouloir supprimer cet élément ?",
  itemDetails = null,
  itemIcon = "📄",
  loading = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(255,255,255,0.2)',
          overflow: 'hidden'
        }
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)'
          }
        }
      }}
    >
      {/* Header avec animation */}
      <Box sx={{
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 50%, #ff4757 100%)',
        color: 'white',
        textAlign: 'center',
        py: 4,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Effet de particules en arrière-plan */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          animation: 'pulse 2s ease-in-out infinite alternate'
        }} />

        {/* Icône avec animation */}
        <Box sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)',
            animation: 'bounce 1s ease-in-out infinite alternate'
          }}>
            <Delete sx={{
              fontSize: 40,
              color: 'white',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }} />
          </Box>
          <Typography variant="h4" sx={{
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            mb: 1
          }}>
            Attention !
          </Typography>
          <Typography variant="h6" sx={{
            opacity: 0.9,
            fontWeight: 'medium'
          }}>
            {title}
          </Typography>
        </Box>
      </Box>

      {/* Contenu principal */}
      <DialogContent sx={{
        p: 4,
        textAlign: 'center',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
      }}>
        <Typography variant="h6" sx={{
          mb: 3,
          color: '#2c3e50',
          fontWeight: 'bold'
        }}>
          {message}
        </Typography>

        {itemDetails && (
          <Fade in={true} timeout={800}>
            <Box sx={{
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              color: 'white',
              mb: 3,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
            }}>
              {/* Effet de brillance */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: 'shine 2s ease-in-out infinite'
              }} />

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h6" sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  {itemIcon} {itemDetails.title}
                </Typography>
                <Divider sx={{
                  my: 2,
                  backgroundColor: 'rgba(255,255,255,0.3)'
                }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {itemDetails.details.map((detail, index) => (
                    <Typography key={index} variant="body2" sx={{ fontWeight: 'medium' }}>
                      {detail}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Box>
          </Fade>
        )}

        <Box sx={{
          p: 2,
          backgroundColor: '#fff3cd',
          borderRadius: 2,
          border: '1px solid #ffeaa7',
          mb: 3
        }}>
          <Typography variant="body2" sx={{
            color: '#856404',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}>
            ⚠️ Cette action est irréversible !
          </Typography>
        </Box>
      </DialogContent>

      {/* Actions avec animations */}
      <DialogActions sx={{
        p: 4,
        justifyContent: 'center',
        gap: 3,
        background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
        borderTop: '1px solid rgba(0,0,0,0.1)'
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          disabled={loading}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            borderColor: '#6c757d',
            color: '#6c757d',
            fontWeight: 'bold',
            minWidth: 120,
            '&:hover': {
              borderColor: '#495057',
              backgroundColor: 'rgba(108, 117, 125, 0.1)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(108, 117, 125, 0.3)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          ✕ Annuler
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          size="large"
          disabled={loading}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontWeight: 'bold',
            minWidth: 120,
            background: loading 
              ? 'linear-gradient(135deg, #ccc 0%, #999 100%)'
              : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 50%, #ff4757 100%)',
            boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
            '&:hover': {
              background: loading 
                ? 'linear-gradient(135deg, #ccc 0%, #999 100%)'
                : 'linear-gradient(135deg, #ff5252 0%, #f44336 50%, #e53935 100%)',
              transform: loading ? 'none' : 'translateY(-3px)',
              boxShadow: loading 
                ? '0 4px 15px rgba(255, 107, 107, 0.4)'
                : '0 8px 25px rgba(255, 107, 107, 0.6)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? '⏳ Suppression...' : '🗑️ Supprimer'}
        </Button>
      </DialogActions>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </Dialog>
  );
};

export default ModernDeleteDialog;
