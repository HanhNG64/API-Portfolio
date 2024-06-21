const express = require('express');
const userController = require('../controllers/user');
let router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
