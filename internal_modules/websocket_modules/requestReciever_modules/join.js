const { joinRoom, sendRequestToPlayers, getRoom } = require("../roomManager.js")
const { sendRequest } = require("../requestSender.js");

// export the object so it can be required
module.exports = {
    run(websocket, request) {
        const [success, data] = joinRoom(
            websocket,
            request.data.roomCode,
            request.data.username
        )

        if (success) {
            const room = websocket.room

            // Show the player to other players and to host client
            sendRequestToPlayers(room, {
                "type": "room",
                "subtype": "join",
                "data": {
                    "userId": websocket.userId,
                    "username": websocket.username
                }
            }, websocket, room.Host)

            // Give the joining player a list of players
            sendRequest(websocket, {
                "type": "room",
                "subtype": "join",
                "data": {
                    "list_of_players": data
                }
            })
        }
    }
};