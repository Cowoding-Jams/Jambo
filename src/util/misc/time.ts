import { ChatInputCommandInteraction, CommandInteraction, ModalSubmitInteraction } from "discord.js";
import { DateTime, Duration } from "luxon";

export function discordTimestamp(datetime: DateTime): string {
	return `<t:${Math.floor(datetime.toSeconds())}>`;
}

export function discordRelativeTimestamp(datetime: DateTime): string {
	return `<t:${Math.floor(datetime.toSeconds())}:R>`;
}

export function durationToReadable(duration: Duration, short = false): string {
	if (short) {
		return duration.toHuman({ listStyle: "short", unitDisplay: "narrow" });
	} else {
		return duration.toHuman({ listStyle: "long", unitDisplay: "long" });
	}
}

export const longDateFormatWithTimezone = "dd MMMM yyyy 'UTC'Z";
export const longDateTimeFormat = "dd.MM.yyyy HH:mm:ss 'UTC'Z";
export const shortDateTimeFormat = "dd.MM.yyyy HH:mm 'UTC'Z";
export const longTimeFormat = "HH:mm:ss 'UTC'Z";
export const shortTimeFormat = "HH:mm 'UTC'Z";

export async function checkDate(
	interaction: CommandInteraction,
	date: string | null,
	futherMessage = ""
): Promise<DateTime | null> {
	const iso = date ? DateTime.fromISO(date.toUpperCase(), { setZone: true }) : null;
	if (!iso || !iso.isValid) {
		const separator = futherMessage ? "\n\n" : "";
		if (date !== "" && date !== null) {
			await interaction.reply({
				content: `Invalid date format... Please use ISO 8601 (e.g. '2003-05-26T04:48:33+02:00').\n<https://en.wikipedia.org/wiki/ISO_8601>${separator}${futherMessage}`,
				ephemeral: true,
			});
		}

		return null;
	} else {
		return iso;
	}
}

export async function checkDuration(
	interaction: ChatInputCommandInteraction | ModalSubmitInteraction,
	duration: string | null,
	futherMessage = ""
): Promise<Duration | null> {
	const iso = duration ? Duration.fromISO(duration.toUpperCase()) : null;
	if (!iso || !iso.isValid) {
		const separator = futherMessage ? "\n\n" : "";
		if (duration !== "" && duration !== null) {
			await interaction.reply({
				content: `Invalid duration format... Please use ISO 8601 (e.g. P2D2H).\n<https://en.wikipedia.org/wiki/ISO_8601#Durations>${separator}${futherMessage}`,
				ephemeral: true,
			});
		}
		return null;
	} else {
		return iso;
	}
}
