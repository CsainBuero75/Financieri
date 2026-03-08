const yearLabel = document.getElementById("year")
const monthProgressBar = document.getElementById("month")
const inflationLabel = document.getElementById("inflation")
const savingInterestLabel = document.getElementById("saving_account").getElementsByClassName("interest")[0]
const netWorthLabel = document.getElementById("net_worth")
const gameStatusLabel = document.getElementById("game_status")

import { createChart } from "./roomModules.js"

const pastDataObject = {}

function getPortfolioValue(values) {
    let total = 0
    for (const table of Object.keys(values)) {
        if (table === "others" || table === "fixed_deposit") continue
        for (const key of Object.keys(values[table])) {
            const value = Number(values[table][key])
            if (!Number.isNaN(value)) total += value
        }
    }
    return Math.round(total)
}

export function tick(values, chartsList, language, localGameData) {
    if (!values) throw new Error("Data of values is not defined!")
    if (!chartsList) throw new Error("List of charts is not defined!")
    if (!language) throw new Error("Language is not defined!")

    for (const table of Object.keys(values)) {
        for (const key of Object.keys(values[table])) {
            if (table === "others" || table === "fixed_deposit") continue

            const name = `${table}${Object.keys(values[table]).indexOf(key) + 1}`
            const chart = (name in chartsList)
                ? chartsList[name]
                : createChart(document.getElementById(name).getElementsByClassName("chart")[0], name)

            if (!(name in pastDataObject)) pastDataObject[name] = []
            pastDataObject[name].push(values[table][key])
            if (pastDataObject[name].length > 12) {
                pastDataObject[name].shift()
            }

            chart.data.datasets[0].data = pastDataObject[name]
            chart.data.labels = [...Array(pastDataObject[name].length).keys()]
            chart.update()

            const div = document.getElementById(name)
            Array.from(div.getElementsByClassName("name")).forEach((element) => {
                element.textContent = `${key}`
            })
            Array.from(div.getElementsByClassName("price")).forEach((element) => {
                element.textContent = `${values[table][key]}€`
            })
        }
    }

    const inflation = values.others?.inflation ?? "-"
    const savingInterest = values.others?.saving_account ?? "-"

    inflationLabel.textContent = language.inGame.inflation.replace("{inflation}", inflation)
    savingInterestLabel.textContent = language.inGame.saving_account.interest.replace("{interest}", savingInterest)

    const marketValue = getPortfolioValue(values)
    localGameData.netWorth = marketValue
    netWorthLabel.textContent = `Čistá hodnota trhu: ${marketValue.toLocaleString("sk-SK")}€`

    if (monthProgressBar.value + 1 > 12) {
        localGameData.year++
        monthProgressBar.value = 1
    } else {
        monthProgressBar.value++
    }

    const totalYears = Math.max(1, Math.round((localGameData.playtimeMonths || 240) / 12))
    yearLabel.innerHTML = language.inGame.year
        .replace("{currentYear}", localGameData.year)
        .replace("{endYear}", totalYears)

    if (gameStatusLabel) {
        const monthsLeft = Math.max(0, (localGameData.playtimeMonths || 0) - (localGameData.year * 12 + Number(monthProgressBar.value)))
        gameStatusLabel.textContent = `Zostáva ${monthsLeft} mesiacov • Inflácia ${inflation}% • Úrok sporenia ${savingInterest}%`
    }
}

export function event() {
    // Placeholder for random in-game events.
}
