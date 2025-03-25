/* All Processes */
process.stdin.setEncoding("utf8");


/* MongoDB Connections */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, './.env') })
const uri = process.env.MONGO_CONNECTION_STRING;
const fileCollection = { db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_FILECOLLECTION };
const userCollection = { db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_USERCOLLECTION };
const { MongoClient, ServerApiVersion } = require('mongodb');
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });


/* Prompting User Input */
const portNumber = process.argv[2];
const prompt = `Web server started running at http://localhost:3000\nStop to shutdown the server: `;
process.stdout.write(prompt);


/* Print out iteration */
process.stdin.on("readable", function () {
    let dataInput = process.stdin.read();
    let command = dataInput.trim();
    if ((command === "Stop") || (command === "stop")) {
        process.stdout.write("Shutting down the server\n");
        process.exit(0);
    } else {
        process.stdout.write(`Invalid command: ${dataInput}`);
    }
    process.stdout.write(prompt);
    process.stdin.resume();
});


/* All express */
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');
const app = express();

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/register', function (req, res) {
    res.render('register');
});

app.get('/login', function (req, res) {
    res.render('login');
});

// TO-DO: Add entries into database
app.post('/registerSubmit', async function (req, res) {
    /* Find DB entry based on email */
    try {
        await client.connect();
        let filter = { email: req.body.email };
        const result = await client.db(userCollection.db).collection(userCollection.collection).findOne(filter);

        if (result) {
            res.render('emailExists')
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    res.render('registerSubmit');
});

app.post('/loginSubmit', async function (req, res) {
    /* Find DB entry based on email */
    try {
        await client.connect();
        let filter = { email: req.body.email };
        const result = await client
            .db(userCollection.db)
            .collection(userCollection.collection)
            .findOne(filter);

        // Exit Case 1: Email not found
        if (!result) {
            return res.render('userNotFound');
        }

        /* Access other variables from the database entry */
        const { firstname, lastname, userid, email, pass, phone } = result;

        // Exit Case 2: Password incorrect
        if (req.body.password !== pass) {
            return res.render('incorrectPass');
        }

        // Exit Case 3: Successful login
        /* Handle POST request for /apply */
        const variables = {
            firstname,
            lastname,
            userid,
            email,
            pass,
            phone,
        };

        return res.render('main', variables);
    } catch (e) {
        console.error(e);
        return res.status(500).send("Server error. Try again later.");
    } finally {
        await client.close();
    }
});

app.listen(3000);
