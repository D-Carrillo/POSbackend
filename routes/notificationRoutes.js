const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const transactionController = require('../controllers/transactionController');

//get all notifications for a supplier
router.get('/supplier/:supplierId', notificationController.getSupplierNotifications);

//mark notification as read
router.put('/:notificationId/read', notificationController.markNotificationAsRead);
router.post('/returns/accept', transactionController.acceptReturn);
router.post('/returns/decline', transactionController.declineReturn);

module.exports = router;