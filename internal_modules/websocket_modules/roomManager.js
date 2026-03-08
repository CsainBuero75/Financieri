const { format } = require("../formatter.js");
const { Room } = require("./roomManager_modules/roomObject.js")
const { sendRequest } = require("./requestSender.js")

let rooms = []
let list = {}

function generateRoomCode() {
    let roomCode = ""
    do {
        roomCode = Math.floor(1000000 + Math.random() * 9000000).toString(36).slice(0, 7).padStart(7, "0")
    } while (list[roomCode])

    return roomCode
}

function getRoom(roomCode) {
    return list[roomCode] || null
}

function createRoom(websocket) {
    if (!websocket) {
        throw new Error("No websocket!")
    }

    try {
        if (rooms.some((room) => room.Host === websocket || room.getPlayer(websocket.userId))) {
            format({
                sender: "CLIENT",
                protocol: "WS",
                errorCode: "409",
                message: "Trying to create multiple rooms!",
                websocket,
            })
            return [false, null]
        }

        const roomCode = generateRoomCode()
        const newRoom = new Room(roomCode, websocket)

        rooms.push(newRoom)
        list[roomCode] = newRoom

        websocket.username = "HOST"
        websocket.room = newRoom

        format({
            sender: "CLIENT",
            protocol: "WS",
            message: `Room ${roomCode} was created.`,
            websocket,
        })

        return [true, roomCode]
    } catch (error) {
        format({
            sender: "CLIENT",
            protocol: "WS",
            errorCode: "500",
            message: "Error while trying to create a room!",
            websocket,
            error,
        })
        return [false, null]
    }
}

function joinRoom(websocket, roomCode, username) {
    if (!websocket) {
        throw new Error(`Trying to join room '${roomCode}', without defined websocket!`)
    }

    const room = getRoom(roomCode)
    if (!roomCode || !room) {
        format({
            sender: "CLIENT",
            protocol: "WS",
            errorCode: "404",
            message: `Unable to find room with code '${roomCode}'`,
            websocket,
        })

        return [false, null]
    }

    if (!room.Joinable) {
        format({
            sender: "CLIENT",
            protocol: "WS",
            errorCode: "403",
            message: "Unable to join the room! Game has started.",
            websocket,
        })
        return [false, null]
    }

    if (!username || typeof username !== "string" || username.trim().length < 2) {
        throw new Error("Username is invalid")
    }

    if (room.getPlayer(websocket.userId)) {
        return [true, null]
    }

    room.addPlayer(websocket)
    websocket.username = username.trim().slice(0, 16)
    websocket.room = room

    const data = {}
    room.getPlayersWebsockets.forEach((player) => {
        data[player.userId] = player.username
    })

    return [true, data]
}

function leaveRoom(websocket) {
    if (!websocket) {
        throw new Error("Trying to leave room without defined websocket")
    }
    if (!websocket.room) {
        return [false, null]
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
        throw new Error("Unable to delete room: invalid room object")
    }

    room.getPlayersWebsockets.forEach((player) => {
        try {
            kickPlayerServer(room, player)
        } catch (error) {
            format({
                message: "Tried to kick a player object, but unsuccessfully!",
                error,
                protocol: "WS",
                errorCode: "500",
            })
        }
    })

    rooms = rooms.filter((thisRoom) => thisRoom !== room)
    delete list[room.Code]

    return true
}

function sendRequestToPlayers(room, request, except = undefined, include = undefined, dontLog = false) {
    if (!room || !(room instanceof Room)) {
        throw new Error("Room Object was not passed in.")
    }

    const playerSet = new Set(room.getPlayersWebsockets)
    if (include) playerSet.add(include)

    playerSet.forEach((player) => {
        if (!except || player !== except) {
            sendRequest(player, request, dontLog)
        }
    })

    return true
}

function kickPlayer(host, playerId) {
    const room = host.room
    if (!room || !(room instanceof Room)) {
        throw new Error("Host is not in a room!")
    }
    if (room.Host !== host) {
        throw new Error("Host is not a host of the player's room!")
    }

    const player = room.getPlayer(playerId)
    if (!player) {
        throw new Error("Cannot kick a player! Player does not exist!")
    }

    leaveRoom(player)
    sendRequestToPlayers(room, {
        type: "room",
        subtype: "leave",
        data: { userId: player.userId },
    })

    sendRequest(player, {
        type: "room",
        subtype: "kick",
    })
}

function kickPlayerServer(room, player) {
    if (!room || !(room instanceof Room)) {
        throw new Error("Undefined room")
    }
    if (!player) {
        throw new Error("Cannot kick non-existent player!")
    }

    leaveRoom(player)
    sendRequestToPlayers(room, {
        type: "room",
        subtype: "leave",
        data: { userId: player.userId },
    })

    sendRequest(player, {
        type: "room",
        subtype: "kick",
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
    sendRequest,
}
