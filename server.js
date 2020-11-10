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

const GameManager = new gameManager();


io.on('connection', onConnect);

http.listen(3000, function () {
    console.log(`Listening on ${http.address().port}`);
});


function onConnect(socket) {
    console.log('A user connected: ' + socket.id);
    //gameManager.connectPlayer(socket.id);

    // TO DO: Dealing logic
    socket.on('dealCards', dealCards);

    // TO DO: when a card is played
    socket.on('cardPlayed', function (gameObject, isPlayerA) {
        io.emit('cardPlayed', gameObject, isPlayerA);
    });

    socket.on('disconnect', onDisconnect);
}

function onDisconnect(socket) {
    gameManager.disconnectPlayer(socket.id);

    // Remove the player from the list of connected players when they disconnect
    //players = players.filter(player => player !== socket.id);
}

function dealCards() {
    // hands = gameManager.dealCards();
    console.log('Server: Cards dealt');
}