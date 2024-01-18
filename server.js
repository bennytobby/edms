/* All Processes */
process.stdin.setEncoding("utf8");


/* MongoDB Connections */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, './.env') })
const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = { db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION };
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
const app = express();
const bodyParser = require("body-parser");

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.get('/', function (req, res) {
    res.render('index');
});

app.listen(3000);
