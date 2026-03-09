const { format } = require("./formatter.js")
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

        isAlive(websocket) // Check in intervals to make sure the websocket won't be kept in memory after unknown client fail
        errorHandler(websocket)
        onMessage(websocket) // Handles requests and responds to them
        onClose(websocket)

        // Every time a new websocket connection is established, it's a upgrade from HTTPS
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