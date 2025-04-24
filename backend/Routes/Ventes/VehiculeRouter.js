const express = require('express');
const router = express.Router();
const {
    createVehicule,
    getVehicules,
    getVehiculeByID,
    updateVehicule,
    deleteVehicule,
} = require('../../Controllers/VehiculeController');

// Create a new Secteur
router.post('/newVehicule', createVehicule);

// Get all Secteurs
router.get('/Vehicules', getVehicules);

// Get a single Secteur by ID
router.get('/:id', getVehiculeByID);

// Update a Secteur
router.put('/:id', updateVehicule);

// Delete a Secteur
router.delete('/:id', deleteVehicule);

module.exports = router;