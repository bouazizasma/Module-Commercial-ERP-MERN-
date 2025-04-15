const Client = require("../Models/Client/Client");
const CounterModel=require ("../Models/counters");
const mongoose = require('mongoose');
const SecteurModel = require ("../Models/Client/Secteur");

const getClients = async (req, res) => { 
    try {
        const f = await Client.find();
                
        res.status(200).json(f);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const createClient = async (req, res) => {
    const { 
        nom_prenom,matricule_fiscale,adresse,telephone,register_commerce,solde_initial,
        montant_rapprochement,code_rapprochement,rapBl,solde_initial_bl,
        montant_reglement_bl,taux_retenu, codeSecteur , libelleSecteur} = req.body;

    try {
        console.log("Données reçues :", req.body);
        const Secteur = await SecteurModel.findById(codeSecteur,libelle);

        if (!Secteur) {
            return res.status(404).json({ message: "Référence non trouvée" });
        }



        // Récupérez et incrémentez le compteur pour générer le champ `code`
        const counter = await CounterModel.findOneAndUpdate(
            { model: 'client' }, // Rechercher le compteur pour le modèle fournisseur
            { $inc: { seq: 1 } }, // Incrémenter la séquence
            { new: true, upsert: true } // Créer le compteur s'il n'existe pas
        );

        if (!counter || !counter.seq) {
            return res.status(500).json({ message: 'Erreur lors de la génération du code Client.' });
        }

        const code = counter.seq; // Utilisez la séquence incrémentée comme code

        // Créez un nouveau Client avec le code généré
        const newClient = await Client.create({
            code, // Ajoutez le code ici
            nom_prenom,matricule_fiscale,adresse,telephone,register_commerce,solde_initial,montant_rapprochement,code_rapprochement,rapBl,solde_initial_bl,montant_reglement_bl,taux_retenu , codeSecteur , libelleSecteur       });

        console.log("Client créé avec succès :", newClient);
        res.status(201).json(newClient);

    } catch (error) {
        console.error("Erreur lors de la création du Client :", error);
        res.status(500).json({ message: 'Erreur lors de la création du Client.', error: error.message });
    }
};

/*const getClientByID = async (req, res) => { 
    try {
        const c = await Client.findById(req.params.id).populate('libelleSecteur' , '_id') ;
        
        res.status(200).json(c);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}*/


const getClientByID = async (req, res) => { 
    try {
        // 1. Trouver le client
        const client = await Client.findById(req.params.id);
        
        if (!client) {
            return res.status(404).json({ message: "Client non trouvé" });
        }

        // 2. Si vous voulez aussi les détails du secteur
        let secteurDetails = null;
        if (client.codeSecteur) {
            secteurDetails = await SecteurModel.findOne({ 
                codeSecteur: client.codeSecteur 
            });
        }

        // 3. Préparer la réponse
        const response = {
            ...client._doc,
            secteurDetails: secteurDetails || null
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Erreur lors de la récupération du client:", error);
        res.status(500).json({ 
            message: "Erreur serveur",
            error: error.message 
        });
    }
}
 /*const updateClient= async (req, res) => {
    const { id } = req.params;
    const {  nom_prenom,matricule_fiscale,adresse,telephone,register_commerce,solde_initial,montant_rapprochement,code_rapprochement,rapBl,solde_initial_bl,montant_reglement_bl,taux_retenu , codeSecteur , libelleSecteur} = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`pas de Client avec un id: ${id}`);

        if (libelleSecteur && !mongoose.Types.ObjectId.isValid(libelleSecteur)) {
          return res.status(400).json({ message: "Invalid libelleSecteur ID" });
        }
        if (codeSecteur && !mongoose.Types.ObjectId.isValid(codeSecteur)) {
            return res.status(400).json({ message: "Invalid codeSecteur ID" });
          }

           if (libelleSecteur) {
                const libelleSecteur = await SecteurModel.findById(libelle);
                if (!libelleSecteur) {
                  return res.status(404).json({ message: "libelleSecteur non trouvée" });
                }
              }
              if (codeSecteur) {
                const codeSecteur = await SecteurModel.findById(codeSecteur);
                if (!codeSecteur) {
                  return res.status(404).json({ message: "codeSecteur non trouvée" });
                }
              }
  


    const updatedClient = await Client.findByIdAndUpdate(
        id,{
            nom_prenom,matricule_fiscale,adresse,telephone,register_commerce,solde_initial,montant_rapprochement,code_rapprochement,rapBl,solde_initial_bl,montant_reglement_bl,taux_retenu,  codeSecteur , libelleSecteur
        },
        { new: true }

    );     
   //// const c1 = {  nom_prenom:nom_prenom,matricule_fiscale:matricule_fiscale,adresse:adresse,telephone:telephone,register_commerce:register_commerce,solde_initial:solde_initial,montant_rapprochement:montant_rapprochement,code_rapprochement:code_rapprochement,rapBl:rapBl,solde_initial_bl:solde_initial_bl,montant_reglement_bl:montant_reglement_bl,taux_retenu:taux_retenu, libelleSecteur:libelleSecteur,codeSecteur:codeSecteur, _id: id };

  //  await Client.findByIdAndUpdate(id, c1);

   // res.json(c1);

   // res.json(updatedClient);
}*/

/*const updateClient = async (req, res) => {
    const { id } = req.params;
    const { 
      nom_prenom,
      matricule_fiscale,
      adresse,
      telephone,
      register_commerce,
      solde_initial,
      montant_rapprochement,
      code_rapprochement,
      rapBl,
      solde_initial_bl,
      montant_reglement_bl,
      taux_retenu,
      codeSecteur,
      libelleSecteur
    } = req.body;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send(`Pas de Client avec l'id: ${id}`);
    }
  
    try {
      // Vérification des secteurs si nécessaire
      if (codeSecteur) {
        const secteur = await SecteurModel.findOne({ codeSecteur });
        if (!secteur) {
          return res.status(404).json({ message: "Code Secteur non trouvé" });
        }
        // Si vous voulez assurer la cohérence entre code et libellé
        libelleSecteur = secteur.libelle;
      }
  
      const updatedClient = await Client.findByIdAndUpdate(
        id,
        {
          nom_prenom,
          matricule_fiscale,
          adresse,
          telephone,
          register_commerce,
          solde_initial,
          montant_rapprochement,
          code_rapprochement,
          rapBl,
          solde_initial_bl,
          montant_reglement_bl,
          taux_retenu,
          codeSecteur,
          libelleSecteur
        },
        { new: true }
      );
  
      if (!updatedClient) {
        return res.status(404).json({ message: "Client non trouvé" });
      }
  
      res.json(updatedClient);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      res.status(500).json({ message: "Erreur serveur lors de la mise à jour" });
    }
  };*/


  const updateClient = async (req, res) => {
    const { id } = req.params;
    const { 
      nom_prenom,
      matricule_fiscale,
      adresse,
      telephone,
      register_commerce,
      solde_initial,
      montant_rapprochement,
      code_rapprochement,
      rapBl,
      solde_initial_bl,
      montant_reglement_bl,
      taux_retenu,
      codeSecteur,
      libelleSecteur
    } = req.body;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send(`Pas de Client avec l'id: ${id}`);
    }
  
    try {
      // Supprimer les validations d'ObjectId pour les secteurs
      // car vous utilisez des codes et libellés, pas des IDs
      
      // Vérifier si le codeSecteur existe dans la base
      if (codeSecteur) {
        const secteur = await SecteurModel.findOne({ codeSecteur });
        if (!secteur) {
          return res.status(404).json({ message: "Code Secteur non trouvé" });
        }
      }
  
      // Vérifier si le libelleSecteur existe dans la base
      if (libelleSecteur) {
        const secteur = await SecteurModel.findOne({ libelle: libelleSecteur });
        if (!secteur) {
          return res.status(404).json({ message: "Libellé Secteur non trouvé" });
        }
      }
  
      const updatedClient = await Client.findByIdAndUpdate(
        id,
        {
          nom_prenom,
          matricule_fiscale,
          adresse,
          telephone,
          register_commerce,
          solde_initial,
          montant_rapprochement,
          code_rapprochement,
          rapBl,
          solde_initial_bl,
          montant_reglement_bl,
          taux_retenu,
          codeSecteur,
          libelleSecteur
        },
        { new: true }
      );
  
      if (!updatedClient) {
        return res.status(404).json({ message: "Client non trouvé" });
      }
  
      res.json(updatedClient);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      res.status(500).json({ message: "Erreur serveur lors de la mise à jour" });
    }
  };
const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Attempting to delete Client with ID: ${id}`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).send(`Pas de Client avec l'ID: ${id}`);
        }

        const result = await Client.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).send(`Client non trouvé pour l'ID: ${id}`);
        }

        res.json({ message: 'Client supprimé avec succès.' });
    } catch (error) {
        console.error('Error deleting Client:', error);
        res.status(500).json({ message: 'Erreur du serveur.', error });
    }
};

module.exports={getClients, getClientByID, createClient, updateClient, deleteClient};