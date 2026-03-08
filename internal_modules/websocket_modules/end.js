const { format } = require("../formatter.js")
const { run:leave } = require("./requestReciever_modules/leave.js")

module.exports.onClose = function (websocket) {
    if (!websocket) {
        throw new Error("Function 'onClose' requires webSocket!")
    }

    websocket.on("close", () => {
        try {
            leave(websocket)

            format({
                "sender": "CLIENT",
                "protocol": "WS",
                "errorCode": "200",
                "message": `Disconnected.`,
                "websocket": websocket,
            })
        } catch (error) {
            format({
                "sender": "CLIENT",
                "protocol": "WS",
                "errorCode": "500",
                "message": `Disconnected.`,
                "websocket": websocket,
                "error": error
            })
        }
    })
}