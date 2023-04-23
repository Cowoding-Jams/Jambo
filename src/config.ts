import { BotConfig } from "./util/config/configInterface";

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

	// --- Birthday feature ---
	birthdayNotificationAt: 9,

	// --- Tracker ---
	tracking: true,
};
