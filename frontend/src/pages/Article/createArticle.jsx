import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Grid,
  Box,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useNavigate } from "react-router-dom";
import {
  Inventory,
  AttachMoney,
  LocalShipping,
  Category,
  Business,
  Image,
  Settings,
  Straight,
} from "@mui/icons-material";

export default function CreateArticle() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    libelle: "",
    Nature: "",
    type: "",
    prix_brut: "",
    remise: "",
    prix_net: "",
    marge: "",
    prixht: "",
    prix_totale_concre: "",
    gestion_configuration: "",
    configuration: "",
    serie: false,
    dimension_article: false,
    longueur: "",
    largeur: "",
    hauteur: "",
    image_article: "",
    libelleFamille: "",
    libeleCategorie: "",
    lib_fournisseur: "",
    Nombre_unite: "",
    prixmin: "",
    prixmax: "",
    tva_achat: "",
    tva: "",
    dc :"",
    fodec :"",
    movement_article: "",
  });

  const [familles, setFamilles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [famillesResponse, categoriesResponse, fournisseursResponse] = await Promise.all([
          axios.get("http://localhost:5000/familleArticle/familleArticle"),
          axios.get("http://localhost:5000/categorieArticle/CategorieArticles"),
          axios.get("http://localhost:5000/fournisseur/fournisseurs")
        ]);
        setFamilles(famillesResponse.data);
        setCategories(categoriesResponse.data);
        setFournisseurs(fournisseursResponse.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image_article: e.target.files[0],
    }));
  };

  const createArticle = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      await axios.post("http://localhost:5000/article/newA", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/article");
    } catch (error) {
      console.error("Erreur lors de la création de l'article :", error);
    }
  };

  return (
    <>
      <Navbar />
      <Box height={70} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto", maxHeight: "100vh" }}>
          <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                  <Inventory sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Créer un Article
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/article')}
                  sx={{ 
                    borderRadius: '8px',
                    color: '#1976d2',
                    borderColor: '#1976d2',
                    '&:hover': { 
                      borderColor: '#1565c0',
                      backgroundColor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  Retour
                </Button>
              </Box>

              <form>
                {/* Informations Générales */}
                <Card sx={{ mb: 3, boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 3, color: '#1976d2' }}>
                      <Category sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Informations Générales
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Libellé"
                          name="libelle"
                          value={formData.libelle}
                          onChange={handleChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Inventory color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              backgroundColor: '#fff',
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Nature"
                          name="Nature"
                          value={formData.Nature}
                          onChange={handleChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Category color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              backgroundColor: '#fff',
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Type"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Settings color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              backgroundColor: '#fff',
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          label="Famille de l'article"
                          name="libelleFamille"
                          value={formData.libelleFamille}
                          onChange={handleChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Category color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              backgroundColor: '#fff',
                            }
                          }}
                        >
                          {familles.map((famille) => (
                            <MenuItem key={famille._id} value={famille._id}>
                              {famille.designationFamille}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          label="Catégorie de l'article"
                          name="libeleCategorie"
                          value={formData.libeleCategorie}
                          onChange={handleChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Category color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              backgroundColor: '#fff',
                            }
                          }}
                        >
                          {categories.map((categorie) => (
                            <MenuItem key={categorie._id} value={categorie._id}>
                              {categorie.designationCategorie}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          select
                          label="Fournisseur"
                          name="lib_fournisseur"
                          value={formData.lib_fournisseur}
                          onChange={handleChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Business color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              backgroundColor: '#fff',
                            }
                          }}
                        >
                          {fournisseurs.map((fournisseur) => (
                            <MenuItem key={fournisseur._id} value={fournisseur._id}>
                              {fournisseur.raison_sociale}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Nombre d'unités"
                          name="Nombre_unite"
                          type="number"
                          value={formData.Nombre_unite}
                          onChange={handleChange}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocalShipping color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              backgroundColor: '#fff',
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Prix et Remises */}
                <Card sx={{ mb: 3, boxShadow: 2 }}>
                  <CardContent>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" sx={{ color: '#1976d2' }}>
                          <AttachMoney sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Prix et Remises
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Prix Brut"
                              name="prix_brut"
                              type="number"
                              value={formData.prix_brut}
                              onChange={handleChange}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AttachMoney color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Remise %"
                              name="remise"
                              type="number"
                              value={formData.remise}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AttachMoney color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Prix NET"
                              name="prix_net"
                              type="number"
                              value={formData.prix_net}
                              onChange={handleChange}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AttachMoney color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Marge"
                              name="marge"
                              type="number"
                              value={formData.marge}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AttachMoney color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Prix HT"
                              name="prixht"
                              type="number"
                              value={formData.prixht}
                              onChange={handleChange}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AttachMoney color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Droit de consommation%"
                              name="dc"
                              type="number"
                              value={formData.dc}
                              onChange={handleChange}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AttachMoney color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Fonds de Développement de la Compétitivité Industrielle %"
                              name="fodec"
                              type="number"
                              value={formData.fodec}
                              onChange={handleChange}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AttachMoney color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Prix Min"
                              name="prixmin"
                              type="number"
                              value={formData.prixmin}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AttachMoney color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Prix Max"
                              name="prixmax"
                              type="number"
                              value={formData.prixmax}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AttachMoney color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </CardContent>
                </Card>

                {/* TVA */}
                <Card sx={{ mb: 3, boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 3, color: '#1976d2' }}>
                      <AttachMoney sx={{ mr: 1, verticalAlign: 'middle' }} />
                      TVA
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="TVA Achat"
                          name="tva_achat"
                          type="number"
                          value={formData.tva_achat}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AttachMoney color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              backgroundColor: '#fff',
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="TVA"
                          name="tva"
                          type="number"
                          value={formData.tva}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AttachMoney color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              backgroundColor: '#fff',
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Détails */}
                <Card sx={{ mb: 3, boxShadow: 2 }}>
                  <CardContent>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" sx={{ color: '#1976d2' }}>
                          <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Détails
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Movement Article"
                              name="movement_article"
                              value={formData.movement_article}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Straight color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  name="serie"
                                  checked={formData.serie}
                                  onChange={handleChange}
                                  color="primary"
                                />
                              }
                              label="Série"
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  name="dimension_article"
                                  checked={formData.dimension_article}
                                  onChange={handleChange}
                                  color="primary"
                                />
                              }
                              label="Avec dimensions"
                            />
                          </Grid>
                          {formData.dimension_article && (
                            <>
                              <Grid item xs={12} md={4}>
                                <TextField
                                  fullWidth
                                  label="Longueur"
                                  name="longueur"
                                  type="number"
                                  value={formData.longueur}
                                  onChange={handleChange}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <Straight color="primary" />
                                      </InputAdornment>
                                    ),
                                  }}
                                  sx={{ 
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '8px',
                                      backgroundColor: '#fff',
                                    }
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <TextField
                                  fullWidth
                                  label="Largeur"
                                  name="largeur"
                                  type="number"
                                  value={formData.largeur}
                                  onChange={handleChange}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <Straight color="primary" />
                                      </InputAdornment>
                                    ),
                                  }}
                                  sx={{ 
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '8px',
                                      backgroundColor: '#fff',
                                    }
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <TextField
                                  fullWidth
                                  label="Hauteur"
                                  name="hauteur"
                                  type="number"
                                  value={formData.hauteur}
                                  onChange={handleChange}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <Straight color="primary" />
                                      </InputAdornment>
                                    ),
                                  }}
                                  sx={{ 
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '8px',
                                      backgroundColor: '#fff',
                                    }
                                  }}
                                />
                              </Grid>
                            </>
                          )}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </CardContent>
                </Card>

                {/* Image */}
                <Card sx={{ mb: 3, boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 3, color: '#1976d2' }}>
                      <Image sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Image de l'Article
                    </Typography>
                    <Button
                      variant="contained"
                      component="label"
                      sx={{ 
                        textTransform: "none",
                        borderRadius: '8px',
                        backgroundColor: '#1976d2',
                        '&:hover': { backgroundColor: '#1565c0' }
                      }}
                    >
                      Choisir une image
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Button>
                    {formData.image_article && (
                      <Box mt={2}>
                        <img
                          src={URL.createObjectURL(formData.image_article)}
                          alt="Aperçu"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    onClick={createArticle}
                    variant="contained"
                    sx={{ 
                      borderRadius: '8px',
                      backgroundColor: '#1976d2',
                      '&:hover': { backgroundColor: '#1565c0' }
                    }}
                  >
                    Créer l'article
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
}
