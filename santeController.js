const { db } = require('../config/firebase');

// Mes données santé
const mesDonneesSante = async (req, res) => {
    try {
        const userId = req.utilisateur.id;
        
        const snapshot = await db.collection('sante_data')
            .where('employeId', '==', userId)
            .orderBy('recorded_at', 'desc')
            .limit(50)
            .get();
        
        const donnees = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            donnees.push({
                id: doc.id,
                heartRate: data.heart_rate || data.heartRate,
                temperature: data.temperature,
                spO2: data.spO2,
                timestamp: data.recorded_at || data.timestamp
            });
        });
        
        // Si pas de données, générer des données simulées
        if (donnees.length === 0) {
            const donneesSimulees = [];
            for (let i = 0; i < 10; i++) {
                const date = new Date();
                date.setHours(date.getHours() - i);
                donneesSimulees.push({
                    heartRate: 65 + Math.floor(Math.random() * 25),
                    temperature: Number((36.2 + Math.random() * 1.2).toFixed(1)),
                    spO2: 95 + Math.floor(Math.random() * 4),
                    timestamp: date.toISOString()
                });
            }
            return res.json({ 
                success: true, 
                source: 'simulation',
                donnees: donneesSimulees 
            });
        }
        
        res.json({ success: true, donnees });
    } catch (error) {
        console.error('Erreur mesDonneesSante:', error.message);
        // En cas d'erreur, retourner des données simulées
        const donneesSimulees = [];
        for (let i = 0; i < 10; i++) {
            const date = new Date();
            date.setHours(date.getHours() - i);
            donneesSimulees.push({
                heartRate: 65 + Math.floor(Math.random() * 25),
                temperature: Number((36.2 + Math.random() * 1.2).toFixed(1)),
                spO2: 95 + Math.floor(Math.random() * 4),
                timestamp: date.toISOString()
            });
        }
        res.json({ success: true, source: 'simulation', donnees: donneesSimulees });
    }
};

// Dernières données (tous les employés)
const dernieresDonnees = async (req, res) => {
    try {
        const snapshot = await db.collection('sante_data')
            .orderBy('recorded_at', 'desc')
            .limit(50)
            .get();
        
        const donnees = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            donnees.push({
                id: doc.id,
                employeId: data.employeId,
                heartRate: data.heart_rate || data.heartRate,
                temperature: data.temperature,
                spO2: data.spO2,
                timestamp: data.recorded_at || data.timestamp
            });
        });
        
        res.json({ success: true, donnees });
    } catch (error) {
        console.error('Erreur dernieresDonnees:', error.message);
        res.json({ success: true, donnees: [] });
    }
};

// Historique d'un employé
const historiqueEmploye = async (req, res) => {
    try {
        const { employeId } = req.params;
        const snapshot = await db.collection('sante_data')
            .where('employeId', '==', employeId)
            .orderBy('recorded_at', 'desc')
            .limit(100)
            .get();
        
        const historique = [];
        snapshot.forEach(doc => {
            historique.push({ id: doc.id, ...doc.data() });
        });
        
        res.json({ success: true, historique });
    } catch (error) {
        console.error('Erreur historiqueEmploye:', error.message);
        res.json({ success: true, historique: [] });
    }
};

module.exports = { dernieresDonnees, mesDonneesSante, historiqueEmploye };
