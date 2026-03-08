const { sendRequestToPlayers } = require("../websocket_modules/roomManager.js")
const { format } = require("../formatter.js")

module.exports = {
    tick: async function (database, Room) {
        const [year, month] = Room.Update()

        const seed = { ...Room.Seed }
        seed.values = {}

        const dictionary = await database.getColumnsOfAllTables()
        for (const table of Object.keys(dictionary)) {
            if (!(table in seed.values) && table !== "gameData") {
                seed.values[table] = {}
            }

            const list = []
            dictionary[table].forEach((element) => {
                if (table === "fixed_deposit" || table === "gameData" || element in (Room.Seed.seed[table] || {})) {
                    list.push(element)
                }
            })

            if (list.length === 0) continue

            const values = await database.getValues(
                `${year}-${month.toString().padStart(2, "0")}`,
                table,
                list,
            )

            if (!values || !values[0] || !values[0][0]) {
                format({
                    errorCode: "500",
                    message: `Database could not fetch data! Request: ${year}-${month.toString().padStart(2, "0")} | ${table} | ${list} | ${values}`,
                    protocol: "SQL",
                })
                return
            }

            for (const key of Object.keys(values[0][0])) {
                if (values[0][0][key] === null || values[0][0][key] === undefined) continue
                if (!("others" in seed.values)) seed.values.others = {}

                if (table === "gameData") {
                    seed.values.others[key] = values[0][0][key]
                } else {
                    seed.values[table][key] = values[0][0][key]
                }
            }
        }

        delete seed.startDate
        delete seed.year
        delete seed.month
        delete seed.seed

        sendRequestToPlayers(Room, {
            type: "game",
            subtype: "tick",
            data: seed,
        }, undefined, Room.Host, true)
    },
}
