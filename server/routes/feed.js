const express = require('express');
const { check } = require('express-validator');

const authMidleware = require('../middleware/isAuth');
const feedController = require('../controllers/feed');

const router = express.Router();

// GET - /feed/posts
router.get('/posts', authMidleware, feedController.getPosts);

// GET - /feed/post/postId
router.get('/post/:postId', authMidleware, feedController.getPost);

// POST - /feed/post
router.post(
    '/post',
    authMidleware,
    [
        check('title').trim().isLength({min: 5}),
        check('content').trim().isLength({min: 5})
    ],
    feedController.createPost
);

router.put(
    '/post/:postId',
    authMidleware,
    [
        check('title').trim().isLength({min: 5}),
        check('content').trim().isLength({min: 5})
    ],
    feedController.updatePost
);

router.delete('/post/:postId', authMidleware, feedController.deletePost);

module.exports = router;