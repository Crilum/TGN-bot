const { REST, Routes, ActionRowBuilder, Base, ButtonBuilder, ButtonStyle, Events, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, Client, GatewayIntentBits, Message, GuildMemberManager, BaseChannel, SelectMenuBuilder, User } = require('discord.js');
const { token, clientId, mongoURI } = require("./config.json");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const commands = [
    {
        name: 'game-poll',
        description: 'Create a poll for game preferences',
    },
    {
        name: 'add-poll-item',
        description: 'Add a game to the game poll list',
        options: [{
            "name": "game-title",
            "description": "The title of the game you're adding",
            "type": 3,
            "required": "true",
        },
        {
            "name": "game-description",
            "description": "A description of the game you're adding",
            "type": 3,
            "required": "true",
        }]
    },
    {
        name: 'remove-poll-item',
        description: 'Remove a game from the game poll list',
        options: [{
            "name": "game-title",
            "description": "The title of the game you're removing",
            "type": 3,
            "required": "false",
        },
        {
            "name": "document-id",
            "description": "The database document ID of the game you're removing",
            "type": 3,
            "required": "false",
        }]
    },
    {
        name: "bubble-wrap",
        description: "Because why not"
    },
    {
        name: "find-the-octopus",
        description: "Find the octopus in a sea of fish!",
        options: [{
            "name": "private",
            "description": "Should this puzzle be sent to the whole server (false), or just you (true)?",
            "type": 5,
            "required": "false",
        }],
    }
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(clientId), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.on('ready', () => {
    console.log(colorize("green", "Ready!"), colorize("yellow", `Logged in as ${client.user.tag}`));
});

const mClient = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Start bot code

const colors = {
    yellow: "\x1b[33m",
    blue: "\x1b[36m",
    red: "\x1b[31m",
    grey: "\x1b[38;5;254m",
    green: "\x1b[38;5;47m",
    NC: "\x1b[0m"
}

function colorize(color, message) {
    if (color == "blue") {
        return `${colors.blue}${message}${colors.NC}`
    } else if (color == "yellow") {
        return `${colors.yellow}${message}${colors.NC}`
    } else if (color == "red") {
        return `${colors.red}${message}${colors.NC}`
    } else if (color == "grey") {
        return `${colors.grey}${message}${colors.NC}`
    } else if (color == "green") {
        return `${colors.green}${message}${colors.NC}`
    } else {
        console.log(`${colors.yellow}Warning: ${colors.red}Garbage color argument!${colors.NC}`)
        return `${message}`
    }
}

function current_date() {
    let currentDate = new Date();
    let day = currentDate.getDate();
    let month = currentDate.getMonth() + 1;
    let year = currentDate.getFullYear();
    let date = `${month}-${day}-${year}`
    let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds() + ":" + currentDate.getMilliseconds();
    return `${time} ${date} ~ `
}

function log(message) {
    console.log(colorize("grey", current_date()), colorize("blue", message));
}

function checkAdmin(interaction) {
    if (interaction.user.id == "1059185655764242452" || interaction.user.id == "509848210311741452") {
        return 1
    } else {
        return 0
    }
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'game-poll') {
        const letterEmojis = [
            '🇦',
            "🇧",
            "🇨",
            "🇩",
            "🇪",
            "🇫",
            "🇬",
            "🇭",
            "🇮",
            "🇯",
            "🇰",
            "🇱",
            "🇲",
            "🇳",
            "🇴",
            "🇵",
            "🇶",
            "🇷",
            "🇸",
            "🇹",
            "🇺",
            "🇻",
            "🇼",
            "🇽",
            "🇾",
            "🇿",
        ]

        await mClient.connect();
        const collection = mClient.db("TGN").collection("game-list-items");
        let items = await collection.find({}).toArray();
        let gameList = `**Choose as many as you would like**:

`
        for (let i = 0; i < items.length; i++) {
            gameList = gameList + `${letterEmojis[i]} **${items[i].title}** (${items[i].desc})
`

        }
        mClient.close()
        const embed = new EmbedBuilder()
            .setColor(13801196)
            .setTitle('Which game should we play?')
            .setDescription(gameList)
            .setTimestamp()
            .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        log("Poll sent. Now adding reactions...")
        for (let i = 0; i < (gameList.split(/\r\n|\r|\n/).length - 3); i++) {
            log("Reacted with: " + letterEmojis[i])
            await message.react(letterEmojis[i])
        }
        log("Sucessfully reacted with " + (gameList.split(/\r\n|\r|\n/).length - 3) + " reactions.")
    }

    if (interaction.commandName == "add-poll-item") {
        if (checkAdmin(interaction) == 0) {
            const embed = new EmbedBuilder()
                .setColor(13801196)
                .setTitle('Whoa there..')
                .setDescription(`If you'd like to add a game to the poll, post it in <#1059506924481167433> and ping the Admin role.
We can't wait to see what games you find!!`)
                .setTimestamp()
                .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
            await interaction.reply({ embeds: [embed], fetchReply: true })
            log("Error: Someone tried to add a game without permissions.")
            return
        };
        let new_title = interaction.options.getString('game-title');
        let new_desc = interaction.options.getString('game-description');
        await mClient.connect()
        const collection = mClient.db("TGN").collection("game-list-items");
        let doc = { title: new_title, desc: new_desc }
        try {
            const result = await collection.insertOne(doc);
            log(`Sucessfully added game "${new_title}"!`)
            const embed = new EmbedBuilder()
                .setColor(13801196)
                .setTitle('Success!')
                .setDescription(`Added \`${new_title}\` with document ID \`${result.insertedId}\`!!`)
                .setTimestamp()
                .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
            await interaction.reply({ embeds: [embed], fetchReply: true })
        } catch (e) {
            log(`Something weird happened... Error: "${e}"`)
            const embed = new EmbedBuilder()
                .setColor(13801196)
                .setTitle('Hold up...')
                .setDescription(`Something weird happened... Error: \`${e}\``)
                .setTimestamp()
                .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
            await interaction.reply({ embeds: [embed], fetchReply: true })
        }
        mClient.close();
    }

    if (interaction.commandName == "remove-poll-item") {
        if (checkAdmin(interaction) == 0) {
            const embed = new EmbedBuilder()
                .setColor(13801196)
                .setTitle('Whoa there..')
                .setDescription(`If you'd like to have a game removed from the poll, please ask an Admin. <:drink_water:1065817315695919105>`)
                .setTimestamp()
                .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
            await interaction.reply({ embeds: [embed], fetchReply: true })
            log("Somebody tried to remove a poll item without permissions.")
            return
        };
        let game_title = interaction.options.getString('game-title');
        let doc_id = interaction.options.getString('document-id');
        await mClient.connect()
        const collection = mClient.db("TGN").collection("game-list-items");

        log(`Got game title "${game_title}" and document ID "${doc_id}"`)
        if (doc_id != null) {
            log("Using document ID...")
            const findResult = await collection.findOne({ "_id": new ObjectId(doc_id) })
            log(findResult)
            if (findResult == null) {
                const embed = new EmbedBuilder()
                    .setColor(13801196)
                    .setTitle('Hold up...')
                    .setDescription(`There's no game with that document ID!!`)
                    .setTimestamp()
                    .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
                await interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: true })
                log("Error: No game with that Document ID.")
                return
            }
            const doc_to_remove = findResult._id
            const removed_name = findResult.title

            const doc = { _id: doc_to_remove }
            const result = await collection.deleteOne(doc);
            if (result.deletedCount === 1) {
                log(`Sucessfully deleted document ID ${doc_id}`)
                const embed = new EmbedBuilder()
                    .setColor(13801196)
                    .setTitle('Success!')
                    .setDescription(`Deleted game\`${removed_name}\`, with document ID \`${doc_to_remove}\`!!`)
                    .setTimestamp()
                    .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
                await interaction.reply({ embeds: [embed], fetchReply: true })
            } else {
                const embed = new EmbedBuilder()
                    .setColor(13801196)
                    .setTitle('Hold up...')
                    .setDescription(`Apperently there weren't any database documents with that name/ID.... If you get this message *something* is wrong!!
||This error has already been checked, so.. :eyes:||`)
                    .setTimestamp()
                    .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
                await interaction.reply({ embeds: [embed], fetchReply: true })
                log("Error: No game with that Document ID.\n\nThis is a Level 2 error.. Weird..")
            }

        } else if (game_title != null) {
            log(`Using game title...`)
            const findResult = await collection.findOne({ "title": game_title })
            if (findResult == null) {
                const embed = new EmbedBuilder()
                    .setColor(13801196)
                    .setTitle('Hold up...')
                    .setDescription(`There's no game with that title!!`)
                    .setTimestamp()
                    .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
                await interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: true })
                log("Error: No game with that title.")
                return
            }
            const doc_to_remove = findResult._id
            const removed_name = findResult.title

            const doc = { _id: doc_to_remove }
            const result = await collection.deleteOne(doc);
            if (result.deletedCount === 1) {
                log(`Sucessfully deleted game "${game_title}"`)
                const embed = new EmbedBuilder()
                    .setColor(13801196)
                    .setTitle('Success!')
                    .setDescription(`Deleted game \`${removed_name}\`, with document ID \`${doc_to_remove}\`!!`)
                    .setTimestamp()
                    .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
                await interaction.reply({ embeds: [embed], fetchReply: true })
                log(`Deleted game \`${removed_name}\`, with document ID \`${doc_to_remove}\`.`)
            } else {
                const embed = new EmbedBuilder()
                    .setColor(13801196)
                    .setTitle('Hold up...')
                    .setDescription(`Apperently there weren't any database documents with that name/ID.... If you get this message *something* is wrong!!
||This error has already been checked, so.. :eyes:||`)
                    .setTimestamp()
                    .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
                await interaction.reply({ embeds: [embed], fetchReply: true })
                log("Error: No game with that Document ID.\n\nThis is a Level 2 error.. Weird..")
            }

        } else {
            const embed = new EmbedBuilder()
                .setColor(13801196)
                .setTitle('Hold up...')
                .setDescription(`You didn't specify the **name of a game** *or* a **Document ID**!!`)
                .setTimestamp()
                .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
            await interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: true })
            log("Error: No name or ID specified.")
            return
        }
        mClient.close();
    }

    if (interaction.commandName == "bubble-wrap") {
        interaction.reply(`||pop||||pop||||pop||||pop||||pop||
||pop||||pop||||pop||||pop||||pop||
||pop||||pop||||pop||||pop||||pop||
||pop||||pop||||pop||||pop||||pop||
||pop||||pop||||pop||||pop||||pop||
||pop||||pop||||pop||||pop||||pop||`)
        log("Sent bubble-wrap.")
    }

    if (interaction.commandName == "find-the-octopus") {
        const privateOpt = interaction.options.getBoolean('private');

        let values = [
            "", "", "", "", "", "", "", "",
            "", "", "", "", "", "", "", "",
            "", "", "", "", "", "", "", "",
            "", "", "", "", "", "", "", "",
            "", "", "", "", "", "", "", "",
            "", "", "", "", "", "", "", "",
            "", "", "", "", "", "", "", "",
            "", "", "", "", "", "", "", "",
        ]

        for (let i = 0; i < 8; i++) {
            values[i] = ":ocean:"
        }

        for (let i = 8; i < 64; i++) {
            values[i] = "<:wtr:1095807899479048336>"//<:water:1095804110151880745>"
        }
        for (let i = 8; i < 64; i++) {
            if (Math.ceil(Math.random() * 3) == 2) {
                let fish_num = `${Math.ceil(Math.random() * 7)}`
                switch (fish_num) {
                    case "1":
                        values[i] = "<:a:1095810182879129681>";
                        break;
                    case "2":
                        values[i] = "<:a:1095817210523549796>";
                        break;
                    case "3":
                        values[i] = "<:a:1095814417997889607>";
                        break;
                    case "4":
                        values[i] = "<:a:1095815258448339086>";
                        break;
                    case "5":
                        values[i] = "<:a:1095814692594794506>";
                        break;
                    case "6":
                        values[i] = "<:a:1095814987877978275>";
                        break;
                    case "7":
                        values[i] = "<:a:1095809091487682610>";
                        break;
                }
            }
        }
        values[Math.ceil(Math.random() * 64)] = "<:fsh:1095817170333736990>"
        const game = `||${values[0]}||||${values[1]}||||${values[2]}||||${values[3]}||||${values[4]}||||${values[5]}||||${values[6]}||||${values[7]}||
||${values[8]}||||${values[9]}||||${values[10]}||||${values[11]}||||${values[12]}||||${values[13]}||||${values[14]}||||${values[15]}||
||${values[16]}||||${values[17]}||||${values[18]}||||${values[19]}||||${values[20]}||||${values[21]}||||${values[22]}||||${values[23]}||
||${values[24]}||||${values[25]}||||${values[26]}||||${values[27]}||||${values[28]}||||${values[29]}||||${values[30]}||||${values[31]}||
||${values[32]}||||${values[33]}||||${values[34]}||||${values[35]}||||${values[36]}||||${values[37]}||||${values[38]}||||${values[39]}||
||${values[40]}||||${values[41]}||||${values[42]}||||${values[43]}||||${values[44]}||||${values[45]}||||${values[46]}||||${values[47]}||
||${values[48]}||||${values[49]}||||${values[50]}||||${values[51]}||||${values[52]}||||${values[53]}||||${values[54]}||||${values[55]}||
||${values[56]}||||${values[57]}||||${values[58]}||||${values[59]}||||${values[60]}||||${values[61]}||||${values[62]}||||${values[63]}||`

        if (privateOpt == true) {
            await interaction.reply({ content: game, fetchReply: true, ephemeral: true })
        } else {
            await interaction.reply({ content: game, fetchReply: true, ephemeral: false })
        }
        log("Sent find-the-octopus game.")
    }
});

client.login(token);

module.exports = "./index.js";