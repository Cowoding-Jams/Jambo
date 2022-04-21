import { MessageEmbed } from "discord.js";

export function addDefaultEmbedFooter(embed: MessageEmbed): MessageEmbed {
    return embed
        .setAuthor({
            name: "Made by me, Jambo :)",
            iconURL: "https://raw.githubusercontent.com/Cowoding-Jams/Jambo/main/images/Robot-lowres.png",
            url: "https://github.com/Cowoding-Jams/Jambo",
        })
        .setColor("#F0A5AC")
        .setTimestamp();
}