const { validationResult } = require('express-validator');

const commonUtils = require('../utils/common');
const User = require('../models/user');
const Post = require('../models/post');
const { contextsKey } = require('express-validator/lib/base');

exports.getPosts = async (req, res, next) => {
    try {
        const currentPage = req.query.page;
        const perPageItems = 2;
        const totalItems = await Post.find().countDocuments();
        const response = await Post.find().skip((currentPage - 1) * perPageItems).limit(perPageItems);
        res.status(200).json({
            posts: response,
            totalItems: totalItems
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getPost = async (req, res, next) => {
    try {
        const response = await Post.findById(req.params.postId);
        if (!response) {
            const err = new Error('Could not find the post.');
            err.statusCode = 404;
            throw err;
        }
        const user = await User.findById(response.creator);
        res.status(200).json({
            post: {
                _id: response._id,
                title: response.title,
                imageUrl: response.imageUrl,
                content: response.content,
                creator: {_id: response.creator, name: user.name},
                createdAt: response.createdAt,
                updatedAt: response.updatedAt
            }
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.createPost = async (req, res, next) => {
    try {
        const {title, content} = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const err = new Error('Validation failed. Entered data is not correct.');
            err.statusCode = 422;
            throw err;
        }
        if (!req.file) {
            const err = new Error('Attached file is not an image.');
            err.statusCode = 422;
            throw err;
        }
        const post = new Post({
            title: title,
            imageUrl: req.file.path,
            content: content,
            creator: req.userId
        });
        const response = await post.save();
        const user = await User.findById(req.userId);
        user.posts.push(post);
        const savedUser = await user.save();
        res.status(201).json({
            post: response,
            creator: {_id: savedUser._id, name: savedUser.name}
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.updatePost = async (req, res, next) => {
    try {
        const {postId} = req.params;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const err = new Error('Validation failed. Entered data is not correct.');
            err.statusCode = 422;
            throw err;
        }
        const {title, image, content} = req.body;
        let imageUrl = image;
        if (req.file) {
            imageUrl = req.file.path;
        }
        if (!imageUrl) {
            const err = new Error('No File picked.');
            err.statusCode = 422;
            throw err;
        }
        const post = await Post.findById(postId);
        if (!post) {
            const err = new Error('Post not found.');
            err.statusCode = 404;
            throw err;
        }
        if (post.creator.toString() !== req.userId) {
            const err = new Error('Not Authorized!');
            err.statusCode = 403;
            throw err;
        }
        if (post.imageUrl !== imageUrl) {
            commonUtils.deleteFile(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        const response = await post.save();
        res.status(200).json({
            post: response
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.deletePost = async (req, res, next) => {
    try {
        const {postId} = req.params;
        const post = await Post.findById(postId);
        if (!post) {
            const err = new Error('Post not found!');
            err.statusCode = 404;
            throw err;
        }
        if (post.creator.toString() !== req.userId) {
            const err = new Error('Not Authorized!');
            err.statusCode = 403;
            throw err;
        }
        commonUtils.deleteFile(post.imageUrl);
        const response = await Post.findByIdAndDelete(postId);
        const user = await User.findById(req.userId);
        user.posts.pull(postId);
        await user.save();
        res.status(200).json({
            deletedPost: response
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}