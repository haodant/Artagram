const express = require("express");
const Post = require('../models/post');

const router = express.Router();

const checkAuth = require("../middleware/check-auth");
const extractFile = require("../middleware/file");

router.post("", checkAuth, extractFile, (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + "/images/" + req.file.filename,
        creator: req.userData.userId
    })
    post.save().then(createdPost => {
        res.status(201).json({
            message: "post added successfully",
            post: {
                ...createdPost,
                id: createdPost._id,
                // title: createdPost.title,
                // content: createdPost.content,
                // imagePath: createdPost.imagePath
            }
        });
    }).catch(error => {
        res.status(500).json({
            message: "creating a post failed!"
        })
    })
})

router.get("", (req, res, next) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    let fechedPosts;
    const postQuery = Post.find();
    if (pageSize && currentPage) {
        postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    postQuery.then(documents => {
        fechedPosts = documents;
        return Post.count();
    }).then(count => {
        res.status(200).json({
            message: "Posts fetched successfully",
            posts: fechedPosts,
            maxPosts: count
        });
    }).catch(error => {
        res.status(500).json({
            message: "Fetching post failed!"
        })
    })
});

router.get("/:id", (req, res, next) => {
    Post.findById(req.params.id).then(post => {
        if(post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({message: "post not found"})
        }
    }).catch(error => {
        res.status(500).json({
            message: "Fetching post failed!"
        })
    })
})

router.put("/:id", checkAuth, extractFile, (req, res, next) => {
    let imagePath = req.body.imagePath;
    if(req.file) {
        const url = req.protocol + "://" + req.get("host");
        imagePath = url + "/images/" + req.file.filename;
    }
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId
    });
    Post.updateOne({_id: req.params.id, creator: req.userData.userId }, post).then(result => {
        if (result.n > 0) {
            res.status(200).json({message: "update successful"});
        } else {
            res.status(401).json({message: "Not authorized message"});
        }  
    }).catch(error => {
        res.status(500).json({
            message: "Couldn't update post!"
        })
    })
})

router.delete("/:id", checkAuth, (req, res, next) => {
    Post.deleteOne({_id: req.params.id, creator: req.userData.userId }).then(result => {
        if (result.n > 0) {
            res.status(200).json({ message: "post deleted" })
        } else {
            res.status(401).json({message: "Not authorized"});
        }
    }).catch(error => {
        res.status(500).json({
            message: "Fetching post failed!"
        })
    })
})

module.exports = router;
