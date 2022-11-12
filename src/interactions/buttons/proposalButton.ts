import { Button } from "../interactionClasses";
import { ButtonInteraction } from "discord.js";
import { listProposals } from "../../util/proposalCommand/listProposals";

class ProposalButton extends Button {
	constructor() {
		super("proposal");
	}

	async execute(interaction: ButtonInteraction, args: string[]): Promise<void> {
		if (args[0] == "list") {
			const page = parseInt(args[2]);
			if (args[1] == "left") {
				listProposals(interaction, page - 1);
			} else if (args[1] == "right") {
				listProposals(interaction, page + 1);
			}
		}
	}
}

export default new ProposalButton();
