import { birthdayDb } from "../../db";

export function set(user: string, day: number, month: number) {
	birthdayDb.set(user, { day: day, month: month });
}

export function exists(user: string) {
	return birthdayDb.has(user);
}

export function getDay(user: string) {
	if (!exists(user)) return -1;
	return birthdayDb.get(user)?.day || 1;
}

export function getMonth(user: string) {
	if (!exists(user)) return -1;
	return birthdayDb.get(user)?.month || 1;
}

export function remove(user: string) {
	birthdayDb.delete(user);
}
