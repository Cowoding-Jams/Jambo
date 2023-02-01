import { ChatInputCommandInteraction, CommandInteraction, ModalSubmitInteraction } from "discord.js";
import { DateTime, Duration } from "luxon";

export function discordTimestamp(datetime: DateTime | number): string {
	return `<t:${datetime instanceof DateTime ? Math.floor(datetime.toSeconds()) : datetime}>`;
}

export function discordRelativeTimestamp(datetime: DateTime | number): string {
	return `<t:${datetime instanceof DateTime ? Math.floor(datetime.toSeconds()) : datetime}:R>`;
}

export function durationToReadable(duration: Duration, short = false): string {
	if (short) {
		return duration.normalize().rescale().toHuman({ listStyle: "short", unitDisplay: "narrow" });
	} else {
		return duration.normalize().rescale().toHuman({ listStyle: "long", unitDisplay: "long" });
	}
}

export const longDateFormatWithTimezone = "dd MMMM yyyy 'UTC'Z";
export const longDateTimeFormat = "dd.MM.yyyy HH:mm:ss 'UTC'Z";
export const shortDateTimeFormat = "dd.MM.yyyy HH:mm 'UTC'Z";
export const longTimeFormat = "HH:mm:ss 'UTC'Z";
export const shortTimeFormat = "HH:mm 'UTC'Z";

export async function checkDate(
	interaction: CommandInteraction,
	date: string | null
): Promise<DateTime | null> {
	const iso = date ? DateTime.fromISO(date.toUpperCase(), { setZone: true }) : null;
	if (!iso) return null;
	if (!iso.isValid) {
		if (date !== "") {
			await interaction.reply({
				content: `Invalid date format... Please use ISO 8601 (e.g. '2003-05-26T04:48:33+02:00').\n<https://en.wikipedia.org/wiki/ISO_8601>`,
				ephemeral: true,
			});
		}
		return null;
	} else return iso;
}

export async function checkDuration(
	interaction: ChatInputCommandInteraction | ModalSubmitInteraction,
	duration: string | null
): Promise<Duration | null> {
	const iso = duration ? Duration.fromISO(duration.toUpperCase()) : null;
	if (!iso) return null;
	if (!iso.isValid) {
		if (duration !== "") {
			await interaction.reply({
				content: `Invalid duration format... Please use ISO 8601 (e.g. P2D2H).\n<https://en.wikipedia.org/wiki/ISO_8601#Durations>`,
				ephemeral: true,
			});
		}
		return null;
	} else return iso;
}
