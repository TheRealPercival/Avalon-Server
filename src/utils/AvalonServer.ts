import os from "os"
import { DefaultEventsMap, ExtendedError, RemoteSocket, Server, Socket } from "socket.io";
import packageJSON from "../../package.json"
import ServerInfo from "../types/ServerInfo";
import ServerEvent from "../types/ServerEvent";
import Environment from "./Environment";
import AvalonUser from "./AvalonUser";
import ClientEvent from "../types/ClientEvent";
import SessionInfo from "../types/SessionInfo";

class WebSocketServer extends Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    AvalonUser | null
> { }

export default class AvalonServer {
    static sessionName: string = "session"

    readonly server: WebSocketServer;
    private info: ServerInfo;
    private users: { [id: string]: AvalonUser }

    constructor() {
        this.info = {
            version: packageJSON.version,
            supabaseURL: Environment.getSupabaseURL(),
            supabaseAnonKey: Environment.getSupabaseAnonKey()
        }

        this.users = {}
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

    private createServer = (): WebSocketServer => {
        const port = Environment.getPort()
        const server = new WebSocketServer(port)

        const address = AvalonServer.getServerIPAddress()
        const fullServerAddress = `http://${address}:${port}`

        console.log(`${new Date().toISOString()}\nAvalon server started at ${fullServerAddress}\n`)

        server.use(AvalonServer.authenticateSocket)
        server.on("connect", this.onConnect)

        return server
    }

    private static authenticateSocket = async (
        socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, AvalonUser | null>,
        next: (err?: ExtendedError) => void
    ) => {
        socket.data = await AvalonUser.create(socket)
        next()
    }

    private onConnect = (socket: Socket) => {
        const user = socket.data

        if (user) {
            this.onAuthConnect(user)
        } else {
            this.onAnonymousConnect(socket)
        }
    }

    private onAnonymousConnect = (socket: Socket) => {
        console.log(`${new Date().toISOString()}\n+ Anonymous socket connected\n  └ ${socket.id}\n`)
        socket.on("disconnect", () => this.onAnonymousDisconnect(socket))

        socket.emit(ServerEvent.info, this.info)
    }

    private onAnonymousDisconnect = (socket: Socket) => {
        console.log(`${new Date().toISOString()}\n- Anonymous socket disconnected\n  └ ${socket.id}\n`)
    }

    private onAuthConnect = (user: AvalonUser) => {
        console.log(`${new Date().toISOString()}\n+ User @${user.getUsername()} connected\n  └ ${user.socket.id}\n`)
        user.socket.on("disconnect", () => this.onAuthDisconnect(user))

        user.socket.on(ClientEvent.getSessionInfo, (args) => this.onGetSessionInfo(user, args))
        user.socket.on(ClientEvent.joinSession, user.joinSession)
        user.socket.on(ClientEvent.leaveSession, user.leaveSession)

        this.users[user.getId()] = user
    }

    private onAuthDisconnect = (user: AvalonUser) => {
        console.log(`${new Date().toISOString()}\n- User @${user.getUsername()} disconnected\n  └ ${user.socket.id}\n`)

        user.leaveSession()
        delete this.users[user.getId()]
    }

    private onGetSessionInfo = (user: AvalonUser, emitAck: (data: SessionInfo) => void) => {
        console.log(`${new Date().toISOString()}\n? User @${user.getUsername()} requested session info\n  └ ${user.socket.id}\n`)

        const userPayloads = Object.values(this.users)
            .filter(u => u.getIsInSession())
            .map(u => u.getUserPayload())

        const sessionInfo: SessionInfo = {
            inSession: user.getIsInSession(),
            users: userPayloads
        }

        emitAck(sessionInfo)
    }
}
