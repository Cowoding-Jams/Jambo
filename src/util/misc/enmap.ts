import Enmap from "enmap";

export function getFromEnmap<T>(enmap: Enmap<T>, keys: string[]): T[] {
	const values = keys.map((k) => enmap.get(k));
	if (values.includes(undefined)) {
		const index = values.findIndex((v) => v === undefined);
		throw new Error(`Key '${keys[index]}' was not found in the ${enmap.name} enmap`);
	}
	return values as T[];
}
