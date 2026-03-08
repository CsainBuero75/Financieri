import { showGame, showMainMenu, showRoomMenu, showJoinMenu } from "./menusManager.js"

const roomCodeLabel = document.getElementById("room_code")
const hostRoomMenu = document.getElementById("host_room_menu")
const playerRoomMenu = document.getElementById("player_room_menu")
const playerList = document.getElementById("playerlist")
const roomCodeInputField = document.getElementById("join_code")
const usernameInputField = document.getElementById("join_username")
const yearLabel = document.getElementById("year")
const monthProgressBar = document.getElementById("month")
const gameStatusLabel = document.getElementById("game_status")

function getRadioButtonsValueByClassName(className) {
    const elements = document.getElementsByName(className)
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].checked) return elements[i].value
    }
    return null
}

function establishWebsocketSecuredConnection(controller) {
    if (!controller) throw new Error("Controller was not defined!")
    if (controller.websocket) return

    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    const ip = window.location.hostname
    const port = window.location.port

    console.log(`Upgrading connection to websocket secure! Address: ${protocol}://${ip}:${port}`)
    controller.establishConnection(protocol, ip, port)
}

export function createChart(canvas, key) {
    return new Chart(canvas, {
        type: "line",
        data: {
            labels: [0],
            datasets: [{
                label: key,
                data: [],
                fill: false,
                borderColor: "#4f46e5",
                pointStyle: "none",
                pointRadius: 0,
                tension: 0.25,
            }],
        },
        responsive: true,
        options: {
            scales: {
                y: { ticks: { display: false }, grid: { display: false } },
                x: { ticks: { display: false }, grid: { display: false } },
            },
            plugins: { datalabels: { display: false }, legend: { display: false } },
        },
    })
}

export function showCreatedRoom(roomCode) {
    if (!roomCode) throw new Error("Room code was not defined!")

    showRoomMenu()
    roomCodeLabel.textContent = `Kód: ${roomCode}`
    hostRoomMenu.hidden = false
    playerRoomMenu.hidden = true
}

export async function requestRoomCreation(controller) {
    if (!controller) throw new Error("Controller was not defined!")

    establishWebsocketSecuredConnection(controller)
    await controller.waitForConnection()
    if (!controller.websocket) return

    controller.sendRequest({ type: "room", subtype: "create" })
    controller.setHost(true)
}

export function showPlayersInRoom(listOfPlayers) {
    if (!listOfPlayers) throw new Error("List of players is not defined!")
    showRoomMenu()

    playerList.innerHTML = ""
    for (const [userId, username] of Object.entries(listOfPlayers)) {
        const newElement = document.createElement("p")
        newElement.innerHTML = `<strong>${username}</strong>`
        newElement.id = userId
        playerList.appendChild(newElement)
    }
}

export function addPlayerToPlayerList(username, userId, controller, isHost = false) {
    if (!username) throw new Error("Username of new player is not defined!")
    if (!userId) throw new Error("UserId of new player is not defined!")

    const newElement = document.createElement("p")
    newElement.innerHTML = `<strong>${username}</strong>`
    newElement.id = userId
    playerList.appendChild(newElement)

    if (isHost) {
        newElement.onclick = function () {
            controller.sendRequest({
                type: "room",
                subtype: "kick",
                data: { userId },
            })
        }
    }
}

export async function prepareForJoin(controller) {
    if (!controller) throw new Error("Controller was not defined!")

    establishWebsocketSecuredConnection(controller)
    await controller.waitForConnection()
    if (!controller.websocket) return

    controller.setHost(false)
    showJoinMenu()
}

export function joinRoom(controller) {
    if (!controller) throw new Error("Controller was not defined!")
    if (!controller.websocket) return

    const roomCode = roomCodeInputField.value.trim().padStart(7, "0")
    const username = usernameInputField.value.trim()
    if (username.length < 2) {
        alert("Meno musí mať aspoň 2 znaky.")
        return
    }

    controller.sendRequest({
        type: "room",
        subtype: "join",
        data: { roomCode, username },
    })
    roomCodeLabel.textContent = `Kód: ${roomCode}`
}

export function clientLeft(userId) {
    if (!userId) throw new Error("UserId is not defined!")
    const node = document.getElementById(userId)
    if (node) node.remove()
}

export function leaveRoom(controller) {
    if (!controller) throw new Error("Controller was not defined!")

    showMainMenu()
    controller.sendRequest({ type: "room", subtype: "leave" })
    controller.setHost(false)
}

export function kickedFromRoom(inGame = false) {
    if (inGame) return
    alert("Hostiteľ vás odstránil z miestnosti.")
    showMainMenu()
}

export function initialize(data, language, isHost = false) {
    if (!data) throw new Error("Data for initialization were not defined!")
    if (!language) throw new Error("Language is not defined!")

    const canvas = {}
    const chartsList = {}

    for (let i = 1; i <= data.commodity.length; i++) {
        canvas[`commodity${i}`] = document.getElementById(`commodity${i}`).getElementsByClassName("chart")[0]
    }
    for (let i = 1; i <= data.stocks.length; i++) {
        canvas[`stocks${i}`] = document.getElementById(`stocks${i}`).getElementsByClassName("chart")[0]
    }
    for (let i = 1; i <= data.indexfund.length; i++) {
        canvas[`indexfund${i}`] = document.getElementById(`indexfund${i}`).getElementsByClassName("chart")[0]
    }

    for (let i = 1; i <= 6; i++) {
        if (`stocks${i}` in canvas) continue
        document.getElementById(`stocks${i}`).hidden = true
    }
    for (let i = 1; i <= 1; i++) {
        if (`indexfund${i}` in canvas) continue
        document.getElementById(`indexfund${i}`).hidden = true
    }

    for (const key of Object.keys(canvas)) chartsList[key] = createChart(canvas[key], key)

    monthProgressBar.value = 1
    yearLabel.innerHTML = language.inGame.year.replace("{currentYear}", 0).replace("{endYear}", (data.playtime / 12).toString())
    if (gameStatusLabel) {
        gameStatusLabel.textContent = `Začiatok hry: kapitál ${data.semianuallySaving}€ / polrok`
    }

    showGame(isHost)
    return chartsList
}

export function start(controller) {
    if (!controller) throw new Error("Controller was not defined!")

    if (playerList.childElementCount === 0) {
        console.warn("Unable to start the game! There aren't any players!")
        return
    }

    controller.sendRequest({
        type: "room",
        subtype: "start",
        data: {
            playtime: getRadioButtonsValueByClassName("playtime"),
            semianuallySaving: getRadioButtonsValueByClassName("money"),
        },
    })
}
