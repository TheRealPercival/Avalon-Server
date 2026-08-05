import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(__dirname, "..", "..", ".env.local"),
  quiet: true,
});

export default class Environment {
  static getSupabaseURL = (): string => {
    const supabaseURL = process.env.SUPABASE_URL;

    if (!supabaseURL) {
      throw "SUPABASE_URL not set!";
    }

    return supabaseURL;
  };

  static getSupabaseAnonKey = (): string => {
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseAnonKey) {
      throw "SUPABASE_ANON_KEY not set!";
    }

    return supabaseAnonKey;
  };

  static getPort = (): number => {
    const defaultPort = 8000
    const portString = process.env.PORT;
    if (!portString) return defaultPort

    const port = parseInt(portString)
    if (Number.isNaN(port)) return defaultPort

    return port
  }
}
