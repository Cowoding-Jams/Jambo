import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";
import { jamDb, pollDb, proposalDb, proposalID, userID } from "../../db";
import { autocompleteISODuration, autocompleteISOTime } from "../../util/misc/autocomplete";

export const autocompleteCache: {
	[key: userID]: { include: Map<string, proposalID[]>; exclude: Map<string, proposalID[]> };
} = {};

class CodingJamsAutocompleter extends Autocompleter {
	constructor() {
		super("coding-jams");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		const subCmdGroup = interaction.options.getSubcommandGroup();
		if (subCmdGroup == "poll") {
			await this.pollAutocomplete(interaction);
		} else if (subCmdGroup == "jam") {
			await this.jamAutocomplete(interaction);
		}
	}

	async jamAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
		const subCmd = interaction.options.getSubcommand();
		const focus = interaction.options.getFocused(true);
		const optionName = focus.name;
		const value = focus.value.toLowerCase();

		const jamNameAutocompletion = async () =>
			await interaction.respond(
				jamDb
					.array()
					.filter((k) => k.title.toLowerCase().startsWith(value))
					.slice(0, 25)
					.map((c) => ({ name: c.title, value: c.title }))
			);

		const proposalNameAutocompletion = async () =>
			await interaction.respond(
				proposalDb
					.array()
					.filter((k) => k.title.toLowerCase().startsWith(value))
					.slice(0, 25)
					.map((c) => ({ name: c.title, value: c.title }))
			);

		if (subCmd == "new") {
			if (optionName == "proposal") {
				proposalNameAutocompletion();
			} else if (optionName == "duration") {
				await autocompleteISODuration(interaction);
			} else {
				// start-date or end-date
				await autocompleteISOTime(interaction);
			}
		} else if (subCmd == "extend") {
			if (optionName == "name") {
				await interaction.respond(
					jamDb
						.array()
						.filter((k) => k.title.toLowerCase().startsWith(value))
						.slice(0, 25)
						.map((c) => ({ name: c.title, value: c.title }))
				);
			} else {
				if (value.length == 0) {
					const name = interaction.options.getString("name") || "";
					const endDate = jamDb.find((e) => e.title === name)?.end;
					interaction.respond([
						{
							name: endDate ? endDate.toISO() : "Enter the name to get the current end date!",
							value: endDate ? endDate.toISO() : "-",
						},
					]);
					return;
				}
				await autocompleteISOTime(interaction);
			}
		} else {
			// delete, view
			jamNameAutocompletion();
		}
	}

	async pollAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
		const subCmd = interaction.options.getSubcommand();
		const focus = interaction.options.getFocused(true);
		const optionName = focus.name;
		const value = focus.value.toLowerCase();

		const pollNameAutocompletion = async () =>
			await interaction.respond(
				pollDb
					.array()
					.filter((k) => k.title.toLowerCase().startsWith(value))
					.slice(0, 25)
					.map((c) => ({ name: c.title, value: c.title }))
			);

		if (subCmd == "new") {
			if (optionName == "duration") {
				await autocompleteISODuration(interaction);
			} else {
				// ["start-date", "end-date"].includes(optionName))
				await autocompleteISOTime(interaction);
			}
		} else if (subCmd == "extend") {
			if (optionName == "name") {
				pollNameAutocompletion();
			} else {
				if (value.length == 0) {
					const name = interaction.options.getString("name") || "";
					const endDate = pollDb.find((e) => e.title === name)?.end;
					interaction.respond([
						{
							name: endDate ? endDate.toISO() : "Enter the name to get the current end date!",
							value: endDate ? endDate.toISO() : "-",
						},
					]);
					return;
				}
				await autocompleteISOTime(interaction);
			}
		} else {
			// delete, view, votes
			pollNameAutocompletion();
		}
	}
}

export default new CodingJamsAutocompleter();
