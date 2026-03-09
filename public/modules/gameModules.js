const yearLabel = document.getElementById("year")
const monthProgressBar = document.getElementById("month")
const inflationLabel = document.getElementById("inflation")
const net_worth = document.getElementById("net_worth")
const goverment_bonds = document.getElementById("goverment_bonds")
const closing_timer = goverment_bonds.getElementsByClassName("closing")
import { createChart } from "./roomModules.js"

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
            const value = values[Table][Key]

            if (!chart) {
                throw new Error(`Unable to find chart ${name}`)
            }
            if (!(name in PastDataObject)) PastDataObject[name] = []

            const lastValue = PastDataObject[name].at(-1) || 1
            PastDataObject[name].push(value);
            if (PastDataObject[name].length > 12) PastDataObject[name].shift();

            chart.data.datasets[0].data = PastDataObject[name];
            chart.data.labels = [...Array(name in PastDataObject && PastDataObject[name].length || 0).keys()];
            chart.update();

            const Div = document.getElementById(name);
            Array.from(Div.getElementsByClassName("name")).forEach(element => element.textContent = `${Key}`);
            Array.from(Div.getElementsByClassName("price")).forEach(element => element.textContent = `${value}€`);
            Array.from(Div.getElementsByClassName("change")).forEach(element => element.textContent = `${Math.round((value / lastValue) * 100) - 100}%`);
        }
    }

    if (!values["others"]["inflation"]) throw new Error(`Inflation rate doesn't exist!`)
    inflationLabel.textContent = language.inGame.inflation.replace("{inflation}", values["others"]["inflation"])
    document.getElementById("saving_account").getElementsByClassName("interest")[0].textContent = language.inGame.saving_account.interest.replace("{interest}", values["others"]["saving_account"])

    if (monthProgressBar.value + 1 > 12) {
        localGameData.year++
        monthProgressBar.value = 1
        yearLabel.innerHTML = language.inGame.year.replace("{currentYear}", localGameData.year).replace("{endYear}", "20")
    } else {
        monthProgressBar.value++
    }

    net_worth.textContent = language.inGame.netWorth.replace("{net_worth}", 0)
}

export function event(name, description, options) {
    // random in-game events
}

export function respond(data) {
    // When player sends request to buy something and server responds
}