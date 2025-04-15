const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/transaction', transactionController.createTransaction);
router.post('/transaction-item', transactionController.createTransactionItem);
router.get('/userTransactions/:userId', transactionController.getUserTransactions);
router.post('/returns', transactionController.returnItem);
router.get('/getReturns', transactionController.getreturnItem);
router.post('/returns/accept', transactionController.acceptReturn);
router.post('/returns/decline', transactionController.declineReturn);

module.exports = router;