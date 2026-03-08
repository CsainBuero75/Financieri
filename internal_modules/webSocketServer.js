const { format } = require("./formatter.js")
//const { newConnection } = require("./websocket_modules/clientManager.js")
const { v4: uuidv4 } = require('uuid');

// WebSocketServer Modules
const websocket = require("ws")
const { isAlive } = require("./websocket_modules/isAlive.js")
const { errorHandler } = require("./websocket_modules/error.js")
const { onMessage } = require("./websocket_modules/requestReciever.js")
const { onClose } = require("./websocket_modules/end.js")

module.exports.createWebsocketServer = function () {
    const WebSocketServer = new websocket.WebSocketServer({ // Create a websocket server, which gets updated from HTTPS
        noServer: true,
        clientTracking: true
    });

    WebSocketServer.on('connection', (websocket, req) => {
        // Set up websocket, to have userId and userData
        websocket.userId = uuidv4();

        //const userId = newConnection(websocket) 

        isAlive(websocket) // Check in intervals to make sure the websocket won't be kept in memory after unknown client fail
        errorHandler(websocket) // Handles websocket errors
        onMessage(websocket) // Handles requests and responds
        onClose(websocket) // Handles closing websockets

        // Every time a new websocket connection is esabilised, it's a upgrade from HTTPS
        format({
            "sender": "CLIENT",
            "protocol": "WS",
            "errorCode": 101,
            "message": "Successfull upgrade!",
            "websocket" : websocket
        })
    });

    return WebSocketServer
}