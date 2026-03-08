const { sendRequestToPlayers } = require("../websocket_modules/roomManager.js")
const { format } = require("../formatter.js")

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
    initializeGame: async function (database, Room, playtime, semianuallySaving) {
        // Select random start year and month from the interval
        const startYear = randomIntFromInterval(1998, 2026 - playtime)
        const startMonth = 1

        // Randomly select which elements will be used in the game
        const dictionary = await database.getColumnsOfAllTables()
        const seed = {}
        for (const key of Object.keys(dictionary)) {
            if (key === "fixed_deposit" || key === "gameData") continue

            const listOfNames = dictionary[key]
            const options = JSON.parse(process.env[`GAME_${key.toUpperCase()}`] || `{"max":1, "min":1}`)

            if (!(key in seed)) seed[key] = {}

            const count = randomIntFromInterval(options.max, options.min)
            while (Object.keys(seed[key]).length < count) {
                const randomName = listOfNames[Math.floor(Math.random() * listOfNames.length)] // Returns name of item from table
                if (randomName in seed[key]) {
                    continue
                } // If the name is already in table, then skip
                seed[key][randomName] = await database.getFirstDate(key, randomName)
            }
        }

        // Set seed of the game
        Room.setSeed({
            "startYear": startYear,
            "startMonth": startMonth,
            "semiAnnuallySaving": semianuallySaving,
            "playtime": playtime*12,
            "seed": seed
        })

        // Send to players how many stocks will be at beginning of the game
        stocksAtTheBeginning = []
        Object.keys(seed.stocks).forEach(stock => {
            if (database.isSooner(seed.stocks[stock], `${startYear}-${startMonth}`)) {
                stocksAtTheBeginning.push(stock)
            } else {
                format({
                    "protocol": "SQL",
                    "message": `Stock ${stock.name} is not available till ${stock.firstDate}. Current year: ${startYear}-${(startMonth).toString().padStart(2, 0)}.`,
                })
            }
        });

        // Send to players and to host the game has started, so they can initialize for first update
        sendRequestToPlayers(Room, {
            "type": "room",
            "subtype": "start",
            "data": {
                "semianuallySaving": semianuallySaving,
                "playtime": playtime*12,
                "commodity": Object.keys(seed.commodity),
                "indexfund": Object.keys(seed.indexfund),
                "stocks": stocksAtTheBeginning
            }
        }, undefined, Room.Host)

        format({
            "protocol": "WS",
            "message": `Room ${Room.Code} was initialized! ${JSON.stringify(Room.Seed, "null", "\t")}`,
        })
    }
}