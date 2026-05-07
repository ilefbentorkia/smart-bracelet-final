// scripts/initialiser-donnees.js
require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-credentials.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Copiez ici les fonctions genererPointagesPourEmploye, etc.
// Ou importez-les depuis simulationIoT.js

async function initialiser() {
    console.log('🚀 Démarrage de l\'initialisation des données...');
    
    // Récupérer tous les employés
    const snapshot = await db.collection('employes').get();
    const employes = [];
    snapshot.forEach(doc => {
        employes.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`📋 ${employes.length} employés trouvés`);
    
    // Pour chaque employé, générer des pointages
    for (const employe of employes) {
        if (employe.email === 'admin@smartbracelet.com') continue; // Skip admin
        
        console.log(`\n📝 Génération pour ${employe.prenom} ${employe.nom}...`);
        
        // Pointages des 7 derniers jours ouvrés
        const jours = [6, 5, 4, 3, 2, 1];
        for (const offset of jours) {
            const date = new Date();
            date.setDate(date.getDate() - offset);
            const dateStr = date.toISOString().split('T')[0];
            
            // Éviter week-end
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) continue;
            
            // Heures aléatoires
            const heureDebut = 8 + Math.floor(Math.random() * 2);
            const minuteDebut = Math.floor(Math.random() * 30);
            const heuresTravail = 7 + Math.random() * 1.5;
            const heureFin = heureDebut + Math.floor(heuresTravail);
            const minuteFin = minuteDebut + Math.floor((heuresTravail % 1) * 60);
            
            const check_in = `${String(heureDebut).padStart(2, '0')}:${String(minuteDebut).padStart(2, '0')}:00`;
            const check_out = `${String(heureFin).padStart(2, '0')}:${String(minuteFin).padStart(2, '0')}:00`;
            
            await db.collection('pointages').add({
                employeId: employe.id,
                date: dateStr,
                check_in: check_in,
                check_out: check_out,
                created_at: new Date()
            });
            console.log(`   ✅ ${dateStr}: ${check_in} → ${check_out}`);
        }
        
        // Pointage pour aujourd'hui (seulement check-in)
        const today = new Date().toISOString().split('T')[0];
        await db.collection('pointages').add({
            employeId: employe.id,
            date: today,
            check_in: '08:30:00',
            check_out: null,
            created_at: new Date()
        });
        console.log(`   ✅ Aujourd'hui: check-in à 08:30`);
    }
    
    console.log('\n✨ Initialisation terminée !');
    process.exit(0);
}

initialiser();
