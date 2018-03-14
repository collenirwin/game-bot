const fs = require("fs");
const states = require("./states");

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

module.exports = class Hangman {
    constructor() {
        this.isActive = false;
        this.state = 0;
        this.word = "";
        this.guesses = [];
        
        // read word list file into this.words, capitalize every word
        this.words = fs.readFileSync("words.txt", "utf8")
            .split("\r\n")
            .map(x => x.toUpperCase());
    }
    
    /**
     * Start a new game of Hangman
     * @param {string} user user who initiated the game
     * @param {number} [letters] number of letters in the selected word
     */
    startGame(user, letters) {
        // number of letters was specified
        if (letters) {
            letters = parseInt(letters)
            
            if (isNaN(letters)) {
                return { error: `I don't think that's a number, <@${user}>.` };
            }
            
            // get all words that are of length 'letters'
            const nLetterWords = this.words.filter(x => x.length === letters);
            
            if (nLetterWords.length === 0) {
                return { error: `Sorry <@${user}>, I don't have a word with that many letters.` };
            }
            
            // grab a random word from our filtered list
            this.word = nLetterWords[Math.floor(Math.random() * nLetterWords.length)]
        }
        else {
            // grab a random word from our word list
            this.word = this.words[Math.floor(Math.random() * this.words.length)]
        }
        
        this.isActive = true;
        this.state = 0;
        this.guesses = [];
        
        return this.fullResult(`Game of Hangman started by <@${user}>!`);
    }
    
    guess(user, guess) {
        let won = false;
        let lost = false;
        let right = false;
        let letter = true;
        
        // there's no game running
        if (!this.isActive) {
            return { error: "No game of hangman is currently active. Type **!hangman** to start a game." };
        }
        
        // no guess given
        if (!guess) {
            return { error: `You forgot to tell me your guess, <@${user}>.` };
        }
        
        // guess was already given earlier
        if (this.guesses.includes(guess)) {
            return { error: `"${guess}" has already been guessed, <@${user}>.` };
        }
        
        // guessed a character
        if (guess.length === 1) {
            // guess is not a letter
            if (!ALPHA.includes(guess)) {
                return { error: `No numbers or symbols in your guess please, <@${user}>.` };
            }
            
            // keep track of that guess
            this.guesses.push(guess);
            
            // good guess
            if (this.word.includes(guess)) {
                right = true;
                won = this.gameWon();
            }
        }
        else { // guessed a word
            won = this.word === guess;
            letter = false;
            
            // keep track of that guess
            this.guesses.push(guess);
        }
        
        // advance the state if we have to
        if (!won && !right) {
            this.state++;
        }
        
        // 9th stage is the end of the road
        lost = this.state === 9;
        
        // are we still playing?
        this.isActive = !won && !lost;
        
        // i'm very sorry
        const message = won
            ? `<@${user}> won the game for everyone! The word was **"${this.word}"**`
            : lost
                ? `<@${user}> lost the game for everyone! The word was **"${this.word}"**`
                : right
                    ? `***Right!*** "${guess}" is in it, <@${user}>.`
                    : letter
                        ? `***Wrong!*** "${guess}" is not in the word, <@${user}>.`
                        : `***Wrong!*** The word isn't "${guess}", <@${user}>.`;
        
        return this.fullResult(message);
    }
    
    /**
     * Returns true if every letter in the word has been guessed
     */
    gameWon() {
        return this.word.split("").every(x => this.guesses.includes(x));
    }
    
    /**
     * Generates _'s (underscores) for each letter in this.word that hasn't been guessed yet
     */
    genBlanks() {
        return this.word
            .split("")
            .reduce((t, x) => t + (this.guesses.includes(x) ? x : "_") + " ", "");
    }
    
    /**
     * Returns a result object that contains a message, board, word, and guesses
     * @param {string} message message to go at the top of the result
     */
    fullResult(message) {
        return {
            message: message,
            board: states[this.state],
            word: "Word: " + this.genBlanks(),
            guesses: "Guesses: " + this.guesses.join(" ")
        }
    }
    
    /**
     * Concatenates all of the fields of a result object
     * @param {*} result result object
     */
    stringifyResult(result) {
        if (result.error) {
            return result.error;
        }
        
        return result.message + "\r\n" +
            result.board + "\r\n" +
            "```" + result.word + "```\r\n" +
            "```" + result.guesses + "```";
    }
}