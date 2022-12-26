import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";
import { jamDb, pollDb, proposalDb, proposalID, userID } from "../../db";
import { autocompleteISODuration, autocompleteISOTime } from "../../util/misc/autocomplete";

export const autocompleteCache: {
	[key: userID]: { include: Map<string, proposalID[]>; exclude: Map<string, proposalID[]> };
} = {};

class JamAutocompleter extends Autocompleter {
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

		if (subCmd == "new") {
			if (optionName == "proposal") {
				await interaction.respond(
					proposalDb
						.array()
						.filter((k) => k.title.toLowerCase().startsWith(value))
						.slice(0, 25)
						.map((c) => ({ name: c.title, value: c.title }))
				);
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
					const endDate = jamDb.get(name)?.end;
					interaction.respond([
						{
							name: endDate ? endDate.toISO() : "Enter the name to get the current end date!",
							value: endDate ? endDate.toISO() : "-",
						},
					]);
				}
				await autocompleteISOTime(interaction);
			}
		} else if (subCmd == "delete") {
			await interaction.respond(
				jamDb
					.array()
					.filter((k) => k.title.toLowerCase().startsWith(value))
					.slice(0, 25)
					.map((c) => ({ name: c.title, value: c.title }))
			);
		}
	}

	async pollAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
		const subCmd = interaction.options.getSubcommand();
		const focus = interaction.options.getFocused(true);
		const optionName = focus.name;
		const value = focus.value.toLowerCase();

		if (subCmd == "new") {
			if (optionName == "duration") {
				await autocompleteISODuration(interaction);
			} else {
				// ["start-date", "end-date"].includes(optionName))
				await autocompleteISOTime(interaction);
			}
		} else if (subCmd == "extend") {
			if (optionName == "name") {
				await interaction.respond(
					pollDb
						.array()
						.filter((k) => k.title.toLowerCase().startsWith(value))
						.slice(0, 25)
						.map((c) => ({ name: c.title, value: c.title }))
				);
			} else {
				if (value.length == 0) {
					const name = interaction.options.getString("name") || "";
					const endDate = pollDb.get(name)?.end;
					interaction.respond([
						{
							name: endDate ? endDate.toISO() : "Enter the name to get the current end date!",
							value: endDate ? endDate.toISO() : "-",
						},
					]);
				}
				await autocompleteISOTime(interaction);
			}
		} else if (subCmd == "delete") {
			await interaction.respond(
				pollDb
					.array()
					.filter((k) => k.title.toLowerCase().startsWith(value))
					.slice(0, 25)
					.map((c) => ({ name: c.title, value: c.title }))
			);
		}
	}
}

export default new JamAutocompleter();
