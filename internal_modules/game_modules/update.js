const { sendRequestToPlayers } = require("../websocket_modules/roomManager.js")
const { CanvasRenderService: CRS } = require('chartjs-node-canvas');
require('dotenv').config({ path: '../../.env', quiet: true })

module.exports = {
    tick: async function (database, Room) {
        const [year, month] = Room.Update()

        let seed = { ...Room.Seed } // Get updated seed of the room
        seed["values"] = {}

        const dictionary = await database.getColumnsOfAllTables()
        for (const Table of Object.keys(dictionary)) {
            if (!(Table in seed["values"]) && Table !== "gameData") {
                seed["values"][Table] = {}
            }

            let list = []
            dictionary[Table].forEach(element => {
                if (
                    Table === "fixed_deposit"
                    || Table === "gameData"
                    || element in Room.Seed.seed[Table]
                ) list.push(element)
            }); // Push into list just elements that the room has in seed

            const values = await database.getValues(
                `${year}-${month.toString().padStart(2, "0")}`, // Date to get data from
                Table,
                list
            )
            if (!values || !values[0] || !values[0][0]) {
                format({
                    "errorCode": "500",
                    "message": `Database could not fetch data! Request: ${year}-${month.toString().padStart(2, "0")} | ${Table} | ${list} | ${values}`,
                    "protocol": "SQL"
                })
                return
            }

            const PDT = Room.PastDataStorage
            for (const Key of Object.keys(values[0][0])) {
                if (!values[0][0][Key]) continue
                if (!("others" in seed["values"])) seed["values"]["others"] = {}

                if (Table === "gameData") {
                    seed["values"]["others"][Key] = values[0][0][Key]
                } else {
                    seed["values"][Table][Key] = values[0][0][Key]
                }
            }
        }

        // Deleting data, which clients should not have access to
        delete seed["startDate"]
        delete seed["year"]
        delete seed["month"]
        delete seed["seed"]

        sendRequestToPlayers(Room, {
            "type": "game",
            "subtype": "tick",
            "data": seed
        }, undefined, Room.Host, true)
    }
}