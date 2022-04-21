export function shuffleList(list: any[]): any[] {
    return list.sort(() => Math.random() - 0.5);
}

export function pickRandomFromList(list: any[]): any {
    return list[randInt(0, list.length)];
}

export function randInt(lowerbound: number, upperbound: number) {
    // upperbound is not included
    return lowerbound + Math.floor(Math.random() * (upperbound - lowerbound));
}