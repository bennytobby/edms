/* All Processes */
process.stdin.setEncoding("utf8");

/* Imports */
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const dotenv = require('dotenv').config({ path: './.env' });

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
