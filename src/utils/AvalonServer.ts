import { Server, Socket } from "socket.io";
import Stage from "../types/Stage"
import Settings from "./Settings"
import os from "os"
import packageJSON from "../../package.json"
import ServerInfo from "../types/ServerInfo";
import ServerEvent from "../types/ServerEvent";

export default class AvalonServer {
    private server: Server;
    private info: ServerInfo;
    private sockets: Set<Socket>

    private settings: Settings
    private stage: Stage

    constructor() {
        this.server = this.createServer()
        this.sockets = new Set()
        this.stage = Stage.setup
        this.settings = new Settings()

        this.info = {
            version: packageJSON.version,
            supabaseURL: "IMPORT_FROM_ENV",
            supabaseAnonKey: "IMPORT_FROM_ENV"
        }
    }

    private static getServerIPAddress = (): string => {
        const interfaces = os.networkInterfaces();
        for (const interfaceGroup of Object.values(interfaces)) {
            if (!interfaceGroup) continue
            for (const currentInterface of interfaceGroup) {
                if (currentInterface.family === "IPv4" && !currentInterface.internal) {
                    return currentInterface.address;
                }
            }
        }
        return "localhost";
    }

    private createServer = (): Server => {
        const port = 8000
        const server = new Server(port, {
            cors: {
                origin: "*"
            }
        })

        const address = AvalonServer.getServerIPAddress()
        const fullServerAddress = `${address}:${port}`

        console.log("Avalon server started at", fullServerAddress)

        server.on("connect", this.onConnect)
        return server
    }

    private onConnect = (socket: Socket) => {
        const staleSocket = this.sockets.values().find(s => {
            return s.handshake.address == socket.handshake.address && !s.connected
        })
        
        if (staleSocket) {
            this.sockets.delete(staleSocket)
            this.onReconnect(socket)
        } else {
            console.log(`New socket connected: ${socket.id}`)
        }

        this.sockets.add(socket)

        socket.on("disconnect", () => this.onDisconnect(socket))

        socket.emit(ServerEvent.info, this.info)
    }

    private onReconnect = (socket: Socket) => {
        console.log(`Socket reconnected: ${socket.id}`)
    }

    private onDisconnect = (socket: Socket) => {
        console.log(`Socket disconnected: ${socket.id}`)

        setTimeout(() => {
            if (this.sockets.has(socket)) {
                this.sockets.delete(socket)
                console.log(`Removed stale socket: ${socket.id}`)
            }
        }, 10000)
    }
}