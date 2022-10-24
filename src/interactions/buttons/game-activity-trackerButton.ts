import { Button } from "../interactionClasses";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js";
import { createList } from "../../util/tracker/list";
import { addDefaultEmbedFooter } from "../../util/misc/embeds";

class gameActivityTrackerButton extends Button {
	constructor() {
		super("game-activity-tracker");
	}
	async execute(interaction: ButtonInteraction, args: string[]): Promise<void> {
        let offset = parseInt(args[1])
        if (args[0] == "left") offset -= 1
        else if (args[0] == "left2") offset -= 10
        else if (args[0] == "right") offset += 1
        else if (args[0] == "right2") offset += 10

        let filter = args[2]
        let [left, right, left2, right2, index, games, values, pages] = await createList(filter, offset)

        if (!Array.isArray(values)) return
        if (!Array.isArray(index)) return
        if (!Array.isArray(games)) return
        if (typeof left !== "boolean") return
        if (typeof right !== "boolean") return        
        if (typeof left2 !== "boolean") return
        if (typeof right2 !== "boolean") return
        if (typeof pages !== "number") return
    
        let embed = new EmbedBuilder()
            .setTitle("<title work in progress>")
            .setDescription("wip")
            .addFields(
                {name:"Index", value:index.join("\n"), inline:true},
                {name:"Game", value:games.join("\n"), inline:true},
                {name:"Value", value:values.join("\n"), inline:true}
            )
            .setFooter({text:`page ${offset+1}/${pages}`})
    
        embed = addDefaultEmbedFooter(embed)
    
        let row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`game-activity-tracker.left2.${offset}.` + filter)
                .setLabel("◀◀")
                .setStyle(left2 ? ButtonStyle.Primary : ButtonStyle.Danger)
                .setDisabled(!left2 ? true : false),
            new ButtonBuilder()
                .setCustomId(`game-activity-tracker.left.${offset}.` + filter)
                .setLabel("◀")
                .setStyle(left ? ButtonStyle.Primary : ButtonStyle.Danger)
                .setDisabled(!left ? true : false),
            new ButtonBuilder()
                .setCustomId(`game-activity-tracker.right.${offset}.` + filter)
                .setLabel("▶")
                .setStyle(right ? ButtonStyle.Primary : ButtonStyle.Danger)
                .setDisabled(!right ? true : false),
            new ButtonBuilder()
                .setCustomId(`game-activity-tracker.right2.${offset}.` + filter)
                .setLabel("▶▶")
                .setStyle(right2 ? ButtonStyle.Primary : ButtonStyle.Danger)
                .setDisabled(!right2 ? true : false)
        );
        
        await interaction.update({embeds:[embed], components:[row]})

    }
}

export default new gameActivityTrackerButton();
