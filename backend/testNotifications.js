// Script de test pour créer des notifications de test
const mongoose = require('mongoose');
const Notification = require('./Models/notification');

// Connexion à MongoDB (ajustez l'URL selon votre configuration)
mongoose.connect('mongodb://localhost:27017/commercial', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const createTestNotifications = async () => {
    try {
        // Supprimer les anciennes notifications de test
        await Notification.deleteMany({ message: { $regex: /Test/ } });

        // Créer quelques notifications de test
        const testNotifications = [
            {
                message: "Test - Stock faible pour l'article ABC123 - Produit Test. Stock actuel: 5, Minimum: 10",
                type: 'stock',
                read: false
            },
            {
                message: "Test - Nouvelle commande reçue",
                type: 'system',
                read: false
            },
            {
                message: "Test - Alerte système importante",
                type: 'alert',
                read: true
            }
        ];

        const createdNotifications = await Notification.insertMany(testNotifications);
        console.log('Notifications de test créées:', createdNotifications.length);
        
        // Afficher toutes les notifications
        const allNotifications = await Notification.find().sort({ createdAt: -1 });
        console.log('Toutes les notifications:', allNotifications);
        
    } catch (error) {
        console.error('Erreur lors de la création des notifications de test:', error);
    } finally {
        mongoose.connection.close();
    }
};

createTestNotifications();
