const { sendRequestToPlayers } = require("../websocket_modules/roomManager.js")
const { format } = require("../formatter.js")

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = {
    initializeGame: async function (database, Room, playtime, semianuallySaving) {
        const yearsToPlay = Number(playtime) || 15
        const startYear = randomIntFromInterval(1998, 2026 - yearsToPlay)
        const startMonth = 1

        const dictionary = await database.getColumnsOfAllTables()
        const seed = {}

        for (const key of Object.keys(dictionary)) {
            if (key === "fixed_deposit" || key === "gameData") continue

            const listOfNames = dictionary[key]
            const options = JSON.parse(process.env[`GAME_${key.toUpperCase()}`] || `{"max":1,"min":1}`)
            const min = Number(options.min) || 1
            const max = Number(options.max) || min
            const count = randomIntFromInterval(Math.min(min, max), Math.max(min, max))

            if (!(key in seed)) seed[key] = {}

            while (Object.keys(seed[key]).length < Math.min(count, listOfNames.length)) {
                const randomName = listOfNames[Math.floor(Math.random() * listOfNames.length)]
                if (randomName in seed[key]) continue
                seed[key][randomName] = await database.getFirstDate(key, randomName)
            }
        }

        Room.setSeed({
            startYear,
            startMonth,
            semiAnnuallySaving: Number(semianuallySaving) || 1000,
            playtime: yearsToPlay * 12,
            seed,
        })

        const stocksAtTheBeginning = []
        Object.keys(seed.stocks || {}).forEach((stockName) => {
            if (database.isSooner(seed.stocks[stockName], `${startYear}-${startMonth}`)) {
                stocksAtTheBeginning.push(stockName)
            } else {
                format({
                    protocol: "SQL",
                    message: `Stock ${stockName} is not available till ${seed.stocks[stockName]}. Current year: ${startYear}-${startMonth.toString().padStart(2, "0")}.`,
                })
            }
        })

        sendRequestToPlayers(Room, {
            type: "room",
            subtype: "start",
            data: {
                semianuallySaving: Number(semianuallySaving) || 1000,
                playtime: yearsToPlay * 12,
                commodity: Object.keys(seed.commodity || {}),
                indexfund: Object.keys(seed.indexfund || {}),
                stocks: stocksAtTheBeginning,
            },
        }, undefined, Room.Host)

        format({
            protocol: "WS",
            message: `Room ${Room.Code} was initialized! ${JSON.stringify(Room.Seed, null, "\t")}`,
        })
    },
}
