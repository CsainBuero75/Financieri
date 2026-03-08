// Use this formula to console.log or console.error things
// {LOG/WARN/ERROR} | {SERVER/CLIENT} [HTTPS/WS/---]/[userId/ip]/[errorCode] : [Message] \n [error],
const picocolors = require("picocolors")

const errorMessages = {
    "?" : {
        "text": "Unknown status",
        "type": "log"
    },

    // 100's
    "101": {
        "text": "Switching Protocols",
        "type": "log"
    },

    // 200's
    "200": {
        "text": "OK",
        "type": "log"
    },

    // 300's

    // 400's
    "400": { // Server doesn't know what to do with it
        "text": "Bad Request", 
        "type": "warn"
    },
    "403": { // Server rejection, bad username, bad roomcode etc.
        "text": "Forbidden",
        "type": "warn"
    },
    "404": { // Unable to find requested room
        "text": "Not Found",
        "type": "warn"
    },
    "408" : { // No responce from client for some time
        "text": "Request Timeout",
        "type": "log"
    },
    "409": { // When trying to create/joining multiple rooms
        "text": "Conflict",
        "type": "warn"
    },
    "410": {
        "text": "Gone/Ended",
        "type": "log"
    },

    // 500's
    "500": {
        "text": "Internal Server Error",
        "type": "error"
    },
    "501": { // Not implemented function
        "text": "Not Implemented",
        "type": "warn"
    },

}

module.exports.format = function (
    properties
    /*
    {
        type: string?           LOG/WARN/ERROR              based on error code or "error" if not found
        sender: string?         SERVER/CLIENT               "SERVER"
        protocol: string        HTTP/HTTP/WS/SQL            undefined
        errorCode: string?      search error codes          200
        message: string         custom message              undefined
        websocket: websocket?   Websocket to get userId     undefined
        error: Error?           error from catch(error)     undefined
    }
    */
) {
    if (!properties.errorCode) properties.errorCode = "200"
    if (!properties.type) properties.type = errorMessages[properties.errorCode].type || "error" // If formater should use different kind of message type
    if (!properties.sender) properties.sender = "SERVER"
    if (!properties.protocol) properties.protocol = "?"

    const startDate = new Date()
    const time = `${
        startDate.getDay().toString().padStart(2,0)
    }.${
        startDate.getMonth().toString().padStart(2,0)
    }.${
        startDate.getFullYear().toString().padStart(2,0)
    } ${
        startDate.getHours().toString().padStart(2,0)
    }:${
        startDate.getMinutes().toString().padStart(2,0)
    }:${
        startDate.getSeconds().toString().padStart(2,0)
    }`
    //const newMessage = `${time} : ${properties.type} | ${properties.sender} [${properties.protocol}]` + (properties.userInformation && `/[${properties.userInformation}]` || "") + `/[${properties.errorCode}] : ${properties.message} | ${errorMessages[properties.errorCode] || "unknown"}` + (properties.error && `\n ${properties.error.stack}` || "")
    const ssnewMessage =
        `${time} : ` // Time of logger
        + `[${properties.sender.toUpperCase()}] ` // If proccesing request from client, then client, else server
        + `[${properties.type.toUpperCase()}] ` // LOG, ERROR, WARN
        + `[${properties.protocol.toUpperCase()}] ` // WS for WS and WSS, HTTP for HTTP and HTTPS, except when starting HTTPS server
        + `[${properties.errorCode}] ` // check errorMessages dictionary
        + `[${errorMessages[properties.errorCode].text} - ${properties.message}] ` // Shows the message of the error code and message it recieved
        + (properties.websocket && `[${properties.websocket._socket.remoteAddress} as "${properties.websocket.username || "null"}" <${properties.websocket.userId}>] ` || "") // If sender is client, show it's IP and userId, do not pass websocket object
        + (properties.error && `\n ${properties.error.stack}` || "") // If error, then show error.stack

    const newMessage = `${time} : ${properties.sender.toUpperCase()}\t${properties.type.toUpperCase()}\t${properties.protocol.toUpperCase()}\t${properties.errorCode}\t[${errorMessages[properties.errorCode].text} - ${properties.message}]\t` + (properties.websocket && `[${properties.websocket._socket.remoteAddress} as "${properties.websocket.username || "null"}" <${properties.websocket.userId}>] ` || "") + (properties.error && `\n ${properties.error.stack}` || "")

    if (properties.error || properties.type.toUpperCase() === "ERROR") {
        console.error(picocolors.redBright(newMessage))
    } else if (properties.type.toUpperCase() === "WARN") {
        console.warn(picocolors.yellow(newMessage))
    } else {
        console.log(newMessage) 
    }
}

//npx @tailwindcss/cli -i ./public/style.css -o ./public/output.css --watch