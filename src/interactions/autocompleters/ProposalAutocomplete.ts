import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";
import { proposalDb } from "../../db";
import { hasModeratorRole } from "../../util/misc/permissions";

class ProposalAutocompleter extends Autocompleter {
	constructor() {
		super("proposals");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		let proposals = Array.from(proposalDb.values());

		if (!(await hasModeratorRole(interaction)) && interaction.options.getSubcommand() != "view") {
			proposals = proposals.filter((p) => p.owner == interaction.user.id);
		}

		const input = interaction.options.getFocused();
		proposals = proposals.filter((p) => p.title.toLowerCase().startsWith(input.toLowerCase()));
		await interaction.respond(proposals.slice(0, 25).map((c) => ({ name: c.title, value: c.title })));
	}
}

export default new ProposalAutocompleter();
