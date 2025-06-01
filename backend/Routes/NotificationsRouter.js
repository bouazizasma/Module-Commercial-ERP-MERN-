// Dans votre fichier de routes
const express = require('express');
const router = express.Router();
const Notification = require('../Models/notification');

// Récupérer toutes les notifications
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Marquer une notification comme lue
router.patch('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        res.json(notification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Marquer toutes les notifications comme lues
router.patch('/mark-all-read', async (req, res) => {
    try {
        await Notification.updateMany(
            { read: false },
            { $set: { read: true } }
        );
        res.json({ message: 'Toutes les notifications marquées comme lues' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;