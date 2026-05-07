const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

// Inscription
const signup = async (req, res) => {
    try {
        const { nom, prenom, email, mot_de_passe, department } = req.body;
        
        // Vérifier si l'email existe déjà
        const emailCheck = await db.collection('employes')
            .where('email', '==', email)
            .get();
        
        if (!emailCheck.empty) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cet email est déjà utilisé' 
            });
        }
        
        // Crypter le mot de passe
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
        
        // Créer l'employé (par défaut rôle 'employe')
        const employeData = {
            nom,
            prenom,
            email,
            mot_de_passe: hashedPassword,
            role: 'employe',  // Par défaut, pas admin !
            department: department || 'Non spécifié',
            date_inscription: new Date(),
            actif: true
        };
        
        const docRef = await db.collection('employes').add(employeData);
        
        // Créer un token
        const token = jwt.sign(
            { id: docRef.id, email, role: 'employe' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Inscription réussie !',
            token,
            employe: {
                id: docRef.id,
                nom,
                prenom,
                email,
                role: 'employe'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Connexion
const login = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;
        
        // Chercher l'utilisateur
        const snapshot = await db.collection('employes')
            .where('email', '==', email)
            .get();
        
        if (snapshot.empty) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email ou mot de passe incorrect' 
            });
        }
        
        let employeData;
        let employeId;
        snapshot.forEach(doc => {
            employeId = doc.id;
            employeData = doc.data();
        });
        
        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(mot_de_passe, employeData.mot_de_passe);
        
        if (!validPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email ou mot de passe incorrect' 
            });
        }
        
        // Créer le token
        const token = jwt.sign(
            { id: employeId, email: employeData.email, role: employeData.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Connexion réussie !',
            token,
            employe: {
                id: employeId,
                nom: employeData.nom,
                prenom: employeData.prenom,
                email: employeData.email,
                role: employeData.role,
                department: employeData.department
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { signup, login };
