import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";
import {
	adminWhitelistgame,
	blacklistAdd,
	blacklistRemove,
	statisticsGamestats,
	statisticsMystats,
} from "../../util/tracker/autocompletes";
class TrackerAutocompleter extends Autocompleter {
	constructor() {
		super("game-activity-tracker");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		const group = interaction.options.getSubcommandGroup();
		const sub = interaction.options.getSubcommand();
		if (group === "admin") {
			if (sub == "whitelistgame") await adminWhitelistgame(interaction);
			else if (sub == "blacklistgame") await statisticsGamestats(interaction);
		} else if (group === "statistics") {
			if (sub == "mystats") await statisticsMystats(interaction);
			else if (sub == "gamestats") await statisticsGamestats(interaction);
		} else if (group === "blacklist") {
			if (sub == "remove") await blacklistRemove(interaction);
			else if (sub == "add") await blacklistAdd(interaction);
		}
	}
}

export default new TrackerAutocompleter();
