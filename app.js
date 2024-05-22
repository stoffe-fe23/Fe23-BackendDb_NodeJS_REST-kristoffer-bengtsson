/*
    Slutprojekt Backend Databaser (FE23 Grit Academy)
    Kristoffer Bengtsson

    app.js
    Main script for running the node.js/Express server.
*/
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as url from 'url';
import clientRoutes from './modules/routes-client.js';
import apiRoutes from './modules/routes-api.js';
import databaseInit from './modules/db-init.js';


// Init express HTTP server
const app = express();

// Process incoming parameter/form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());

// EJS templates
app.set("view engine", "ejs");
app.set("views", url.fileURLToPath(new URL('./views', import.meta.url)));

// Serve static files used by client pages. 
app.use('/css', express.static(url.fileURLToPath(new URL('./client/css', import.meta.url))));
app.use('/js', express.static(url.fileURLToPath(new URL('./client/js', import.meta.url))));
app.use('/images', express.static(url.fileURLToPath(new URL('./client/images', import.meta.url))));


// Serve API endpoints
app.use('/api', apiRoutes);

// Serve client pages
app.use('/', clientRoutes);


// Setup: Create the database tables if they do not already exist. 
app.get("/init", (req, res) => {
    databaseInit().then(() => {
        res.json({ message: "Database initialized." });
    }).catch((error) => {
        res.status(500);
        res.json({ error: "Database initialization failed.", status: error });
    });
});

// General error handler
app.use((err, req, res, next) => {
    console.log("ERROR: ", err);
    res.status(500);
    res.json({ error: err.message });
})



// Start the server on port 3000
const server = app.listen(3000, () => {
    console.log("Running node server. View page at: http://localhost:3000/");
});
