import { confirmEmbed, errorEmbed } from "./helper";

export const USERNOTFOUND = errorEmbed("user not found", "Cant get user option or interaction user.");
export const MEMBERNOTFOUND = errorEmbed(
	"member not found",
	"Cant get guild member, user may not be on this server anymore."
);
export const INVALIDFILTER = errorEmbed("invalid filter", 'Given filter needs to be "logs" or "playtime"');
export const USERNOENTRY = errorEmbed("no database entry", "Given user has no entrys in the database.");
export const USERNOGAMEENTRY = errorEmbed(
	"no database entry",
	"Given user has no entrys in the database associated with given the game."
);
export const GAMENOENTRY = errorEmbed("no database entry", "Given game has no entry in the database.");
export const ADMINONLY = errorEmbed("admin only", "This command can only be executed by an admin.");
export const GAMEONBLACKLIST = errorEmbed("already on blacklist", "Given game is already on the blacklist.");
export const GAMENOTBLACKLIST = errorEmbed("no on blacklist", "Given game is not on the blacklist.");
export const NOUSERANDGAMEGIVEN = errorEmbed(
	"invalid options",
	"game nor user where given. This command needs at lest one of both."
);
export const GAMEADDED = (game: string) => confirmEmbed(`"${game}" has been added to the blacklist!`);
export const GAMEREMOVED = (game: string) => confirmEmbed(`"${game}" has been removed from the blacklist!`);
