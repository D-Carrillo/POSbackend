const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/reports/:period/:customerId', reportController.getCustomerReports);
router.get('/supplier/:supplierId', reportController.getSupplierReport);
router.get('/spending/:userID', reportController.getSpendingReport);

router.get('/supplier-sales/:supplierId', reportController.getSupplierSalesSummary);

router.get('/top-selling-items', reportController.getTopSellingItems);

router.get('/supplier/:supplierId/top-selling-items', (req, res, next) => {
    req.query.supplierId = req.params.supplierId;
    next();
}, reportController.getTopSellingItems);

module.exports = router;