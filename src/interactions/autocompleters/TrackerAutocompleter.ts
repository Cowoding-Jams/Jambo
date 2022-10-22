import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";
import {
	adminWhitelistgame,
	statisticsGamestats,
	statisticsMystats,
	blacklistRemove,
} from "../../util/tracker/autocompletes";
class TrackerAutocompleter extends Autocompleter {
	constructor() {
		super("tracker");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		if (interaction.options.getSubcommandGroup() === "admin") {
			await adminWhitelistgame(interaction);
		} else if (interaction.options.getSubcommandGroup() === "statistics") {
			if (interaction.options.getSubcommand() == "mystats") await statisticsMystats(interaction);
			else if (interaction.options.getSubcommand() == "gamestats") await statisticsGamestats(interaction);
		} else if (interaction.options.getSubcommandGroup() === "blacklist") {
			await blacklistRemove(interaction);
		}
	}
}

export default new TrackerAutocompleter();
