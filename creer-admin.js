require('dotenv').config();
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const serviceAccount = require('../firebase-credentials.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function creerAdmin() {
    try {
        const email = 'admin@smartbracelet.com';
        const mot_de_passe = 'Admin123!';
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
        
        const snapshot = await db.collection('employes')
            .where('email', '==', email)
            .get();
        
        if (!snapshot.empty) {
            console.log('⚠️ Un admin existe déjà !');
            return;
        }
        
        await db.collection('employes').add({
            nom: 'Admin',
            prenom: 'System',
            email: email,
            mot_de_passe: hashedPassword,
            role: 'admin',
            department: 'IT',
            date_inscription: new Date(),
            actif: true
        });
        
        console.log('✅ Admin créé avec succès !');
        console.log('📧 Email: admin@smartbracelet.com');
        console.log('🔑 Mot de passe: Admin123!');
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

creerAdmin();
