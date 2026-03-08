const { format } = require("../formatter.js");

module.exports.isAlive = function (websocket) {
    // Handle connection ping/pong for keep-alive
    if (!websocket) {
        throw new Error("Function 'isAlive' requires webSocket!")
    }

    websocket.isAlive = true;
    websocket.on('pong', function heartbeat() {
        websocket.isAlive = true;
    });

    // Ping client periodically to detect broken connections
    const interval = setInterval(function ping() {
        if (websocket.isAlive === false) {
            format({
                "protocol" : "WSS",
                "errorCode" : "408",
                "message": "Websocket is getting terminated!",
                "websocket": websocket,
            })
            return websocket.terminate()
        }
        websocket.isAlive = false
        websocket.ping()
    }, 3000)

    websocket.on('close', () => { // When a client closes, clear the interval.
        clearInterval(interval)
    })
}
