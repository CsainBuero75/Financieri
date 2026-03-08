// List of variables, which are needed
import { showGame, showMainMenu, showRoomMenu, showJoinMenu } from "./menusManager.js";
const roomCodeLabel = document.getElementById("room_code");
const hostRoomMenu = document.getElementById("host_room_menu");
const playerRoomMenu = document.getElementById("player_room_menu");
const playerList = document.getElementById("playerlist");
const roomCodeInputField = document.getElementById("join_code");
const usernameInputField = document.getElementById("join_username");
const yearLabel = document.getElementById("year");
const monthProgressBar = document.getElementById("month");

function getRadioButtonsValueByClassName(ClassName) {
    // Gets elements by thier class name and returns value of first element, which is checked
    var elements = document.getElementsByName(ClassName);

    for (let i = 0; i < elements.length; i++) {
        if (elements[i].checked)
            return elements[i].value;
    }
    return null
};
function establishWebsocketSecuredConnection(controller) {
    if (!controller) throw new Error(`Controller was not defined!`)
    if (controller.websocket) return; // Do not try to connect when already connected

    // Use window's location to get ip and port
    const split = window.location.href.split(":");
    const ip = split[1].replaceAll("/", "");
    const port = split[2].replaceAll("/", "");

    console.log(`Upgrading connection to websocket secure! Adress: wss://${ip}:${port}`)
    controller.establishConnection("wss", ip, port);
};
export function createChart(canvas, key) {
    return new Chart(canvas, {
            type: "line",
            data: {
                labels: [0],
                datasets: [{
                    label: key,
                    data: [],
                    fill: false,
                    borderColor: 'blue',
                    pointStyle: 'none',
                    pointRadius: 0, // Set radius to 0 to hide points
                }]
            },
            responsive: true,
            options: {
                scales: {
                    y: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                    x: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                },
                plugins: {
                    datalabels: {
                        display: false
                    },
                    legend: {
                        display: false
                    }
                }
            }
        })
}

// S>C | Room creation was successful, the host got roomCode
export function showCreatedRoom(roomCode) {
    if (!roomCode) throw new Error(`Room code was not defined!`)

    showRoomMenu()
    roomCodeLabel.textContent = roomCodeLabel.textContent.replace("{room_code}", roomCode);
    hostRoomMenu.hidden = false
    playerRoomMenu.hidden = true
};
// C>S | Request server to create a room
export async function requestRoomCreation(controller) {
    if (!controller) throw new Error(`Controller was not defined!`)

    establishWebsocketSecuredConnection(controller)
    await controller.waitForConnection()
    if (!controller.websocket) return

    controller.sendRequest({
        "type": "room",
        "subtype": "create"
    })
    controller.setHost(true)
};

// S>C | Joining into room
export function showPlayersInRoom(list_of_players) {
    if (!list_of_players) throw new Error(`List of players is not defined!`)
    showRoomMenu()

    // Clear innerHTML of playerlist and put players there.
    playerList.innerHTML = ""
    for (const [userId, username] of Object.entries(list_of_players)) { // [userId : username]
        const newElement = document.createElement("p")
        newElement.innerHTML = `<strong>${username}</strong>`
        newElement.id = userId

        playerList.appendChild(newElement)
    }
};
// S>C | When new player joins, add them to player list
export function addPlayerToPlayerList(username, userId, isHost = false) {
    if (!username) throw new Error(`Username of new player is not defined!`)
    if (!userId) throw new Error(`UserId of new player is not defined!`)

    const newElement = document.createElement("p")
    newElement.innerHTML = `<strong>${username}</strong>`
    newElement.id = userId

    playerList.appendChild(newElement)

    // Ability to kick players from the room, works only for hosts
    if (!isHost) {
        newElement.onclick = function () {
            controller.sendRequest({
                "type": "room",
                "subtype": "kick",
                "data": {
                    "userId": userId
                }
            })
        }
    }
};
// C>S | Establish connection and show join menu when success
export async function prepareForJoin(controller) {
    if (!controller) throw new Error(`Controller was not defined!`)

    establishWebsocketSecuredConnection(controller);
    await controller.waitForConnection();
    if (!controller.websocket) return

    controller.setHost(false);
    showJoinMenu();
};
// - | Send server a request to join room
export function joinRoom(controller) {
    if (!controller) throw new Error(`Controller was not defined!`);
    if (!controller.websocket) return;

    controller.sendRequest({
        "type": "room",
        "subtype": "join",
        "data": {
            "roomCode": roomCodeInputField.value.padStart(7, "0"),
            "username": usernameInputField.value
        }
    });
    roomCodeLabel.textContent = roomCodeLabel.textContent.replace("{room_code}", roomCodeInputField.value.padStart(7, "0"));
    // Needs an update, due to rejoining or translations
};

// S>C | Server annouces to clients that a client has left
export function clientLeft(userId) {
    if (!userId) throw new Error(`UserId is not defined!`)
    document.getElementById(userId).remove()
};
// C>S | Annouce to server, that client is leaving
export function leaveRoom(controller) {
    if (!controller) throw new Error(`Controller was not defined!`)

    showMainMenu()
    controller.sendRequest({            // needs update, bc players presses join and closses the website, the server throws an error
        "type": "room",
        "subtype": "leave"
    })
    controller.setHost(false)
};

// S>C | Notify client, that they were kicked from the room
export function kickedFromRoom(inGame = false) {
    if (inGame) return

    alert(`The host has kicked you from the room!`)
    showMainMenu()
};

// S>C | Runs when server initializes the game and responds to request
export function initialize(data, language, isHost = false) {
    if (!data) throw new Error(`Data for initialization were not defined!`)
    if (!language) throw new Error(`Language is not defined!`)
    console.log(data)

    // List of canvases, where the charts will be drawn
    let canvas = {
        //"indexfund1": document.getElementById('indexfund1').getElementsByClassName("chart"),
    }
    // List of charts themselves
    let chartsList = {}

    // Dynamicly add every comodities's canvas into list
    for (let i = 1; i <= data["commodity"].length; i++) {
        canvas[`commodity${i}`] = document.getElementById(`commodity${i}`).getElementsByClassName("chart")[0];
    }
    for (let i = 1; i <= data["stocks"].length; i++) {
        canvas[`stocks${i}`] = document.getElementById(`stocks${i}`).getElementsByClassName("chart")[0];
    }
    for (let i = 1; i <= data["indexfund"].length; i++) {
        canvas[`indexfund${i}`] = document.getElementById(`indexfund${i}`).getElementsByClassName("chart")[0];
    } // NOTE: Website support only one index fund!

    // Hide stocks, which player does not need at the start
    for (let i = 1; i <= 6; i++) {
        if (`stocks${i}` in canvas) continue
        document.getElementById(`stocks${i}`).hidden = true
    }
    // Hide indexfund, which player does not need at the start
    for (let i = 1; i <= 1; i++) {
        if (`indexfund${i}` in canvas) continue
        document.getElementById(`indexfund${i}`).hidden = true
    }

    // For every canvas, create new object in chartsList, with key as id of an element
    for (const key of Object.keys(canvas)) chartsList[key] = createChart(canvas[key], key)

    monthProgressBar.value = 1
    yearLabel.innerHTML = language.inGame.year.replace("{currentYear}", 0).replace("{endYear}", "20")

    showGame(isHost)
    return chartsList
};
// C>S | Send request to server to start a game
export function start(controller) {
    if (!controller) throw new Error(`Controller was not defined!`)

    if (playerList.childElementCount == 0) {
        console.warn(`Unable to start the game! There aren't any players!`)
        return
    }

    controller.sendRequest({
        "type": "room",
        "subtype": "start",
        "data": {
            "playtime": getRadioButtonsValueByClassName("playtime"),
            "semianuallySaving": getRadioButtonsValueByClassName("money")
        }
    })
};