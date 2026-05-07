// scripts/initialiser-alertes.js
require('dotenv').config();

// Ne pas réinitialiser Firebase si déjà fait
let admin;
try {
    admin = require('firebase-admin');
    // Vérifier si une app existe déjà
    if (!admin.apps.length) {
        const serviceAccount = require('../firebase-credentials.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase initialisé');
    } else {
        console.log('✅ Firebase déjà initialisé');
    }
} catch (error) {
    console.error('❌ Erreur Firebase:', error.message);
    process.exit(1);
}

const db = admin.firestore();

// Types d'alertes possibles
const TYPES_ALERTES = {
    HIGH_HEART_RATE: { type: 'high_heart_rate', niveau: 'critical', message: 'Fréquence cardiaque élevée' },
    FEVER: { type: 'fever', niveau: 'warning', message: 'Température élevée' },
    LOW_SPO2: { type: 'low_spo2', niveau: 'critical', message: 'Oxygénation sanguine basse' }
};

// Générer une alerte aléatoire
function genererAlerteAleatoire(employeId, employeNom) {
    const types = Object.values(TYPES_ALERTES);
    const typeAlerte = types[Math.floor(Math.random() * types.length)];
    
    let message = typeAlerte.message;
    
    switch (typeAlerte.type) {
        case 'high_heart_rate':
            const bpm = 100 + Math.floor(Math.random() * 40);
            message = `${typeAlerte.message} : ${bpm} BPM`;
            break;
        case 'fever':
            const temp = (37.5 + Math.random() * 1.5).toFixed(1);
            message = `${typeAlerte.message} : ${temp}°C`;
            break;
        case 'low_spo2':
            const spo2 = 85 + Math.floor(Math.random() * 10);
            message = `${typeAlerte.message} : ${spo2}%`;
            break;
    }
    
    return {
        employeId: employeId,
        employeNom: employeNom,
        alert_type: typeAlerte.type,
        alert_message: message,
        niveau: typeAlerte.niveau,
        resolu: false,
        created_at: new Date()
    };
}

// Générer des alertes pour un employé
async function genererAlertesPourEmploye(employeId, employeNom) {
    try {
        // Vérifier si l'employé a déjà des alertes
        const existing = await db.collection('alertes')
            .where('employeId', '==', employeId)
            .limit(3)
            .get();
        
        if (!existing.empty) {
            console.log(`   ⏭️ Alertes déjà existantes pour ${employeNom}`);
            return;
        }
        
        // Générer 2 à 5 alertes
        const nbAlertes = 2 + Math.floor(Math.random() * 4);
        console.log(`   🔔 Génération de ${nbAlertes} alertes pour ${employeNom}...`);
        
        for (let i = 0; i < nbAlertes; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 7));
            date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
            
            const alerte = genererAlerteAleatoire(employeId, employeNom);
            alerte.created_at = date;
            
            // 30% de chance que l'alerte soit déjà résolue
            if (Math.random() < 0.3) {
                alerte.resolu = true;
                alerte.resolu_par = employeId;
                alerte.resolu_le = new Date(date.getTime() + 3600000);
            }
            
            await db.collection('alertes').add(alerte);
        }
        
        console.log(`   ✅ ${nbAlertes} alertes générées pour ${employeNom}`);
        
    } catch (error) {
        console.error(`Erreur pour ${employeNom}:`, error.message);
    }
}

// Récupérer tous les employés (sauf admin)
async function getEmployes() {
    const snapshot = await db.collection('employes').get();
    const employes = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.role !== 'admin') {
            employes.push({
                id: doc.id,
                nom: data.nom,
                prenom: data.prenom,
                email: data.email,
                department: data.department || 'Non spécifié'
            });
        }
    });
    return employes;
}

// Générer des alertes pour tous les employés
async function genererAlertesPourTousLesEmployes() {
    try {
        console.log('\n🔔 GÉNÉRATION DES ALERTES...\n');
        
        const employes = await getEmployes();
        console.log(`📋 ${employes.length} employés trouvés\n`);
        
        for (const employe of employes) {
            await genererAlertesPourEmploye(employe.id, `${employe.prenom} ${employe.nom}`);
        }
        
        console.log('\n✅ Génération des alertes terminée !\n');
        
    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

// Exécution
genererAlertesPourTousLesEmployes()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
