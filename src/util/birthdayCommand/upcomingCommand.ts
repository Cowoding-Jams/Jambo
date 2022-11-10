import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { birthdayDb } from "../../db";
import { addDefaultEmbedFooter } from "../misc/embeds";

export async function upcomingCommand(interaction: ChatInputCommandInteraction) {
	// I know there can be less loops, but cant matter that much
	// and Im to lazy to redo thing now... ^^
	const entrys = birthdayDb.keyArray()

	let currentDate = new Date()
	currentDate = new Date(
		currentDate.getFullYear(), 
		currentDate.getMonth(), 
		currentDate.getDate(), 
		0, 0, 0, 0)

	let results: string[] = []

	entrys.forEach((key) => {
		const entry = birthdayDb.get(key);
		if (!entry) return
		const entryDate = new Date(
				currentDate.getFullYear(),
				entry.month-1,
				entry.day,
				0, 0, 0, 0)

		if (entry.month < currentDate.getMonth()) return
		if (entry.day < currentDate.getDate()) return

		let dayDifference = (currentDate.getTime() - entryDate.getTime()) / 86400000


		if (dayDifference <= 30 && dayDifference < 0) results.push(key)
		

	})

	results = results.sort((a, b) => {
		let ea = birthdayDb.get(a);
		let eb = birthdayDb.get(b);
		return ((ea?.day || 1) + ((ea?.month || 1) * 31)) - ((eb?.day || 1) + ((ea?.month || 1) * 31))
	}).slice(0, 10)

	
	let list: string[] = []
	
	results.forEach((r) => {
		const entry = birthdayDb.get(r);
		if (!entry) return
		const entryDate = new Date(
			currentDate.getFullYear(),
			entry.month-1,
			entry.day,
			0, 0, 0, 0)
		list.push(`<@!${r}> ⁘ <t:${entryDate.getTime()/1000}:R>`)
		
	})
	
	if (list.length == 0) {
		let embed = new EmbedBuilder()
			.setTitle("No upcoming Birthdays")
			.setDescription("Seems like there are no upcoming birthdays in the next 30 days")
		embed = addDefaultEmbedFooter(embed)
		await interaction.editReply({embeds:[embed]})
		return
	}

	let embed = new EmbedBuilder()
		.setTitle("Upcoming Birthdays")
		.setDescription(list.join("\n"))
	embed = addDefaultEmbedFooter(embed)
	await interaction.editReply({embeds:[embed]})
}
