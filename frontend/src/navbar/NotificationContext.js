// NotificationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            console.log("Tentative de récupération des notifications...");
            const response = await axios.get('http://localhost:5000/notifications');
            console.log("Notifications reçues:", response.data);
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.read).length);
            console.log("Nombre de notifications non lues:", response.data.filter(n => !n.read).length);
        } catch (error) {
            console.error("Erreur lors de la récupération des notifications:", error);
            console.error("Détails de l'erreur:", error.response?.data || error.message);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.patch(`http://localhost:5000/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error("Erreur lors du marquage comme lu:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.patch('http://localhost:5000/notifications/mark-all-read');
            fetchNotifications();
        } catch (error) {
            console.error("Erreur lors du marquage comme lu:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        // Rafraîchir les notifications toutes les 5 minutes
        const interval = setInterval(fetchNotifications, 300000);
        return () => clearInterval(interval);
    }, []);

    return (
        <NotificationContext.Provider 
            value={{ 
                notifications, 
                unreadCount, 
                fetchNotifications, 
                markAsRead, 
                markAllAsRead 
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);