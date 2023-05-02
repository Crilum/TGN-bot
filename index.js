const { REST, Routes, ActionRowBuilder, Base, ButtonBuilder, ButtonStyle, Events, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, Client, GatewayIntentBits, Message, GuildMemberManager, BaseChannel, SelectMenuBuilder, User } = require('discord.js');
const { token, clientId, mongoURI } = require("./config.json");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const puppet = require('puppeteer');
const fs = require('fs');
const https = require('https');
const complimenter = require("complimenter");
let doc_to_edit, old_name, old_desc, old_link, filename;

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

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                // Consume response data to free up memory
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));

            }
        });
    });
}

async function compliment_random(self) {
    log("")
    log("Generating random compliment...")
    let userID = self.options.getString('person');
    let compliment_message = userID + ", " + complimenter("random");
    await self.reply(compliment_message);
    log('Compliment sent: "' + compliment_message + '"')
}

async function compliment_nice(self) {
    log("")
    log("Generating random nice compliment...")
    let userID = self.options.getString('person');

    let compliment = complimenter("nice");
    let compliment_message = userID + ", " + compliment;
    await self.reply(compliment_message);
    log('Compliment sent: "' + compliment_message + '"')
}

async function get_regretted(self) {
    log("")
    log("Generating random roast...")
    let userID = self.options.getString('person');

    let roast = complimenter("roast");
    let compliment_message = userID + ", " + roast;
    await self.reply(compliment_message);
    log('Roast sent: "' + compliment_message + '"')
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
            if (items[i].url != null) {
                gameList = gameList + `${letterEmojis[i]} **[${items[i].title}](${items[i].url})** (${items[i].desc})
`
            } else {
                gameList = gameList + `${letterEmojis[i]} **${items[i].title}** (${items[i].desc})
`
            }
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
        let new_url = interaction.options.getString("game-url")

        await mClient.connect()
        const collection = mClient.db("TGN").collection("game-list-items");
        let doc;
        if (new_url != null) {
            doc = { title: new_title, desc: new_desc, url: new_url }
        } else {
            doc = { title: new_title, desc: new_desc }
        }
        log(doc)
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

    if (interaction.commandName == "edit-poll-item") {
        if (checkAdmin(interaction) == 0) {
            const embed = new EmbedBuilder()
                .setColor(13801196)
                .setTitle('Whoa there..')
                .setDescription(`If you'd like to have a game edited on the poll, please ask an Admin. <:drink_water:1065817315695919105>`)
                .setTimestamp()
                .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
            await interaction.reply({ embeds: [embed], fetchReply: true })
            log("Somebody tried to remove a edit item without permissions.")
            return
        };
        mClient.connect(async err => {
            if (err) {
                log("Error connecting to MongoDB.")
                const embed = new EmbedBuilder()
                    .setColor(13801196)
                    .setTitle('Hold up...')
                    .setDescription(`There was an error connecting to the database!!`)
                    .setTimestamp()
                    .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
                interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: true });
                return
            }
        });
        log("Connected to MongoDB.")
        const modal = new ModalBuilder()
            .setCustomId('old_item_picker')
            .setTitle('Pick a game to edit:')
        const old_gameTitle = new TextInputBuilder()
            .setCustomId('old_gameTitle')
            .setLabel("The title of the game you want to edit:")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const old_docID = new TextInputBuilder()
            .setCustomId('old_docID')
            .setLabel("OR, you can use the Document ID:")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(old_gameTitle);
        const secondActionRow = new ActionRowBuilder().addComponents(old_docID);

        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow);
        await interaction.showModal(modal)

    }

    if (interaction.commandName == "bubble-wrap") {
        const private = interaction.options.getBoolean('private');

        const wrap = `||pop||||pop||||pop||||pop||||pop||
||pop||||pop||||pop||||pop||||pop||
||pop||||pop||||pop||||pop||||pop||
||pop||||pop||||pop||||pop||||pop||
||pop||||pop||||pop||||pop||||pop||
||pop||||pop||||pop||||pop||||pop||`

        if (private == true) {
            await interaction.reply({ content: wrap, fetchReply: true, ephemeral: true })
            log("Sent ephemeral bubble-wrap.")
        } else {
            await interaction.reply({ content: wrap, fetchReply: true, ephemeral: false })
            log("Sent bubble-wrap.")
        }
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
            values[i] = "<:wtr:1095807899479048336>"
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
            log("Sent find-the-octopus game ephemerally.")

        } else {
            await interaction.reply({ content: game, fetchReply: true, ephemeral: false })
            log("Sent find-the-octopus game.")
        }
    }

    if (interaction.commandName == "react-to-message") {
        const link = interaction.options.getString("message-link");
        const emoji = interaction.options.getString("emoji");
        const silent = interaction.options.getBoolean("silent");

        const linkArray = link
            .replace("https://discord.com/channels/", "")
            .split("/")
        const guildID = linkArray[0]
        const channelID = linkArray[1]
        const messageID = linkArray[2]
        log(`${channelID}, ${messageID}`)
        const guild = await client.guilds.fetch(guildID);
        const channel = guild.channels.cache.get(channelID);
        try {
            const message = await channel.messages.fetch(messageID)
                .then(function (message) { message.react(emoji) });
            if (silent == true) {
                log("Reacted silently.")
                interaction.deferReply();
                interaction.deleteReply();
                return
            } else {
                const embed = new EmbedBuilder()
                    .setColor(13801196)
                    .setTitle('Success!')
                    .setDescription(`Successfully reacted "${emoji}" to message \`${link}\`!!`)
                    .setTimestamp()
                    .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
                await interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: false })
                log(`Successfully reacted "${emoji}" to message "${link}"!!`)
            }
        } catch (e) {
            const embed = new EmbedBuilder()
                .setColor(13801196)
                .setTitle('Uh oh...')
                .setDescription(`Something weird happened! Here's the error:
\`\`\`
${e}
\`\`\``)
                .setTimestamp()
                .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
            await interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: false })
            log("Failed to react to message. Here's the error: " + e)
        }

    }

    if (interaction.commandName == "joke") {
        const privateOpt = interaction.options.getBoolean("private");
        const jokeID = interaction.options.getInteger("id");
        let category = interaction.options.getString("category");
        let joke, logMessage, embed;
        const categories = ["Any", "Misc", "Programming", "Pun", "Spooky", "Christmas"]

        if (jokeID == null && category == null) {
            let again = true;
            while (again == true) {
                joke = await fetch("https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit")
                    .then(interaction => interaction.json())
                if (joke.safe == true) {
                    again = false
                } else {
                    again = true
                }
            }
        } else if (jokeID != null) {
            if (jokeID > 319 || jokeID < 0) {
                const embed = new EmbedBuilder()
                    .setColor(13801196)
                    .setTitle('Hmm.. Different ID, please?')
                    .setDescription(`The range of english joke IDs is 0-319. Try another one.`)
                    .setTimestamp()
                    .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
                await interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: true })
                return
            }
            joke = await fetch("https://v2.jokeapi.dev/joke/Any?idRange=" + jokeID)
                .then(interaction => interaction.json())
            if (joke.safe == false) {
                const embed = new EmbedBuilder()
                    .setColor(13801196)
                    .setTitle('Maybe not that one...')
                    .setDescription(`That joke is not.. Uhmm.. *Allowed* in this server! Try another one.`)
                    .setTimestamp()
                    .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
                await interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: true })
                return
            }
        } else if (category != null) {
            for (let i = 0; i < categories.length; i++) {
                if (category.toLowerCase() == categories[i].toLowerCase()) {
                    category = categories[i]
                    break
                } else if (i == categories.length - 1) {
                    const embed = new EmbedBuilder()
                        .setColor(13801196)
                        .setTitle('Uh oh...')
                        .setDescription(`That's not a valid category! Here's a list of valid categories: \`any, misc, programming, pun, spooky, christmas\``)
                        .setTimestamp()
                        .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
                    await interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: true })
                    return
                }
            }

            let again = true;
            while (again == true) {
                joke = await fetch("https://v2.jokeapi.dev/joke/" + category)
                    .then(interaction => interaction.json())
                if (joke.safe == true) {
                    again = false
                } else {
                    again = true
                }
            }
        }
        if (joke.type == "twopart") {
            embed = new EmbedBuilder()
                .setColor(13801196)
                .setTitle('Joke')
                .setDescription(`${joke.setup}
...
||${joke.delivery}||

Category: \`${joke.category}\`, ID: \`${joke.id}\``)
                .setTimestamp()
                .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
            logMessage = `${joke.setup}\n...\n${joke.delivery}\n\nCategory: ${joke.category}\nID: ${joke.id}`;
        } else {
            embed = new EmbedBuilder()
                .setColor(13801196)
                .setTitle('Joke')
                .setDescription(`${joke.joke}\n\nCategory: \`${joke.category}\`, ID: \`${joke.id}\``)
                .setTimestamp()
                .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
            logMessage = `${joke.joke}\n\nCategory: ${joke.category}\nID: ${joke.id}`;
        }
        if (privateOpt == true) {
            await interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: true })
            log("Sent joke ephemerally:\n" + logMessage + "\n\nSafe? " + joke.safe)
        } else {
            await interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: false })
            log("Sent joke:\n" + logMessage + "\n\nSafe? " + joke.safe)
        }
    }

    if (interaction.commandName == "help") {
        const embed = new EmbedBuilder()
            .setColor(13801196)
            .setTitle('Commands')
            .setDescription(`\`**/game-poll**\` - *Sends a poll with all the games in the database.*
\`**/add-poll-item**\` - *Adds a game to the poll.*
\`**/remove-poll-item**\` - *Removes a game from the poll.*
\`**/edit-poll-item**\` - *Edits a game on the poll.*
\`**/bubble-wrap**\` - *Sends a bubble-wrap message.*
\`**/find-the-octopus**\` - *Sends a find-the-octopus game.*
\`**/react-to-message**\` - *Reacts to a message.*
\`**/inspirobot**\` - *Sends an InspiroBot quote.*
\`**/joke**\` - *Sends a joke.*
\`**/help**\` - *Sends this message.*`)
            .setTimestamp()
            .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
        interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: true })
    }

    if (interaction.commandName == "inspirobot") {
        await interaction.deferReply({ ephemeral: true })
        log("Launching Puppeteer...")
        await puppet.launch({ headless: "new" }).then(async browser => {
            //browser new page
            const p = await browser.newPage();
            //set viewpoint of browser page
            await p.setViewport({ width: 1920, height: 1080 })
            //launch URL
            log("Opening URL...")
            await p.goto('https://inspirobot.me/')
            const f = await p.$(".btn-generate")
            log("Generating quote...")
            await f.click()
            await sleep(2500)
            const img = await p.$(".generated-image")
            const src = await img.getProperty('src')
            const formattedSrc = `${src}`.split(':')[1] + ':' + `${src}`.split(':')[2]
            log("Downloading quote (URL: " + formattedSrc + ")...")
            filename = "./quotes/SPOILER_" + formattedSrc.split('/')[formattedSrc.split('/').length - 1]
            await downloadImage(formattedSrc, filename)
            log("Closing browser...")
            await browser.close()
        })

        const send = new ButtonBuilder()
            .setCustomId('send')
            .setLabel('Send it to the world! (Make it public)')
            .setStyle(ButtonStyle.Success);

        const sus = new ButtonBuilder()
            .setCustomId('sus')
            .setLabel('That be sus bro.. (Delete quote)')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(sus, send);

        log("Sending quote...")
        await interaction.editReply({ files: [filename], components: [row], ephemeral: true });


        log("Done!")
    }

    if (interaction.commandName === 'compliment-random') {
        await compliment_random(interaction);
    }

    if (interaction.commandName === 'compliment') {
        await compliment_nice(interaction);
    }

    if (interaction.commandName === 'get-regretted') {
        await get_regretted(interaction);
    }

});

// modals

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId == 'old_item_picker') {
        const collection = mClient.db("TGN").collection("game-list-items");
        const old_game_title = interaction.fields.getTextInputValue("old_gameTitle");
        const old_doc_id = interaction.fields.getTextInputValue("old_docID");
        if (old_game_title != null) {
            log(`Using game title...`)
            let findResult;
            try {
                findResult = await collection.findOne({ "title": old_game_title })
                log("Found result: " + findResult.title)
            } catch (err) {
                const embed = new EmbedBuilder()
                    .setColor(13801196)
                    .setTitle('Hold up...')
                    .setDescription(`There's no game with that title!!`)
                    .setTimestamp()
                    .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
                interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: true });
                log("Error: No game with that title.")
                return
            }
            doc_to_edit = findResult._id
            old_name = findResult.title
            old_desc = findResult.desc
            old_link = findResult.url
        } else if (old_doc_id != null) {
            log(`Using document ID...`)
            let findResult;
            try {
                findResult = await collection.findOne({ "_id": old_doc_id })
                log("Found result: " + findResult.title)
            } catch (err) {
                const embed = new EmbedBuilder()
                    .setColor(13801196)
                    .setTitle('Hold up...')
                    .setDescription(`There's no game with that Document ID!!`)
                    .setTimestamp()
                    .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
                interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: true });
                log("Error: No game with that Document ID.")
                return
            }
            doc_to_edit = findResult._id
            old_name = findResult.title
            old_desc = findResult.desc
            old_link = findResult.url
        } else {
            const embed = new EmbedBuilder()
                .setColor(13801196)
                .setTitle('Hold up...')
                .setDescription(`You didn't enter anything!!`)
                .setTimestamp()
                .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
            interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: true });
            log("Error: No valid game title or document ID entered.")
            return
        }

        const confirm = new ButtonBuilder()
            .setCustomId('confirmEdit')
            .setLabel(`Yep! Edit ${old_name}!`)
            .setStyle(ButtonStyle.Primary);

        const cancel = new ButtonBuilder()
            .setCustomId('cancelEdit')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(cancel, confirm);

        await interaction.reply({ content: `Found game with title \`${old_name}\`.\nAre you sure you want to edit it?`, components: [row], fetchReply: true, ephemeral: true });

    }

    if (interaction.customId == 'item_editor') {
        const collection = mClient.db("TGN").collection("game-list-items");
        const new_name = interaction.fields.getTextInputValue("gameTitle");
        const new_desc = interaction.fields.getTextInputValue("gameDesc");
        const new_link = interaction.fields.getTextInputValue("gameLink");
        const new_values = { $set: { title: new_name, desc: new_desc, url: new_link } };
        const updateResult = await collection.updateOne({ "_id": doc_to_edit }, new_values);
        if (updateResult.modifiedCount == 1) {
            const embed = new EmbedBuilder()
                .setColor(13801196)
                .setTitle('Success!')
                .setDescription(`Successfully updated the game!`)
                .setTimestamp()
                .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
            await interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: true });
            log(`Successfully updated game.\n\nTitle: ${new_name}\nDescription: ${new_desc}\nURL: ${new_link}}`)
        } else {
            const embed = new EmbedBuilder()
                .setColor(13801196)
                .setTitle('Hold up...')
                .setDescription(`There was an error updating the game!!`)
                .setTimestamp()
                .setFooter({ text: 'Sent by TGN', iconURL: 'https://github.com/Crilum/stuff/blob/main/tgn.jpg?raw=true' });
            await interaction.reply({ embeds: [embed], fetchReply: true, ephemeral: true });
            log("Error: Failed to update game.")
        }
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId == 'confirmEdit') {
        const modal = new ModalBuilder()
            .setCustomId('item_editor')
            .setTitle('Edit to your hearts content:');
        const gameTitle = new TextInputBuilder()
            .setCustomId('gameTitle')
            .setLabel("The title of the game:")
            .setValue(`${old_name}`)
            .setStyle(TextInputStyle.Short);
        const gameDesc = new TextInputBuilder()
            .setCustomId('gameDesc')
            .setLabel("The description of the game:")
            .setValue(`${old_desc}`)
            .setStyle(TextInputStyle.Paragraph);
        const gameLink = new TextInputBuilder()
            .setCustomId('gameLink')
            .setLabel("The link to the game:")
            .setValue(`${old_link}`)
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(gameTitle);
        const secondActionRow = new ActionRowBuilder().addComponents(gameDesc);
        const thirdActionRow = new ActionRowBuilder().addComponents(gameLink);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
        await interaction.showModal(modal);
        await interaction.deleteReply();
    }

    if (interaction.customId == 'cancelEdit') {
        await interaction.update({ content: `Cancelled edit.`, components: [], fetchReply: true, ephemeral: true });
        await interaction.deleteReply()
    }

    if (interaction.customId == 'send') {
        await interaction.reply({ files: [filename], components: [], fetchReply: true, ephemeral: false });
    }

    if (interaction.customId == 'sus') {
        fs.unlink(filename, (err) => {
            if (err) {
                log("Error deleting file: " + err)
            } else {
                log("Deleted file.")
            }
        });
        await interaction.update({ content: `Deleted quote.`, components: [], files: [], fetchReply: true, ephemeral: true });
    }
});

client.login(token);

module.exports = "./index.js";