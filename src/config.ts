import { ColorResolvable } from "discord.js";

// Configure your bot here.
export const config: BotConfig = {
    botName: "Jambo",
    iconURL: "https://raw.githubusercontent.com/Cowoding-Jams/Jambo/main/images/Robot-lowres.png",
    githubURL: "https://github.com/Cowoding-Jams/Jambo",
    color: "#F0A5AC",
    logLevel: "debug",
};

interface BotConfig {
    // Name of the bot.
    botName: string;
    // URL to a png or jpg of the logo of the bot.
    iconURL: string;
    // URL to the github repository of the bot. Please share your code!
    githubURL: string;
    // The main color the bot will use.
    color: ColorResolvable;
    // Also available: error, warn, info, http, verbose, debug, silly.
    logLevel: "debug" | "info" | "warn" | "error" | "verbose"; 
}

