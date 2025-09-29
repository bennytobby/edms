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
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Add JSON parser for API endpoints
app.use(cookieParser()); // Add cookie parser middleware
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

// Serve static files
app.use(express.static(__dirname));
app.use("/styles", express.static(path.join(__dirname, "styles")));
app.use("/js", express.static(path.join(__dirname, "public/js")));


/* Session Handling - JWT-based for Vercel */
const session = require("express-session");
const jwt = require('jsonwebtoken');

// Simple in-memory session for Vercel (will be replaced with JWT)
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true,
    rolling: true,
    name: 'edms.sid',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
    }
}));

// JWT helper functions
function createToken(user) {
    return jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '24h' });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
        return null;
    }
}

// Session validation middleware
app.use((req, res, next) => {
    // Skip session validation for public routes
    const publicRoutes = ['/', '/login', '/register', '/loginSubmit', '/registerSubmit'];
    if (publicRoutes.includes(req.path)) {
        return next();
    }

    // Check both session and JWT token
    const sessionUser = req.session.user;
    const authToken = req.cookies ? req.cookies.authToken : null;
    const jwtUser = authToken ? verifyToken(authToken) : null;

    console.log(`Accessing ${req.path} - Session user:`, sessionUser);
    console.log(`JWT user:`, jwtUser);

    // If either session or JWT token is valid, restore the user
    if (jwtUser && !sessionUser) {
        console.log('Restoring user from JWT token');
        req.session.user = jwtUser;
    }

    // For protected routes, ensure user exists
    if (!req.session.user && req.path !== '/logout') {
        console.log('No valid authentication, redirecting to login from:', req.path);
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
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

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
    // Debug session for Vercel
    console.log('Dashboard access - Session user:', req.session.user);
    console.log('Session ID:', req.sessionID);

    if (!req.session.user) {
        console.log('No session user found, redirecting to login');
        return res.redirect('/login');
    }

    const searchTerm = req.query.search?.trim().toLowerCase();
    const category = req.query.category;
    const sortBy = req.query.sort || 'newest';

    // Build search filter
    let searchFilter = {};

    if (searchTerm) {
        searchFilter.$or = [
            { originalName: { $regex: searchTerm, $options: "i" } },
            { uploadedBy: { $regex: searchTerm, $options: "i" } },
            { tags: { $in: [searchTerm] } },
            { description: { $regex: searchTerm, $options: "i" } }
        ];
    }

    if (category) {
        searchFilter.category = category;
    }

    // Build sort object
    let sortObject = {};
    switch (sortBy) {
        case 'oldest':
            sortObject = { uploadDate: 1 };
            break;
        case 'name':
            sortObject = { originalName: 1 };
            break;
        case 'size':
            sortObject = { size: -1 };
            break;
        case 'uploader':
            sortObject = { uploadedBy: 1 };
            break;
        case 'newest':
        default:
            sortObject = { uploadDate: -1 };
            break;
    }

    try {
        await client.connect();
        const fileDocs = await client
            .db(fileCollection.db)
            .collection(fileCollection.collection)
            .find(searchFilter)
            .sort(sortObject)
            .toArray();

        res.render('dashboard', {
            firstname: req.session.user.firstname,
            email: req.session.user.email,
            user: req.session.user, // Pass the full user object
            files: fileDocs,
            search: searchTerm,
            category: category,
            sort: sortBy
        });
    } catch (e) {
        console.error(e);
        res.status(500).send("Failed to load dashboard.");
    } finally {
        await client.close();
    }
});

app.get('/logout', (req, res) => {
    // Clear JWT token cookie
    res.clearCookie('authToken');

    // Destroy session
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send("Could not log out.");
        }
        console.log('User logged out successfully');
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
            phone: phone,
            role: req.body.role || 'contributor', // Default to contributor if no role specified
            createdAt: new Date()
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

        const { firstname, lastname, userid, email, phone, role } = result;
        const userData = { firstname, lastname, userid, email, phone, role };

        // Create JWT token for Vercel
        const token = createToken(userData);

        // Set both session and JWT token for compatibility
        req.session.user = userData;
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'lax'
        });

        console.log('Login successful for user:', userid);
        console.log('JWT token created, redirecting to dashboard');

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
        // Determine file category based on MIME type
        let category = req.body.category;
        if (!category) {
            if (file.mimetype.startsWith('image/')) {
                category = 'images';
            } else if (file.mimetype.includes('pdf') || file.mimetype.includes('document')) {
                category = 'documents';
            } else if (file.mimetype.includes('presentation') || file.mimetype.includes('powerpoint')) {
                category = 'presentations';
            } else if (file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel')) {
                category = 'spreadsheets';
            } else if (file.mimetype.includes('zip') || file.mimetype.includes('rar')) {
                category = 'archives';
            } else {
                category = 'other';
            }
        }

        const fileMeta = {
            filename: s3Key,
            originalName: file.originalname,
            s3Url: s3Result.Location,
            mimetype: file.mimetype,
            size: file.size,
            uploadDate: new Date(),
            uploadedBy: req.session.user.userid,
            description: req.body.description || "",
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim().toLowerCase()) : [],
            category: category
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

// Admin Dashboard
app.get('/admin', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.role !== 'admin') {
        return res.render('error', {
            title: "Access Denied",
            message: "You don't have permission to access the admin dashboard.",
            link: "/dashboard",
            linkText: "Back to Dashboard"
        });
    }

    try {
        await client.connect();
        const users = await client
            .db(userCollection.db)
            .collection(userCollection.collection)
            .find({}, { projection: { pass: 0 } }) // Exclude password field
            .sort({ createdAt: -1 })
            .toArray();

        res.render('admin', {
            title: "Admin Dashboard",
            user: req.session.user,
            users: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.render('error', {
            title: "Database Error",
            message: "Failed to load user data.",
            link: "/dashboard",
            linkText: "Back to Dashboard"
        });
    } finally {
        await client.close();
    }
});

// API endpoint to generate signed URLs for direct S3 uploads
app.post('/api/get-signed-url', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { filename, contentType } = req.body;

        if (!filename || !contentType) {
            return res.status(400).json({ error: 'Missing filename or contentType' });
        }

        const s3Key = `${Date.now()}_${filename}`;

        const s3Params = {
            Bucket: AWS_BUCKET,
            Key: s3Key,
            ContentType: contentType,
            Expires: 300 // 5 minutes
        };

        const signedUrl = s3.getSignedUrl('putObject', s3Params);

        res.json({
            signedUrl,
            s3Key,
            fields: {
                key: s3Key,
                'Content-Type': contentType
            }
        });
    } catch (error) {
        console.error('Error generating signed URL:', error);
        res.status(500).json({ error: 'Failed to generate signed URL: ' + error.message });
    }
});

// API endpoint to confirm file upload and save metadata
app.post('/api/confirm-upload', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { s3Key, originalName, description, tags, category } = req.body;

        // Get file info from S3
        const s3Object = await s3.headObject({
            Bucket: AWS_BUCKET,
            Key: s3Key
        }).promise();

        const fileMeta = {
            filename: s3Key,
            originalName: originalName,
            s3Url: `https://${AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`,
            mimetype: s3Object.ContentType,
            size: s3Object.ContentLength,
            uploadDate: new Date(),
            uploadedBy: req.session.user.userid,
            description: description || "",
            tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [],
            category: category || 'other'
        };

        await client.connect();
        await client
            .db(fileCollection.db)
            .collection(fileCollection.collection)
            .insertOne(fileMeta);

        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.session.user.email,
            subject: "EDMS File Upload Confirmation",
            text: `Hello ${req.session.user.firstname},\n\nYour file "${originalName}" has been uploaded successfully on ${new Date().toLocaleString()}.\n\n- EDMS Team`
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.error("Error sending email:", err);
            else console.log("Email sent:", info.response);
        });

        res.json({ success: true, message: 'File uploaded successfully' });
    } catch (error) {
        console.error('Error confirming upload:', error);
        res.status(500).json({ error: 'Failed to confirm upload' });
    } finally {
        await client.close();
    }
});

// User Management API Endpoints
app.post('/api/update-user-role', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { userId, newRole } = req.body;

        if (!userId || !newRole) {
            return res.status(400).json({ error: 'Missing userId or newRole' });
        }

        if (!['admin', 'contributor', 'viewer'].includes(newRole)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        await client.connect();
        const result = await client
            .db(userCollection.db)
            .collection(userCollection.collection)
            .updateOne(
                { userid: userId },
                { $set: { role: newRole, updatedAt: new Date() } }
            );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    } finally {
        await client.close();
    }
});

app.post('/api/delete-user', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        // Prevent admin from deleting themselves
        if (userId === req.session.user.userid) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        await client.connect();

        // Delete user's files from S3 and database
        const userFiles = await client
            .db(fileCollection.db)
            .collection(fileCollection.collection)
            .find({ uploadedBy: userId })
            .toArray();

        // Delete files from S3
        for (const file of userFiles) {
            try {
                await s3.deleteObject({
                    Bucket: AWS_BUCKET,
                    Key: file.filename
                }).promise();
            } catch (s3Error) {
                console.error('Error deleting file from S3:', s3Error);
            }
        }

        // Delete user's files from database
        await client
            .db(fileCollection.db)
            .collection(fileCollection.collection)
            .deleteMany({ uploadedBy: userId });

        // Delete user account
        const result = await client
            .db(userCollection.db)
            .collection(userCollection.collection)
            .deleteOne({ userid: userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    } finally {
        await client.close();
    }
});


// Error handling middleware for multer file size errors
app.use((error, req, res, next) => {
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.render('error', {
            title: "File Too Large",
            message: "The file you're trying to upload exceeds the 100MB limit. Please choose a smaller file.",
            link: "/dashboard",
            linkText: "Back to Dashboard"
        });
    }
    next(error);
});

// Export the app for testing
module.exports = app;

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
    app.listen(portNumber);
}
