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
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    next();
});

app.post('/api/posts', (req, res, next) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content
    })
    post.save();
    res.status(201).json({
        message: "post added successfully"
    })
})

app.get('/api/posts', (req, res, next) => {
    const posts = [
        {
            id: "asdf2134", 
            title: "First server-side post", 
            content: "This is coming from server"
        },
        {
            id: "asdfq31234", 
            title: "Second server-side post", 
            content: "This is coming from server!"
        },
    ]
    res.status(200).json({
        message: "Posts fetched successfully",
        posts: posts
    })
});

module.exports = app;
