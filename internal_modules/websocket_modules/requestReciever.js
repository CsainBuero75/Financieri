const { format } = require("../formatter.js")
const { existsSync } = require("fs")

const modulesPath = __dirname + "/requestReciever_modules"
const validRequestTypes = new Set(["room", "game"])

module.exports.onMessage = function (websocket) {
    if (!websocket) {
        throw new Error("Websocket was not defined!")
    }

    websocket.on("message", async (message) => {
        let request
        try {
            request = JSON.parse(message)
        } catch (error) {
            format({
                protocol: "WS",
                errorCode: "400",
                message: `Malformed JSON request: ${message}`,
                websocket,
                error,
            })
            return
        }

        if (!request || !request.type || !request.subtype || !validRequestTypes.has(request.type)) {
            format({
                protocol: "WS",
                errorCode: "400",
                message: `Invalid request envelope: ${JSON.stringify(request)}`,
                websocket,
            })
            return
        }

        const scriptPath = `${modulesPath}/${request.subtype}.js`
        if (!existsSync(scriptPath)) {
            format({
                protocol: "WS",
                errorCode: "501",
                message: `Request '${request.type}/${request.subtype}' is not implemented!`,
                websocket,
            })
            return
        }

        try {
            const eventFunction = require(scriptPath)
            await eventFunction.run(websocket, request)

            format({
                protocol: "WS",
                message: `Request '${request.type}-${request.subtype}' was processed!`,
                websocket,
            })
        } catch (error) {
            format({
                sender: "CLIENT",
                protocol: "WS",
                errorCode: "500",
                message: `Error while trying to process '${request.type}-${request.subtype}' request!`,
                websocket,
                error,
            })
        }
    })
}
