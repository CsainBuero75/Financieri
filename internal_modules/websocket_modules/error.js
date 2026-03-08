const { format } = require("../formatter.js")

module.exports.errorHandler = function (websocket) {
    if (!websocket) {
        throw new Error("Function 'errorHandler' requires webSocket!")
    }

    websocket.on('error', (error) => {
        format({
            "sender": "CLIENT",
            "protocol": "WS",
            "errorCode": "500",
            "message": "Websocket error",
            "websocket": websocket,
            "error": error
        })
    });
}