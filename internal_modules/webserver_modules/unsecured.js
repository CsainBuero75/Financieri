const http = require("http")
require('dotenv').config({ path: '../../.env', quiet:true })
const {format} = require("../formatter.js")

module.exports.createUnsecuredServer = function (app) {
    try {
        const server = http.createServer(app);
        server.listen(process.env.PORT_HTTP, process.env.ADDRESS)

        format({
            "protocol": "HTTP",
            "message": "Unencrypted server is runing",
        })

        return server
    } catch (error) {
        format({
            "protocol": "HTTP",
            "errorCode": "500",
            "message": "Failed to start",
            "error": error
        })
        process.exit()
    }
}