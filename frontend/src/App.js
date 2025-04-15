import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import theme from '../src/theme';
import { ThemeProvider } from "@mui/material/styles";
import Login from '../src/pages/Login';
import Signup from '../src/pages/Signup';
//////////FOURNISSEUR////////////
import Fournisseur from './pages/Fournisseur/Fournisseur';
import CreateFournisseur from './pages/Fournisseur/createFournisseur';
import UpdateFournisseur from './pages/Fournisseur/updateFournisseur';
/////////CLIENT//////////
import Client from './pages/Client/Client';
import CreateClient from './pages/Client/createClient';
import UpdateClient from './pages/Client/updateClient';
import Dashbord from "../src/pages/Dashbord";
import Secteur from "../src/pages/Client/Secteur"
import CreateSecteur from "../src/pages/Client/createSecteur";
import UpdateSecteur from "../src/pages/Client/updateSecteur";
///////ARTICLE///////////
import Article from './pages/Article/Article';
import CreateArticle from './pages/Article/createArticle';
import FamilleArticle from './pages/Article/FamilleArticle';
import CreateFamilleArticle from './pages/Article/createFamilleArticle';
import CategorieArticle from './pages/Article/CategorieArticle';
import CreateCategorieArticle from './pages/Article/createCategorieArticle';
import UpdateFamilleArticle from './pages/Article/updateFamilleArticle';
import UpdateCategorieArticle from './pages/Article/updateCategorieArticle';
import UpdateArticle from './pages/Article/updateArticle';
////////////ACHATS///////////////
import BonCommandeFournisseur from './pages/Achat/SaisieBonCommandeFournisseur';
import ListeBonCommandeFournisseur from './pages/Achat/ListeBonCommandeFournisseurs';
import BonReceptionFournisseur from './pages/Achat/SaisieBonReceptionFournisseur';
import ListeBonReceptionFournisseur from './pages/Achat/ListeBonReceptionFournisseur';
import UpdateBonCommande from './pages/Achat/UpdateBonCommande';
import UpdateBonReception from './pages/Achat/UpdateBonReception';
import ListeFactures from './pages/Achat/ListeFacturesFournisseur';
import FactureParFournisseur from './pages/Achat/FactureParFournisseur';
import PaiementFournisseur from './pages/Achat/PaiementFournisseur';
import Banque from './pages/Achat/Banque';
import Caisse from './pages/Achat/Caisse';
import ListePaiements from './pages/Achat/ListeDesPaiements';
//////VENTES /////////////////
import SaisieDevis from './pages/Ventes/SaisieDevis';
import ListeDevisClient from './pages/Ventes/ListeDevisClient';
import UpdateDevis from './pages/Ventes/UpdateDevis';
import ListeBonCommandeClient from './pages/Ventes/ListeBonCommandeClient';
import ListeBonLivraisonClient from './pages/Ventes/ListeBonLivraisonClient';
import SaisieBonCommandeClient from './pages/Ventes/SaisieBonCommandeClient';
/////////LKOL//////////////
import Depot from './pages/Depot/Depot';

import { useState } from 'react';
import RefrshHandler from './RefrshHandler';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />
  }
  return (
    <div className="App">
      <RefrshHandler setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path='/' element={<Navigate to="/login" />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/Dashbord' element={<PrivateRoute element={<Dashbord/>} />} />
        <Route path='/Fournisseur' element={<PrivateRoute element={<Fournisseur/>} />} />
        <Route path='/createFournisseur' element={<PrivateRoute element={<CreateFournisseur/>} />} />
        <Route path='/updateFournisseur/:id' element={<PrivateRoute element={<UpdateFournisseur/>} />} />
        {/* CLIENT */}
        <Route path='/Client' element={<PrivateRoute element={<Client/>} />} />
        <Route path='/Client/create' element={<PrivateRoute element={<CreateClient/>} />} />
        <Route path='/Client/update/:id' element={<PrivateRoute element={<UpdateClient/>} />} />
        <Route path='/Secteur' element={<PrivateRoute element={<Secteur/>} />} />
        <Route path='/Secteur/create' element={<PrivateRoute element={<CreateSecteur/>} />} />
        <Route path='/Secteur/update/:id' element={<PrivateRoute element={<UpdateSecteur/>} />} />


        {/* ARTICLE */}
        <Route path='/article' element={<PrivateRoute element={<Article/>} />} />
        <Route path='/createArticle' element={<PrivateRoute element={<CreateArticle/>} />} />
        <Route path='/updateArticle/:id' element={<PrivateRoute element={<UpdateArticle/>} />} />
        <Route path='/FamilleArticle' element={<PrivateRoute element={<FamilleArticle/>} />} />
        <Route path='/FamilleArticle/create' element={<PrivateRoute element={<CreateFamilleArticle/>} />} />
        <Route path='/FamilleArticle/update/:id' element={<PrivateRoute element={<UpdateFamilleArticle/>} />} />
        <Route path='/CategorieArticle' element={<PrivateRoute element={<CategorieArticle/>} />} />
        <Route path='/categorieArticle/create' element={<PrivateRoute element={<CreateCategorieArticle/>} />} />
        <Route path='/CategorieArticle/update/:id' element={<PrivateRoute element={<UpdateCategorieArticle/>} />} />
        {/* ACHATS */}
        <Route path='/BonCommandeFournisseur' element={<PrivateRoute element={<BonCommandeFournisseur/>} />} />
        <Route path='/BonReceptionFournisseur' element={<PrivateRoute element={<BonReceptionFournisseur/>} />} />
        <Route path='/ListeBonCommandeFournisseur' element={<PrivateRoute element={<ListeBonCommandeFournisseur/>} />} />
        <Route path='/ListeBonReceptionFournisseur' element={<PrivateRoute element={<ListeBonReceptionFournisseur/>} />} />
        <Route path='/updateBonReception/:id' element={<PrivateRoute element={<UpdateBonReception/>} />} />                     
        <Route path='/ListeBonCommandeFournisseur/update/:id' element={<PrivateRoute element={<UpdateBonCommande/>} />} />
        <Route path='/ListeFactures' element={<PrivateRoute element={<ListeFactures/>} />} />
        <Route path='/FactureParFournisseur' element={<PrivateRoute element={<FactureParFournisseur/>} />} />
        <Route path='/PaiementFournisseur' element={<PrivateRoute element={<PaiementFournisseur/>} />} />
        <Route path='/Banque' element={<PrivateRoute element={<Banque/>} />} /> 
        <Route path='/Depot' element={<PrivateRoute element={<Depot/>} />} />
        <Route path='/Caisse' element={<PrivateRoute element={<Caisse/>} />} />
        <Route path='/ListePaiements' element={<PrivateRoute element={<ListePaiements/>} />} />
        {/* VENTES */}
        <Route path='/SaisieDevis' element={<PrivateRoute element={<SaisieDevis/>} />} />
        <Route path='/ListeDevisClient' element={<PrivateRoute element={<ListeDevisClient/>} />} />
        <Route path='/ListeBonCommandeClient' element={<PrivateRoute element={<ListeBonCommandeClient/>} />} />
        <Route path='/ListeDevisClient/update/:id' element={<PrivateRoute element={<UpdateDevis/>} />} />
        <Route path='/ListeBonLivraisonClient' element={<PrivateRoute element={<ListeBonLivraisonClient/>} />} />
        <Route path='/SaisieBonCommandeClient' element={<PrivateRoute element={<SaisieBonCommandeClient/>} />} />



      </Routes>
    </div>
  );
}
export default App;
