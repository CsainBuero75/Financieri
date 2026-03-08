const { kickPlayer } = require("../roomManager.js")

// export the object so it can be required
module.exports = {
    run(websocket, request) {        
        kickPlayer(
            websocket, // Host requesting kick out
            request.data.userId, // Player that is going to be kicked out
        )
    }
};