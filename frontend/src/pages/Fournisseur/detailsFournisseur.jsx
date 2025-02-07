import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../navbar/Navbar";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

export default function DetailsFournisseur() {
  const [fournisseur, setFournisseur] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFournisseurId, setSelectedFournisseurId] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const [isSideNavOpen, setIsSideNavOpen] = useState(true); // État pour gérer l'ouverture/fermeture du Sidenav

  // Récupérer les données du fournisseur par ID
  const fetchFournisseurById = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/fournisseur/${id}`);
      setFournisseur(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération du fournisseur:", error);
    }
  };

  // Supprimer un fournisseur
  const deleteFournisseur = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/fournisseur/${id}`);
      navigate("/Fournisseur"); // Rediriger vers la liste des fournisseurs après suppression
    } catch (error) {
      console.error("Erreur lors de la suppression du fournisseur:", error);
    }
  };

  // Ouvrir le dialogue de confirmation de suppression
  const handleOpenDialog = (id) => {
    setSelectedFournisseurId(id);
    setOpenDialog(true);
  };

  // Fermer le dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFournisseurId(null);
  };

  // Effectuer la récupération des données à l'ouverture du composant
  useEffect(() => {
    fetchFournisseurById();
  }, [id]);

  if (!fournisseur) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <Box height={100} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            marginLeft: isSideNavOpen ? "240px" : "100p", // Ajuster selon l'état du sidenav
            transition: "margin-left 0.3s", // Transition fluide pour l'ouverture/fermeture du sidenav
          }}
        >
          <Box sx={{ position: "sticky", top: 0, zIndex: 2, backgroundColor: "#fff", paddingBottom: "10px", borderBottom: "1px solid #ddd" }}>
            <h1>Fournisseur Détails</h1>
            <Button variant="contained" color="success" onClick={() => navigate("/Fournisseur/create")}>
              Create
            </Button>
          </Box>

          {/* Tableau des informations du fournisseur avec défilement horizontal */}
          <TableContainer component={Paper} sx={{ marginTop: "20px", overflowX: "auto" }}>
            <Table sx={{ minWidth: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Raison Sociale</TableCell>
                  <TableCell>Matricule Fiscale</TableCell>
                  <TableCell>Adresse</TableCell>
                  <TableCell>Telephone</TableCell>
                  <TableCell>Fax</TableCell>
                  <TableCell>Register Commerce</TableCell>
                  <TableCell>Solde Initial</TableCell>
                  <TableCell>Montant Rapprochement</TableCell>
                  <TableCell>Code Rapprochement</TableCell>
                  <TableCell>rapebe</TableCell>
                  <TableCell>solde_initial_ebe</TableCell>
                  <TableCell>montant_paie_ebe</TableCell>
                  <TableCell>taux_retenu</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow key={fournisseur._id}>
                  <TableCell>{fournisseur.code}</TableCell>
                  <TableCell>{fournisseur.raison_sociale}</TableCell>
                  <TableCell>{fournisseur.matricule_fiscale}</TableCell>
                  <TableCell>{fournisseur.adresse}</TableCell>
                  <TableCell>{fournisseur.telephone.join(" | ")}</TableCell>
                  <TableCell>{fournisseur.fax}</TableCell>
                  <TableCell>{fournisseur.register_commerce}</TableCell>
                  <TableCell>{fournisseur.solde_initial}</TableCell>
                  <TableCell>{fournisseur.montant_rapprochement}</TableCell>
                  <TableCell>{fournisseur.code_rapprochement}</TableCell>
                  <TableCell>{fournisseur.rapebe}</TableCell>
                  <TableCell>{fournisseur.solde_initial_ebe}</TableCell>
                  <TableCell>{fournisseur.montant_paie_ebe}</TableCell>
                  <TableCell>{fournisseur.taux_retenu}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="error" onClick={() => handleOpenDialog(fournisseur._id)} style={{ marginRight: "10px" }}>
                      Delete
                    </Button>
                    <Button variant="contained" color="warning" onClick={() => navigate(`/Fournisseur/update/${fournisseur._id}`)}>
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Supprimer le fournisseur</DialogTitle>
        <DialogContent>
          <p>Êtes-vous sûr de vouloir supprimer ce fournisseur ?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Non</Button>
          <Button onClick={() => { deleteFournisseur(selectedFournisseurId); handleCloseDialog(); }} color="secondary">Oui</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
