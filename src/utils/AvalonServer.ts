import { Server, Socket } from "socket.io";
import Stage from "../types/Stage"
import Settings from "./Settings"

export default class AvalonServer {
    private server: Server;
    private settings: Settings
    private stage: Stage

    constructor() {
        this.server = this.createServer()
        this.stage = Stage.setup
        this.settings = new Settings()
    }

    private createServer = (): Server => {
        const port = 8000
        const server = new Server(port, {
            cors: {
                origin: "*"
            }
        })

        console.log("Avalon server created on port", port)

        server.on("connect", this.onConnect)
        return server
    }

    private onConnect = (socket: Socket) => {
        console.log(`New socket connected: ${socket.id}`)

        socket.on("disconnect", () => this.onDisconnect(socket))
        socket.emit("state", {
            stage: this.stage,
            settings: this.settings.getModel()
        })
    }

    private onDisconnect = (socket: Socket) => {
        console.log(`Socket disconnected: ${socket.id}`)
    }
}