export class WebSocketController {
    constructor() {
        this.websocket = null
        this.host = false
        this.EventEmitterEvents = {}
    }

    // Event emitter for onMessageHandling
    // eventName = `${request.data.type}-${request.data.subtype}`
    on(eventName, listener) {
        const listeners = this.EventEmitterEvents.hasOwnProperty(eventName) ? this.EventEmitterEvents[eventName] : (this.EventEmitterEvents[eventName] = [])
        listeners.push(listener)
    }

    emit(name, ...params) {
        const listeners = this.EventEmitterEvents[name] || []
        listeners.forEach((listener) => {
            console.log("Captured emit!")
            listener(...params)
        })
    }

    setHost(bool) {
        this.host = bool
    }

    get isHost() {
        return this.host
    }

    establishConnection(protocol, address, port) {
        if (
            (!protocol || (
                protocol !== "wss"
                &&
                protocol !== "ws"
            )) || !address || (
                !port || isNaN(port)
            )
        ) {
            throw new Error(
                `To establish websocket connection, the function needs protocol '${protocol}', address '${address}' and port '${port}'!`
            )
        }

        // Connect to websocket server
        const websocket = new WebSocket(`${protocol}://${address}:${port}`)
        this.websocket = websocket

        // Alert
        websocket.addEventListener("open", () => alert("Connection was established!"))

        // Handler for responces and requests
        websocket.addEventListener("message", (message) => this.onMessage(message))

        this.waitForConnection()
    }

    async waitForConnection() {
        return new Promise((resolve, reject) => {
            const maxNumberOfAttempts = 10
            const intervalTime = 100 //in miliseconds

            let currentAttempt = 0

            const interval = setInterval(() => {
                if (currentAttempt > maxNumberOfAttempts - 1) {
                    clearInterval(interval)
                    reject(new Error('Maximum number of attempts exceeded'))
                } else if (this && this.websocket && this.websocket.readyState === this.websocket.OPEN) {
                    clearInterval(interval)
                    resolve()
                }
                currentAttempt++
            }, intervalTime)
        })
    }

    // everytime a client has recieved a request from server, this function fires
    onMessage(message) {
        const request = JSON.parse(message.data);
        console.log("RECIEVED : " + JSON.stringify(request, "null", "\t"))

        console.log("EMITTING: " + `${request.type}-${request.subtype}`)
        this.emit(
            `${request.type}-${request.subtype}`, // room-create
            request.data // Sends just the data of the request.
        )
    }

    // Send requests to server
    sendRequest(request) {
        try {
            if (!this.websocket || this.websocket.readyState === 0) {
                throw new Error(`Trying to sent request, without being connected!`)
            }

            if (!request.type || !request.subtype) {
                throw new Error(`Unknown type!`)
            }
            if (request.type !== "room" && request.type !== "game" && !request.data) {
                throw new Error(`Data of request aren't defined!`)
            }

            console.log(`SENDING : ${JSON.stringify(request)}`)
            this.websocket.send(JSON.stringify(request))
        } catch (error) {
            console.error("Failed to sent a request!", error)
        }
    }
}