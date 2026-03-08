export class WebSocketController {
    constructor() {
        this.websocket = null
        this.host = false
        this.EventEmitterEvents = {}
    }

    on(eventName, listener) {
        const listeners = this.EventEmitterEvents[eventName] || (this.EventEmitterEvents[eventName] = [])
        listeners.push(listener)
    }

    emit(name, ...params) {
        const listeners = this.EventEmitterEvents[name] || []
        listeners.forEach((listener) => listener(...params))
    }

    setHost(bool) {
        this.host = bool
    }

    get isHost() {
        return this.host
    }

    establishConnection(protocol, address, port) {
        if (!protocol || !address || !port || isNaN(port)) {
            throw new Error(`To establish websocket connection, protocol '${protocol}', address '${address}' and port '${port}' are required!`)
        }

        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            return
        }

        const websocket = new WebSocket(`${protocol}://${address}:${port}`)
        this.websocket = websocket

        websocket.addEventListener("open", () => console.info("Connection was established."))
        websocket.addEventListener("message", (message) => this.onMessage(message))
    }

    async waitForConnection() {
        return new Promise((resolve, reject) => {
            const maxNumberOfAttempts = 20
            const intervalTime = 100
            let currentAttempt = 0

            const interval = setInterval(() => {
                if (currentAttempt > maxNumberOfAttempts - 1) {
                    clearInterval(interval)
                    reject(new Error("Maximum number of attempts exceeded"))
                } else if (this.websocket && this.websocket.readyState === this.websocket.OPEN) {
                    clearInterval(interval)
                    resolve()
                }
                currentAttempt++
            }, intervalTime)
        })
    }

    onMessage(message) {
        const request = JSON.parse(message.data)
        this.emit(`${request.type}-${request.subtype}`, request.data)
    }

    sendRequest(request) {
        try {
            if (!this.websocket || this.websocket.readyState === 0) {
                throw new Error("Trying to send request without being connected!")
            }
            if (!request.type || !request.subtype) {
                throw new Error("Unknown request type!")
            }

            this.websocket.send(JSON.stringify(request))
        } catch (error) {
            console.error("Failed to send a request!", error)
        }
    }
}
