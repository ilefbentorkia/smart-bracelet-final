const express = require('express');
const router = express.Router();
const { verifierToken, verifierAdmin } = require('../middleware/auth');
const { 
    mesAlertes, 
    alertesNonResolues, 
    resoudreAlerte, 
    toutesAlertes 
} = require('../controllers/alertesController');

router.get('/mes-alertes', verifierToken, mesAlertes);
router.get('/non-resolues', verifierToken, verifierAdmin, alertesNonResolues);
router.get('/', verifierToken, verifierAdmin, toutesAlertes);
router.put('/:id/resoudre', verifierToken, verifierAdmin, resoudreAlerte);

module.exports = router;
