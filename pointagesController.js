const { db } = require('../config/firebase');

// Faire check-in ou check-out
const enregistrerPointage = async (req, res) => {
    try {
        const { type } = req.body; // 'check_in' ou 'check_out'
        const employeId = req.utilisateur.id;
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toTimeString().split(' ')[0];
        
        const pointageRef = db.collection('pointages');
        const snapshot = await pointageRef
            .where('employeId', '==', employeId)
            .where('date', '==', today)
            .get();
        
        if (snapshot.empty && type === 'check_in') {
            await pointageRef.add({
                employeId,
                date: today,
                check_in: now,
                check_out: null,
                created_at: new Date()
            });
            res.json({ success: true, message: `✅ Check-in à ${now}` });
        } else if (!snapshot.empty && type === 'check_out') {
            let docId;
            snapshot.forEach(doc => { docId = doc.id; });
            await pointageRef.doc(docId).update({ check_out: now });
            res.json({ success: true, message: `✅ Check-out à ${now}` });
        } else {
            res.status(400).json({ 
                success: false, 
                message: type === 'check_in' ? 'Vous avez déjà pointé aujourd\'hui' : 'Vous n\'avez pas fait de check-in' 
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mes pointages (pour l'employé connecté)
// Dans pointagesController.js - Version temporaire sans double filtre
const mesPointages = async (req, res) => {
    try {
        const userId = req.utilisateur.id;
        
        // Récupérer TOUS les pointages (attention aux performances)
        const snapshot = await db.collection('pointages').get();
        
        const pointages = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.employeId === userId) {
                pointages.push({ id: doc.id, ...data });
            }
        });
        
        // Trier par date décroissante
        pointages.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.json({ success: true, pointages: pointages.slice(0, 30) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Pointages d'un employé (ADMIN seulement)
const pointagesEmploye = async (req, res) => {
    try {
        const { employeId } = req.params;
        
        const snapshot = await db.collection('pointages')
            .where('employeId', '==', employeId)
            .orderBy('date', 'desc')
            .limit(50)
            .get();
        
        const pointages = [];
        snapshot.forEach(doc => {
            pointages.push({ id: doc.id, ...doc.data() });
        });
        
        res.json({ success: true, pointages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tous les pointages (pour ADMIN - graphique)
const tousLesPointages = async (req, res) => {
    try {
        // Récupérer tous les pointages
        const snapshot = await db.collection('pointages').get();
        
        const pointages = [];
        snapshot.forEach(doc => {
            pointages.push({ id: doc.id, ...doc.data() });
        });
        
        // Trier par date décroissante
        pointages.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.json({ success: true, pointages });
    } catch (error) {
        console.error('Erreur tousLesPointages:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { enregistrerPointage, mesPointages, pointagesEmploye, tousLesPointages };
