import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";
import {
	blacklistAdd,
	blacklistAutocompletion,
	blacklistRemove,
	gamesAutocompletion,
	statisticsMystats,
} from "../../util/activity-tracker/autocompletes";

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
		} else if (group === "statistics") {
			if (sub == "my-stats") await statisticsMystats(interaction);
			else if (sub == "game-stats") await gamesAutocompletion(interaction);
		} else if (group === "blacklist") {
			if (sub == "remove") await blacklistRemove(interaction);
			else if (sub == "add") await blacklistAdd(interaction);
		}
	}
}

export default new ActivityTrackerAutocompleter();
