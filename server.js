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


/* Session Handling */
const session = require("express-session");
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));


/* Email Handling */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


/* Password Hashing */
const bcrypt = require('bcrypt');


/* Upload directory */
app.use('/uploads', express.static('uploads'));
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    },
});
const upload = multer({ storage: storage });


app.get('/', function (req, res) {
    res.render('index');
});

app.get('/register', function (req, res) {
    res.render('register');
});

app.get('/login', function (req, res) {
    res.render('login');
});


app.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const searchTerm = req.query.search?.trim().toLowerCase();
    const searchFilter = searchTerm
        ? {
            $or: [
                { originalName: { $regex: searchTerm, $options: "i" } },
                { uploadedBy: { $regex: searchTerm, $options: "i" } },
                { tags: { $in: [searchTerm] } }
            ]
        }
        : {};

    try {
        await client.connect();

        const fileDocs = await client
            .db(fileCollection.db)
            .collection(fileCollection.collection)
            .find(searchFilter)
            .sort({ uploadDate: -1 })
            .toArray();

        res.render('dashboard', {
            firstname: req.session.user.firstname,
            email: req.session.user.email,
            files: fileDocs,
            search: searchTerm
        });
    } catch (e) {
        console.error(e);
        res.status(500).send("Failed to load dashboard.");
    } finally {
        await client.close();
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Could not log out.");
        }
        res.redirect('/');
    });
});


const fs = require('fs');
const fsPath = require('path');
app.get("/delete/:filename", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    const filename = req.params.filename;
    const filePath = fsPath.join(__dirname, "uploads", filename);

    try {
        /* Delete from DB */
        await client.connect();
        const deleteResult = await client
            .db(fileCollection.db)
            .collection(fileCollection.collection)
            .deleteOne({ filename });

        /* Delete from LOCAL */
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting file.");
    } finally {
        await client.close();
    }
});


app.get("/download/:filename", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    /* Download from LOCAL */
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "uploads", filename);
    res.download(filePath, (err) => {
        if (err) {
            console.error("Download error:", err);
            res.status(500).send("File could not be downloaded.");
        }
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
        req.session.user = { firstname, lastname, userid, email, phone };
        return res.redirect('/dashboard');
    } catch (e) {
        console.error(e);
        return res.status(500).send("Server error. Try again later.");
    } finally {
        await client.close();
    }
});


app.post("/upload", upload.single("document"), async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    const file = req.file;
    if (!file) {
        return res.status(400).send("No file uploaded.");
    }

    const fileMeta = {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadDate: new Date(),
        uploadedBy: req.session.user.userid,
        description: req.body.description || "",
        tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim().toLowerCase()) : []
    };

    try {
        /* Insert into DB */
        await client.connect();
        await client
            .db(fileCollection.db)
            .collection(fileCollection.collection)
            .insertOne(fileMeta);

        /* Send email notification */
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.session.user.email,
            subject: "EDMS File Upload Confirmation",
            text: `Hello ${req.session.user.firstname},\n\nYour file "${file.originalname}" has been uploaded successfully on ${new Date().toLocaleString()}.\n\n- EDMS Team`
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error sending email:", err);
            } else {
                console.log("Email sent:", info.response);
            }
        });

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.status(500).send("File upload failed.");
    } finally {
        await client.close();
    }
});



app.listen(3000);
