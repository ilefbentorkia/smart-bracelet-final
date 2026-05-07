const express = require('express');
const router = express.Router();
const { verifierToken, verifierAdmin } = require('../middleware/auth');
const { enregistrerPointage, mesPointages, pointagesEmploye, tousLesPointages } = require('../controllers/pointagesController');

router.post('/', verifierToken, enregistrerPointage);
router.get('/me', verifierToken, mesPointages);
router.get('/employe/:employeId', verifierToken, verifierAdmin, pointagesEmploye);
router.get('/', verifierToken, verifierAdmin, tousLesPointages);  // ← AJOUTEZ CETTE LIGNE

module.exports = router;
