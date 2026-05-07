const { db } = require('../config/firebase');
const bcrypt = require('bcrypt');

// 1. Lister tous les employés (ADMIN seulement)
const listerEmployes = async (req, res) => {
    try {
        const snapshot = await db.collection('employes').get();
        const employes = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            delete data.mot_de_passe; // Ne pas envoyer le mot de passe
            employes.push({ id: doc.id, ...data });
        });
        res.json({ success: true, count: employes.length, employes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Voir un employé spécifique (ADMIN seulement)
const voirEmploye = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection('employes').doc(id).get();
        
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Employé non trouvé' });
        }
        
        const data = doc.data();
        delete data.mot_de_passe;
        res.json({ success: true, employe: { id: doc.id, ...data } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Créer un employé (ADMIN seulement)
const creerEmploye = async (req, res) => {
    try {
        const { nom, prenom, email, mot_de_passe, department, role = 'employe' } = req.body;
        
        // Vérifier si l'email existe
        const emailCheck = await db.collection('employes')
            .where('email', '==', email)
            .get();
        
        if (!emailCheck.empty) {
            return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
        }
        
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
        
        const employeData = {
            nom, prenom, email,
            mot_de_passe: hashedPassword,
            role: role || 'employe',
            department: department || 'Non spécifié',
            date_inscription: new Date(),
            actif: true,
            cree_par: req.utilisateur.id
        };
        
        const docRef = await db.collection('employes').add(employeData);
        
        res.json({ 
            success: true, 
            message: 'Employé créé avec succès',
            employe: { id: docRef.id, nom, prenom, email, role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Modifier un employé (ADMIN seulement)
const modifierEmploye = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, email, department, role, actif } = req.body;
        
        const docRef = db.collection('employes').doc(id);
        const doc = await docRef.get();
        
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Employé non trouvé' });
        }
        
        const updates = {};
        if (nom) updates.nom = nom;
        if (prenom) updates.prenom = prenom;
        if (email) updates.email = email;
        if (department) updates.department = department;
        if (role) updates.role = role;
        if (actif !== undefined) updates.actif = actif;
        
        await docRef.update(updates);
        
        res.json({ success: true, message: 'Employé modifié avec succès' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Supprimer un employé (ADMIN seulement)
const supprimerEmploye = async (req, res) => {
    try {
        const { id } = req.params;
        
        const docRef = db.collection('employes').doc(id);
        const doc = await docRef.get();
        
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Employé non trouvé' });
        }
        
        await docRef.delete();
        
        res.json({ success: true, message: 'Employé supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Voir son propre profil (TOUT le monde)
const monProfil = async (req, res) => {
    try {
        const doc = await db.collection('employes').doc(req.utilisateur.id).get();
        
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Profil non trouvé' });
        }
        
        const data = doc.data();
        delete data.mot_de_passe;
        res.json({ success: true, employe: { id: doc.id, ...data } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. Modifier son propre profil (TOUT le monde)
const modifierMonProfil = async (req, res) => {
    try {
        const { nom, prenom, email } = req.body;
        
        const updates = {};
        if (nom) updates.nom = nom;
        if (prenom) updates.prenom = prenom;
        if (email) updates.email = email;
        
        await db.collection('employes').doc(req.utilisateur.id).update(updates);
        
        res.json({ success: true, message: 'Profil mis à jour' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    listerEmployes,
    voirEmploye,
    creerEmploye,
    modifierEmploye,
    supprimerEmploye,
    monProfil,
    modifierMonProfil
};
