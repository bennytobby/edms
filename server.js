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


/* Session Handling */
const session = require("express-session");
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));


/* Password Hashing */
const bcrypt = require('bcrypt');


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

/* Protected route to check session details */
app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('dashboard', { user: req.session.user });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.post('/registerSubmit', async function (req, res) {
    /* Find DB entry based on email */
    try {
        await client.connect();

        /* Filter based on two possible exit cases */
        let conflictFilter = {
            $or: [
                { email: req.body.email },
                { userid: req.body.userid }
            ]
        };
        const result = await client
            .db(userCollection.db)
            .collection(userCollection.collection)
            .findOne(conflictFilter);

        if (result) {
            /* Exit Case 1: Email already exists in DB */
            if (result.email === req.body.email) {
                return res.render('emailExists');
            }

            /* Exit Case 2: UserID already exists in DB */
            if (result.userid === req.body.userid) {
                return res.render('userIdExists');
            }
        }

        /* Exit Case 3: Password != Confirm Password */
        if (req.body.password !== req.body.confirm_pass) {
            return res.render('passwordMismatch');
        }


        /* Exit Case 4: Invalid Phone Format */
        const phone = req.body.phone?.trim();
        if (phone && !/^\d{3}-\d{3}-\d{4}$/.test(phone)) {
            return res.render('invalidPhone');
        }


        /* Successful user account creation */
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = {
            firstname: req.body.first_name,
            lastname: req.body.last_name,
            userid: req.body.userid,
            email: req.body.email,
            pass: hashedPassword,
            phone: phone
        };

        /* Insert into DB */
        await client
            .db(userCollection.db)
            .collection(userCollection.collection)
            .insertOne(newUser);

        return res.render('registerSubmit');
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
        let filter = { userid: req.body.userid };
        const result = await client
            .db(userCollection.db)
            .collection(userCollection.collection)
            .findOne(filter);

        /* Exit Case 1: UserID not found */
        if (!result) {
            return res.render('userNotFound');
        }

        /* Exit Case 2: Password incorrect */
        const passwordMatch = await bcrypt.compare(req.body.password, result.pass);
        if (!passwordMatch) {
            return res.render('incorrectPass');
        }

        /* Successful login */
        const { firstname, lastname, userid, email, phone } = result;
        const variables = { firstname, lastname, userid, email, phone };

        req.session.user = {
            firstname: result.firstname,
            lastname: result.lastname,
            userid: result.userid,
            email: result.email,
            phone: result.phone
        };

        return res.redirect('/dashboard');
    } catch (e) {
        console.error(e);
        return res.status(500).send("Server error. Try again later.");
    } finally {
        await client.close();
    }
});

app.listen(3000);
