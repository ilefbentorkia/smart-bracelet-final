const { db } = require('../config/firebase');

// Mes alertes (pour employé connecté)
const mesAlertes = async (req, res) => {
    try {
        const userId = req.utilisateur.id;
        
        const snapshot = await db.collection('alertes')
            .where('employeId', '==', userId)
            .orderBy('created_at', 'desc')
            .limit(20)
            .get();
        
        const alertes = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            alertes.push({
                id: doc.id,
                employeId: data.employeId,
                employeNom: data.employeNom,
                alert_type: data.alert_type,
                alert_message: data.alert_message,
                niveau: data.niveau,
                resolu: data.resolu || false,
                created_at: data.created_at || new Date()
            });
        });
        
        res.json({ success: true, alertes });
    } catch (error) {
        console.error('Erreur mesAlertes:', error.message);
        res.json({ success: true, alertes: [] });
    }
};

// Alertes non résolues (pour admin)
const alertesNonResolues = async (req, res) => {
    try {
        // Récupérer TOUTES les alertes (sans filtre orderBy pour éviter l'index)
        const snapshot = await db.collection('alertes').get();
        
        const alertes = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Filtrer manuellement celles qui ne sont PAS résolues
            if (data.resolu === false) {
                alertes.push({
                    id: doc.id,
                    employeId: data.employeId,
                    employeNom: data.employeNom || 'Inconnu',
                    alert_type: data.alert_type,
                    alert_message: data.alert_message,
                    niveau: data.niveau || 'warning',
                    resolu: data.resolu || false,
                    created_at: data.created_at || new Date()
                });
            }
        });
        
        // Trier par date décroissante
        alertes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        console.log(`📊 ${alertes.length} alertes non résolues trouvées`);
        
        res.json({ success: true, alertes });
    } catch (error) {
        console.error('Erreur alertesNonResolues:', error.message);
        res.json({ success: true, alertes: [] });
    }
};

// Toutes les alertes (pour admin)
const toutesAlertes = async (req, res) => {
    try {
        const snapshot = await db.collection('alertes')
            .orderBy('created_at', 'desc')
            .limit(100)
            .get();
        
        const alertes = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            alertes.push({
                id: doc.id,
                employeId: data.employeId,
                employeNom: data.employeNom,
                alert_type: data.alert_type,
                alert_message: data.alert_message,
                niveau: data.niveau,
                resolu: data.resolu || false,
                created_at: data.created_at || new Date()
            });
        });
        
        res.json({ success: true, alertes });
    } catch (error) {
        console.error('Erreur toutesAlertes:', error.message);
        res.json({ success: true, alertes: [] });
    }
};

// Résoudre une alerte
const resoudreAlerte = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('alertes').doc(id).update({
            resolu: true,
            resolu_par: req.utilisateur.id,
            resolu_le: new Date()
        });
        res.json({ success: true, message: 'Alerte résolue' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { mesAlertes, alertesNonResolues, toutesAlertes, resoudreAlerte };
