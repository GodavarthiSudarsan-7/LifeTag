const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contactsController');
const auth = require('../middleware/auth');

router.get('/', auth, contactsController.getContacts);
router.post('/', auth, contactsController.addContact);
router.put('/:id', auth, contactsController.updateContact);
router.delete('/:id', auth, contactsController.deleteContact);
router.put('/:id/primary', auth, contactsController.setPrimaryContact);

module.exports = router;
