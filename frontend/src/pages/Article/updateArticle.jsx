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
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useNavigate, useParams } from "react-router-dom";
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

export default function UpdateArticle() {
  const navigate = useNavigate();
  const { id } = useParams();
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
    image_article: null,
    libelleFamille: "",
    libeleCategorie: "",
    lib_fournisseur: "",
    Nombre_unite: "",
    prixmin: "",
    prixmax: "",
    tva_achat: "",
    tva: "",
    dc: "",
    fodec: "",
    movement_article: "",
    quantiteMax : "",
    quantiteMin: "" ,
  });

  const [familles, setFamilles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articleResponse, famillesResponse, categoriesResponse, fournisseursResponse] = await Promise.all([
          axios.get(`http://localhost:5000/article/${id}`),
          axios.get("http://localhost:5000/familleArticle/familleArticle"),
          axios.get("http://localhost:5000/categorieArticle/CategorieArticles"),
          axios.get("http://localhost:5000/fournisseur/fournisseurs")
        ]);

        const articleData = articleResponse.data;
        setFormData({
          ...articleData,
          image_article: articleData.image_article || null,
        });
        setFamilles(famillesResponse.data);
        setCategories(categoriesResponse.data);
        setFournisseurs(fournisseursResponse.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
    setFormData((prev) => ({
      ...prev,
      image_article: e.target.files[0],
    }));}
  };

  const updateArticle = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      await axios.put(`http://localhost:5000/article/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/article");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'article :", error);
    }
  };

  return (
    <>
      <Navbar />
      <Box height={70} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{
          flexGrow: 1,
          p: 3,
          overflow: "auto",
          maxHeight: "100vh",
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        }}>
          {/* Header principal moderne */}
          <Box sx={{
            textAlign: 'center',
            mb: 4,
            p: 3,
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            color: 'white'
          }}>
            <Inventory sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h3" sx={{
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              mb: 1
            }}>
              Modifier l'Article
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Mettez à jour les informations de votre article
            </Typography>
          </Box>

          <Card sx={{
            mb: 3,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              {/* Bouton retour moderne */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/article')}
                  sx={{
                    borderRadius: 2,
                    borderColor: '#95a5a6',
                    color: '#95a5a6',
                    '&:hover': {
                      borderColor: '#7f8c8d',
                      backgroundColor: 'rgba(149, 165, 166, 0.1)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(149, 165, 166, 0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Retour
                </Button>
              </Box>

              <form>
                {/* Informations Générales modernisées */}
                <Card sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(149, 165, 166, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Category sx={{
                        fontSize: 32,
                        mr: 2,
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        borderRadius: '50%',
                        p: 1,
                        color: 'white'
                      }} />
                      <Typography variant="h5" sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        Informations Générales
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />
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
                          value={formData.libelleFamille || ''}
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
                          value={formData.libeleCategorie || ''}
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
                          label="Quantitée"
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
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Quantitée Minimale"
                          name="quantiteMin"
                          type="number"
                          value={formData.quantiteMin}
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
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Quantitée Maximale"
                          name="quantiteMax"
                          type="number"
                          value={formData.quantiteMax}
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

                {/* Image modernisée */}
                <Card sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(149, 165, 166, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Image sx={{
                        fontSize: 32,
                        mr: 2,
                        background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                        borderRadius: '50%',
                        p: 1,
                        color: 'white'
                      }} />
                      <Typography variant="h5" sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        Image de l'Article
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />

                    <Button
                      variant="contained"
                      component="label"
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(149, 165, 166, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(149, 165, 166, 0.4)'
                        },
                        transition: 'all 0.3s ease'
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
      src={
        typeof formData.image_article === 'string' 
          ? `data:image/jpeg;base64,${formData.image_article}`
          : formData.image_article instanceof Blob
            ? URL.createObjectURL(formData.image_article)
            : ''
      }
      alt="Aperçu"
      style={{
        width: "100px",
        height: "100px",
        objectFit: "cover",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}
      onLoad={() => {
        // Revoke the object URL to avoid memory leaks
        if (formData.image_article instanceof Blob) {
          URL.revokeObjectURL(formData.image_article);
        }
      }}
    />
  </Box>
)}
                  </CardContent>
                </Card>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Button
                    onClick={updateArticle}
                    variant="contained"
                    size="large"
                    sx={{
                      borderRadius: 3,
                      px: 6,
                      py: 2,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      color: 'white',
                      boxShadow: '0 8px 25px rgba(52, 73, 94, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 35px rgba(52, 73, 94, 0.5)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Mettre à jour l'article
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