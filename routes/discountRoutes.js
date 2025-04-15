const express = require('express');
const router = express.Router();
const discountsController = require('../controllers/discountsController');

router.put('/addDiscount', discountsController.addDiscount);
router.get('/getDiscounts/:supplierID', discountsController.getDiscount);
router.post('/deleteDiscount/:discountID', discountsController.deleteDiscount);
router.get('/getDiscountsByName/:code', discountsController.getCodes);

module.exports = router;