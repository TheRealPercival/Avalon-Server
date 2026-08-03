import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { Socket } from "socket.io";
import Environment from "./Environment";
import ServerInfo from "../types/ServerInfo";

export default class AvalonUser {
    constructor(public socket: Socket, private userData: User, private supabaseClient: SupabaseClient) {}

    public static create = async (socket: Socket, serverInfo: ServerInfo): Promise<AvalonUser | null> => {
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

    public getName = (): string => {
        return this.getDiscordName() ?? "Unknown User"
    }

    private getDiscordName = (): string | null => {
        const metadata = this.userData.user_metadata

        const customClaims = metadata["custom_claims"]
        if(!customClaims || typeof customClaims !== "object") return null

        const discordName = customClaims["global_name"]
        if(!discordName || typeof discordName !== "string") return null

        return discordName
    }
}