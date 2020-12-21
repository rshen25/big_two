/**
 * The main scene used for the game of Big Two
 */
import io from 'socket.io-client';
import Card from '../objects/card.js';
import Hand from '../objects/hand.js';
import Rules from '../objects/gameRules.js';
import PlayArea from '../objects/playArea.js';
import Button from '../objects/button.js';

export default class BigTwo extends Phaser.Scene {
    constructor() {
        super({
            key: 'BigTwo'
        });
        this.isHost = false;
        this.playerNumber = -1;
        this.cardsToBePlayed = [];
        this.westHand = null;
        this.northHand = null;
        this.eastHand = null;
        this.hands = [];
        this.gameRules = new Rules();
        this.turn = false;
        this.isGameStart = false;
    }

    init(data) {
        this.username = data.username;
        this.socket = data.socket;
        this.playerNumber = data.playerNumber;
        this.room = data.room;
        this.otherPlayers = data.players;
        if (this.playerNumber == 1) {
            this.isHost = true;
        }
    }

    preload() {
        // Pre-load in the playing cards into the client
        this.load.atlasXML('playingCards',
            'src/assets/sprites/playingCards.png',
            'src/assets/sprites/playingCards.xml');

        // Pre-load the card backs into the client
        this.load.atlasXML('cardBacks',
            'src/assets/sprites/playingCardBacks.png',
            'src/assets/sprites/playingCardBacks.xml');

        // Pre-load the button sprites
        this.load.atlas('redButton',
            'src/assets/sprites/redButton.png',
            'src/assets/sprites/redButton.json');

        this.load.atlas('yellowButton',
            'src/assets/sprites/yellowButton.png',
            'src/assets/sprites/yellowButton.json');
    }

    create() {
        let self = this;
        let width = this.scale.width;
        let height = this.scale.height;

        console.log(`Username : ${this.username}, PlayerNumber : ${this.playerNumber}, Room ${this.room}`);

        // Create play area
        this.playArea = new PlayArea(this, width / 2, height / 2,
            width / 2 - 100, height / 2 - 100);

        // Create the hands
        this.hand = new Hand(width / 2, height - 50, width * 0.75, 100);
        this.westHand = new Hand(50, height / 2, 100, height * 0.6);
        this.northHand = new Hand(width / 2, 50, width * 0.75, 100);
        this.eastHand = new Hand(width - 50, height / 2, 100, height * 0.6);

        this.hands.push(this.westHand);
        this.hands.push(this.northHand);
        this.hands.push(this.eastHand);

        // Draw player hand
        this.hand.renderOutline(this);

        /*
         * Create zones for other player hands
         */
        // west player
        this.westHand.renderOutline(this);

        // north player
        this.northHand.renderOutline(this);

        // east player
        this.eastHand.renderOutline(this);

        // Set the player numbers for the hands
        this.hand.playerNumber = this.playerNumber;
        let pNumber = this.playerNumber;
        this.westHand.playerNumber = (++pNumber % 5 === 0) ? ++pNumber % 5 : pNumber % 5;
        this.northHand.playerNumber = (++pNumber % 5 === 0) ? ++pNumber % 5: pNumber % 5;
        this.eastHand.playerNumber = (++pNumber % 5 === 0) ? ++pNumber % 5: pNumber % 5;

        let players = [];
        for (let i = 1; i < 4; i++) {
            pNumber++;
            if (pNumber % 5 == 0) {
                pNumber = 1;
            }
            players.push(pNumber);
        }

        let style = {
            fontSize: 18, fontFamily: 'Trebuchet MS', color: '#ffffff'
        };
        let usernameTextStyle = { fontSize: 14, fontFamily: 'Trebuchet MS', color: '#ffffff' }
        // Add username text for the main client
        this.usernameText = this.add.text(10, height - 50, this.username, usernameTextStyle);
        this.westUsernameText = this.add.text(10, 100, '', usernameTextStyle);
        this.northUsernameText = this.add.text(150 , 110, '', usernameTextStyle);
        this.eastUsernameText = this.add.text(width - 90, 100, '', usernameTextStyle);

        this.usernameTexts = [this.westUsernameText, this.northUsernameText, this.eastUsernameText];

        // Set the username for players that are already in the room
        console.log('Other Players: ' + this.otherPlayers);
        if (this.otherPlayers) {
            this.otherPlayers.forEach((player) => {
                this.setUsernames(player.username, player.playerNumber);
            });
        }

        // Create a deal cards button to start dealing cards to the players
        this.dealBtn = new Button(self, width / 2, height / 2, 'redButton',
            "red_button_normal.png", "red_button_pressed.png", "red_button_hover.png",
            'START GAME', style);
        this.dealBtn.setButtonScale(0.7, 0.7);
        if (this.isHost) {
            this.dealBtn.setVisible(true);
        }
        else {
            this.dealBtn.setVisible(false)
        }

        this.dealBtn.on('pointerdown', () => { this.startGame(); });

        /**
         * Create the play cards button
         */
        style = { fontSize: 16, fontFamily: 'Trebuchet MS' };
        this.playBtn = new Button(self, width - 50, height - 80, 'yellowButton',
            "yellow_button_normal.png", "yellow_button_pressed.png", "yellow_button_hover.png",
            'PLAY', style);
        this.playBtn.setButtonScale(0.5, 0.5);

        this.playBtn.on('pointerdown', this.playCards, this);

        /**
         * Create the pass turn button
         */
        this.passBtn = new Button(self, width - 50, height - 30, 'yellowButton',
            "yellow_button_normal.png", "yellow_button_pressed.png", "yellow_button_hover.png",
            'PASS', style);
        this.passBtn.setButtonScale(0.5, 0.5);

        this.passBtn.on('pointerdown', this.passTurn, this);

        this.togglePlayPassButtons();

        /**
         * Create the leave room button
         */
        this.leaveRoomBtn = new Button(self, width - 50, 30, 'redButton',
            "red_button_normal.png", "red_button_pressed.png", "red_button_hover.png",
            'LEAVE ROOM', style);

        this.leaveRoomBtn.setButtonScale(0.5, 0.5);

        this.leaveRoomBtn.on('pointerdown', self.leaveRoom, self);

        /******************************
         * Server listener code
         *****************************/
        this.socket.on('onJoinRoom', (username, playerNumber) => {
            self.setUsernames(username, playerNumber);
        });

        this.socket.on('playerNumber',  (playerNumber) => {
            self.playerNumber = playerNumber;
            if (self.playerNumber == 1) {
                self.dealBtn.setVisible(true);
                self.dealBtn.setInteractive();
            }
        });

        // TODO: remove player from others players and remove their username
        this.socket.on('otherPlayerDisconnect', (username) => {
            console.log(`User ${username} left.`);
        });

        this.socket.on('otherPlayerLeave', (username, playerNumber) => {
            this.removePlayer(username, playerNumber);
        });

        this.socket.on('otherPlayedCards', (cards, id, playerNumber) => {
            this.otherPlayedCards(cards, id, playerNumber);
        });

        this.socket.on('playedCards', (response) => {
            this.validPlay(response);
        });

        this.socket.on('nextTurn', (id, lastPlayed) => { this.checkIfTurn(id, lastPlayed); });

        // Get the player's hand from the server and add the cards to the hand and 
        // draw them onto the scene 
        this.socket.on('handDealt', (data) => {
            this.isGameStart = true;
            this.toggleLeaveButton();
            let spriteName;
            let startX = self.hand.x - (data.length * 25 / 2);
            for (let i = 0; i < data.length; i++) {
                spriteName = self.getSpriteNameOfCard(data[i].value, data[i].suit);

                let card = new Card(self,
                    (startX) + (i * 25),
                    self.hand.y,
                    'playingCards',
                    spriteName,
                    data[i].value,
                    data[i].suit,
                    data[i].suitValue);
                self.hand.add(card);
            }
        });

        // Get the other player's hand sizes and draw the cards onto the scene
        this.socket.on('handSizes', (handSizes) => {
            handSizes.splice(self.playerNumber, 1);
            let key = 'cardBacks';
            let spriteName = 'cardBack_red1.png';
            if (handSizes.length >= 1) {
                // Add and draw west player hand
                let start = self.westHand.y - (self.westHand.height / 2) + 30;
                for (let i = 0; i < handSizes[0]; i++) {
                    let card = new Card(self,
                        self.westHand.x,
                        start + ((self.westHand.height / (handSizes[0] + 1)) * i),
                        key,
                        spriteName,
                        -1, -1, -1)
                        .setAngle(-90);
                    card.disableInteractive();
                    self.westHand.add(card);
                }
            }

            if (handSizes.length >= 2) {
                // Add and draw north player hand
                let start = self.northHand.x - (self.northHand.width / 2) + 30;
                for (let i = 0; i < handSizes[1]; i++) {
                    let card = new Card(self,
                        start + ((self.northHand.width / (handSizes[1] + 1)) * i),
                        self.northHand.y,
                        key,
                        spriteName,
                        -1, -1, -1)
                        .setAngle(180);
                    card.disableInteractive();
                    self.northHand.add(card);
                }
            }
            if (handSizes.length >= 3) {
                // Add and draw east player hand
                let start = self.eastHand.y - (self.eastHand.height / 2) + 30;
                for (let i = 0; i < handSizes[2]; i++) {
                    let card = new Card(self,
                        self.eastHand.x,
                        start + ((self.eastHand.height / (handSizes[2] + 1)) * i),
                        key,
                        spriteName,
                        -1, -1, -1)
                        .setAngle(90);
                    card.disableInteractive();
                    self.eastHand.add(card);
                }
            }
        });

        // When the client has finished emptying their hand
        this.socket.on('hasWon', (place, score) => { this.hasWon(place, score) });

        this.socket.on('gameOver', (scores) => { this.gameOver(scores) });
    }

    update() {

    }

    /**
     * Sends a message to the server to make it deal the deck of cards to all players in
     * the current game
     */
    startGame() {
        this.socket.emit('startGame', this.room, (response) => {
            if (response && response === true) {
                this.dealBtn.disableInteractive();
                this.dealBtn.setVisible(false);
                console.log("Client: Cards Dealt");
            }
            else {
                console.log('Failed to deal cards');
            }
        });
    }

    /**
     * Attempts to play the cards the player has selected, if valid a request will be 
     * sent to the server for further validation before it will actually be played
     */
    playCards() {
        // Get selected cards
        let selectedCards = this.hand.getSelectedCards();

         // If it can be played, send it to the server for further processing
        if (this.gameRules.checkIfValidPlayHand(selectedCards)) {
            // Prepare the card data to be sent to server
            let cards = [];

            for (let i = 0; i < selectedCards.length; i++) {
                cards.push(selectedCards[i].stringify());
            }

            this.socket.emit('playedCards', cards, this.playerNumber, this.room,
                (response) => {
                    this.validPlay(response);
                });
            // Disable the hand
            this.hand.disableHand();
        }
        // else, display message - Invalid Play
        else {
            console.log('Invalid Play');
        }
    }

    /**
     * Remove the cards from the hand
     * @param {Array} cards
     */
    removeCards(cards) {
        if (cards.length != 0) {
            this.hand.findAndRemoveCards(cards);
            this.hand.enableHand();
        }
    }

    /**
     * Passes the turn of the player and sends a message to the server of the passed turn
     */
    passTurn() {
        this.turn = false;
        this.socket.emit('passTurn', this.room);
        this.togglePlayPassButtons();
    }

    /**
     * Toggles the play and pass buttons to on or off depending if it is the client's turn
     */
    togglePlayPassButtons() {
        if (this.turn) {
            this.playBtn.enable();
            this.passBtn.enable();
        }
        else {
            this.playBtn.disable();
            this.passBtn.disable();
        }
    }

    /**
    * Toggles the leave room button depending if it is the game has started
    */
    toggleLeaveButton() {
        if (this.isGameStart) {
            this.leaveRoomBtn.disable();
            this.leaveRoomBtn.setVisibility(false);
        }
        else {
            this.leaveRoomBtn.enable();
            this.leaveRoomBtn.setVisibility(true);
        }
    }

    onConnect(username) {
        console.log('Connected!');
    }

    /**
     * Checks if the current turn is the clients
     * @param {integer} playerNumber : The current turn's player number
     * @param {Array} lastPlayed : The cards that were last played by a player
     */
    checkIfTurn(id, lastPlayed) {
        console.log(`Received: ${id}, ${lastPlayed}`);
        if (lastPlayed) {
            this.gameRules.setLastPlayed(lastPlayed);
        }
        this.gameRules.incrementTurn();

        if (id == this.socket.id) {
            this.turn = true;
            // Enable the play and pass buttons
            this.togglePlayPassButtons();
        }
    }

    /**
     * Removes the cards from the client's last play from its hand
     * @param {Array} cards : Array of cards the client has played
     */
    validPlay(cards) {
        let cardsToMove = this.hand.getSelectedCards();
        if (cards === undefined || cards.length == 0) {
            this.hand.enableHand();
        }
        else {
            this.gameRules.setLastPlayed(cards);
            this.gameRules.incrementTurn();
            this.removeCards(cards);

            // Add the cards to the play area
            this.playArea.addCards(cardsToMove);
            console.log(this.playArea.getLastPlayed());

            // Re-size the hand
            this.refreshHand();
            this.turn = false;
            this.togglePlayPassButtons();
        }
    }

    /**
     * Finds the hand of the given player number
     * @param {integer} playerNumber : The player number we are looking for
     * @returns {Hand} : The hand of the corresponding player number
     */
    getHand(playerNumber) {
        for (let i = 0; i < this.hands.length; i++) {
            if (this.hands[i].playerNumber == playerNumber) {
                return this.hands[i];
            }
        }
        return null;
    }

    /**
     * When another player plays cards, it will remove the cards from their hand.
     * @param {Array} cards : An array of cards the player has played
     * @param {string} id : The socket id of the player who played the card
     * @param {integer} playerNumber : The player number of the other player
     */
    otherPlayedCards(cards, id, playerNumber) {
        if (playerNumber == this.playerNumber) {
            return;
        }
        // Find the hand with the corresponding player number
        let hand = this.getHand(playerNumber);
        if (!hand) {
            console.log(`Player ${playerNumber} not found`);
            return;
        }

        if (hand.isEmpty()) {
            console.log('Error: Hand is empty');
            return;
        }

        // Remove the cards from their hand
        let count = cards.length;
        for (let i = 0; i < count; i++) {
            hand.pop().destroy();
        }

        // Display the cards in the middle of the board
        if (cards) {
            let cardsToShow = [];
            // Create the new cards
            for (let i = 0; i < cards.length; i++) {
                let spriteName = this.getSpriteNameOfCard(cards[i].value, cards[i].suit);
                cardsToShow.push(new Card(this, 0, 0, 'playingCards',
                    spriteName,
                    cards[i].value,
                    cards[i].suit,
                    cards[i].suitValue).disableInteractive());
            }
            this.playArea.addCards(cardsToShow);
        }

        console.log(`${id} played ${cards}`);
    }

    /**
     * Determines the name of the card sprite used to show the card in the scene 
     * @param {integer} value : The value of the card based on the game rules
     * @param {string} suit : The suit of the card
     * @returns {string} : The name of the sprite or image file
     */
    getSpriteNameOfCard(value, suit) {
        let spriteName;
        switch (value) {
            case 11:
                spriteName = `card${suit}J.png`;
                break;
            case 12:
                spriteName = `card${suit}Q.png`;
                break;
            case 13:
                spriteName = `card${suit}K.png`;
                break;
            case 14:
                spriteName = `card${suit}A.png`;
                break;
            case 17:
                spriteName = `card${suit}2.png`;
                break;
            default:
                spriteName = `card${suit}${value}.png`;
                break;
        }
        return spriteName;
    }

    /**
     * Checks if the client's hand is empty if so, then it has finished
     * @returns {boolean} : True if we have won and the hand is empty, false otherwise
     */
    checkWinCondition() {
        return this.hand.isEmpty();
    }

    /**
     * Displays a message to the client showing they have finished the game at which place
     * and the scores of the other players
     * @param {integer} place : The place the client has placed in (1st, 2nd, 3rd, 4th) or -1
     *                          if the client has not actually won.
     * @param {Array} scores : An array of the scores for each player in the game
     */
    hasWon(place, scores) {
        this.turn = false;
        this.togglePlayPassButtons();
        console.log(`You placed in position ${place}!`);
        console.log(`Your score: ${scores}`);
    }

    /**
     * When the game is over, it will show the scores and enables the start new game button
     */
    gameOver(scores) {
        // Display scores
        console.log(scores);
        // Show deal cards button if host
        if (this.playerNumber == 1) {
            this.dealBtn.setInteractive().setVisible(true);
        }
        this.turn = false;
        this.isGameStart = false;
        this.togglePlayPassButtons();
        this.toggleLeaveButton();
    }

    /**
     * Emits to the server to leave the current Big Two room, if ack is received then the client
     * will go back to the lobby
     */
    leaveRoom() {
        this.socket.emit('leaveRoom', this.room, (response) => {
            if (response === true) {
                this.room = undefined;
                this.playerNumber = 0;
                // Go back to the lobby
                this.scene.start('Lobby');
            }
        });
    }

    /**
     * Sets the username text display for the player
     * @param {string} username : The username of the player
     * @param {integer} playerNumber : The player number of the player
     */
    setUsernames(username, playerNumber) {
        console.log(`${username} has joined the room as player ${playerNumber}.`);
        for (let i = 0; i < this.hands.length; i++) {
            if (this.hands[i].playerNumber == playerNumber) {
                this.usernameTexts[i].setText(username);
                console.log(`Username set for player ${i + 1}`);
                break;
            }
        }
    }

    /**
     * Removes a player from the game
     * @param {string} username : The username of the player we are removing
     * @param {integer} playerNumber : The player number of the player we are removing
     */
    removePlayer(username, playerNumber) {
        // Remove the player from the other player's list
        for (let i = 0; i < this.otherPlayers.length; i++) {
            if (this.otherPlayers[i].username == username &&
                this.otherPlayers[i].playerNumber == playerNumber) {
                this.otherPlayers.splice(i, 1);
            }
        }
        // Remove the player's username from the game scene
        this.setUsernames('', playerNumber);
    }

    refreshHand() {
        let cards = this.hand.getHand();
        let startX = this.hand.x - (cards.length * 25 / 2);
        for (let i = 0; i < cards.length; i++) {
            cards[i].setX((startX) + (i * 25));
        }
    }
}