const express = require('express');
const router = express.Router();
const { verifierToken, verifierAdmin } = require('../middleware/auth');
const { dernieresDonnees, mesDonneesSante, historiqueEmploye } = require('../controllers/santeController');

router.get('/dernieres-donnees', verifierToken, dernieresDonnees);
router.get('/me', verifierToken, mesDonneesSante);
router.get('/historique/:employeId', verifierToken, verifierAdmin, historiqueEmploye);

module.exports = router;
