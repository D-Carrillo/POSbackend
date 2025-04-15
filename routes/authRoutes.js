const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.put('/update/:type/:id', authController.updateUser);
router.get('/user/:type/:id', authController.getUser);
router.patch('/deletion/:type/:id', authController.deleteUser);

module.exports = router;