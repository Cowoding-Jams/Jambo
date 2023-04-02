import { ChatInputCommandInteraction, inlineCode } from "discord.js";
import { birthdayDb } from "../../db";
import { DateTime } from "luxon";
import { getTimezoneFromRole } from "../misc/role";
import { longDateFormatWithTimezone, shortDateFormatWithTimezone } from "../misc/time";
import { config } from "../../config";
import { getAge } from "./loop";

export async function setBirthday(interaction: ChatInputCommandInteraction) {
	const oldDate = birthdayDb.get(interaction.user.id);
	const dateString = interaction.options.getString("date")!;
	let date = DateTime.fromISO(dateString, { setZone: true });

	if (interaction.options.getBoolean("delete")) {
		birthdayDb.delete(interaction.user.id);
		await interaction.reply({
			content: `Your birthday is now removed from the database!`,
		});
		return;
	}

	if (!date || !date.isValid) {
		await interaction.reply({
			content: `${inlineCode(dateString)} is not a valid date... Please enter a valid ISO string!`,
			ephemeral: true,
		});
		return;
	}

	if (date > DateTime.now()) {
		await interaction.reply({
			content: `Either you are a crazy scientist and developed time travel, or you are trying to troll me... Anyways, because I'm not sure I wont add this to the database...`,
			ephemeral: true,
		});
		return;
	} else if (date.year < DateTime.now().year - 100 && date.year != 0) {
		await interaction.reply({
			content: `Hmm... You seem to be a bit too old to be on Discord...\nAre you really *that* old? 🤔\nI don't really believe you dear...`,
			ephemeral: true,
		});
		return;
	}

	const zone = await getTimezoneFromRole(interaction.user.id, interaction.guild!);
	if (zone) date = date.setZone(zone);

	birthdayDb.set(
		interaction.user.id,
		date.set({
			hour: config.birthdayNotificationAt,
			minute: 0,
			second: 0,
			millisecond: 0,
		})
	);

	if (oldDate) {
		await interaction.reply({
			content: `Changed your birthday from ${oldDate.toFormat(
				longDateFormatWithTimezone
			)} to **${date.toFormat(longDateFormatWithTimezone)}**!`,
		});
	} else {
		await interaction.reply({
			content: `Set your birthday to **${date.toFormat(longDateFormatWithTimezone)}**!`,
		});
	}
}

export async function getBirthday(interaction: ChatInputCommandInteraction) {
	const user = interaction.options.getUser("user") ?? interaction.user;
	const member = interaction.guild!.members.cache.get(user.id);

	if (!member) {
		await interaction.reply({
			content: "This user is not on this server!",
			ephemeral: true,
		});
		return;
	}

	const isUserItself = interaction.user.id == user.id;

	if (!birthdayDb.has(user.id)) {
		await interaction.reply({
			content: isUserItself
				? "You don't have a birthday set yet!\nYou can set it with `/birthday set`!"
				: `${member.displayName} hasn't set their birthday yet!`,
			ephemeral: true,
		});
		return;
	}

	const date = birthdayDb.get(user.id)!;
	const age = getAge(date);

	await interaction.reply({
		content: `${isUserItself ? "Your" : member.displayName + "s"} birthday is set for the ${date.toFormat(
			age != null ? longDateFormatWithTimezone : shortDateFormatWithTimezone
		)}!${age != null ? ` That means ${isUserItself ? "you" : "they"} are ${age} years old!` : ""}`,
	});
}
