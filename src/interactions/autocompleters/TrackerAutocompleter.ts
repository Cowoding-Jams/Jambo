import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";
import {
	adminWhitelistgame,
	blacklistRemove,
	statisticsGamestats,
	statisticsMystats,
} from "../../util/tracker/autocompletes";
class TrackerAutocompleter extends Autocompleter {
	constructor() {
		super("tracker");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		let group = interaction.options.getSubcommandGroup()
		let sub = interaction.options.getSubcommand()
		if (group === "admin") {
			if (sub == "whitelistgame")	await adminWhitelistgame(interaction);
			else if (sub == "blacklistgame") await statisticsGamestats(interaction)
		} else if (group === "statistics") {
			if (sub == "mystats") await statisticsMystats(interaction);
			else if (sub == "gamestats") await statisticsGamestats(interaction);
		} else if (group === "blacklist") {
			await blacklistRemove(interaction);
		}
	}
}

export default new TrackerAutocompleter();
