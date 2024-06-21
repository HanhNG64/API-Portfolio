const express = require('express');
let router = express.Router();
const contactController = require('../controllers/contact');

router.get('/', contactController.getAllContacts);
router.get('/toanswer', contactController.getContactsToAnswer);
router.get('/email', contactController.getContact);
router.post('/', contactController.addContact);
router.delete('/:id', contactController.deleteContact);

module.exports = router;
