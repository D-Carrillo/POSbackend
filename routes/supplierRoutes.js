const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

router.post('/supplier-entry-form', supplierController.register);

module.exports = router;