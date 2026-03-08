import { WebSocketController } from "./modules/websocket.js"
const controller = new WebSocketController()

let localGameData = {
    "year": 0,
    "inGame": false,
    "invertory": {
        // Client's side
    }
}
let chartsList

import * as translationManager from "./modules/translationsManager.js"
let selectedLanguage = translationManager.defaultLanguage

import * as roomModules from "./modules/roomModules.js"
import * as gameModules from "./modules/gameModules.js"
import { showRoomMenu } from "./modules/menusManager.js"

// Set up buttons to fire specific functions
Array.from(document.getElementsByClassName("returnButton")).forEach(element => element.onclick = () => roomModules.leaveRoom(controller))
document.getElementById("start_game").onclick = () => roomModules.start(controller);
document.getElementById("join_room_button").onclick = () => roomModules.prepareForJoin(controller);
document.getElementById("host_room_button").onclick = () => roomModules.requestRoomCreation(controller);
document.getElementById("join_room").onclick = () => roomModules.joinRoom(controller);

// Event catchers
controller.on("room-create", (data) => roomModules.showCreatedRoom(data.roomCode));
controller.on("room-join", (data) => {
    showRoomMenu()
    if ("list_of_players" in data) roomModules.showPlayersInRoom(data.list_of_players)
    else roomModules.addPlayerToPlayerList(data.username, data.userId, controller.isHost)
})
controller.on("room-leave", (data) => roomModules.clientLeft(data.userId))
controller.on("room-kick", () => roomModules.kickedFromRoom(localGameData.inGame))
controller.on("room-start", (data) => chartsList = roomModules.initialize(data, selectedLanguage, controller.isHost))
controller.on("game-tick", (data) => gameModules.tick(data.values, chartsList, selectedLanguage, localGameData))