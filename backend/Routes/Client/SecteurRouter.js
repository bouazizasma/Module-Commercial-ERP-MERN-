const express = require('express');
const router = express.Router();
const {
    createSecteur,
    getSecteurs,
    getSecteurByID,
    updateSecteur,
    deleteSecteur,
} = require('../../Controllers/SecteurController');

// Create a new Secteur
router.post('/newSecteur', createSecteur);

// Get all Secteurs
router.get('/Secteurs', getSecteurs);

// Get a single Secteur by ID
router.get('/:id', getSecteurByID);

// Update a Secteur
router.put('/:id', updateSecteur);

// Delete a Secteur
router.delete('/:id', deleteSecteur);

module.exports = router;