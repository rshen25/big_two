/**
 * A Room object, representing a big two game room
 */
const GameManager = require("./gameManager");

 

module.exports = class Room {
    constructor(player, username) {
        this.id = player.id;
        this.username = username;
        this.players = [player];
        this.gameManager = new GameManager();
    }

    /**
     * Attempts to add the player into the room
     * @param {Player} player : The player we would like to add to the room
     * @returns {boolean} : True if the player is able to join the room, false otherwise
     */
    addPlayer(player) {
        if (this.getNumberPlayers >= 4) {
            console.log('Room is full unable to join');
            return false;
        }
        this.players.push(player);
        return true;
    }

    /**
     * Returns the players in the room
     * @returns {Array} : An array of players in the room
     */
    getPlayers() {
        return this.players;
    }

    /**
     * 
     */
    getNumberPlayers() {
        return this.players.length;
    }
}