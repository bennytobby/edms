/* All Processes */
process.stdin.setEncoding("utf8");


/* MongoDB Connections */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, './.env') });

// Check for required environment variables
const requiredEnvVars = [
    'MONGO_CONNECTION_STRING',
    'MONGO_DB_NAME',
    'MONGO_FILECOLLECTION',
    'MONGO_USERCOLLECTION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    console.error('Please set these variables in your Vercel dashboard');
}

const uri = process.env.MONGO_CONNECTION_STRING;
const fileCollection = { db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_FILECOLLECTION };
const userCollection = { db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_USERCOLLECTION };
const { MongoClient, ServerApiVersion } = require('mongodb');
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

/* Swagger/OpenAPI Documentation */
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Vercel Analytics - mock function for now
const track = (event, properties) => {
    if (process.env.VERCEL_URL) {
        console.log(`[ANALYTICS] ${event}:`, properties);
    }
    return Promise.resolve();
};


/* AWS Connection */
const AWS = require('aws-sdk');
// Suppress AWS SDK v2 deprecation warning in development
if (process.env.NODE_ENV !== 'production') {
    process.removeAllListeners('warning');
}
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

/* Swagger/OpenAPI Configuration */
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'EDMS API',
            version: '1.0.0',
            description: 'Electronic Document Management System API - A comprehensive document management solution with role-based access control, cloud storage integration, and advanced file handling capabilities.',
            contact: {
                name: 'EDMS Development Team',
                email: 'admin@edms.system'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'https://edms-blue.vercel.app',
                description: 'Production server'
            },
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                sessionAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'connect.sid',
                    description: 'Session-based authentication using Express sessions'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        userid: {
                            type: 'string',
                            example: 'admin'
                        },
                        firstname: {
                            type: 'string',
                            example: 'John'
                        },
                        lastname: {
                            type: 'string',
                            example: 'Doe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john.doe@example.com'
                        },
                        role: {
                            type: 'string',
                            enum: ['admin', 'contributor', 'viewer'],
                            example: 'admin'
                        },
                        isProtected: {
                            type: 'boolean',
                            example: false
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T10:30:00Z'
                        }
                    }
                },
                File: {
                    type: 'object',
                    properties: {
                        filename: {
                            type: 'string',
                            example: 'document_123456789.pdf'
                        },
                        originalName: {
                            type: 'string',
                            example: 'My Document.pdf'
                        },
                        size: {
                            type: 'integer',
                            example: 1024000
                        },
                        mimetype: {
                            type: 'string',
                            example: 'application/pdf'
                        },
                        category: {
                            type: 'string',
                            enum: ['documents', 'images', 'presentations', 'spreadsheets', 'archives'],
                            example: 'documents'
                        },
                        uploadedBy: {
                            type: 'string',
                            example: 'admin'
                        },
                        uploadDate: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T10:30:00Z'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            example: 'User not found'
                        },
                        message: {
                            type: 'string',
                            example: 'The requested user could not be found'
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and session management'
            },
            {
                name: 'User Management',
                description: 'User account management and role operations'
            },
            {
                name: 'File Operations',
                description: 'File upload, download, and management operations'
            },
            {
                name: 'Admin Dashboard',
                description: 'Administrative functions and user management'
            }
        ]
    },
    apis: ['./server.js'] // Path to the API files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
// Serve swagger.json directly
app.get('/api-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Simple API docs page
app.get('/api-docs', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>EDMS API Documentation</title>
            <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
            <style>
                body { margin: 0; padding: 20px; }
                .swagger-ui .topbar { display: none; }
            </style>
        </head>
        <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
            <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
            <script>
                SwaggerUIBundle({
                    url: '/api-docs/swagger.json',
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIStandalonePreset
                    ],
                    plugins: [
                        SwaggerUIBundle.plugins.DownloadUrl
                    ],
                    layout: "StandaloneLayout"
                });
            </script>
        </body>
        </html>
    `);
});

// Health check for API docs
app.get('/api-docs-health', (req, res) => {
    res.json({
        status: 'API Documentation is running',
        endpoints: Object.keys(swaggerSpec.paths || {}).length,
        timestamp: new Date().toISOString()
    });
});

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Vercel Analytics - track is used directly in routes

// Performance monitoring middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > 1000 && process.env.VERCEL_URL) { // Log slow requests (only in production)
            track('slow_request', {
                path: req.path,
                method: req.method,
                duration: duration,
                statusCode: res.statusCode
            });
        }
    });
    next();
});

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

// Filename sanitization helper function
function sanitizeForHeader(filename) {
    return filename
        .replace(/[^\x20-\x7E]/g, '') // Remove non-ASCII characters
        .replace(/[\r\n\t]/g, ' ') // Replace control characters with spaces
        .replace(/"/g, "'") // Replace quotes with single quotes
        .trim();
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

    // Authentication middleware - session and JWT validation

    // If either session or JWT token is valid, restore the user
    if (jwtUser && !sessionUser) {
        // Restoring user from JWT token
        req.session.user = jwtUser;
    }

    // For protected routes, ensure user exists
    if (!req.session.user && req.path !== '/logout') {
        // No valid authentication, redirecting to login
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

// Function to create protected system accounts
async function createProtectedSystemAccounts() {
    try {
        await client.connect();

        const systemAccounts = [
            {
                firstname: 'System',
                lastname: 'Admin',
                userid: 'admin',
                email: 'admin@edms.system',
                pass: await bcrypt.hash('admin', 10),
                role: 'admin',
                isProtected: true,
                createdAt: new Date()
            },
            {
                firstname: 'System',
                lastname: 'Contributor',
                userid: 'cont',
                email: 'contributor@edms.system',
                pass: await bcrypt.hash('cont', 10),
                role: 'contributor',
                isProtected: true,
                createdAt: new Date()
            },
            {
                firstname: 'System',
                lastname: 'Viewer',
                userid: 'view',
                email: 'viewer@edms.system',
                pass: await bcrypt.hash('view', 10),
                role: 'viewer',
                isProtected: true,
                createdAt: new Date()
            }
        ];

        for (const account of systemAccounts) {
            // Check if account already exists
            const existingUser = await client
                .db(userCollection.db)
                .collection(userCollection.collection)
                .findOne({ userid: account.userid });

            if (!existingUser) {
                await client
                    .db(userCollection.db)
                    .collection(userCollection.collection)
                    .insertOne(account);
                console.log(`✅ Created protected system account: ${account.userid}`);
            } else {
                // Update existing account to be protected if it isn't already
                if (!existingUser.isProtected) {
                    await client
                        .db(userCollection.db)
                        .collection(userCollection.collection)
                        .updateOne(
                            { userid: account.userid },
                            { $set: { isProtected: true } }
                        );
                    console.log(`🛡️ Updated existing account to protected: ${account.userid}`);
                }
            }
        }
    } catch (error) {
        console.error('Error creating protected system accounts:', error);
    } finally {
        await client.close();
    }
}

// Create protected system accounts on server startup
createProtectedSystemAccounts();


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
    // Dashboard access with session validation

    if (!req.session.user) {
        // No session user found, redirecting to login
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

        // Files loaded for dashboard display

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
        // User logged out successfully
        res.redirect('/');
    });
});

/**
 * @swagger
 * /delete/{filename}:
 *   get:
 *     summary: Delete a file
 *     description: Delete a file from the system. Only admin users can delete any file, contributors can only delete their own files.
 *     tags: [File Operations]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-encoded filename of the file to delete
 *         example: "document_123456789.pdf"
 *     responses:
 *       302:
 *         description: File deleted successfully - redirect to dashboard
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/dashboard"
 *       401:
 *         description: Unauthorized - redirect to login
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/login"
 *       500:
 *         description: File could not be deleted
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "File could not be deleted."
 */
app.get("/delete/:filename", async (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    // Decode the filename to handle URL encoding
    const filename = decodeURIComponent(req.params.filename);

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
            text: `Hi ${req.session.user.firstname},\n\nThe file '${sanitizeForHeader(filename)}' has been deleted by your account.\n\n- EDMS Team`
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.error("Error sending deletion email:", err);
            else console.log("Deletion email sent successfully");
        });

        res.redirect("/dashboard");
    } catch (err) {
        console.error("Delete failed:", err);
        res.status(500).send("Error deleting file.");
    } finally {
        await client.close();
    }
});

/**
 * @swagger
 * /download/{filename}:
 *   get:
 *     summary: Download a file
 *     description: Download a file from the system. Filename is URL-encoded. Returns the file with proper Content-Disposition header.
 *     tags: [File Operations]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-encoded filename of the file to download
 *         example: "document_123456789.pdf"
 *     responses:
 *       200:
 *         description: File download successful
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: "attachment; filename=\"My Document.pdf\""
 *       302:
 *         description: Unauthorized - redirect to login
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/login"
 *       500:
 *         description: File could not be downloaded
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "File could not be downloaded."
 */
app.get("/download/:filename", async (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    // Decode the filename to handle URL encoding
    const filename = decodeURIComponent(req.params.filename);
    const params = { Bucket: AWS_BUCKET, Key: filename };

    try {
        const data = await s3.getObject(params).promise();

        // Get the original filename from database for proper download name
        await client.connect();
        const fileDoc = await client
            .db(fileCollection.db)
            .collection(fileCollection.collection)
            .findOne({ filename: filename });

        let downloadFilename = filename; // Fallback to S3 key
        if (fileDoc && fileDoc.originalName) {
            downloadFilename = fileDoc.originalName;
        }

        // Sanitize filename for Content-Disposition header
        const sanitizedFilename = sanitizeForHeader(downloadFilename);

        res.setHeader("Content-Disposition", `attachment; filename="${sanitizedFilename}"`);
        res.send(data.Body);
    } catch (err) {
        console.error("S3 download error:", err);
        res.status(500).send("File could not be downloaded.");
    } finally {
        await client.close();
    }
});

/**
 * @swagger
 * /registerSubmit:
 *   post:
 *     summary: Register a new user account
 *     description: Create a new user account with the provided information. Returns success page on successful registration.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - userid
 *               - email
 *               - password
 *               - confirm_pass
 *               - role
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               userid:
 *                 type: string
 *                 example: "johndoe123"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123"
 *               confirm_pass:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123"
 *               phone:
 *                 type: string
 *                 pattern: "^\\d{3}-\\d{3}-\\d{4}$"
 *                 example: "123-456-7890"
 *               role:
 *                 type: string
 *                 enum: [admin, contributor, viewer]
 *                 example: "contributor"
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html>Registration Complete</html>"
 *       400:
 *         description: Registration failed - validation error
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html>Error: Email already exists</html>"
 */
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
            isProtected: false, // Regular users are not protected by default
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
            else console.log("Welcome email sent successfully");
        });

        // Track user registration (only in production)
        if (process.env.VERCEL_URL) {
            track('user_registered', {
                userId: req.body.userid,
                role: req.body.role || 'contributor'
            });
        }

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

/**
 * @swagger
 * /loginSubmit:
 *   post:
 *     summary: Authenticate user login
 *     description: Authenticate user credentials and create a session. Redirects to dashboard on successful login.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - userid
 *               - password
 *             properties:
 *               userid:
 *                 type: string
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "admin"
 *     responses:
 *       302:
 *         description: Login successful - redirect to dashboard
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/dashboard"
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: "connect.sid=s%3A..."
 *       401:
 *         description: Login failed - invalid credentials
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/login"
 */
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

        // Login successful, redirecting to dashboard

        return res.redirect('/dashboard');
    } catch (e) {
        console.error(e);
        return res.status(500).send("Server error. Try again later.");
    } finally {
        await client.close();
    }
});

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file
 *     description: Upload a file to the system. Supports files up to 100MB. Only contributors and admins can upload files.
 *     tags: [File Operations]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (max 100MB)
 *               category:
 *                 type: string
 *                 enum: [documents, images, presentations, spreadsheets, archives]
 *                 example: "documents"
 *               description:
 *                 type: string
 *                 example: "Important project document"
 *     responses:
 *       302:
 *         description: File uploaded successfully - redirect to dashboard
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/dashboard"
 *       401:
 *         description: Unauthorized - redirect to login
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "/login"
 *       400:
 *         description: Bad request - File too large or invalid format
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html>Error: File too large</html>"
 *       500:
 *         description: Upload failed
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html>Error: Upload failed</html>"
 */
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
            text: `Hello ${req.session.user.firstname},\n\nYour file \"${sanitizeForHeader(file.originalname)}\" has been uploaded successfully on ${new Date().toLocaleString()}.\n\n- EDMS Team`
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.error("Error sending email:", err);
            else console.log("Email sent successfully");
        });

        // Track file upload (only in production)
        if (process.env.VERCEL_URL) {
            track('file_uploaded', {
                userId: req.session.user.userid,
                fileSize: file.size,
                fileType: file.mimetype,
                category: category
            });
        }

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
            .sort({ _id: -1 }) // Sort by creation order (newest first)
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
/**
 * @swagger
 * /api/get-signed-url:
 *   post:
 *     summary: Get signed URL for direct S3 upload
 *     description: Generate a pre-signed URL for direct file upload to AWS S3. Used for large file uploads to bypass server limitations.
 *     tags: [File Operations]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filename
 *               - contentType
 *             properties:
 *               filename:
 *                 type: string
 *                 example: "document_123456789.pdf"
 *               contentType:
 *                 type: string
 *                 example: "application/pdf"
 *     responses:
 *       200:
 *         description: Signed URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 signedUrl:
 *                   type: string
 *                   example: "https://edms-bucket.s3.amazonaws.com/document_123456789.pdf?X-Amz-Algorithm=..."
 *                 key:
 *                   type: string
 *                   example: "document_123456789.pdf"
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Failed to generate signed URL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
/**
 * @swagger
 * /api/confirm-upload:
 *   post:
 *     summary: Confirm file upload and save metadata
 *     description: Save file metadata to database after successful direct S3 upload. This completes the upload process.
 *     tags: [File Operations]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filename
 *               - originalName
 *               - size
 *               - contentType
 *               - category
 *             properties:
 *               filename:
 *                 type: string
 *                 example: "document_123456789.pdf"
 *               originalName:
 *                 type: string
 *                 example: "My Document.pdf"
 *               size:
 *                 type: integer
 *                 example: 1024000
 *               contentType:
 *                 type: string
 *                 example: "application/pdf"
 *               category:
 *                 type: string
 *                 enum: [documents, images, presentations, spreadsheets, archives]
 *                 example: "documents"
 *               description:
 *                 type: string
 *                 example: "Important project document"
 *     responses:
 *       200:
 *         description: File metadata saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "File uploaded successfully"
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Failed to save file metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
            text: `Hello ${req.session.user.firstname},\n\nYour file "${sanitizeForHeader(originalName)}" has been uploaded successfully on ${new Date().toLocaleString()}.\n\n- EDMS Team`
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.error("Error sending email:", err);
            else console.log("Email sent successfully");
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
/**
 * @swagger
 * /api/update-user-role:
 *   post:
 *     summary: Update user role
 *     description: Change a user's role (admin, contributor, viewer). Only accessible by admin users.
 *     tags: [Admin Dashboard]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - newRole
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user123"
 *               newRole:
 *                 type: string
 *                 enum: [admin, contributor, viewer]
 *                 example: "contributor"
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User role updated successfully"
 *       401:
 *         description: Unauthorized - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

        // Check if user exists and is protected
        const user = await client
            .db(userCollection.db)
            .collection(userCollection.collection)
            .findOne({ userid: userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent role changes for protected users
        if (user.isProtected) {
            return res.status(403).json({
                error: 'Cannot modify protected system account',
                message: 'This user account is protected and cannot have its role changed'
            });
        }

        const result = await client
            .db(userCollection.db)
            .collection(userCollection.collection)
            .updateOne(
                { userid: userId },
                { $set: { role: newRole, updatedAt: new Date() } }
            );

        // Track admin action (only in production)
        if (process.env.VERCEL_URL) {
            track('user_role_updated', {
                adminId: req.session.user.userid,
                targetUserId: userId,
                newRole: newRole
            });
        }

        res.json({ success: true, message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    } finally {
        await client.close();
    }
});

/**
 * @swagger
 * /api/delete-user:
 *   post:
 *     summary: Delete user account
 *     description: Permanently delete a user account and all associated files. Cannot delete protected system accounts or own account.
 *     tags: [Admin Dashboard]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user123"
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       400:
 *         description: Bad request - Cannot delete own account or protected account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Cannot delete protected system account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

        // Check if user is protected (system accounts)
        const userToDelete = await client
            .db(userCollection.db)
            .collection(userCollection.collection)
            .findOne({ userid: userId });

        if (userToDelete && userToDelete.isProtected) {
            return res.status(403).json({
                error: 'Cannot delete protected system account. This account is required for system functionality.'
            });
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
    try {
        app.listen(portNumber, () => {
            console.log(`EDMS Server started successfully on port ${portNumber}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
