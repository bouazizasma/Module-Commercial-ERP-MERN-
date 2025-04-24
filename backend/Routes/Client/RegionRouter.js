const express = require('express');
const router = express.Router();
const {
    createRegion,
    getRegions,
    getRegionByID,
    updateRegion,
    deleteRegion,
} = require('../../Controllers/RegionController');

// Create a new Region
router.post('/newRegion', createRegion);

// Get all Regions
router.get('/Regions', getRegions);

// Get a single Region by ID
router.get('/:id', getRegionByID);

// Update a Region
router.put('/:id', updateRegion);

// Delete a Region
router.delete('/:id', deleteRegion);

module.exports = router;