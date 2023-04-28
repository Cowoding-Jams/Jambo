import { trackerBlacklist, trackerGames, trackerUsers } from "../../db";

export function user(
	option: string,
	userid: string | number | boolean | undefined,
	game: string | number | boolean | undefined
) {
	const results = [];

	if (option == "game") {
		if (typeof userid == "string") {
			if (trackerUsers.get(userid)?.games) {
				// list games a user has played (if user has played anything)
				trackerUsers.get(userid)?.games.forEach((g) => results.push(g.name));
			} else {
				// show this when user didnt play any games
				results.push("[user has not played any games yet]");
			}
		} else {
			// list all games in case user hasnt filled in the user-option yet
			results.push(...trackerGames.keyArray());
		}
	} else if (option == "statistic") {
		// only show playtime and logs if a game is given, else show standard options
		results.push(
			...(typeof game == "string"
				? ["playtime", "logs"]
				: ["general statistics", "top 5 most played games", "top 5 most logged games", "latest 5 logs"])
		);
	}

	return results;
}

export function blacklist(action: string) {
	const results = [];

	if (action == "add" || action == "rem") {
		// only show not blacklisted games when "add" is chosen as the action, else only show blacklisted games
		results.push(
			...trackerGames
				.keyArray()
				.filter((e) =>
					action == "add"
						? !trackerBlacklist.get("")?.find((e2) => e2 == e)
						: !!trackerBlacklist.get("")?.find((e2) => e2 == e)
				)
		);
	} else {
		// show all games in case action-option isnt filled in yet
		results.push(...trackerGames.keyArray());
	}

	return results;
}
