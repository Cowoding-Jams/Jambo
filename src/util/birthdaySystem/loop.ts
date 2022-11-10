import { Client, Guild } from "discord.js";
import { schedule } from "node-cron";
import { birthdayDb } from "../../db";
import { config } from "../../config";
import "dotenv/config";

export async function BirthdayMessage(client: Client) {
    if (!process.env.DEFAULT_GUILD) throw new Error("This error shouldn't accure... Something is wrong with the env.");
    let guild = await client.guilds.fetch(process.env.DEFAULT_GUILD)


    // fuck this
    for (let timezone = -12; timezone < 12; timezone++) {
        schedule(`0 0 ${12+timezone} * * *`, async () => {
            const birthdayUsers = birthdayDb.keyArray()
            const timezoneUsers = getUserWithTimeZone(`UTC${timezone == 0 ? "" : timezone}`, guild); 
            birthdayUsers.forEach((userid) => {
                if (timezoneUsers?.includes(userid)) return
                const entry = birthdayDb.get(userid)
                if (!entry) return
                const month = entry.month
                const day = entry.day

                if ()

            })
        })



    }


    schedule("0 0 12 * * * ", async () => {
        birthdayDb.keyArray().forEach((userid) => {
            const entry = birthdayDb.get(userid)
            if (!entry) return
            const month = entry.month
            const day = entry.day


        })
    })
}

function getUserWithTimeZone(timezone:string, guild:Guild) {
    return guild.roles.cache.find(role => role.name == timezone)?.members.map(m => m.user.id)
}