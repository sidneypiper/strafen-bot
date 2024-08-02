import {Events, Routes} from "discord.js";
import {initDiscordClient, COMMANDS} from "./Helpers";

const clientId = process.env.DC_CLIENT_ID;

initDiscordClient().then(client => {
    client.on(Events.ClientReady, async readyClient => {
        console.log('Starting refreshing application (/) commands.')
        readyClient.rest.put(Routes.applicationCommands(clientId), {
            body: COMMANDS.map(c => c.payload())
        })
            .then(() => console.log('Successfully refreshed application (/) commands.'))
            .catch(console.error)
            .finally(() => process.exit())
    })
})


