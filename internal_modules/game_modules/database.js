const mysql = require("mysql2/promise")
const { format } = require("../formatter.js")

module.exports.DatabaseObject = class {
    constructor(user, password) {
        this.pool = null
        this.user = user
        this.password = password
    }

    connect() {
        try {
            const pool = mysql.createPool({
                host: 'localhost',
                user: this.user,
                password: this.password,
                database: 'Financieri',
                waitForConnections: true,
                queueLimit: 0
            });

            this.pool = pool
            return true
        } catch (error) {
            format({
                "sender": "SERVER",
                "protocol": "SQL",
                "errorCode": "500",
                "message": "Error while trying to connect to the database!",
                "error": error
            })

            return false
        }
    }

    async request(SQLrequest) {
        if (!this.pool) { throw new Error(`You are not connected!`) }

        try {
            const [result, fields] = await this.pool.query(SQLrequest)
                .then((result, fields) => {
                    return [result, fields]
                }).catch((error) => {
                    throw error
                });
            
            return [result, fields]
        } catch (error) {
            format({
                "sender": "SERVER",
                "protocol": "SQL",
                "errorCode": "500",
                "message": "Error while trying to query to database!",
                "error": error
            })
        }
        return[null, null]
    }

    async getValues(date, table, keys) {
        if (!date || typeof date !== "string" || date.length !== 7) {
            throw new Error(`Unable to recieve data, date is bad.`)
        }
        if (!table || typeof table !== "string") {
            throw new Error(`Undefined table variable!`)
        }
        if (!keys || !Array.isArray(keys)) {
            throw new Error(`Undefined keys variable!`)
        }

        let queryColoums = keys[0]
        keys.shift()
        keys.forEach((key) => {
            queryColoums = `${queryColoums}, ${key}`
        })

        let [result, _] = await this.request(`SELECT ${queryColoums} FROM ${table} WHERE gameDate = '${date}';`)

        return result
    }

    async getColumns(table) {
        if (!table || typeof table !== "string") {
            throw new Error(`Undefined table variable!`)
        }
        const [result, _] = await this.request(`DESCRIBE ${table};`)
        
        let columns = []
        result[0].forEach((column) => {
            columns.push(column.Field)
        })
        return columns
    }

    async getTables() {
        const [result, _] = await this.request(`SHOW TABLES;`)

        let tables = []
        result[0].forEach((field) => {
            tables.push(field["Tables_in_Financieri"])
        })

        return tables
    }
    
    async getColumnsOfAllTables() {
        let dictionary = {}
        const tablesInDatabase = await this.getTables()

        for (const table of tablesInDatabase) {
            const columns = (await this.getColumns(table)).filter((name) => name !== "gameDate")

            dictionary[table] = columns
        }

        return dictionary
    }
    
    async getFirstDate(table, name) {
        const [result, _] = await this.request(`SELECT gameDate, ${name} FROM ${table}`)

        const newResult = {}
        result[0].forEach((propeties) => {
            const key = Object.keys(propeties).filter(name => name !== "gameDate")[0]

            newResult[propeties.gameDate] = propeties[key]
        })

        let firstApperance = {
            "year" : 789456,
            "month": 13
        }
        Object.keys(newResult).forEach((key) => {
            const split = key.split("-")
            const year = Number(split[0])
            const month = Number(split[1])

            if (newResult[`${year}-${month}`]) {
                if (year < firstApperance.year) {
                firstApperance.year = year
                firstApperance.month = month
            } else if (year === firstApperance.year && month < firstApperance.month) {
                firstApperance.month = month
            } 
            }
        })

        return `${firstApperance.year}-${firstApperance.month}`
    }

    isSooner(date1, date2) {
        if (!date1 || !date2) {
            throw new Error(`Undefined dates! ${date1} ${date2}`)
        }

        const split1 = date1.split("-")
        const year1 = Number(split1[0])
        const month1 = Number(split1[1])
        const split2 = date2.split("-")
        const year2 = Number(split2[0])
        const month2 = Number(split2[1])

        if (year1 < year2) return true
        if (year1 === year2 && month1 < month2) return true
        return false
    }
}