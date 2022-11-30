import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { birthdayDb } from "../../db";
import { addDefaultEmbedFooter } from "../misc/embeds";

export async function setCommand(interaction: ChatInputCommandInteraction) {
	const month = interaction.options.getString("month");

	const oldDay = getDay(interaction.user.id);
	const oldMonth = getMonth(interaction.user.id);
	const newDay = interaction.options.getInteger("day") || oldDay;
	const newMonth = month ? parseInt(month) : oldMonth;

	if (newDay == -1 || newMonth == -1) {
		let embed = new EmbedBuilder()
			.setTitle("Can't edit your birthday...")
			.setDescription(
				"You can't edit your birthday when you haven't set one yet.\nTo set your birthday you need to give a `day` AND a `month`"
			);
		embed = addDefaultEmbedFooter(embed);
		await interaction.editReply({ embeds: [embed] });
		return;
	}

	if (interaction.options.getBoolean("delete")) {
		remove(interaction.user.id);
		let embed = new EmbedBuilder()
			.setTitle("Deleted your birthday")
			.setDescription("Your birthday is now removed from the database!");
		embed = addDefaultEmbedFooter(embed);
		await interaction.editReply({ embeds: [embed] });
		return;
	}

	if (!isValidDay(newMonth, newDay)) {
		let embed = new EmbedBuilder()
			.setTitle("Invalid date")
			.setDescription(
				"Seams like your entered day is not correct... Please check if you entered everything correctly!"
			);
		embed = addDefaultEmbedFooter(embed);
		await interaction.editReply({ embeds: [embed] });
		return;
	}

	set(interaction.user.id, newDay, newMonth);

	if (oldMonth !== -1 || oldDay !== -1) {
		const oldDate = `${oldDay}.${oldMonth}`;
		let embed = new EmbedBuilder()
			.setTitle("Changed Your birthday")
			.setDescription(`Changed from \`${oldDate}\` to \`${newDay}.${newMonth}\``);
		embed = addDefaultEmbedFooter(embed);
		await interaction.editReply({ embeds: [embed] });
		return;
	}

	let embed = new EmbedBuilder().setTitle("Set Your Birthday").setDescription(`to \`${newDay}.${newMonth}\``);
	embed = addDefaultEmbedFooter(embed);
	await interaction.editReply({ embeds: [embed] });
}

function set(user: string, day: number, month: number) {
	birthdayDb.set(user, { day: day, month: month });
}

function exists(user: string) {
	return birthdayDb.has(user);
}

function getDay(user: string) {
	if (!exists(user)) return -1;
	return birthdayDb.get(user)?.day || 1;
}

function getMonth(user: string) {
	if (!exists(user)) return -1;
	return birthdayDb.get(user)?.month || 1;
}

function remove(user: string) {
	birthdayDb.delete(user);
}

function isValidDay(month: number, day: number): boolean {
	// (if date is march 1 and the current year is not divisible by 4, include those born on feb 29)
	if (month == 2) {
		return day <= 29;
	}

	if (month == 4 || month == 6 || month == 9 || month == 11) return day <= 30;
	return true;
}
