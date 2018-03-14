const discord = require("discord.js");
const token = require("./token");
const Hangman = require("./hangman");

const hangman = new Hangman();
const bot = new discord.Client();

bot.login(token);

bot.on("ready", () => {
    console.log("game-bot is ready for action");
});

bot.on("error", (error) => {
    console.log("game-bot can't start. Here's the exception:\r\n " + error.message);
    bot.destroy();
});

bot.on("message", (message) => {
    // check for undefined or invalid message
    if (!message || !message.content || message.length < 1) {
        return;
    }
    
    // if the message is a command (starts with !)
    if (message.content.startsWith("!")) {

        // format message
        message.content = message.content.substring(1).trim().toUpperCase();

        if (message.content === "HELP") {
            message.channel.send(
                "**game-bot commands**\r\n" +
                "**!hangman <?word size>** - begin a game of hangman (optionally with a specific word size)\r\n" +
                "  **!guess <letter>** - guess a letter (requires active hangman game)\r\n" +
                "  **!guess <word>** - guess a word (requires active hangman game)"
            );

        }
        else if (message.content.startsWith("HANGMAN")) {
            // start a game
            const result = hangman.startGame(message.author.id, message.content.split(" ")[1]);
            
            // send the message, game board, etc or error message
            message.channel.send(hangman.stringifyResult(result));
        }
        else if (message.content.startsWith("GUESS")) {
            // make a guess
            const result = hangman.guess(message.author.id, message.content.split(" ")[1]);
            
            // send the message, game board, etc or error message
            message.channel.send(hangman.stringifyResult(result));
        }
    }
});