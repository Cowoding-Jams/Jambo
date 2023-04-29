import { ColorResolvable, ComponentEmojiResolvable } from "discord.js";

/** Interface used in ./src/config.ts */
export interface BotConfig {
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
	/** Pronoun roles to pick from. First argument is the name of the role, second argument is the emoji id (You get the id by typing "\\[insert emoji]" in Discord). */
	pronounRoles: [string, ComponentEmojiResolvable | null][];
	/** Max 25 color roles to pick from. First argument is the name of the role, second argument is the color. */
	colorRoles: [string, ColorResolvable][];

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

	// --- Tracker ---
	/** Enable or Disable the tracking feature (if disabled, tracking-commands and logging wont be available anymore, but tracking-Database wont be cleared!) */
	tracking: boolean;
}
