const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http);
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

    /**********************************************
    * Lobby event listeners
    *********************************************/
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

    // When the client disconnects
    socket.on('disconnect', onDisconnect);

    socket.on('logout', () => {
        onLogout(socket);
    });

    /**********************************************
     * Room event listeners
     *********************************************/
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

    // When a client leaves a room
    socket.on('leaveRoom', (room, callback) => {
        callback(onLeaveRoom(socket, room));
    });
}

/**
 * When a user disconnects, deletes the player and their id
 * @param {Socket} socket : socket object for the given player that has disconnected
 */
function onDisconnect(socket) {
    // remove them from the 
    // Log the user out
    // io.emit('otherPlayerDisconnect', socket.id);
    // GameManager.disconnectPlayer(socket.id);
}

/********************************************************
 * Lobby events
 *******************************************************/
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
        for (let gameRoom of rooms.values()) {
            data.push(gameRoom.roomID);
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
    let player = getPlayer(socket.id);
    if (!player) {
        console.log(`Player ${socket.id} not found`);
        return false;
    }
    let newRoom = new GameRoom(player, username);
    if (!newRoom) {
        return false;
    }
    player.setPlayerNumber(1);
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
    let roomToJoin = getRoom(room);
    if (!roomToJoin || roomToJoin.getNumberPlayers() >= 4 || roomToJoin.isInProgress) {
        return { status: false, room: undefined };
    }
    let player = getPlayer(socket.id);
    if (!player) {
        return { status: false, room: undefined };
    }

    if (!roomToJoin.addPlayer(player)) {
        return { status: false, room: undefined };
    }

    // Add the player's socket to the socket room
    player.setGameRoom(room);
    player.setPlayerNumber(roomToJoin.getNumberPlayers());
    socket.join(roomToJoin.roomID);
    io.to(roomToJoin.roomID).emit('onJoinRoom', player);
    return { status: true, room: roomToJoin.roomID, playerNumber: roomToJoin.getNumberPlayers() };
}

function onLogout(socket) {
    // Remove the user from the list of users
    users.delete(socket.id);

    // TODO: Log out and redirect to login - on non-test server
    console.log('logged out');
    onDisconnect(socket);
}

/********************************************************
 * Room events
 *******************************************************/
/**
 * Deals cards to all the connected players and sends their hands to the respective client
 */
function startGame(room) {
    // Find and get room
    let gameRoom = getRoom(room);

    if (gameRoom) {
        let players = gameRoom.getPlayers();
        if (!players || players.length < 2) {
            return false;
        }
        hands = gameRoom.startGame();
        let handSizes = [];
        // Send the hands to each player
        players.forEach((player) => {
            io.to(player.id).emit('handDealt', player.getHand().hand);
            handSizes.push(player.getHand().hand.length);
        });

        io.to(gameRoom.roomID).emit('handSizes', handSizes);
        console.log('hand sizes dealt');

        console.log('Server: Cards dealt');

        io.to(gameRoom.roomID).emit('nextTurn', gameRoom.currentTurn);
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
    let gameRoom = getRoom(room);
    console.log(cards);
    console.log(`PlayerNumber: ${playerNumber} played`)
    // See if the play is valid
    if (gameRoom.playCards(cards, playerNumber)) {
        // Send the play to all other players
        callback(cards);

        // Check if the player has finished
        if (gameRoom.checkIfWon(playerNumber)) {
            let place = gameRoom.playerWon(playerNumber);
            io.to(id).emit('hasWon', place, gameRoom.getPlayerScore(playerNumber));
            if (place == 3) {
                let lastID = gameRoom.turnOrder[0];
                place = gameRoom.playerWon(gameRoom.turnOrder[0]);
                io.to(lastID).emit('hasWon', place, gameRoom.getPlayerScoreByID(lastID));
                io.to(gameRoom.roomID).emit('gameOver', gameRoom.getScores());
            }
        }

        io.to(gameRoom.roomID).emit('otherPlayedCards', cards, id, playerNumber);
        io.to(gameRoom.roomID).emit('nextTurn', gameRoom.getCurrentPlayerTurn(), cards);
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
        io.to(gameRoom.roomID).emit('nextTurn', currentPlayerNumber, gameRoom.lastPlayed);
    }
}

/**
 * Searches the player map for the given id, if found it will return the player object, otherwise null
 * @param {string} id : The id of the player we are looking for
 */
function getPlayer(id) {
    let player = users.get(id);
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
    let room = rooms.get(roomName);
    if (!room) {
        console.log(`${roomName} not found`);
        return null;
    }
    return room;
}

/**
 * When a client leaves a room
 * @param {Socket} socket : The socket of the client
 * @param {string} room : The name of the room the client is leaving from
 * @returns {boolean} : Returns true if the leave operation was successful, false otherwise
 */
function onLeaveRoom(socket, room) {
    socket.leave(room);
    let client = getPlayer(socket.id);
    if (!client) {
        return false;
    }
    client.setGameRoom(undefined);
    return true;
}