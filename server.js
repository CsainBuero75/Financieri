require('dotenv').config({ path: './.env', quiet: true })
const { createWebServers } = require("./internal_modules/webServers.js")
const { createWebsocketServer } = require("./internal_modules/webSocketServer.js")

const WebSocketServer = createWebsocketServer()
createWebServers(WebSocketServer)

const startDate = new Date()
console.log(`
${startDate.getDay()}.${startDate.getMonth()}.${startDate.getFullYear()} ${startDate.getHours()}:${startDate.getMinutes()}:${startDate.getSeconds()}
https://${process.env.WEBSERVER_ADDRESS}:${process.env.WEBSERVER_HTTPS}
Press Ctrl+C to stop the server
`)