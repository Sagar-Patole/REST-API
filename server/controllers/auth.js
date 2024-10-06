const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const err = new Error('Entered data in not correct.');
            err.statusCode = 422;
            throw err;
        }
        const {email, password, name} = req.body;
        const existingUser = await User.findOne({email: email});
        if (existingUser) {
            const err = new Error('User already exist.');
            err.statusCode = 409;
            throw err;
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPassword,
            name: name
        });
        const response = await user.save();
        res.status(201).json({
            user: response
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email: email});
        if (!user) {
            const err = new Error('User with this email does not exist.');
            err.statusCode = 404;
            throw err;
        }
        const isPasswordEqual = await bcrypt.compare(password, user.password);
        if (!isPasswordEqual) {
            const err = new Error('Incorrect password.');
            err.statusCode = 400;
            throw err;
        }
        const token = jwt.sign({
            email: user.email,
            userId: user._id.toString()
        }, 'supersupersupersecret', {expiresIn: '1h'});
        res.status(200).json({
            token: token,
            userId: user._id.toString()
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const err = new Error('User not found!');
            err.statusCode = 404;
            throw err;
        }
        res.status(200).json({
            status: user.status
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.updateUserStatus = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const err = new Error('Validation failed. Please enter correct status.');
            err.statusCode = 422;
            throw err;
        }
        const user = await User.findById(req.userId);
        if (!user) {
            const err = new Error('User not found!');
            err.statusCode = 404;
            throw err;
        }
        user.status = req.body.status;
        const response = await user.save();
        res.status(200).json({
            status: response.status
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}