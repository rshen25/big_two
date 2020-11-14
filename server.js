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

io.on('connection', onConnect);

http.listen(3000, function () {
    console.log(`Listening on ${http.address().port}`);
});

function onConnect(socket) {
    console.log('A user connected: ' + socket.id);
    GameManager.connectPlayer(socket.id);
    io.to(socket.id).emit('playerNumber', GameManager.numberOfPlayers);

    // Deal cards to players when button is pressed by host
    socket.on('dealCards', dealCards);

    // TO DO: when a card is played
    socket.on('cardPlayed', function (gameObject, isPlayerA) {
        io.emit('cardPlayed', gameObject, isPlayerA);
    });

    socket.on('disconnect', onDisconnect);
}

function onDisconnect(socket) {
    GameManager.disconnectPlayer(socket.id);
    io.emit('otherPlayerDisconnect', socket.id);
}

function dealCards() {
    hands = GameManager.dealCards();
    let handSizes = [];
    // Send the hands to each player
    for (const id in GameManager.players) {
        io.to(id).emit('handDealt', GameManager.players[id].hand.hand);
        handSizes.push(GameManager.players[id].hand.hand.length);
    }
    io.emit('handSizes', handSizes);

    console.log('Server: Cards dealt');
}