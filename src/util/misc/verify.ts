import { ComponentEmojiResolvable, Guild } from "discord.js";
import fetch from "node-fetch";

export function isNotEmpty(value: string): boolean {
	return value !== "";
}

export async function emojiExists(guild: Guild, emoji: ComponentEmojiResolvable): Promise<boolean> {
	return (await fetch(`https://cdn.discordapp.com/emojis/${emoji}`)).ok;
}

export async function roleExists(guild: Guild, role: string): Promise<boolean> {
	return await guild.roles
		.fetch(role)
		.catch(() => false)
		.then((role) => role !== null);
}

export async function channelExists(guild: Guild, channel: string): Promise<boolean> {
	return await guild.channels
		.fetch(channel)
		.catch(() => false)
		.then((channel) => channel !== null);
}

export function isValidHexColor(color: string): boolean {
	return /^#[0-9A-F]{6}$/i.test(color);
}

export function isValidURl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}
