import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";
import {
	adminWhitelist,
	blacklistAdd,
	blacklistRemove,
	statisticsGamestats,
	statisticsMystats,
} from "../../util/game-activity-tracker/autocompletes";
class TrackerAutocompleter extends Autocompleter {
	constructor() {
		super("game-activity-tracker");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		const group = interaction.options.getSubcommandGroup();
		const sub = interaction.options.getSubcommand();

		if (group === "admin") {
			if (sub == "whitelist") await adminWhitelist(interaction);
			else if (sub == "blacklist") await statisticsGamestats(interaction);
		} else if (group === "statistics") {
			if (sub == "my-stats") await statisticsMystats(interaction);
			else if (sub == "game-stats") await statisticsGamestats(interaction);
		} else if (group === "blacklist") {
			if (sub == "remove") await blacklistRemove(interaction);
			else if (sub == "add") await blacklistAdd(interaction);
		}
	}
}

export default new TrackerAutocompleter();
