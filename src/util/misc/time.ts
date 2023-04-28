import { ChatInputCommandInteraction, CommandInteraction, ModalSubmitInteraction } from "discord.js";
import { DateTime, Duration } from "luxon";

function makeTimestamp(datetime: DateTime | number, end?: string): string {
	return `<t:${datetime instanceof DateTime ? Math.floor(datetime.toSeconds()) : datetime}${end ? ":" + end : ""}>`;
}

/** 
 * Make a discord Timestamp which displays like this: `1 January 1970 01:00` \
 * @param datetime DateTime object or number in Seconds */
export function discordTimestamp(datetime: DateTime | number): string {
	return makeTimestamp(datetime);
}
/** 
 * Make a discord Timestamp which displays like this: `53 years ago` \
 * @param datetime DateTime object or number in Seconds */
export function discordRelativeTimestamp(datetime: DateTime | number): string {
	return makeTimestamp(datetime, "R");
}
/** 
 * Make a discord Timestamp which displays like this: `01:00` \
 * @param datetime DateTime object or number in Seconds */
export function discordShortTimeTimestamp(datetime: DateTime | number): string {
	return makeTimestamp(datetime, "t");
}
/** 
 * Make a discord Timestamp which displays like this: `01:00:00` \
 * @param datetime DateTime object or number in Seconds */
export function discordLongTimeTimestamp(datetime: DateTime | number): string {
	return makeTimestamp(datetime, "T");
}
/** 
 * Make a discord Timestamp which displays like this: `01/01/1970` \
 * @param datetime DateTime object or number as Seconds */
export function discordShortDateTimestamp(datetime: DateTime | number): string {
	return makeTimestamp(datetime, "d");
}
/** 
 * Make a discord Timestamp which displays like this: `1 January 1970` \
 * @param datetime DateTime object or number in Seconds */
export function discordLongDateTimestamp(datetime: DateTime | number): string {
	return makeTimestamp(datetime, "D");
}
/** 
 * Make a discord Timestamp which displays like this: `1 January 1970 01:00` \
 * @param datetime DateTime object or number in Seconds */
export function discordLongDateWithShortTimeTimestamp(datetime: DateTime | number): string {
	return makeTimestamp(datetime, "f");
}
/** 
 * Make a discord Timestamp which displays like this: `Thursday, 1 January 1970 01:00` \
 * @param datetime DateTime object or number in Seconds */
export function discordLongDateWithDateOfWeekAndShortTimeTimestamp(datetime: DateTime | number): string {
	return makeTimestamp(datetime, "F");
}
/** 
 * Make a custom Timestamp which displays like this: `01/01/1970 01:00` \
 * @param datetime DateTime object or number in Seconds */
export function shortDateAndShortTimeTimestamp(datetime: DateTime | number): string {
	return discordShortDateTimestamp(datetime) + discordShortTimeTimestamp(datetime)
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

// 60seconds * 60 minutes * 24 hours = One day
export const dayInSeconds = 60 * 60 * 24;
export const dayInMillis = dayInSeconds * 1000;
// 7 times a day = week
export const weekInSeconds = dayInSeconds * 7;
export const weekInMillis = dayInMillis * 7;
// 4 times a week + 2.4 days = (average) month
export const monthInSeconds = weekInSeconds * 4 + dayInSeconds * 2.4167
export const monthInMillis = weekInMillis * 4 + dayInMillis * 2.4167;
