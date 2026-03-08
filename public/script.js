import { WebSocketController } from "./modules/websocket.js"
import * as translationManager from "./modules/translationsManager.js"
import * as roomModules from "./modules/roomModules.js"
import * as gameModules from "./modules/gameModules.js"
import { showRoomMenu } from "./modules/menusManager.js"

const controller = new WebSocketController()

const localGameData = {
    year: 0,
    inGame: false,
    semiAnnualContribution: 0,
    playtimeMonths: 0,
    netWorth: 0,
    inventory: {},
}

let chartsList
const selectedLanguage = translationManager.defaultLanguage

Array.from(document.getElementsByClassName("returnButton")).forEach((element) => {
    element.onclick = () => roomModules.leaveRoom(controller)
})

document.getElementById("start_game").onclick = () => roomModules.start(controller)
document.getElementById("join_room_button").onclick = () => roomModules.prepareForJoin(controller)
document.getElementById("host_room_button").onclick = () => roomModules.requestRoomCreation(controller)
document.getElementById("join_room").onclick = () => roomModules.joinRoom(controller)

controller.on("room-create", (data) => roomModules.showCreatedRoom(data.roomCode))
controller.on("room-join", (data) => {
    showRoomMenu()
    if ("list_of_players" in data) roomModules.showPlayersInRoom(data.list_of_players)
    else roomModules.addPlayerToPlayerList(data.username, data.userId, controller, controller.isHost)
})
controller.on("room-leave", (data) => roomModules.clientLeft(data.userId))
controller.on("room-kick", () => roomModules.kickedFromRoom(localGameData.inGame))
controller.on("room-start", (data) => {
    localGameData.inGame = true
    localGameData.year = 0
    localGameData.semiAnnualContribution = data.semianuallySaving
    localGameData.playtimeMonths = data.playtime
    chartsList = roomModules.initialize(data, selectedLanguage, controller.isHost)
})
controller.on("game-tick", (data) => gameModules.tick(data.values, chartsList, selectedLanguage, localGameData))
