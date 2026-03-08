const { leaveRoom, sendRequestToPlayers } = require("../roomManager.js")

// export the object so it can be required
module.exports = {
    run(websocket, request) {
        const [success, room] = leaveRoom(
            websocket,
        )
        /*
        // Responds to the client with succes and code to the room or just fail.
            sendRequest(websocket, {
                "type": request.type,
                "success": success,
            })
        */

        if (success && room) {
            // Send to the rest of room that the client left
            sendRequestToPlayers(room, {
                "type": "room",
                "subtype": "leave",
                "data": {
                    "userId": websocket.userId
                }
            }, undefined, room.getHost)
        }
    }
};