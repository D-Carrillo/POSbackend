const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/itemsController');

router.get('/', itemsController.getAllItems);
router.post('/item-entry', itemsController.itemEntry);
router.get('/supplier/:supplierId',itemsController.getSupplierItems);
router.post('/deleteitem/:itemId', itemsController.itemdelete);
router.put('/modify/:itemId', itemsController.modify);
router.put('/stock/:itemId', itemsController.updateStock);
router.get('/search', itemsController.searchItems);

module.exports = router;