const { format } = require("../formatter.js");
const { Room } = require("./roomManager_modules/roomObject.js")
const { sendRequest } = require("./requestSender.js")

let rooms = [/* room, room*/]
let list = {/* roomcode : room */ }

// Returns RoomObject or null
function getRoom(roomCode) {
    return list[roomCode] || null
}
// Method to create a room using RoomObject
function createRoom(websocket) {
    if (!websocket) {
        throw new Error("No websocket!")
    }

    try {
        // Stops users from sending request to make more rooms per websocket
        rooms.forEach((room) => {
            if (room.Host === websocket) {
                format({
                    "sender": "CLIENT",
                    "protocol": "WS",
                    "errorCode": "409",
                    "message": "Trying to create multiple rooms!",
                    "websocket": websocket,
                })
                return [false, null];
            }
        })
        // Code generator, needs an update
        //                          When you make 3 rooms and the first one deletes, the next roomCode will be the same as already used roomCode
        const roomCode = (Math.round(Math.random() * (9999999 - Object.keys(list).length))).toString(36).padStart(7, "0")

        const newRoom = new Room(roomCode, websocket)
        rooms.push(newRoom)
        list[roomCode] = newRoom

        websocket.username = "HOST"
        websocket.room = newRoom

        format({
            "sender": "CLIENT",
            "protocol": "WS",
            "message": `Room ${roomCode} was created.`,
            "websocket": websocket,
        })

        return [true, roomCode];
    } catch (error) {
        format({
            "sender": "CLIENT",
            "protocol": "WS",
            "errorCode": "500",
            "message": "Error while trying to create a room!",
            "websocket": websocket,
            "error": error,
        })
        return [false, null];
    }
}
// Join room
function joinRoom(websocket, roomCode, username) {
    if (!websocket) {
        throw new Error(`Trying to join room '${roomCode}', without defined websocket!`)
    }

    const room = getRoom(roomCode)
    if (!roomCode || !room) {
        format({
            "sender": "WARN",
            "protocol": "WS",
            "errorCode": "404",
            "message": `Unable to find room with code '${roomCode}'`,
            "websocket": websocket,
        })

        return [false, null]
    }
    if (!room.Joinable) {
        format({
            "sender": "WARN",
            "protocol": "WS",
            "errorCode": "403",
            "message": `Unable to join the room! Game has started.`,
            "websocket": websocket,
        })

        return [false, null]
    }
    if (!username) {
        throw new Error(`No username`)
    }

    room.addPlayer(websocket)
    websocket.username = username
    websocket.room = room

    let data = {}
    room.getPlayersWebsockets.forEach((player) => {
        data[player.userId] = player.username
    })

    return [true, data]
}
function leaveRoom(websocket) {
    if (!websocket) {
        throw new Error(`Trying to leave room without defined websocket`)
    }
    if (!websocket.room) {
        throw new Error(`Trying to leave room, but the player has no room set!`)
    }
    if (websocket.room.Host === websocket) {
        deleteRoom(websocket.room)
        return [true, null]
    }

    const room = websocket.room
    websocket.room = undefined
    room.removePlayer(websocket)

    return [true, room]
}
function deleteRoom(room) {
    if (!room || !(room instanceof Room)) {
        throw new Error(`Unable to find room with code '${roomCode || "undefined"}'!`)
    }
    if (!room.Joinable) return true

    room.getPlayersWebsockets.forEach(player => {
        try {
            kickPlayerServer(room, player)
        } catch (error) {
            format({
                "message": "Tryied to kick a player object, but unsuccesfully!",
                "error": error,
                "protocol": "WS",
                "errorCode": "500"
            })
        }
        
    })

    // delete
    rooms = rooms.filter(thisRoom => thisRoom !== room);
    delete list[room.Code]
    room = undefined

    return true
}
// Send a websocket request to each player
function sendRequestToPlayers(room, request, except = undefined, include = undefined, dontLog = false) {
    if (!room || !(room instanceof Room)) {
        throw new Error(`Room Object was not passed in.`)
    }

    const players = [...room.getPlayersWebsockets]
    if (include) {
        players.push(include)
    }

    players.forEach(player => {
        if (!except || player !== except) {
            sendRequest(player, request, dontLog)
        }
    })
    return true
}
function kickPlayer(host, playerId) {
    const room = host.room 
    if (!room || !(room instanceof Room)) {
        throw new Error(`Host is not in a room!`)
    }
    const player = room.getPlayer(playerId)
    if (!player) {
        throw new Error(`Cannot kick a player! Host is not in the same room or they don't exist!`)
    }
    if (room.Host !== host) {
        throw new Error(`Host is not a host of the player's room!`)
    }

    // The same as leave.js script
    leaveRoom(player)
    // Send to the rest of room that the client left
    sendRequestToPlayers(room, {
        "type": "room",
        "subtype": "leave",
        "data": {
            "userId": player.userId
        }
    })
    
    // Notify the client, they were kicked out
    sendRequest(player, {
        "type": "room",
        "subtype": "kick"
    })
}

function kickPlayerServer(room, player) {
    if (!room || !(room instanceof Room)) {
        throw new Error(`Undefined room`)
    }
    if (!player) {
        throw new Error(`Cannot kick non-existent player!`)
    }
    // The same as leave.js script
    leaveRoom(player)
    // Send to the rest of room that the client left
    sendRequestToPlayers(room, {
        "type": "room",
        "subtype": "leave",
        "data": {
            "userId": player.userId
        }
    })
    
    // Notify the client, they were kicked out
    sendRequest(player, {
        "type": "room",
        "subtype": "kick"
    })
}

module.exports = {
    getRoom,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
    sendRequestToPlayers,
    kickPlayer,
    sendRequest
}