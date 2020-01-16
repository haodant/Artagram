const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postRoutes = require("./routes/posts")

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

app.use("/api/posts", postRoutes);

module.exports = app;
