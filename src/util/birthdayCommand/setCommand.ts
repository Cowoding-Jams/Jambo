import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { addDefaultEmbedFooter } from "../misc/embeds";
import { isValidDay } from "../birthdaySystem/date";
import { getDay, getMonth, set, remove } from "../birthdaySystem/set"

export async function setCommand(interaction: ChatInputCommandInteraction) {
    const month = interaction.options.getString('month')

    const oldDay = getDay(interaction.user.id)
    const oldMonth = getMonth(interaction.user.id)
    const newDay = interaction.options.getInteger('day') || oldDay
    const newMonth = month ? parseInt(month) : oldMonth

    if (newDay == -1 || newMonth == -1) {
        let embed = new EmbedBuilder()
            .setTitle("Cant edit Birthday")
            .setDescription("You cant edit your Birthday when you havent set one yet.\nTo set your birthday you need to give a `day` AND a `month`")
        embed = addDefaultEmbedFooter(embed)
        await interaction.editReply({embeds:[embed]})
        return
    } 

    if (interaction.options.getBoolean('delete')) {
        remove(interaction.user.id)
        let embed = new EmbedBuilder()
            .setTitle("Deleted your Birthday")
            .setDescription("Your Birthday is now removed from the Database")
        embed = addDefaultEmbedFooter(embed)
        await interaction.editReply({embeds:[embed]})
        return
    }

    if (!isValidDay(newMonth, newDay)) {
        let embed = new EmbedBuilder()
            .setTitle("Invalid Date")
            .setDescription("Seams like your entered day is not correct. Please check if you entered everything correctly!")
        embed = addDefaultEmbedFooter(embed)
        await interaction.editReply({embeds:[embed]})
        return
    }

    set(interaction.user.id, newDay, newMonth)
    let oldDate = `${oldDay != -1 ? oldDay : newDay}.${oldMonth != -1 ? oldMonth : newMonth}`
    
    if (oldMonth !== -1 || oldDay !== -1) {
        let embed = new EmbedBuilder()
            .setTitle("Changed Your Birthday")
            .setDescription(`Changed from \`${oldDate}\` to \`${newDay}.${newMonth}\``)
        embed = addDefaultEmbedFooter(embed)
        await interaction.editReply({embeds:[embed]})
        return
    }

    let embed = new EmbedBuilder()
        .setTitle("Set Your Birthday")
        .setDescription(`to \`${newDay}.${newMonth}\``)
    embed = addDefaultEmbedFooter(embed)
    await interaction.editReply({embeds:[embed]})
}