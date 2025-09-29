/* All Processes */
process.stdin.setEncoding("utf8");


/* MongoDB Connections */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, './.env') });
const uri = process.env.MONGO_CONNECTION_STRING;
const fileCollection = { db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_FILECOLLECTION };
const userCollection = { db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_USERCOLLECTION };
const { MongoClient, ServerApiVersion } = require('mongodb');
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });


/* AWS Connection */
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const AWS_BUCKET = process.env.AWS_S3_BUCKET;


/* Port Configuration */
const portNumber = process.env.PORT || process.argv[2] || 3000;
// Server startup message
console.log(`EDMS Server started on port ${portNumber}`);


/* All express */
const express = require("express");
const nodemailer = require('nodemailer');
const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: false }));
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/styles", express.static(path.join(__dirname, "styles")));


/* Session Handling */
const session = require("express-session");
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: true, // Changed to true for Vercel
    saveUninitialized: true, // Changed to true for Vercel
    rolling: true, // Reset expiration on each request
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true in production (Vercel)
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax' // Important for Vercel
    }
}));

// Session validation middleware
app.use((req, res, next) => {
    // Skip session validation for public routes
    const publicRoutes = ['/', '/login', '/register', '/loginSubmit', '/registerSubmit'];
    if (publicRoutes.includes(req.path)) {
        return next();
    }

    // For protected routes, ensure session exists
    if (!req.session.user && req.path !== '/logout') {
        console.log('Session lost, redirecting to login from:', req.path);
        return res.redirect('/login');
    }

    next();
});

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


/* Upload */
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', function (req, res) {
    res.render('index', { title: "Welcome to EDMS" });
});

app.get('/register', function (req, res) {
    res.render('register', { title: "Register - EDMS" });
});

app.get('/login', function (req, res) {
    res.render('login', { title: "Login - EDMS" });
});

app.get('/dashboard', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

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
        if (err) return res.status(500).send("Could not log out.");
        res.redirect('/');
    });
});

app.get("/delete/:filename", async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    const filename = req.params.filename;

    try {
        await client.connect();

        await s3.deleteObject({ Bucket: AWS_BUCKET, Key: filename }).promise();

        await client
            .db(fileCollection.db)
            .collection(fileCollection.collection)
            .deleteOne({ filename });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.session.user.email,
            subject: "EDMS File Deletion Notice",
            text: `Hi ${req.session.user.firstname},\n\nThe file '${filename}' has been deleted by your account.\n\n- EDMS Team`
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.error("Error sending deletion email:", err);
            else console.log("Deletion email sent:", info.response);
        });

        res.redirect("/dashboard");
    } catch (err) {
        console.error("Delete failed:", err);
        res.status(500).send("Error deleting file.");
    } finally {
        await client.close();
    }
});

app.get("/download/:filename", async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    const filename = req.params.filename;
    const params = { Bucket: AWS_BUCKET, Key: filename };

    try {
        const data = await s3.getObject(params).promise();
        res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
        res.send(data.Body);
    } catch (err) {
        console.error("S3 download error:", err);
        res.status(500).send("File could not be downloaded.");
    }
});

app.post('/registerSubmit', async function (req, res) {
    try {
        await client.connect();
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
            if (result.email === req.body.email) {
                return res.render('error', {
                    title: "Email Exists",
                    message: "The email already exists in the database.",
                    link: "/register",
                    linkText: "Back to Registration"
                });
            }
            if (result.userid === req.body.userid) {
                return res.render('error', {
                    title: "UserID Exists",
                    message: "Please choose a different userID.",
                    link: "/register",
                    linkText: "Back to Registration"
                });
            }
        }

        if (req.body.password !== req.body.confirm_pass) {
            if (req.body.password !== req.body.confirm_pass) {
                return res.render('error', {
                    title: "Password Mismatch",
                    message: "The passwords entered do not match.",
                    link: "/register",
                    linkText: "Try Again"
                });
            }
        }

        const phone = req.body.phone?.trim();
        if (phone && !/^\d{3}-\d{3}-\d{4}$/.test(phone)) {
            return res.render('error', {
                title: "Invalid Phone Format",
                message: "Phone number must match xxx-xxx-xxxx.",
                link: "/register",
                linkText: "Back to Register"
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = {
            firstname: req.body.first_name,
            lastname: req.body.last_name,
            userid: req.body.userid,
            email: req.body.email,
            pass: hashedPassword,
            phone: phone
        };

        await client
            .db(userCollection.db)
            .collection(userCollection.collection)
            .insertOne(newUser);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.body.email,
            subject: "Welcome to EDMS!",
            text: `Hello ${req.body.first_name},\n\nThank you for registering with EDMS. Your account has been successfully created.\n\n- EDMS Team`
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.error("Error sending welcome email:", err);
            else console.log("Welcome email sent:", info.response);
        });

        return res.render('success', {
            title: "Registration Complete",
            message: "Your account has been successfully created.",
            link: "/login",
            linkText: "Login Now"
        });
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    res.render('success', {
        title: "Registration Complete",
        message: "Your account has been successfully created.",
        link: "/login",
        linkText: "Login Now"
    });

});

app.post('/loginSubmit', async function (req, res) {
    try {
        await client.connect();
        let filter = { userid: req.body.userid };
        const result = await client
            .db(userCollection.db)
            .collection(userCollection.collection)
            .findOne(filter);

        if (!result) {
            return res.render('error', {
                title: "User Not Found",
                message: "No account found with the given UserID.",
                link: "/login",
                linkText: "Try Again"
            });
        }

        const passwordMatch = await bcrypt.compare(req.body.password, result.pass);
        if (!passwordMatch) {
            return res.render('error', {
                title: "Incorrect Password",
                message: "The password entered does not match. Please try again.",
                link: "/login",
                linkText: "Back to Login"
            });
        }

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
    if (!req.session.user) return res.redirect("/login");
    const file = req.file;
    if (!file) return res.status(400).send("No file uploaded.");

    const s3Key = `${Date.now()}_${file.originalname}`;
    const s3Params = {
        Bucket: AWS_BUCKET,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    try {
        const s3Result = await s3.upload(s3Params).promise();
        const fileMeta = {
            filename: s3Key,
            originalName: file.originalname,
            s3Url: s3Result.Location,
            mimetype: file.mimetype,
            size: file.size,
            uploadDate: new Date(),
            uploadedBy: req.session.user.userid,
            description: req.body.description || "",
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim().toLowerCase()) : []
        };

        await client.connect();
        await client
            .db(fileCollection.db)
            .collection(fileCollection.collection)
            .insertOne(fileMeta);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.session.user.email,
            subject: "EDMS File Upload Confirmation",
            text: `Hello ${req.session.user.firstname},\n\nYour file \"${file.originalname}\" has been uploaded successfully on ${new Date().toLocaleString()}.\n\n- EDMS Team`
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.error("Error sending email:", err);
            else console.log("Email sent:", info.response);
        });

        res.render('success', {
            title: "Upload Successful",
            message: "Your file has been uploaded to the system.",
            link: "/dashboard",
            linkText: "Return to Dashboard"
        });
    } catch (err) {
        console.error("Upload failed:", err);
        res.status(500).send("File upload failed.");
    } finally {
        await client.close();
    }
});

// Export the app for testing
module.exports = app;

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
    app.listen(portNumber);
}
