import { AutocompleteInteraction } from "discord.js";
import {
	blacklistAdd,
	blacklistAutocompletion,
	blacklistRemove,
	gamesAutocompletion,
	statsMy,
} from "../../util/activity-tracker/autocompletes.js";
import { Autocompleter } from "../interactionClasses.js";

class ActivityTrackerAutocompleter extends Autocompleter {
	constructor() {
		super("activity-tracker");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		const group = interaction.options.getSubcommandGroup();
		const sub = interaction.options.getSubcommand();

		if (group === "admin") {
			if (sub == "whitelist") await blacklistAutocompletion(interaction);
			else if (sub == "blacklist") await gamesAutocompletion(interaction);
		} else if (group === "stats") {
			if (sub == "my") await statsMy(interaction);
			else if (sub == "game") await gamesAutocompletion(interaction);
		} else if (group === "blacklist") {
			if (sub == "remove") await blacklistRemove(interaction);
			else if (sub == "add") await blacklistAdd(interaction);
		}
	}
}

export default new ActivityTrackerAutocompleter();
