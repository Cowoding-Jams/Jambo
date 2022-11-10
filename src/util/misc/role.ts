import { GuildMember, Role } from "discord.js";


export function search(user: GuildMember, find: string, useStartsWith: boolean = true) {
    const check = (role: string) => useStartsWith ? role.startsWith(find) : role == find
    const found: Role[] = Array.from(user.roles.cache.filter(role => check(role.name)).values())
    return found;
}