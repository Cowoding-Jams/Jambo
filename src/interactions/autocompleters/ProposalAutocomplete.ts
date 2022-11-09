import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction, GuildMember } from "discord.js";
import { proposalDb } from "../../db";
import { hasRole } from "../../util/misc/permissions";
import { config } from "../../config";

class ProposalAutocompleter extends Autocompleter {
	constructor() {
		super("proposal");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		let proposals = proposalDb.array();
		if (!(await hasRole(interaction.member as GuildMember, config.moderatorRoleId))) {
			proposals = proposals.filter((p) => p.owner == interaction.user.id);
		}
		await interaction.respond(proposals.map((c) => ({ name: c.title, value: c.title })));
	}
}

export default new ProposalAutocompleter();
