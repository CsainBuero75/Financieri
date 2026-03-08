const https = require("https")
require('dotenv').config({ path: '../../.env', quiet:true })
const { format } = require("../formatter.js")

module.exports.createSecuredServer = function (app, EncryptionOptions) {
    try {
        const server = https.createServer(EncryptionOptions, app)
        server.listen(process.env.PORT_HTTPS, process.env.ADDRESS)

        format({
            "protocol": "HTTP",
            "message": "Encrypted server is runing",
        })

        return server
    } catch (error) {
        format({
            "protocol": "HTTP",
            "errorCode": "500",
            "message": "Failed to encrypted start",
            "error": error
        })

        return null
    }
}