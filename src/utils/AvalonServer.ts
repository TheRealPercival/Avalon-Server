import os from "os"
import { Server, Socket } from "socket.io";
import packageJSON from "../../package.json"
import ServerInfo from "../types/ServerInfo";
import ServerEvent from "../types/ServerEvent";
import Environment from "./Environment";
import AvalonUser from "./AvalonUser";

export default class AvalonServer {
    private server: Server;
    private info: ServerInfo;
    private users: Set<AvalonUser>

    constructor() {
        this.info = {
            version: packageJSON.version,
            supabaseURL: Environment.getSupabaseURL(),
            supabaseAnonKey: Environment.getSupabaseAnonKey()
        }

        this.users = new Set()
        this.server = this.createServer()
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
        const port = Environment.getPort()
        const server = new Server(port)

        const address = AvalonServer.getServerIPAddress()
        const fullServerAddress = `http://${address}:${port}`

        console.log("Avalon server started at", fullServerAddress)

        server.on("connect", this.onConnect)
        return server
    }

    private onConnect = async (socket: Socket) => {
        const user = await AvalonUser.create(socket, this.info)

        if(user) {
            this.onAuthConnect(user)
        } else {
            this.onAnonymousConnect(socket)
        }
    }

    private onAnonymousConnect = (socket: Socket) => {
        console.log(`+ Anonymous socket connected\n  └ ${socket.id}\n`)
        socket.on("disconnect", () => this.onAnonymousDisconnect(socket))

        socket.emit(ServerEvent.info, this.info)
    }

    private onAnonymousDisconnect = (socket: Socket) => {
        console.log(`- Anonymous socket disconnected\n  └ ${socket.id}\n`)
    }

    private onAuthConnect = (user: AvalonUser) => {
        console.log(`+ User "${user.getName()}" connected\n  └ ${user.socket.id}\n`)
        user.socket.on("disconnect", () => this.onAuthDisconnect(user))

        this.users.add(user)
    }

    private onAuthDisconnect = (user: AvalonUser) => {
        console.log(`- User "${user.getName()}" disconnected\n  └ ${user.socket.id}\n`)
        this.users.delete(user)
    }
}