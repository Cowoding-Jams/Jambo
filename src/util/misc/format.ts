export function numberedList(list: (string | undefined)[], additional?: string[]): string[] {
	const len = list.length;
	if (additional && len !== additional.length) throw new Error("The length of the two arrays must be equal.");
	return list.map(
		(e, i) =>
			`#${i.toString().padStart(Math.ceil(len / 10), "0")} ${e}${additional ? " ⁘ " + additional[i] : ""}`
	);
}
