# Guide de test des notifications

## Problèmes identifiés et corrigés :

1. **NotificationProvider manquant dans App.js** ✅ CORRIGÉ
   - Ajouté l'import du NotificationProvider
   - Enveloppé l'application dans le NotificationProvider

2. **Route des notifications manquante dans le backend** ✅ CORRIGÉ
   - Ajouté l'import de NotificationsRouter dans index.js
   - Enregistré la route `/notifications` dans le serveur

3. **Middleware de vérification de stock non utilisé** ✅ CORRIGÉ
   - Corrigé l'export du middleware StockCheckMiddleware
   - Ajouté le middleware aux routes de création de bons de réception (achat)
   - Ajouté le middleware aux routes de création de bons de livraison (ventes)

4. **Logs de débogage ajoutés** ✅ AJOUTÉ
   - Ajouté des logs dans NotificationContext pour diagnostiquer les problèmes

## Étapes pour tester :

### 1. Démarrer le serveur backend
```bash
cd backend
npm start
```

### 2. Créer des notifications de test
```bash
cd backend
node testNotifications.js
```

### 3. Démarrer le frontend
```bash
cd frontend
npm start
```

### 4. Vérifier les notifications
- Ouvrir la console du navigateur (F12)
- Regarder les logs de récupération des notifications
- Cliquer sur l'icône de notification dans la navbar
- Vérifier que les notifications s'affichent

### 5. Tester la création automatique de notifications
- Créer un bon de réception avec des articles qui ont un stock faible
- Créer un bon de livraison
- Vérifier que de nouvelles notifications sont générées

## Vérifications supplémentaires :

1. **Vérifier que MongoDB est démarré**
2. **Vérifier que le port 5000 est libre pour le backend**
3. **Vérifier que le port 3000 est libre pour le frontend**
4. **Vérifier les logs de la console pour les erreurs CORS ou de réseau**
