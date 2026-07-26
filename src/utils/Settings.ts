import SettingsModel from "../types/SettingsModel"

export default class Settings {
    private preset: string
    private roles: string[]
    private isTrapper: boolean
    private isLady: boolean
    private isFailReset: boolean

    constructor() {
        this.preset = "Classic"
        this.roles = ["Merlin", "Morgana", "Percival"]
        this.isTrapper = false
        this.isLady = false
        this.isFailReset = false
    }

    public getModel = (): SettingsModel => {
        return {
            preset: this.preset,
            roles: this.roles,
            isTrapper: this.isTrapper,
            isLady: this.isLady,
            isFailReset: this.isFailReset
        }
    }
}