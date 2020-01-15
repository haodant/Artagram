const express = require('express');
const bodyParser = require('body-parser');
const Post = require('./models/post');
const mongoose = require('mongoose');

const app = express();

mongoose.connect("mongodb+srv://Ashley:NZemLa68D7icQh7R@cluster0-secyx.mongodb.net/node-angular?retryWrites=true&w=majority")
    .then(() => {
        console.log("Connected to database")
    })
    .catch(() => {
        console.error("Connection failed.")
    });


app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    next();
});

app.post('/api/posts', (req, res, next) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content
    })
    post.save().then(createdPost => {
        res.status(201).json({
            message: "post added successfully",
            postId: createdPost._id
        });
    });

})

app.get('/api/posts', (req, res, next) => {
    Post.find().then(documents => {
        res.status(200).json({
            message: "Posts fetched successfully",
            posts: documents
        });
    });
});

app.put('/api/posts/:id', (req, res, next) => {
    const post = new Post({
        _id: req.param.id,
        title: req.body.title,
        content: req.body.content
    })
    Post.updateOne({_id: req.param.id}, post).then(result => {
        console.log(result);
        res.status(200).message("update successful");
    })
})

app.delete('/api/posts/:id', (req, res, next) => {
    Post.deleteOne({_id: req.params.id}).then(result => {
        console.log(result);
        res.status(200).json({ message: "post deleted" })
    })
})

module.exports = app;
