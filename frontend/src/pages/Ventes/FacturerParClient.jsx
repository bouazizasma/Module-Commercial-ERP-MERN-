import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import { Visibility } from "@mui/icons-material";
import { Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import {
  Card, CardContent, Typography, Grid, Button, TextField, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, 
  Autocomplete, IconButton
} from "@mui/material";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FiltresDeRecherche = ({ clients, applyFilters, handleGroupedFacturation }) => {
  const [filters, setFilters] = useState({
    client: "",
    startDate: "",
    endDate: "",
    statut: "",
  });
  const [error, setError] = useState("");

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    if (field === "startDate" || field === "endDate") validateDates(field, value);
  };

  const validateDates = (field, value) => {
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      setError(endDate <= startDate ? "La date de fin doit être postérieure à la date de début." : "");
    } else {
      setError("");
    }
  };

  const handleApplyFilters = () => {
    if (error) return alert(error);
    applyFilters(filters);
  };

  return (
    <Card sx={{ p: 3, mb: 3, boxShadow: 3, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
          Filtres de Recherche
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              options={clients}
              getOptionLabel={(option) => option.nom_prenom || option.nom || `${option.nom} ${option.prenom}` || ""}
              value={clients.find(c => 
                c.nom_prenom === filters.client || 
                c.nom === filters.client || 
                `${c.nom} ${c.prenom}` === filters.client
              ) || null}
              onChange={(_, newValue) => {
                handleFilterChange("client", newValue ? (newValue.nom_prenom || newValue.nom || `${newValue.nom} ${newValue.prenom}`) : "");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Client"
                  placeholder="Sélectionner un client"
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body1">
                      {option.nom_prenom || option.nom || `${option.nom} ${option.prenom}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.adresse || "Adresse non spécifiée"}
                    </Typography>
                  </Box>
                </li>
              )}
              isOptionEqualToValue={(option, value) => 
                option._id === value._id || 
                option.nom_prenom === value.nom_prenom || 
                option.nom === value.nom
              }
              noOptionsText="Aucun client trouvé"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Date de début"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Date de fin"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              fullWidth
              error={!!error}
              helperText={error}
              inputProps={{ min: filters.startDate }}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' },
                height: '56px',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              CHERCHER
            </Button>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Button
              variant="contained"
              onClick={handleGroupedFacturation}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' },
                height: '56px',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              FACTURE
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default function FactureParClient() {
  const [bonsLivraison, setBonsLivraison] = useState([]);
  const [filteredBonsLivraison, setFilteredBonsLivraison] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [selectedBonLivraison, setSelectedBonLivraison] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedBonsLivraison, setSelectedBonsLivraison] = useState([]);
  const [isGroupedFacturationModalOpen, setIsGroupedFacturationModalOpen] = useState(false);
  const [groupedFactureData, setGroupedFactureData] = useState({
    numero_Facture: "",
    date_Facture: "",
    client: "",
    bonsLivraison: [],
    total_HT: 0,
    total_TTC: 0,
    totalAvecTimbre: 0,
  });
  const [timbre, setTimbre] = useState("1.000");
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bonsLivraisonRes, clientsRes] = await Promise.all([
          axios.get("http://localhost:5000/ventes/bonslivraison/nonfactures/all"),
          axios.get("http://localhost:5000/client/clients")
        ]);
        setBonsLivraison(bonsLivraisonRes.data);
        setFilteredBonsLivraison(bonsLivraisonRes.data);
        setClients(clientsRes.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };
    fetchData();
  }, []);

  const applyFilters = (filters) => {
    let filtered = bonsLivraison.filter(bon => {
      const matchesClient = !filters.client || bon.client?.nom_prenom === filters.client;
      const matchesDate = !filters.startDate || !filters.endDate || (
        new Date(bon.date_bon_livraison || bon.dateLivraison) >= new Date(filters.startDate) &&
        new Date(bon.date_bon_livraison || bon.dateLivraison) <= new Date(filters.endDate)
      );
      return matchesClient && matchesDate;
    });
    setFilteredBonsLivraison(filtered);
    setShowResults(true);
  };

  const handleGroupedFacturation = () => {
    if (selectedBonsLivraison.length === 0) {
      return alert("Veuillez sélectionner au moins un bon de livraison");
    }

    const totalHT = selectedBonsLivraison.reduce((sum, bon) => sum + (Number(bon.total_hors_Taxe) || 0), 0);
    const totalTTC = selectedBonsLivraison.reduce((sum, bon) => sum + (Number(bon.total_ttc) || 0), 0);

    setGroupedFactureData({
      numero_Facture: `FACT-${Date.now()}`,
      date_Facture: new Date().toISOString().split('T')[0],
      client: selectedBonsLivraison[0]?.client?.nom_prenom || "",
      bonsLivraison: selectedBonsLivraison,
      total_HT: totalHT,
      total_TTC: totalTTC,
      totalAvecTimbre: totalTTC + parseFloat(timbre || 1)
    });
    setIsGroupedFacturationModalOpen(true);
  };

  const generateFacturePDF = () => {
    try {
      const pdf = new jsPDF();
      pdf.setFont("helvetica");
      pdf.setFontSize(16);
      pdf.text("Facture Groupée", 85, 20);

      // Header
      pdf.setFontSize(10);
      pdf.text(`Numéro Facture: ${groupedFactureData.numero_Facture}`, 15, 30);
      pdf.text(`Client: ${groupedFactureData.client}`, 15, 40);
      pdf.text(`Date: ${groupedFactureData.date_Facture}`, 15, 50);

      // Table content
      let y = 70;
      groupedFactureData.bonsLivraison.forEach((bon, index) => {
        pdf.setFontSize(12);
        pdf.text(`Bon de Livraison ${index + 1}: ${bon.numero_bon_livraison || bon.numero}`, 15, y);
        y += 10;
        
        const headers = ['Désignation', 'Quantité', 'P.U HT', 'Total HT'];
        const rows = (bon.lignes || []).map(ligne => [
          ligne.article?.designation || ligne.libelle || 'N/A',
          ligne.quantite,
          `${Number(ligne.prix_unitaire || 0).toFixed(3)}`,
          `${Number(ligne.total_HT || (ligne.quantite * ligne.prix_unitaire) || 0).toFixed(3)}`
        ]);

        pdf.autoTable({
          startY: y,
          head: [headers],
          body: rows,
          margin: { left: 15 },
          styles: { fontSize: 8 }
        });
        y = pdf.lastAutoTable.finalY + 10;
      });

      // Totals
      pdf.setFontSize(10);
      pdf.text(`TOTAL HT: ${groupedFactureData.total_HT.toFixed(3)}`, 15, y);
      pdf.text(`TVA: ${(groupedFactureData.total_TTC - groupedFactureData.total_HT).toFixed(3)}`, 15, y + 10);
      pdf.text(`TIMBRE: ${Number(timbre || 0).toFixed(3)}`, 15, y + 20);
      pdf.text(`TOTAL TTC: ${groupedFactureData.totalAvecTimbre.toFixed(3)}`, 15, y + 30);

      const pdfBlob = pdf.output('blob');
      setPdfBlob(pdfBlob);
      setOpenPreviewModal(true);
      return true;
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Erreur lors de la génération du PDF");
      return false;
    }
  };

  const handleGenerateFacture = async () => {
    try {
      const timbreValue = parseFloat(timbre);
      if (isNaN(timbreValue)) throw new Error("Valeur de timbre invalide");

      await axios.post("http://localhost:5000/ventes/factures/groupes", {
        bonLivraisonIDs: selectedBonsLivraison.map(bon => bon._id),
        timbre: timbreValue
      });

      if (await generateFacturePDF()) {
        const { data } = await axios.get("http://localhost:5000/ventes/bonslivraison/nonfactures/all");
        setBonsLivraison(data);
        setFilteredBonsLivraison(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.response?.data?.message || error.message || "Erreur lors de la création de la facture");
    }
  };

  const handleDownloadFacture = () => {
    if (!pdfBlob) return alert("Aucun PDF disponible");
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facture_${groupedFactureData.numero_Facture}.pdf`;
    link.click();
  };

  const handlePrintFacture = () => {
    if (!pdfBlob) return alert("Aucun PDF disponible");
    const url = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(url);
    printWindow?.print();
  };
// Ajoutez cette fonction dans votre composant principal FactureParClient
const handleSelectBonLivraison = (bonLivraison) => {
    setSelectedBonsLivraison(prev => {
      const isSelected = prev.some(bon => bon._id === bonLivraison._id);
      if (isSelected) {
        return prev.filter(bon => bon._id !== bonLivraison._id);
      } else {
        return [...prev, bonLivraison];
      }
    });
  };
  return (
    <Box sx={{ display: "flex" }}>
      <Sidenav />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Navbar />
        <FiltresDeRecherche
          clients={clients}
          applyFilters={applyFilters}
          handleGroupedFacturation={handleGroupedFacturation}
        />

        {showResults && (
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedBonsLivraison.length > 0 && selectedBonsLivraison.length < filteredBonsLivraison.length}
                      checked={selectedBonsLivraison.length === filteredBonsLivraison.length}
                      onChange={(e) => setSelectedBonsLivraison(e.target.checked ? [...filteredBonsLivraison] : [])}
                    />
                  </TableCell>
                  <TableCell>N° Bon de Livraison</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Total HT</TableCell>
                  <TableCell>Total TTC</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBonsLivraison.map((bon) => (
                  <TableRow key={bon._id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedBonsLivraison.includes(bon)}
                        onChange={() => handleSelectBonLivraison(bon)}
                      />
                    </TableCell>
                    <TableCell>{bon.numero_bon_livraison || bon.numero || 'N/A'}</TableCell>
                    <TableCell>{bon.client?.nom_prenom || 'N/A'}</TableCell>
                    <TableCell>
                      {bon.date_bon_livraison ? new Date(bon.date_bon_livraison).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>{Number(bon.total_hors_Taxe || 0).toFixed(3)}</TableCell>
                    <TableCell>{Number(bon.total_ttc || 0).toFixed(3)}</TableCell>
                    <TableCell>
                      <Chip
                        label={bon.statut || 'N/A'}
                        color={
                          bon.statut === "facture" ? "success" :
                          bon.statut === "en_attente" ? "warning" : "error"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => setSelectedBonLivraison(bon)}>
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Modal de détails */}
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Détails du Bon de Livraison</DialogTitle>
          <DialogContent>
            {selectedBonLivraison && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <Typography variant="h6">Informations</Typography>
                  <Typography>N°: {selectedBonLivraison.numero_bon_livraison || 'N/A'}</Typography>
                  <Typography>Client: {selectedBonLivraison.client?.nom_prenom || 'N/A'}</Typography>
                  <Typography>Date: {selectedBonLivraison.date_bon_livraison ? new Date(selectedBonLivraison.date_bon_livraison).toLocaleDateString() : 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">Articles</Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Article</TableCell>
                          <TableCell>Quantité</TableCell>
                          <TableCell>Prix unitaire</TableCell>
                          <TableCell>Total HT</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(selectedBonLivraison.lignes || []).map((ligne, i) => (
                          <TableRow key={i}>
                            <TableCell>{ligne.article?.designation || ligne.libelle || 'N/A'}</TableCell>
                            <TableCell>{ligne.quantite}</TableCell>
                            <TableCell>{Number(ligne.prix_unitaire || 0).toFixed(3)}</TableCell>
                            <TableCell>{Number(ligne.total_HT || (ligne.quantite * ligne.prix_unitaire) || 0).toFixed(3)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsModalOpen(false)}>Fermer</Button>
          </DialogActions>
        </Dialog>

        {/* Modal de facturation groupée */}
        <Dialog 
          open={isGroupedFacturationModalOpen} 
          onClose={() => setIsGroupedFacturationModalOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {!openPreviewModal ? (
            <>
              <DialogTitle>Facturation Groupée</DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12}>
                    <TextField
                      label="Timbre"
                      fullWidth
                      value={timbre}
                      onChange={(e) => setTimbre(e.target.value)}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">Récapitulatif</Typography>
                    <Typography>Nombre de bons: {selectedBonsLivraison.length}</Typography>
                    <Typography>Total HT: {groupedFactureData.total_HT.toFixed(3)}</Typography>
                    <Typography>Total TTC: {groupedFactureData.total_TTC.toFixed(3)}</Typography>
                    <Typography>Total avec timbre: {groupedFactureData.totalAvecTimbre.toFixed(3)}</Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsGroupedFacturationModalOpen(false)}>Annuler</Button>
                <Button 
                  onClick={handleGenerateFacture} 
                  variant="contained" 
                  color="primary"
                >
                  Générer Facture
                </Button>
              </DialogActions>
            </>
          ) : (
            <>
              <DialogTitle>Facture Groupée</DialogTitle>
              <DialogContent>
                {pdfBlob ? (
                  <Document
                    file={pdfBlob}
                    onLoadError={(error) => console.error("Erreur PDF:", error)}
                  >
                    <Page pageNumber={1} width={600} />
                  </Document>
                ) : (
                  <Typography>Chargement du PDF...</Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button 
                  startIcon={<LocalPrintshopIcon />} 
                  onClick={handlePrintFacture}
                  variant="contained"
                  color="primary"
                >
                  Imprimer
                </Button>
                <Button 
                  startIcon={<FileDownloadIcon />} 
                  onClick={handleDownloadFacture}
                  variant="contained"
                  color="secondary"
                >
                  Télécharger
                </Button>
                <Button 
                  onClick={() => {
                    setOpenPreviewModal(false);
                    setIsGroupedFacturationModalOpen(false);
                    setSelectedBonsLivraison([]);
                  }}
                >
                  Terminer
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Box>
  );
}