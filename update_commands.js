const { REST, Routes } = require('discord.js');
const { token, clientId } = require("./config.json");


const commands = [
    {
        name: 'game-poll',
        description: 'Create a poll for game preferences',
        options: [{
            "name": "time",
            "description": "How long (in seconds) to keep the poll open for",
            "type": 4,
            "required": "true",
        }]
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
        },
        {
            "name": "game-url",
            "description": "The URL of the game you're adding (optional, but recommended)",
            "type": 3,
            "required": "false",
        }]
    },
    {
        name: 'edit-poll-item',
        description: 'Edit a game on the game poll list',
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
        description: "Because why not",
        options: [{
            "name": "private",
            "description": "Should this bubble wrap be sent to the whole server (false), or just you (true)?",
            "type": 5,
            "required": "false",
        }],
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
    },
    {
        name: 'react-to-message',
        description: 'React to a message',
        options: [{
            "name": "message-link",
            "description": "The link of the message you want to react to",
            "type": 3,
            "required": "true",
        },
        {
            "name": "emoji",
            "description": "The emoji you want to react with. This can be an emoji name, or a emoji ID.",
            "type": 3,
            "required": "true",
        },
        {
            "name": "silent",
            "description": "Send a reply after reacting to the specified message (false), or do it silently (true)?",
            "type": 5,
            "required": "false",
        },]
    },
    {
        name: 'joke',
        description: 'Tell a joke. Powered by https://jokeapi.dev/',
        options: [{
            "name": "category",
            "description": "The joke category. This can be any of the following: any, misc, programming, pun, spooky, christmas",
            "type": 3,
            "required": "false",
        },
        {
            "name": "id",
            "description": "If you want to get a certain joke from the API, you can use its ID.",
            "type": 4,
            "required": "false",
        },
        {
            "name": "private",
            "description": "Send the joke to the whole server (false), or just to you (true)?",
            "type": 5,
            "required": "false",
        },]
    },
    {
        name: "inspirobot",
        description: "AI generated inspirational quotes for all!",
        options: [{
            "name": "private",
            "description": "Should this quote be sent to the whole server (false), or just you (true)?",
            "type": 5,
            "required": "false",
        }],
    },
    {
        name: 'compliment-random',
        description: 'Compliment someone.. Or end up roasting them..',
        options: [{
            "name": "person",
            "description": "Compliment this person",
            "type": 3,
            "required": "true",
        }],
    },
    {
        name: 'compliment',
        description: 'Compliment someone',
        options: [{
            "name": "person",
            "description": "Compliment this person",
            "type": 3,
            "required": "true",
        }],
    },
    {
        name: 'get-regretted',
        description: 'Absolutely roast someone 😈',
        options: [{
            "name": "person",
            "description": "Roast this person",
            "type": 3,
            "required": "true",
        }],
    },
    {
        name: "help",
        description: "See how many commands this bot is capable of! .. Oh yeah, and see what they do, too.",
    },
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(clientId), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
        console.log(commands);
    } catch (error) {
        console.error(error);
    }
})();