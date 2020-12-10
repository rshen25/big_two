/**
 * A Room object, representing a big two game room
 */ 

module.exports = class Room {
    constructor(player, username) {
        this.id = player.id;
        this.username = username;
        this.players = [player];
    }

    addUser(player) {
        this.players.push(player);
    }

    getNumberPlayers() {
        return this.players.length;
    }
}