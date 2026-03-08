const { format } = require("../formatter.js")

// Validate the request and send it to the websocket
module.exports.sendRequest = function (
    websocket, // Websocket to send the request
    request,
    /*
    type
        room        Requests about creating, joining, leaving, kicking out, changing options of the game and lasty starting. Afterwards, it shall not be used. 
        game        Requests about buying, investing, saving, and other stuff in game. 

    subtype
        create      
            Client: -
            Server: roomcode
        join
            Client: roomcode, username
            Server -> joining Client: list_of_players [userId : username]
            Server -> Clients + Host: username, userId
        leave
            Client: -
            Server -> Clients + Host: userId
        kick
            Host: userId
            Server -> Client: -
        edit
            Host: time, money
            Server -> Clients: time, money
        start
            Host: -
            Server -> All Clients: semianuallySaving, playtime, commodity, index_fond, stocks

        tick
            Server -> All Clients:  

    data
        roomcode : string, indentifies rooms
        username : string, do not use to indentify players -> userId
        list_of_players : [userId: username]
        userId : string, indentifies websocket and by that clients

        time : number, game option, lenght of the game (1 year in game = 1 minute in real life). 60 - time => start time
        money : number, game option, semi-anualy earnings

        
    */
    dontLog
) {
    if (!websocket) {
        throw new Error("Websocket was not recieved!")
    }
    if (!request) {
        throw new Error("Request was not recieved!")
    }
    if (!request.type || !request.subtype) {
        throw new Error("Undefined request type!")
    }

    if (!dontLog) format({
        "protocol": "WS",
        "errorCode": "200",
        "message": `Sending '${request.type}-${request.subtype}' request to client.`,
        "websocket": websocket,
    })

    try {
        websocket.send(JSON.stringify(request))
    } catch (error) {
        format({
            "protocol": "WS",
            "errorCode": "500",
            "message": `Error, while trying to send a '${request.type}-${request.subtype}' request to client!`,
            "websocket": websocket,
            "error": error
        })
    }
}