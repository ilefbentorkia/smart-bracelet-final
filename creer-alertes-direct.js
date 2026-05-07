/ scripts/creer-alertes-direct.js
require('dotenv').config();

let admin;
try {
    admin = require('firebase-admin');
    if (!admin.apps.length) {
        const serviceAccount = require('../firebase-credentials.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase initialisé');
    }
} catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
}

const db = admin.firestore();

async function creerAlertes() {
    try {
        // Récupérer les employés avec leurs noms
        const employesSnapshot = await db.collection('employes').get();
        const employes = [];
        employesSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.role !== 'admin') {
                employes.push({ 
                    id: doc.id, 
                    nom: data.nom, 
                    prenom: data.prenom,
                    nomComplet: `${data.prenom} ${data.nom}`
                });
            }
        });
        
        console.log(`📋 ${employes.length} employés trouvés\n`);
        
        // Supprimer les anciennes alertes
        const anciennesAlertes = await db.collection('alertes').get();
        let deletedCount = 0;
        for (const doc of anciennesAlertes.docs) {
            await db.collection('alertes').doc(doc.id).delete();
            deletedCount++;
        }
        console.log(`🗑️ ${deletedCount} anciennes alertes supprimées\n`);
        
        // Types d'alertes avec messages personnalisés
        const typesAlertes = [
            { 
                type: 'high_heart_rate', 
                niveau: 'critical', 
                messages: [
                    'Fréquence cardiaque très élevée',
                    'Tachycardie détectée',
                    'Rythme cardiaque anormalement rapide',
                    'Palpitations cardiaques importantes'
                ] 
            },
            { 
                type: 'fever', 
                niveau: 'warning', 
                messages: [
                    'Température corporelle élevée',
                    'Fièvre suspectée',
                    'Hyperthermie détectée',
                    'Température anormalement haute'
                ] 
            },
            { 
                type: 'low_spo2', 
                niveau: 'critical', 
                messages: [
                    'Oxygénation sanguine basse',
                    'Désaturation en oxygène',
                    'Hypoxie détectée',
                    'Niveau d\'oxygène critique'
                ] 
            },
            { 
                type: 'signal_perdu', 
                niveau: 'warning', 
                messages: [
                    'Bracelet déconnecté',
                    'Signal du bracelet perdu',
                    'Perte de connexion bracelet',
                    'Bracelet hors ligne'
                ] 
            }
        ];
        
        // Créer des alertes pour chaque employé
        let totalAlertes = 0;
        
        for (const emp of employes) {
            const nbAlertes = 2 + Math.floor(Math.random() * 4);
            console.log(`🔔 ${emp.nomComplet}: ${nbAlertes} alertes`);
            
            for (let i = 0; i < nbAlertes; i++) {
                const type = typesAlertes[Math.floor(Math.random() * typesAlertes.length)];
                const messageBase = type.messages[Math.floor(Math.random() * type.messages.length)];
                
                let valeur = '';
                let messageComplet = messageBase;
                
                switch (type.type) {
                    case 'high_heart_rate':
                        const bpm = 100 + Math.floor(Math.random() * 40);
                        valeur = `${bpm} BPM`;
                        messageComplet = `${messageBase} : ${valeur}`;
                        break;
                    case 'fever':
                        const temp = (37.5 + Math.random() * 1.5).toFixed(1);
                        valeur = `${temp}°C`;
                        messageComplet = `${messageBase} : ${valeur}`;
                        break;
                    case 'low_spo2':
                        const spo2 = 85 + Math.floor(Math.random() * 10);
                        valeur = `${spo2}%`;
                        messageComplet = `${messageBase} : ${valeur}`;
                        break;
                    default:
                        messageComplet = messageBase;
                }
                
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 5));
                date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
                
                await db.collection('alertes').add({
                    employeId: emp.id,
                    employeNom: emp.nomComplet,  // ← NOM COMPLET DE L'EMPLOYÉ
                    alert_type: type.type,
                    alert_message: messageComplet,
                    niveau: type.niveau,
                    resolu: false,
                    created_at: date
                });
                totalAlertes++;
            }
        }
        
        console.log(`\n✅ ${totalAlertes} alertes créées avec succès !`);
        
        // Vérification
        const verification = await db.collection('alertes').get();
        console.log(`📊 Total alertes dans Firebase: ${verification.size}`);
        
        // Afficher un exemple
        const sample = await db.collection('alertes').limit(3).get();
        console.log('\n📝 Exemple des alertes créées:');
        sample.forEach(doc => {
            const data = doc.data();
            console.log(`   - ${data.employeNom}: ${data.alert_message} (${data.niveau})`);
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

creerAlertes();
