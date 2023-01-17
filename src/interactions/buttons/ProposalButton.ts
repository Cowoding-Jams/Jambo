import { Button } from "../interactionClasses";
import { ButtonInteraction } from "discord.js";
import { listProposals } from "../../util/proposal/listProposals";

class ProposalButton extends Button {
	constructor() {
		super("proposals");
	}

	async execute(interaction: ButtonInteraction, args: string[]): Promise<void> {
		if (args[0] == "list") {
			const page = parseInt(args[2]);
			const proposalsPerPage = parseInt(args[3]);
			if (args[1] == "left") {
				listProposals(interaction, page - 1, proposalsPerPage);
			} else if (args[1] == "right") {
				listProposals(interaction, page + 1, proposalsPerPage);
			} else if (args[1] == "minus") {
				listProposals(interaction, page, proposalsPerPage > 1 ? proposalsPerPage - 1 : 1);
			} else if (args[1] == "plus") {
				listProposals(interaction, page, proposalsPerPage < 10 ? proposalsPerPage + 1 : 10);
			}
		}
	}
}

export default new ProposalButton();
