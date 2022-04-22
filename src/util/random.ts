export function shuffleList<T>(list: T[]): T[] {
	return list.sort(() => Math.random() - 0.5);
}

export function pickRandomFromList<T>(list: T[]): T {
	return list[randInt(0, list.length)];
}

// upperbound is not included
export function randInt(lowerbound: number, upperbound: number) {
	return lowerbound + Math.floor(Math.random() * (upperbound - lowerbound));
}
