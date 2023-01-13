import { ColorResolvable, ComponentEmojiResolvable } from "discord.js";

// Configure your bot here.
export const config: BotConfig = {
	// --- General ---
	botName: "Jambo",
	iconURL: "https://raw.githubusercontent.com/Cowoding-Jams/Jambo/main/images/Robot-lowres.png",
	githubURL: "https://github.com/Cowoding-Jams/Jambo",
	serverDescription:
		"We're a group of young and mostly queer people having a game jam/hackathon server together. We're a very friendly and welcoming community and are happy to have you join us! \nCheck out <#1022874504525008997> for more information!",
	color: "#F0A5AC",

	// --- Development ---
	logLevel: "debug",

	// --- Management ---
	adminRoleId: "855348792025939988", // cowoding-jams/roles: admin
	moderatorRoleId: "855349314807922698", // cowoding-jams/roles: moderator

	// --- Polls & Coding Jams ---
	jamRoleName: "jammin",
	pollChannelId: "1063379924267847761", // cowoding-jams/channels: coding-jams
	jamChannelId: "1063379924267847761", // cowoding-jams/channels: coding-jams
	resultCategoryId: "855356830724259871", // cowoding-jams/categories: Working Area

	// --- Roles ---
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

	// --- Activity Tracker ---
	logActivity: true,

	// --- Birthday feature ---
	birthdayNotificationAt: 9,
};

interface BotConfig {
	// --- General ---
	/** Name of the bot. */
	botName: string;
	/** URL to a png or jpg of the logo of the bot. */
	iconURL: string;
	/** URL to the github repository of the bot. Please share your code! */
	githubURL: string;
	/** A description of the server that will be displayed in the welcome message. */
	serverDescription: string;
	/** The main color the bot will use. */
	color: ColorResolvable;

	// --- Development ---
	/** Also available: error, warn, info, http, verbose, debug, silly. */
	logLevel: "debug" | "info" | "warn" | "error" | "verbose";

	// --- Management ---
	/** Moderators of the server (to manage proposals) */
	moderatorRoleId: string;
	/** Admins of the server (to manage the game activity tracker) */
	adminRoleId: string;

	// --- Polls & Coding Jams ---
	/** Active Jam participants role name (will be pinged for announcements) */
	jamRoleName: string;
	/** The text channel where the poll system will post polls. */
	pollChannelId: string;
	/** The text channel where the jam system will post announcements to jams. */
	jamChannelId: string;
	/** The category where the jam system will create channels for jams. */
	resultCategoryId: string;

	// --- Roles ---
	/** Pronoun roles to pick from. First argument is the name of the role, second argument is the emoji id. */
	pronounRoles: [string, ComponentEmojiResolvable | null][];
	/** Max 25 color roles to pick from. First argument is the name of the role, second argument is the color. */
	colorRoles: [string, ColorResolvable][];

	// --- Activity Tracker ---
	/** If User Game Activity should get logged */
	logActivity: boolean;

	// --- Birthday Feature ---
	/** Can be any integer between 0 and 23. Defines at what time the birthday message should get send. */
	birthdayNotificationAt:
		| 0
		| 1
		| 2
		| 3
		| 4
		| 5
		| 6
		| 7
		| 8
		| 9
		| 10
		| 11
		| 12
		| 13
		| 14
		| 15
		| 16
		| 17
		| 18
		| 19
		| 20
		| 21
		| 22
		| 23;
}
