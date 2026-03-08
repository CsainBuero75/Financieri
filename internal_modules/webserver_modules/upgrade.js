const { format } = require("../formatter.js")

module.exports.handleUpgrade = function (webserver, socketserver) {
    if (!socketserver) {
        throw new Error("Function 'createWebServers' requires webSocketSocket!")
    }
    if (!webserver) {
        throw new Error("Function 'createWebServers' requires webServer to bind with!")
    }

    // Handle errors, while upgrading
    function onSocketError(error, request) {
        format({
            "sender": "CLIENT",
            "protocol": "HTTP",
            "errorCode": "500",
            "message": `Error while upgrading to websocket!`,
            "error": error
        })
    }

    webserver.on('upgrade', (request, socket, head) => {
        format({
            "sender": "CLIENT",
            "protocol": "WS",
            "errorCode": "101",
            "message": `Upgrading connection to websocket!`,
        })
        socket.on('error', onSocketError);

        try {
            /*
            authenticate(request, function next(err, client) {
            if (err || !client) {
                messageFormater.format(err, "ERROR", "SERVER", "HTTPS->WSS", "Error while trying to move from https to wss.")

                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }
            */

            socketserver.handleUpgrade(request, socket, head, function upgraded(ws) {
                socketserver.emit('connection', ws, request, socket);
            });
            socket.removeListener('error', onSocketError);
        } catch (error) {
            format({
                "sender": "CLIENT",
                "protocol": "WS",
                "errorCode": "500",
                "message": "Failed to upgrade the connection to WS(S) from HTTP(S)",
                "error": error
            })
        }
    })
}