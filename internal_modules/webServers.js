const http = require("http")
const https = require("https")
const fs = require("fs");
const express = require("express");
const path = require('path');

require('dotenv').config({ path: '../.env', quiet:true })

const EncryptionOptions = {
    key: fs.readFileSync(__dirname + "/webserver_modules/private.key"),
    cert: fs.readFileSync(__dirname + "/webserver_modules/certificate.crt"),

    // Recommended security settings
    minVersion: 'TLSv1.2',
    maxVersion: 'TLSv1.3',
    ciphers: [
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_AES_128_GCM_SHA256',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-CHACHA20-POLY1305',
        'ECDHE-RSA-CHACHA20-POLY1305',
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES128-GCM-SHA256'].join(':'),
    honorCipherOrder: true,

    /*
    // Enable OCSP Stapling
    requestCert: true,
    rejectUnauthorized: true,
    */

    // Enable session resumption
    sessionTimeout: 300, // 5 minutes
    sessionIdContext: 'Financieri',

    // Enable HSTS preload
    hsts: {
        maxAge: 63072000, // 2 years in seconds
        includeSubDomains: true,
        preload: true
    },

    // Enable secure renegotiation
    secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT |
        require('constants').SSL_OP_NO_SSLv3 |
        require('constants').SSL_OP_NO_TLSv1 |
        require('constants').SSL_OP_NO_TLSv1_1 |
        require('constants').SSL_OP_CIPHER_SERVER_PREFERENCE
};

const { createSecuredServer } = require("./webserver_modules/secured.js")
const { createUnsecuredServer } = require("./webserver_modules/unsecured.js")
const { handleUpgrade } = require("./webserver_modules/upgrade.js")

const { format } = require("./formatter.js")

// This function creates HTTPS and HTTP server and configures them
module.exports.createWebServers = function (socketServer) {
    if (!socketServer) {
        throw new Error("Undefined websocketserver!")
    }
    const app = express();

    // When users load the website, they will recieve HTML, CSS and Javascript files in order to work
    app.use(express.static(path.join(__dirname, "../public")))

    /*
    format({
            "sender": "CLIENT",
            "protocol": "HTTP",
            "errorCode": "200",
            "message": "Sending website...",
        })
    */

    // Get status of the server
    /*
    app.get('/api/status', (request, respond) => {
        respond.end(JSON.stringify({
            status: 'ok',
            time: new Date().toISOString()
        }));
    })*/

    const secureServer = createSecuredServer(app, EncryptionOptions)
    handleUpgrade(secureServer, socketServer)

    // Redirect all HTTP trafic to HTTPS?
    if (process.env.REDIRECTUNSECURE) {
        const redirectApp = express();
        redirectApp.all("", (request, respond) => {
            format({
                "sender": "CLIENT",
                "protocol": "HTTP",
                "errorCode": "101",
                "message": "Upgrading to HTTPS.",
            })
            respond.redirect("https://" + process.env.ADDRESS + ":" + process.env.PORT_HTTPS)
        })
        const unsecureServer = createUnsecuredServer(redirectApp)
    } else {
        // Create a server, without redirecting to a secure connection
        const unsecureServer = createUnsecuredServer(app)
        handleUpgrade(unsecureServer, socketServer)
    }
}