const express = require('express');
const router = express.Router();
const { verifierToken, verifierAdmin } = require('../middleware/auth');
const {
    listerEmployes,
    voirEmploye,
    creerEmploye,
    modifierEmploye,
    supprimerEmploye,
    monProfil,
    modifierMonProfil
} = require('../controllers/employesController');

// Routes ADMIN seulement
router.get('/', verifierToken, verifierAdmin, listerEmployes);
router.get('/:id', verifierToken, verifierAdmin, voirEmploye);
router.post('/', verifierToken, verifierAdmin, creerEmploye);
router.put('/:id', verifierToken, verifierAdmin, modifierEmploye);
router.delete('/:id', verifierToken, verifierAdmin, supprimerEmploye);

// Routes pour tout le monde (son propre profil)
router.get('/me/profil', verifierToken, monProfil);
router.put('/me/profil', verifierToken, modifierMonProfil);

module.exports = router;
