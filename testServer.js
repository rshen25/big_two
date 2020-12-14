const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credential: true
    }
});
const GameRoom = require('./server/objects/gameRoom.js');
const Player = require('./server/objects/player.js');

let users = new Map();
let rooms = new Map();

// When a user connects to the server
io.on('connection', (socket) => {
    onConnect(socket);
});

http.listen(3000, function () {
    console.log(`Listening on ${http.address().port}`);
});

/**
 * Adds the client to the list of players connected, adds the event listeners for 
 * the client
 * @param {Socket} socket : socket object of the connected player
 */
function onConnect(socket) {
    let username = socket.handshake.query.data;
    console.log('A user connected: ' + username + ' ' + socket.id);
    let player = new Player(socket.id, username);
    users.set(socket.id, player);

    // Deal cards to players when button is pressed by host
    socket.on('startGame', (room, callback) => {
        callback(startGame(room));
    });

    // When a card is played by the client
    socket.on('playedCards', (cards, playerNumber, room, callback) => {
        cardPlayed(cards, socket.id, playerNumber, room, callback);
    });

    // When a client passes their turn
    socket.on('passTurn', playerPass);

    // When the client disconnects
    socket.on('disconnect', onDisconnect);

    socket.on('disconnectRoom', onDisconnectRoom);

    // When the client requests lobby information --- TODO: Add to the actual server
    socket.on('requestLobbyData', (callback) => {
        callback(getLobbyData());
    });

    // When the client wants to create a room --- TODO: Add to the actual server
    socket.on('createRoom', (username, callback) => {
        callback(createNewRoom(socket, username));
    });

    // When the client attempts to join a room
    socket.on('joinRoom', (room, callback) => {
        callback(joinRoom(socket, room));
    });
}

/**
 * When a user disconnects, deletes the player and their id
 * @param {Socket} socket : socket object for the given player that has disconnected
 */
function onDisconnect(socket) {
    io.emit('otherPlayerDisconnect', socket.id);
    GameManager.disconnectPlayer(socket.id);
}

function onDisconnectRoom(id, username, room) {

}

/**
 * Deals cards to all the connected players and sends their hands to the respective client
 */
function startGame(room) {
    // Find and get room
    let gameRoom = this.rooms.get(room);
    let players = gameRoom.getPlayers();

    if (gameRoom && players) {
        hands = gameRoom.dealCards();
        let handSizes = [];
        // Send the hands to each player
        players.forEach((player) => {
            io.to(player.id).emit('handDealt', player.getHand().hand);
            handSizes.push(player.getHand().hand.length);
        });

        io.to(room).emit('handSizes', handSizes);

        console.log('Server: Cards dealt');

        io.to(room).emit('nextTurn', 0);
        return true;
    }
    return false;
}

/**
 * Calls the Game Manager to check if the card the client has attempted to play is valid,
 * if so, it will remove the cards from the client's respective hand and send an 'ack'
 * letting the client know the play is valid and ending their turn. Also sends the
 * information to all the other players in the game
 * @param {Array} cards : An array of cards the client is intending to play
 * @param {integer} playerNumber : The player number of the client
 */
function cardPlayed(cards, id, playerNumber, room, callback) {
    let gameRoom = rooms.get(room);
    console.log(cards);
    // See if the play is valid
    if (gameRoom.playCards(cards, id, playerNumber)) {
        // Send the play to all other players
        callback(cards);

        // Check if the player has finished
        if (gameRoom.checkIfWon(playerNumber)) {
            let place = gameRoom.playerWon(playerNumber);
            io.to(id).emit('hasWon', place, gameRoom.getPlayerScore(playerNumber));
            if (place == 3) {
                let lastID = gameRoom.turnOrder[0];
                place = gameRoom.playerWon(GameManager.turnOrder[0]);
                io.to(lastID).emit('hasWon', place, gameRoom.getPlayerScoreByID(lastID));
                io.to(room).emit('gameOver', gameRoom.getScores());
            }
        }

        io.to(room).emit('otherPlayedCards', cards, id, playerNumber);
        io.to(room).emit('nextTurn', gameRoom.currentTurn, cards);
        console.log(`Last Played Turn: ${gameRoom.lastPlayedTurn}`);
    }
    else {
        callback([]);
        console.log(`Invalid play from ${id}`);
    }
}

/**
 * Passes the turn for the player, and send the action to the other clients acknowledge
 */
function playerPass(room) {
    let gameRoom = getRoom(room);
    // Send it to all players
    if (gameRoom) {
        let currentPlayerNumber = gameRoom.playPass();
        io.to(room).emit('nextTurn', currentPlayerNumber, gameRoom.lastPlayed);
    }
}

/**
 * TODO: Add to real server
 * Returns an array of all the rooms that have been created and have users in it
 * @returns {Array} : An array of all the rooms that are created
 */
function getLobbyData() {
    // Convert the room map to an array
    let data = [];
    console.log(`Number of rooms: ${rooms.size}, rooms: ${rooms}`);
    if (rooms.size > 0) {
        for (let room of rooms.values()) {
            data.push(room);
        }
    }
    return data;
}

/**
 * TODO: atrs
 * Creates a new room for the client to join
 * @param {Socket} socket : The socket of the player creating the room
 * @param {string} username : The username of the player creating the room
 * @returns {boolean} : True if the room was successfully created, false otherwise
 */
function createNewRoom(socket, username) {
    let player = users.get(socket.id);
    if (!player) {
        console.log(`Player ${socket.id} not found`);
        return false;
    }
    let newRoom = new GameRoom(player, username);
    if (!newRoom) {
        return false;
    }
    rooms.set(username, newRoom);

    // Add the player to the socket room
    socket.join(username);
    return true;
}

/**
 * TODO: atrs
 * Attempts to join the client to the given room, if possible
 * @param {Socket} socket : The socket of the joining player
 * @param {Room} room : The room we want to join
 */
function joinRoom(socket, room) {
    let roomToJoin = rooms.get(room);
    if (!roomToJoin) {
        return { status: false, room: undefined };
    }
    let player = users.get(socket.id);
    if (!player) {
        return { status: false, room: undefined };
    }

    if (!roomToJoin.addPlayer(player)) {
        return { status: false, room: undefined };
    }

    // Add the player's socket to the socket room
    socket.join(roomToJoin.username);
    io.to(roomToJoin.username).emit('onJoinRoom', player);
    return { status: true, room: roomToJoin.username, playerNumber: roomToJoin.getNumberPlayers() };
}

/**
 * Searches the player map for the given id, if found it will return the player object, otherwise null
 * @param {string} id : The id of the player we are looking for
 */
function getPlayer(id) {
    let player = this.users.get(id);
    if (!player) {
        console.log(`${id} not found`);
        return null;
    }
    return player;
}

/**
 * Seartches the room map for the given room name, if found it will return the room object, otherwise null
 * @param {string} roomName : The name of the room we are searching for
 */
function getRoom(roomName) {
    let room = this.rooms.get(roomName);
    if (!room) {
        console.log(`${roomName} not found`);
        return null;
    }
    return room;
}