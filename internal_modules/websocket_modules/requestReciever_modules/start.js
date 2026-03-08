const { initializeGame } = require("../../game_modules/initialize.js")
const { tick } = require("../../game_modules/update")
const {format} = require("../../formatter.js")

require('dotenv').config({ path: '../../../.env', quiet: true })

const { DatabaseObject } = require("../../game_modules/database.js")
const database = new DatabaseObject(process.env.USERNAME, process.env.PASSWORD)

const { Room : RoomObject } = require("../roomManager_modules/roomObject.js")
const { deleteRoom } = require("../roomManager.js")

module.exports = {
    run: async function (websocket, request) {
        const Room = websocket.room

        if (!Room || !(Room instanceof RoomObject)) {
            throw new Error(`Client sending request to start, is not in a room!`)
        }
        if (Room.Host !== websocket) {
            throw new Error(`Client is not a host of the room!`)
        }
        if (!Room.Joinable) {
            throw new Error(`Client trying to start, already started game!`)
        }
        if (Object.keys(Room.Players).length <= 0) {
            format({
                "sender": "CLIENT",
                "protocol": "WS",
                "errorCode": "403",
                "message": `Host tried to start a game, without any players!`,
                "websocket": websocket,
            })
            return
        }

        database.connect()

        if (!request.data.playtime) {
            format({
                "sender": "CLIENT",
                "protocol": "WS",
                "errorCode": "404",
                "message": `Request is missing playtime variable! Setting default value: 20`,
                "websocket": websocket,
            })
            request.data.playtime = 20
        }
        if (!request.data.semianuallySaving) {
            format({
                "sender": "CLIENT",
                "protocol": "WS",
                "errorCode": "404",
                "message": `Request is missing semianuallySaving variable! Setting default value: 1000`,
                "websocket": websocket,
            })
            request.data.semianuallySaving = 1000
        }

        // Initialize the game
        await initializeGame(
            database, // Database object so the script doesn't have to log into the database every time it wants to send a request
            Room,
            request.data.playtime,
            request.data.semianuallySaving
        )

        // Start ticking every 5 second
        tick(database, Room)
        let i = 1
        const interval = setInterval(
            (database, Room) => {
                tick(database, Room)
                i++

                if (i >= (request.data.playtime * 12)) {
                    clearInterval(interval)
                    format({
                        "message": `Game '${Room.Code}' has ended! Destroying connections...`,
                        "errorCode": "410",
                        "protocol": "WS"
                    })
                    
                    deleteRoom(Room)
                } // Stop the interval from running after tha game ended.
            },
            5000,
            // Parametres for the function:
            database, // Database object, so it doesn't have to connect in again
            Room
        )
    }
}