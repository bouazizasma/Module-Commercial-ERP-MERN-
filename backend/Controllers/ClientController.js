const Client = require("../Models/Client/Client");
const CounterModel=require ("../Models/counters");
const mongoose = require('mongoose');
const SecteurModel = require ("../Models/Client/Secteur");
const RegionModel = require ("../Models/Client/Region");
const BanqueClient  =require("../Models/Client/BanqueClient");

const getClients = async (req, res) => { 
    try {
        const f = await Client.find();
                
        res.status(200).json(f);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

/*const createClient = async (req, res) => {
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

*/
const createClient = async (req, res) => {
  const {
      nom_prenom, matricule_fiscale, adresse, telephone, register_commerce,
      solde_initial, montant_rapprochement, code_rapprochement, rapBl,
      solde_initial_bl, montant_reglement_bl, taux_retenu,
      codeSecteur, libelleSecteur, codeRegion, libelleRegion, bankAccounts  } = req.body;

  try {
      console.log("Données reçues :", req.body);
      const secteur = await SecteurModel.findOne({codeSecteur:codeSecteur});

      if (!secteur) {
          return res.status(404).json({ message: "Secteur non trouvé" });
      }

      // Generate client code
      const counter = await CounterModel.findOneAndUpdate(
          { model: 'client' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
      );

      if (!counter || !counter.seq) {
          return res.status(500).json({ message: 'Erreur lors de la génération du code Client.' });
      }

      const code = counter.seq;

      // Validate bank accounts if provided
      if (bankAccounts && bankAccounts.length > 0) {
          // Verify all referenced banks exist
          const bankIds = bankAccounts.map(acc => acc.banque);
          const existingBanks = await BanqueClient.countDocuments({ _id: { $in: bankIds } });
          
          if (existingBanks !== bankIds.length) {
              return res.status(400).json({ message: 'Une ou plusieurs banques référencées n\'existent pas' });
          }

          // Verify RIBs are unique
          const ribs = bankAccounts.map(acc => acc.RIB);
          if (new Set(ribs).size !== ribs.length) {
              return res.status(400).json({ message: 'Les RIBs doivent être uniques' });
          }
      }

      // Create new client
      const newClient = await Client.create({
          code,
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
          libelleSecteur,
          codeRegion,
          libelleRegion,
          bankAccounts: bankAccounts || []
      });

      console.log("Client créé avec succès :", newClient);
      res.status(201).json(newClient);

  } catch (error) {
      console.error("Erreur lors de la création du Client :", error);
      res.status(500).json({ 
          message: 'Erreur lors de la création du Client.', 
          error: error.message 
      });
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


/*const getClientByID = async (req, res) => { 
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
}*/
 
const getClientByID = async (req, res) => { 
  try {
      // 1. Trouver le client avec population des banques et du secteur
      const client = await Client.findById(req.params.id)
            .populate({
    path: 'bankAccounts.banque',
    select: 'libelle',
    options: { lean: true }
  });
      
      if (!client) {
          return res.status(404).json({ message: "Client non trouvé" });
      }

      // 2. Si vous voulez aussi les détails complets du secteur
      let secteurDetails = null;
      if (client.codeSecteur) {
          secteurDetails = await SecteurModel.findOne({ 
              codeSecteur: client.codeSecteur 
          });
      }

      // 3. Formater les informations bancaires
      const bankAccountsWithLibelle = client.bankAccounts.map(account => ({
          ...account.toObject(),
          banqueLibelle: account.banque?.libelle || 'Inconnu'
      }));

      // 4. Préparer la réponse finale
      const response = {
          ...client._doc,
          bankAccounts: bankAccountsWithLibelle,
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
      libelleSecteur,
      codeRegion,
      libelleRegion,
      bankAccounts

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
          libelleSecteur,
          codeRegion,
          libelleRegion,
          bankAccounts: bankAccounts || [] // Handle case where no accounts are provided


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



// Méthode pour ajouter un compte bancaire à un client
const addBankAccount = async (req, res) => {
  const { clientId } = req.params;
  const { banque, RIB, adresseBanque, isPrimary } = req.body;

  try {
      // Vérification que la banque existe
      const bankExists = await BanqueClient.findById(banque);
      if (!bankExists) {
          return res.status(404).json({ message: 'Banque non trouvée' });
      }

      // Vérification que le RIB est unique
      const client = await Client.findById(clientId);
      if (client.bankAccounts.some(acc => acc.RIB === RIB)) {
          return res.status(400).json({ message: 'RIB déjà existant pour ce client' });
      }

      // Si on définit comme compte principal, on désactive l'ancien principal
      if (isPrimary) {
          await Client.updateOne(
              { _id: clientId, 'bankAccounts.isPrimary': true },
              { $set: { 'bankAccounts.$.isPrimary': false } }
          );
      }

      const updatedClient = await Client.findByIdAndUpdate(
          clientId,
          {
              $push: {
                  bankAccounts: {
                      banque,
                      RIB,
                      adresseBanque,
                      isPrimary: isPrimary || false
                  }
              }
          },
          { new: true }
      ).populate('bankAccounts.banque');

      res.json(updatedClient);
  } catch (error) {
      res.status(500).json({ 
          message: 'Erreur lors de l\'ajout du compte bancaire',
          error: error.message 
      });
  }
};

// Méthode pour supprimer un compte bancaire d'un client
const removeBankAccount = async (req, res) => {
  const { clientId, accountId } = req.params;

  try {
      const updatedClient = await Client.findByIdAndUpdate(
          clientId,
          {
              $pull: {
                  bankAccounts: { _id: accountId }
              }
          },
          { new: true }
      ).populate('bankAccounts.banque');

      if (!updatedClient) {
          return res.status(404).json({ message: 'Client non trouvé' });
      }

      res.json(updatedClient);
  } catch (error) {
      res.status(500).json({ 
          message: 'Erreur lors de la suppression du compte bancaire',
          error: error.message 
      });
  }
};

//Get banque par Client 
const getBanqueParClient = async (req, res) => {
    try {
      const { clientId } = req.params;
      
      if (!clientId) {
        return res.status(400).json({ message: "L'ID du client est requis" });
      }
  
      // Récupérer le client avec ses comptes bancaires et les infos des banques
      const client = await Client.findById(clientId)
        .populate('bankAccounts.banque', 'libelle code_banque'  )
        .lean();
  
      if (!client) {
        return res.status(404).json({ message: "Client non trouvé" });
      }
  
      // Extraire les banques uniques (sans doublons)
      const banquesUniques = [];
      const banquesIds = new Set();
  
      client.bankAccounts.forEach(account => {
        if (account.banque && !banquesIds.has(account.banque._id.toString())) {
          banquesIds.add(account.banque._id.toString());
          banquesUniques.push({
            _id: account.banque._id,
            libelle: account.banque.libelle,
            code_banque: account.banque.code_banque,
          });
        }
      });
  
      res.status(200).json(banquesUniques);
    } catch (error) {
      res.status(500).json({ 
        message: "Erreur lors de la récupération des banques du client",
        error: error.message 
      });
    }
  };


  //get comptes par  banque client 
  /*const getComptesParBanqueClient = async (req, res) => {
    try {
      const { clientId, banqueId } = req.params;
      
      const client = await Client.findById(clientId)
        .populate('bankAccounts.banque', 'libelle code_banque');
  
      if (!client) {
        return res.status(404).json({ message: "Client non trouvé" });
      }
  
      // Filtrer les comptes pour la banque spécifique
      const comptes = client.bankAccounts.filter(account => 
        account.banque && account.banque._id.toString() === banqueId
      );
  
      res.status(200).json(comptes);
    } catch (error) {
      res.status(500).json({ 
        message: "Erreur lors de la récupération des comptes",
        error: error.message 
      });
    }
  };*/

  const getComptesParBanqueClient = async (req, res) => {
    try {
      const { clientId, banqueId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(clientId) || 
          !mongoose.Types.ObjectId.isValid(banqueId)) {
        return res.status(400).json({ message: "ID invalide" });
      }
      
      const client = await Client.findById(clientId)
        .populate('bankAccounts.banque', 'libelle code_banque');
  
      if (!client) {
        return res.status(404).json({ message: "Client non trouvé" });
      }
  
      // Filtrer les comptes pour la banque spécifique
      const comptes = client.bankAccounts.filter(account => 
        account.banque && account.banque._id.toString() === banqueId
      );
  
      if (comptes.length === 0) {
        return res.status(404).json({ message: "Aucun compte trouvé pour cette banque" });
      }
  
      res.status(200).json(comptes);
    } catch (error) {
      console.error("Error in getComptesParBanqueClient:", error);
      res.status(500).json({ 
        message: "Erreur lors de la récupération des comptes",
        error: error.message 
      });
    }
  };

//Get regions par secteur
const getRegionsBySecteur = async (req, res) => {
    try {
      const { secteurId } = req.params;

      if (!secteurId) {
        return res.status(400).json({ message: "L'ID du secteur est requis" });
      }

      // Récupérer les régions pour le secteur spécifié
      const regions = await RegionModel.find({ secteur: secteurId })
        .populate('secteur', 'codeSecteur libelle')
        .lean();

      if (!regions || regions.length === 0) {
        return res.status(404).json({ message: "Aucune région trouvée pour ce secteur" });
      }

      res.status(200).json(regions);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des régions du secteur",
        error: error.message
      });
    }
  };

module.exports={getClients, getClientByID, createClient, updateClient, deleteClient, addBankAccount,removeBankAccount,getBanqueParClient,getComptesParBanqueClient,getRegionsBySecteur};