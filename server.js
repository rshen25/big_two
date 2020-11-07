const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http);

let players = [];

io.on('connection', onConnect);

http.listen(3000, function () {
    console.log('Server started!');
});

function onConnect(socket) {
    console.log('A user connected: ' + socket.id);

    players.push(socket.id);

    if (players.length === 1) {
        io.emit('isPlayerA');
    }

    // TO DO: Dealing logic
    socket.on('dealCards', function () {
        io.emit('dealCards');
    });

    // TO DO: when a card is played
    socket.on('cardPlayed', function (gameObject, isPlayerA) {
        io.emit('cardPlayed', gameObject, isPlayerA);
    });

    socket.on('disconnect', onDisconnect);
}

function onDisconnect(socket) {
    console.log('A user disconnected: ' + socket.id);

    // Remove the player from the list of connected players when they disconnect
    players = players.filter(player => player !== socket.id);
}