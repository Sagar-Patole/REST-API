const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');

const rootDir = require('./utils/path');
const config = require('./config/config');
const commonUtils = require('./utils/common');
const feedRouter = require('./routes/feed');
const authRouter = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'assets/images');
    },
    filename: (req, file, cb) => {
        cb(null, commonUtils.formatDateToIST(new Date()).replace(/:/g, '-') + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png', file.mimetype === 'image/jpg', file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(bodyParser.json());
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/assets/images', express.static(path.join(rootDir, 'assets/images')));

app.use('/server/feed', feedRouter);
app.use('/server/auth', authRouter);

app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    const message = err.message;
    res.status(status).json({
        message: message
    });
});

mongoose.connect(config.database.connectionUrl).then(res => {
    app.listen(8080);
}).catch(error => {
    console.log(error);
});