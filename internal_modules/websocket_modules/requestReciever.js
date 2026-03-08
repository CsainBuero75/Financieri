const { format } = require("../formatter.js")
const { readdir, existsSync } = require("fs")

const modulesPath = __dirname + "/requestReciever_modules"

module.exports.onMessage = function (websocket) {
    if (!websocket) {
        throw new Error("Websocket was not defined!")
    }

    // Everytime websocket sends a message, check for scripts and run the correct script
    websocket.on("message", async (message) => {
        // Transform string into table
        const request = JSON.parse(message)

        // Log every request sent to server
        if (!request.type || !request.subtype) {
            format({
                "protocol": "WS",
                "errorCode": "400",
                "message": `${message}`,
                "websocket": websocket,
            })
            return
        }

        if (!existsSync(`${modulesPath}/${request.subtype}.js`)) {
            format({
                "protocol": "WS",
                "errorCode": "501",
                "message": `Request '${request.type}/${request.subtype}' is not implemented! (${existsSync(`${modulesPath}/${request.subtype}.js`)}) ${modulesPath}/${request.subtype}.js`,
                "websocket": websocket,
            })
            return
        }

        try {
            // Get script and execute it's function .run
            const eventFunction = require(`${modulesPath}/${request.subtype}`)
            await eventFunction.run(websocket, request)

            // No errors so far, so it was success.
            format({
                "protocol": "WS",
                "message": `Request '${request.type}-${request.subtype}' was processed! Data: ${JSON.stringify(request.data)}`,
                "websocket": websocket,
            })
        } catch (error) {
            format({
                "sender": "CLIENT",
                "protocol": "WS",
                "errorCode": "500",
                "message": `Error while trying to process ${request.type}-${request.subtype}' request!`,
                "websocket": websocket,
                "error": error
            })
        }
    });
}