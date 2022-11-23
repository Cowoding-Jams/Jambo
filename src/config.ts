import { ColorResolvable, ComponentEmojiResolvable, PermissionsBitField } from "discord.js";

// Configure your bot here.
export const config: BotConfig = {
	botName: "Jambo",
	iconURL: "https://raw.githubusercontent.com/Cowoding-Jams/Jambo/main/images/Robot-lowres.png",
	githubURL: "https://github.com/Cowoding-Jams/Jambo",
	pronounRoles: [
		["she/her", "541000113410015245"],
		["he/him", "590631286666952704"],
		["they/them", "590660390187302912"],
		["any pronouns", null],
		["no pronouns", null],
		["ask me (pronouns)", null],
	],
	colorRoles: [
		//https://www.schemecolor.com/strong-rainbow.php
		["Dark Slate Blue", "#4e3686"],
		["Carolina Blue", "#5da4d9"],
		["Pastel Green", "#80d87f"],
		["Corn", "#fbe960"],
		["Burnt Sienna", "#ee724c"],
		["Amaranth", "#e23349"],
		//https://www.schemecolor.com/unicorn-flowers.php
		["Pastel Violet", "#c49ac7"],
		["Metallic Pink", "#efa8c8"],
		["Flavescent", "#f4ea8f"],
		["Crayola Yellow-Green", "#b6e284"],
		["Medium Aquamarine", "#6cd9a9"],
		["Sea Serpent", "#5db9cf"],
	],
	timezoneRoles: [
		"UTC-12",
		"UTC-11",
		"UTC-10",
		"UTC-9",
		"UTC-8",
		"UTC-7",
		"UTC-6",
		"UTC-5",
		"UTC-4",
		"UTC-3",
		"UTC-2",
		"UTC-1",
		"UTC",
		"UTC+1",
		"UTC+2",
		"UTC+3",
		"UTC+4",
		"UTC+5",
		"UTC+6",
		"UTC+7",
		"UTC+8",
		"UTC+9",
		"UTC+10",
		"UTC+11",
		"UTC+12",
	],
	color: "#F0A5AC",
	serverDescription:
		"We're a group of young and mostly queer people having a game jam/hackathon server together. We're a very friendly and welcoming community and are happy to have you join us! \nCheck out <#1022874504525008997> for more information!",
	logLevel: "debug",
	logActivity: true,
	activityTrackerAdminCommandPermission: PermissionsBitField.Flags.Administrator,
	birthdayNotificationAt: 7,
};

interface BotConfig {
	/** Name of the bot. */
	botName: string;
	/** URL to a png or jpg of the logo of the bot. */
	iconURL: string;
	/** URL to the github repository of the bot. Please share your code! */
	githubURL: string;
	/** Pronoun roles to pick from. First argument is the name of the role, second argument is the emoji id. */
	pronounRoles: [string, ComponentEmojiResolvable | null][];
	/** Max 25 color roles to pick from. First argument is the name of the role, second argument is the color. */
	colorRoles: [string, ColorResolvable][];
	/** Timezones users can pick from. */
	timezoneRoles: string[];
	/** The main color the bot will use. */
	color: ColorResolvable;
	/** A description of the server that will be displayed in the welcome message. */
	serverDescription: string;
	/** Also available: error, warn, info, http, verbose, debug, silly. */
	logLevel: "debug" | "info" | "warn" | "error" | "verbose";
	/** If User Game Activity should get logged */
	logActivity: boolean;
	/** Which permissions are needed to use the game-activity-tracker admin commands */
	activityTrackerAdminCommandPermission: bigint;
	/** Can be any Integer between 0 and 23, or use already defined times With Time.x to define (timezone) relative time of when a Birthday message should get send */
	birthdayNotificationAt: number;
}
