module.exports.Room = class {
    constructor(code, websocket) {
        this.Code = code // Code of the room, which players can use to join the game
        this.Host = websocket // When creating a new room, you must define the host of the game
        this.Players = { // List of the players
            /* userId : websocket */
        }

        this.Seed = {
            // Since initialization startDate doesn't change
            "startDate": {
                "year": null,
                "month": null,
            },

            // Changes based on the tick function in game_modules
            "sas": undefined, // Semi Annually Savings 
            "playtime": undefined, // How many years untill end of the game
            "year": null, // Adds 1 everytime when month becomes 13 and resets month to 1
            "month": null, // Adds 1 every tick
            "seed": null,
        }

        this.Joinable = true
    }

    addPlayer(player) {
        this.Players[player.userId] = player
    }
    get getPlayersWebsockets() {
        let list = []
        Object.keys(this.Players).forEach((userId) => {
            list.push(this.Players[userId])
        })
        return list
    }
    getPlayer(userId) {
        return this.Players[userId]
    }
    removePlayer(player) {
        delete this.Players[player.userId]
    }

    // Initialize the room for the game
    setSeed(
        Table
        /*
        startYear: int
        startMonth: int

        semiAnnuallySaving: float
        playtime: int
        seed : {
            stocks: int
            index_fond: int
            commodity: int
        }
        */
    ) {
        if (!Table || !Table.startYear || !Table.startMonth || !Table.semiAnnuallySaving || !Table.playtime || !Table.seed) {
            throw new Error(`Some parametres of seed are not defined! ${JSON.stringify(Table)}`)
        }

        this.joinable = false

        this.Seed.startDate = {
            "year": Table.startYear,
            "month": Table.startMonth
        }

        this.Seed.semiAnnuallySaving = Table.semiAnnuallySaving
        this.Seed.playtime = Table.playtime
        this.Seed.seed = Table.seed
    }

    Update() { // Increments the date / Initializes the date and returns a new date
        if (!this.Seed.startDate.year) {
            throw Error(`Game was not initialized before it started!`)
        }

        if (!this.Seed.year) { // If it's the first tick, then set startDate as currentDate
            this.Seed.year = this.Seed.startDate.year
            this.Seed.month = this.Seed.startDate.month
        } else { // If not, then increment the date
            if (this.Seed.month === 12) {
                this.Seed.year += 1
                this.Seed.month = 1
            }

            this.Seed.month += 1
        }

        this.Seed.playtime-- // Decrement the playtime

        return [this.Seed.year, this.Seed.month]
    }
}