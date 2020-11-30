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
const gameManager = require('./server/objects/gameManager.js');

let GameManager = new gameManager();

// When a user connects to the server
io.on('connection', onConnect);

http.listen(3000, function () {
    console.log(`Listening on ${http.address().port}`);
});

/**
 * Adds the client to the list of players connected, adds the event listeners for 
 * the client
 * @param {Socket} socket : socket object of the connected player
 */
function onConnect(socket) {
    if (GameManager.numberOfPlayers >= 4) {
        socket.emit('fullGame', 'Game is full');
        socket.disconnect();
    }
    else {
        console.log('A user connected: ' + socket.id);
        GameManager.connectPlayer(socket.id);
        io.to(socket.id).emit('playerNumber', GameManager.numberOfPlayers);

        // Deal cards to players when button is pressed by host
        socket.on('dealCards', startGame);

        // When a card is played by the client
        socket.on('playedCards', cardPlayed);

        // When a client passes their turn
        socket.on('passTurn', playerPass);

        // When the client disconnects
        socket.on('disconnect', onDisconnect);
    }
}

/**
 * When a user disconnects, deletes the player and their id
 * @param {Socket} socket : socket object for the given player that has disconnected
 */
function onDisconnect(socket) {
    io.emit('otherPlayerDisconnect', socket.id);
    GameManager.disconnectPlayer(socket.id);
}

/**
 * Deals cards to all the connected players and sends their hands to the respective client
 */
function startGame() {
    GameManager.resetGame();

    hands = GameManager.dealCards();
    let handSizes = [];
    // Send the hands to each player
    for (const id in GameManager.players) {
        io.to(id).emit('handDealt', GameManager.players[id].getHand().hand);
        handSizes.push(GameManager.players[id].getHand().hand.length);
    }
    io.emit('handSizes', handSizes);

    console.log('Server: Cards dealt');

    GameManager.generatePlayerOrder();

    io.emit('nextTurn', GameManager.currentTurn);
}

/**
 * Calls the Game Manager to check if the card the client has attempted to play is valid,
 * if so, it will remove the cards from the client's respective hand and send an 'ack'
 * letting the client know the play is valid and ending their turn. Also sends the
 * information to all the other players in the game
 * @param {Array} cards : An array of cards the client is intending to play
 * @param {integer} playerNumber : The player number of the client
 */
function cardPlayed(cards, id, playerNumber, callback) {
    console.log(cards);
    // Call the Game Manager to see if the play is valid
    if (GameManager.playCards(cards, id, playerNumber)) {
        // Send the play to all other players
        callback(cards);

        // Check if the player has finished
        if (GameManager.checkIfWon(id)) {
            let place = GameManager.playerWon(id);
            io.to(id).emit('hasWon', place, GameManager.getPlayerScore(id));
            if (place == 3) {
                let lastID = GameManager.turnOrder[0];
                place = GameManager.playerWon(GameManager.turnOrder[0]);
                io.to(lastID).emit('hasWon', place, GameManager.getPlayerScore(lastID));
                io.emit('gameOver', GameManager.getScores());
            }
        }

        io.emit('otherPlayedCards', cards, id, playerNumber);
        io.emit('nextTurn', GameManager.currentTurn, cards);
        console.log(`Last Played Turn: ${GameManager.lastPlayedTurn}`);
    }
    else {
        callback([]);
        console.log(`Invalid play from ${id}`);
    }
}

/**
 * Passes the turn for the player, and send the action to the other clients acknowledge
 */
function playerPass() {
    let currentPlayerNumber = GameManager.playPass();
    // Send it to all players
    io.emit('nextTurn', currentPlayerNumber, GameManager.lastPlayed);
}
