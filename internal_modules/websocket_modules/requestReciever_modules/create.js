const { createRoom } = require("../roomManager.js")
const { sendRequest } = require("../requestSender.js");

// export the object so it can be required
module.exports = {
    run(websocket, request) {
        const [success, roomCode] = createRoom(websocket)
        // Responds to the client with succes and code to the room or just fail.

        /*sendRequest(websocket, {
            "type": request.type,
            "success": success,
            "properties": {
                "roomCode": (roomCode || "")
            }
        })*/

        if (success) {
            sendRequest(websocket, {
                "type": "room",
                "subtype": "create",
                "data": {
                    "roomCode": roomCode
                }
            })
        }
    }
};