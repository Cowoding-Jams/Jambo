import { ColorResolvable } from "discord.js";

// Configure your bot here.
export const config: BotConfig = {
	botName: "Jambo",
	iconURL: "https://raw.githubusercontent.com/Cowoding-Jams/Jambo/main/images/Robot-lowres.png",
	githubURL: "https://github.com/Cowoding-Jams/Jambo",
	color: "#F0A5AC",
	serverDescription: "We're a group of young and mostly queer people having a game jam/hackathon server together. We're a very friendly and welcoming community and are happy to have you join us! \nCheck out <#1022874504525008997> for more information!",
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
	// A description of the server that will be displayed in the welcome message.
	serverDescription: string;
	// Also available: error, warn, info, http, verbose, debug, silly.
	logLevel: "debug" | "info" | "warn" | "error" | "verbose";
}
