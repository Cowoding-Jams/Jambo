import { Autocompleter } from "../Autocompleter";
import { AutocompleteInteraction } from "discord.js";
import { ctx } from "../ctx";
import { CountryCommand } from "commands/CountryCommand";


class CountryAutocompleter extends Autocompleter {
    countryData: [name: string, value: string][]

    constructor() {
        super("country");
        const command = ctx.commands.get("country") as CountryCommand;
        console.log(command)
        console.log(command.countryWithCode)
        this.countryData = command.countryWithCode;
    }

    async execute(interaction: AutocompleteInteraction): Promise<void> {
        // for example return all options which start with the user input
        await interaction.respond(
            this.countryData.filter((c) => c[0].startsWith(interaction.options.getFocused() as string)).map((c) => ({ name: c[0], value: c[1] })),
        );
    }
}

export default new CountryAutocompleter();
