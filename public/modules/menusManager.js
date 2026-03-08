// Default variables
const main_menu = document.getElementById("main_menu")
const room_menu = document.getElementById("room_menu")
const join_menu = document.getElementById("join_menu")

// Collections of divs
const roomDiv = document.getElementById("room") // Before starting game
const gameDiv = document.getElementById("in-game") // After starting game, only for players
const analyticsForHost = document.getElementById("analyticsForHost") // After starting game, only for the host
// const endDiv = document.getElementById("end-menu") //uhh, not implemented yet...

export function showMainMenu() {
    gameDiv.hidden = true

    main_menu.hidden = false
    room_menu.hidden = true
    join_menu.hidden = true

    roomDiv.hidden = false
}

export function showJoinMenu() {
    main_menu.hidden = true;
    room_menu.hidden = true;
    join_menu.hidden = false;
}

export function showRoomMenu() {
    main_menu.hidden = true
    room_menu.hidden = false
    join_menu.hidden = true
}

export function showGame(isHost = false) {
    roomDiv.hidden = true
    if (isHost) analyticsForHost.hidden = false
    else gameDiv.hidden = false
}

/*export function showEndGame() {
    // not implemented yet
}*/