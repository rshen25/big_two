/**
 * Basic Server to handle the game logic for our Big Two game
 * Uses Socket.io to handle communications between server and clients
 **/
//import express from 'express';
//import io from 'socket.io';
//import http from 'http';
import GameManager from './public/js/gameManager.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

/**
*const app = express();
*const server = http.Server(app);
*const gameManager = new GameManager();
*const socketIO = io();
*/

let players = {};

socketIO.listen(server);
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

socketIO.on('connection', onConnect);


server.listen(8080, function () {
	console.log(`Listening on ${server.address().port}`);
});

/**
 * Called when a user connects to the server
 * @param {any} socket
 */
function onConnect(socket) {
	gameManager.connectPlayer(socket.id);

	// Send the players object to the new player
	socket.emit('currentPlayers', players);

	// Update all other players of the new player
	socket.broadcast.emit('newPlayer', players[socket.id]);

	socket.on('disconnect', onDisconnect);
}

/**
 * Called when a user disconnects from the server
 */
function onDisconnect() {
	gameManager.disconnectPlayer(socket.id);

	// Emit a message to all players to remove this player
	socketIO.emit('disconnect', socket.id);
}