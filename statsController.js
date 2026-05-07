const { db } = require('../config/firebase');

// Calculer les heures totales du mois (hors admin)
async function getTotalHeuresMois() {
    try {
        const now = new Date();
        const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
        const debutMoisStr = debutMois.toISOString().split('T')[0];
        
        // Récupérer les IDs des employés (hors admin)
        const employesSnapshot = await db.collection('employes')
            .where('role', '!=', 'admin')
            .get();
        
        const employesIds = [];
        employesSnapshot.forEach(doc => employesIds.push(doc.id));
        
        if (employesIds.length === 0) return 0;
        
        // Récupérer les pointages du mois
        const pointagesSnapshot = await db.collection('pointages')
            .where('date', '>=', debutMoisStr)
            .get();
        
        let totalHeures = 0;
        pointagesSnapshot.forEach(doc => {
            const data = doc.data();
            if (employesIds.includes(data.employeId) && data.check_in && data.check_out) {
                const [inH, inM] = data.check_in.split(':');
                const [outH, outM] = data.check_out.split(':');
                let hours = parseInt(outH) - parseInt(inH);
                let minutes = parseInt(outM) - parseInt(inM);
                if (minutes < 0) { hours--; minutes += 60; }
                totalHeures += hours + (minutes / 60);
            }
        });
        
        return Math.round(totalHeures);
    } catch (error) {
        console.error('Erreur calcul heures mois:', error.message);
        return 0;
    }
}

// Calculer le BPM moyen (hors admin)
async function getBpmMoyen() {
    try {
        // Récupérer les IDs des employés (hors admin)
        const employesSnapshot = await db.collection('employes')
            .where('role', '!=', 'admin')
            .get();
        
        const employesIds = [];
        employesSnapshot.forEach(doc => employesIds.push(doc.id));
        
        if (employesIds.length === 0) return 72;
        
        // Récupérer les données santé
        const snapshot = await db.collection('sante_data')
            .orderBy('recorded_at', 'desc')
            .limit(200)
            .get();
        
        let totalBpm = 0;
        let count = 0;
        
        snapshot.forEach(doc => {
            const data = doc.data();
            if (employesIds.includes(data.employeId)) {
                const bpm = data.heart_rate || data.heartRate;
                if (bpm) {
                    totalBpm += bpm;
                    count++;
                }
            }
        });
        
        return count > 0 ? Math.round(totalBpm / count) : 72;
    } catch (error) {
        console.error('Erreur calcul BPM moyen:', error.message);
        return 72;
    }
}

// Obtenir le top 5 des employés (hors admin)
async function getTopEmployes(limit = 5) {
    try {
        // Récupérer TOUS les employés (sauf admin)
        const employesSnapshot = await db.collection('employes')
            .where('role', '!=', 'admin')
            .get();
        
        const employes = {};
        employesSnapshot.forEach(doc => {
            const data = doc.data();
            employes[doc.id] = { 
                id: doc.id,
                nom: data.nom, 
                prenom: data.prenom, 
                department: data.department
            };
        });
        
        if (Object.keys(employes).length === 0) return [];
        
        // Récupérer tous les pointages
        const pointagesSnapshot = await db.collection('pointages').get();
        
        const maintenant = new Date();
        const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
        const debutMoisStr = debutMois.toISOString().split('T')[0];
        
        const heuresParEmploye = {};
        
        pointagesSnapshot.forEach(doc => {
            const data = doc.data();
            // Vérifier que l'employé existe (non-admin) et que c'est un pointage du mois
            if (employes[data.employeId] && data.date >= debutMoisStr && data.check_in && data.check_out) {
                const [inH, inM] = data.check_in.split(':');
                const [outH, outM] = data.check_out.split(':');
                let hours = parseInt(outH) - parseInt(inH);
                let minutes = parseInt(outM) - parseInt(inM);
                if (minutes < 0) { hours--; minutes += 60; }
                const totalHeures = hours + (minutes / 60);
                heuresParEmploye[data.employeId] = (heuresParEmploye[data.employeId] || 0) + totalHeures;
            }
        });
        
        const top = Object.entries(heuresParEmploye)
            .map(([id, heures]) => ({ id, ...employes[id], heures: Math.round(heures * 10) / 10 }))
            .filter(e => e.heures > 0)
            .sort((a, b) => b.heures - a.heures)
            .slice(0, limit);
        
        return top;
    } catch (error) {
        console.error('Erreur top employes:', error.message);
        return [];
    }
}

// Obtenir l'employé du mois (hors admin)
async function getEmployeDuMois() {
    const top = await getTopEmployes(1);
    return top[0] || null;
}

// Route API pour les statistiques globales
const getStats = async (req, res) => {
    try {
        const [totalHeures, bpmMoyen, topEmployes, employeDuMois] = await Promise.all([
            getTotalHeuresMois(),
            getBpmMoyen(),
            getTopEmployes(5),
            getEmployeDuMois()
        ]);
        
        res.json({
            success: true,
            stats: {
                totalHeuresMois: totalHeures,
                bpmMoyen: bpmMoyen,
                topEmployes: topEmployes,
                employeDuMois: employeDuMois
            }
        });
    } catch (error) {
        console.error('Erreur getStats:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getStats, getTotalHeuresMois, getBpmMoyen, getTopEmployes, getEmployeDuMois };
