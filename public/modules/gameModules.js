const yearLabel = document.getElementById("year")
const monthProgressBar = document.getElementById("month")
const inflationLabel = document.getElementById("inflation")
import {createChart} from "./roomModules.js"

let PastDataObject = {}

export function tick(values, chartsList, language, localGameData) {
    if (!values) throw new Error(`Data of values is not defined!`)
    if (!chartsList) throw new Error(`List of charts is not defined!`)
    if (!language) throw new Error(`Language is not defined!`)

    for (const Table of Object.keys(values)) {
        for (const Key of Object.keys(values[Table])) {
            if (Table === "others" || Table === "fixed_deposit") continue
            const name = `${Table}${Object.keys(values[Table]).indexOf(Key) + 1}`
            const chart = name in chartsList && chartsList[name] || createChart(document.getElementById(name).getElementsByClassName("chart")[0], name)

            if (!chart) {
                console.log(name,chart)
                throw new Error(`Unable to find chart ${name}`)
            }

            if (!(name in PastDataObject)) PastDataObject[name] = []

            let highest = 0
            for (const i of Object.keys(PastDataObject[name])) {
                if (Number(i) > highest) highest = i
            }
            PastDataObject[name].push(values[Table][Key])
            if (PastDataObject[name].length > 12) {
                PastDataObject[name].shift()
            }

            chart.data.datasets[0].data = PastDataObject[name]
            chart.data.labels = [...Array(name in PastDataObject && PastDataObject[name].length || 0).keys()]
            chart.update()

            const Div = document.getElementById(name)
            Array.from(Div.getElementsByClassName("name")).forEach(element => element.textContent = `${Key}`)
            Array.from(Div.getElementsByClassName("price")).forEach(element => element.textContent = `${values[Table][Key]}€`)
        }
    }

    inflationLabel.textContent = language.inGame.inflation.replace("{inflation}", values["others"]["inflation"])
    document.getElementById("saving_account").getElementsByClassName("interest")[0].textContent = language.inGame.saving_account.interest.replace("{interest}", values["others"]["saving_account"])

    if (monthProgressBar.value + 1 > 12) {
        localGameData.year++
        monthProgressBar.value = 1
        yearLabel.innerHTML = language.inGame.year.replace("{currentYear}", localGameData.year).replace("{endYear}", "20")
    } else {
        monthProgressBar.value++
    }
}

export function event() {
    // random in-game events
}