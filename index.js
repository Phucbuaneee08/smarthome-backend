const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const accountRouter = require("./routers/accountRouter");
const homeRouter = require("./routers/homeRouter");
const roomRouter = require("./routers/roomRouter");
const deviceRouter = require("./routers/deviceRouter");
const app = express();
const connection = require("./connection");
const { connectMQTT } = require("./mqtt");
require('dotenv').config({ path: '.env' });

const corsOpts = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOpts));

// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(
    bodyParser.json({
        limit: "128mb",
    })
);
app.use(
    bodyParser.urlencoded({
        extended: true,
        limit: "128mb",
    })
);

// connect database
connection();
connectMQTT();

app.get("/", (req, res) => {
    res.send("SUCCESS");
});

// routing
app.use(accountRouter, function (req, res, next) {
    next();
});

app.use(homeRouter, function (req, res, next) {
    next();
});

app.use(roomRouter, function (req, res, next) {
    next();
});

app.use(deviceRouter, function (req, res, next) {
    next();
});
//recvData();

app.listen(5000, () => {
    console.log("Server started on Port 5000.");
});
