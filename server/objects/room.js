/**
 * A Room object, representing a big two game room
 */ 

module.exports = class Room {
    constructor(id, username) {
        this.id = id;
        this.name = username;
        this.players = [id];
    }

    getNumberPlayers() {
        return this.players.length;
    }
}