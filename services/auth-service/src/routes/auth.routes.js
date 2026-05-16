const express = require('express');
const { register, login, getMe, updateProfile } = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateProfile);

module.exports = router;
