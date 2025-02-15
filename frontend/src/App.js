import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import theme from '../src/theme';
import { ThemeProvider } from "@mui/material/styles";
import Login from '../src/pages/Login';
import Signup from '../src/pages/Signup';
import Fournisseur from './pages/Fournisseur/Fournisseur';
import Client from './pages/Client/Client';
import CreateFournisseur from './pages/Fournisseur/createFournisseur';
import UpdateFournisseur from './pages/Fournisseur/updateFournisseur';
import DetailsFournisseur from './pages/Fournisseur/detailsFournisseur';
import CreateClient from './pages/Client/createClient';
import UpdateClient from './pages/Client/updateClient';
import Dashbord from "../src/pages/Dashbord";
import Article from './pages/Article/Article';
import CreateArticle from './pages/Article/createArticle';
import FamilleArticle from './pages/Article/FamilleArticle';
import CreateFamilleArticle from './pages/Article/createFamilleArticle';
import CategorieArticle from './pages/Article/CategorieArticle';
import CreateCategorieArticle from './pages/Article/createCategorieArticle';
import UpdateFamilleArticle from './pages/Article/updateFamilleArticle';
import UpdateCategorieArticle from './pages/Article/updateCategorieArticle';
import BonCommandeFournisseur from './pages/Achat/SaisieBonCommandeFournisseur';
import ListeBonCommandeFournisseur from './pages/Achat/ListeBonCommandeFournisseurs';
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
        <Route path='/Fournisseur/create' element={<PrivateRoute element={<CreateFournisseur/>} />} />
        <Route path='/Fournisseur/update/:id' element={<PrivateRoute element={<UpdateFournisseur/>} />} />
        <Route path='/Fournisseur/details/:id' element={<PrivateRoute element={<DetailsFournisseur/>} />} />

        <Route path='/Client' element={<PrivateRoute element={<Client/>} />} />
        <Route path='/Client/create' element={<PrivateRoute element={<CreateClient/>} />} />
        <Route path='/Client/update/:id' element={<PrivateRoute element={<UpdateClient/>} />} />
        <Route path='/Articles' element={<PrivateRoute element={<Article/>} />} />
        <Route path='/Article/create' element={<PrivateRoute element={<CreateArticle/>} />} />
        <Route path='/FamilleArticle' element={<PrivateRoute element={<FamilleArticle/>} />} />
        <Route path='/FamilleArticle/create' element={<PrivateRoute element={<CreateFamilleArticle/>} />} />
        <Route path='/FamilleArticle/update/:id' element={<PrivateRoute element={<UpdateFamilleArticle/>} />} />
        <Route path='/CategorieArticle' element={<PrivateRoute element={<CategorieArticle/>} />} />
        <Route path='/categorieArticle/create' element={<PrivateRoute element={<CreateCategorieArticle/>} />} />
        <Route path='/CategorieArticle/update/:id' element={<PrivateRoute element={<UpdateCategorieArticle/>} />} />
        <Route path='/BonCommandeFournisseur' element={<PrivateRoute element={<BonCommandeFournisseur/>} />} />
        <Route path='/ListeBonCommandeFournisseur' element={<PrivateRoute element={<ListeBonCommandeFournisseur/>} />} />

        <Route path='/Depot' element={<PrivateRoute element={<Depot/>} />} />

      </Routes>
    </div>
  );
}
export default App;
