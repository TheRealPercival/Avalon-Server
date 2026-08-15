import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { Socket } from "socket.io";
import Environment from "./Environment";
import AvalonServer from "./AvalonServer";

export default class AvalonUser {
    private isInSession: boolean = false

    constructor(public socket: Socket, private userData: User, private supabaseClient: SupabaseClient) { }

    public static create = async (socket: Socket): Promise<AvalonUser | null> => {
        const { access_token, refresh_token } = socket.handshake.auth;
        if (!access_token || !refresh_token) return null

        const supabaseClient = createClient(
            Environment.getSupabaseURL(),
            Environment.getSupabaseAnonKey()
        )

        const authResponse = await supabaseClient.auth.setSession({ access_token, refresh_token });
        if (authResponse.error || !authResponse.data.user) return null

        return new AvalonUser(socket, authResponse.data.user, supabaseClient)
    }

    public getId = (): string => this.userData.id

    public getUsername = (): string => this.getDiscordName() ?? "unknown"

    public joinSession = () => {
        if (this.isInSession) return

        console.log(`${new Date().toISOString()}\n+ User @${this.getUsername()} joined the session\n  └ ${this.socket.id}\n`)
        this.socket.join(AvalonServer.sessionName)
        this.isInSession = true
    }

    public leaveSession = () => {
        if (!this.isInSession) return

        console.log(`${new Date().toISOString()}\n+ User @${this.getUsername()} left the session\n  └ ${this.socket.id}\n`)
        this.socket.leave(AvalonServer.sessionName)
        this.isInSession = false
    }

    private getDiscordName = (): string | null => {
        const metadata = this.userData.user_metadata

        const discordName = metadata["full_name"]
        if (!discordName || typeof discordName !== "string") return null

        return discordName
    }
}
