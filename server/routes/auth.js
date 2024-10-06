const express = require('express');
const { check } = require('express-validator');

const authMiddleware = require('../middleware/isAuth');
const authController = require('../controllers/auth');

const router = express.Router();

router.post(
    '/signup',
    [
        check('email').trim().isEmail(),
        check('password').trim().isLength({min: 5}),
        check('name').trim().not().isEmpty()
    ],
    authController.signup
);

router.post('/login', authController.login);

router.get('/status', authMiddleware, authController.getUserStatus);

router.patch(
    '/status',
    authMiddleware,
    [
        check('status').trim().not().isEmpty()
    ],
    authController.updateUserStatus
);

module.exports = router;