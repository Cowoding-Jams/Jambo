import { Autocompleter } from "../handler";
import { AutocompleteInteraction } from "discord.js";
import { /*activityTrackerLogDb,*/ activityTrackerBlacklistDb } from "../db";
class TrackerAutocompleter extends Autocompleter {
	constructor() {
		super("tracker"); // command which this autocompleter is for
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {

        if (interaction.options.getSubcommandGroup() === "admin") {
            await adminWhitelistgame(interaction);
        } else if (interaction.options.getSubcommandGroup() === "statistics") {
            await statisticsMystats(interaction);
        } else if (interaction.options.getSubcommandGroup() === "blacklist") {
            await blacklistRemove(interaction);
        }

	}
}

export default new TrackerAutocompleter();










async function adminWhitelistgame(interaction: AutocompleteInteraction) {
    if (!interaction.memberPermissions?.has("Administrator")) {
        await interaction.respond([{name:"You dont have permissions to use this command", value: "You dont have permissions to use this command"}])
        return  
    }

    let options: string[] | undefined = activityTrackerBlacklistDb.get('general-game')

    if (options?.length === 0 || !options) {
        await interaction.respond([{name:"No games are currently blacklisted globaly", value: "No games are currently blacklisted globaly"}])
        return
    }

    await interaction.respond(
        options
            .filter((c) => c.toLowerCase().startsWith(interaction.options.getFocused().toLowerCase() as string))
            .map((c) => ({ name: c, value: c }))
    );
}
async function statisticsMystats(interaction: AutocompleteInteraction) {
    
}
async function blacklistRemove(interaction: AutocompleteInteraction) {
    
}