/**
 * The lobby screen, where the user can create a new game room or join an existing one
 */
import Button from '../objects/button.js';
import io from 'socket.io-client';

const Random = Phaser.Math.Between;

const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

export default class Lobby extends Phaser.Scene {
    constructor() {
        super({
            key: 'Lobby'
        });
    }
    preload() {
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

        /**
         * Create the join room and create room buttons
         */

        let style = {
            fontSize: 18, fontFamily: 'Trebuchet MS', color: "0xffffff"
        };

        /**
         * Create grid table to show the rooms
         */
        let config = {
            x: width / 2,
            y: 300,
            width: width - 100,
            height: height - 100,
            scrollMode: 0,
            backgroundColour: '0x2dad4e',
            cellWidth: undefined,
            cellHeight: 50,
            columns: 1,
            sliderBarColour: '0x1a5c2b',
            sliderNubColour: '0x36854b',
            header: 'Available Rooms',
        }

        this.roomTable = this.rexUI.add.gridTable({
            x: config.x,
            y: config.y,
            width: (config.scrollMode === 0) ? config.width : 420,
            height: (config.scrollMode === 0) ? config.height : 300,

            scrollMode: config.scrollMode,

            background: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, config.backgroundColour),

            table: {
                cellWidth: (config.scrollMode === 0) ? undefined : 60,
                cellHeight: (config.scrollMode === 0) ? 60 : undefined,

                columns: config.columns,

                mask: {
                    padding: 2,
                },

                reuseCellContainer: true,
            },

            slider: {
                track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, config.sliderBarColour),
                thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 13, config.sliderNubColour),
            },

            header: this.rexUI.add.label({
                width: (config.scrollMode === 0) ? undefined : 30,
                height: (config.scrollMode === 0) ? 30 : undefined,

                orientation: config.scrollMode,
                background: this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, config.sliderBarColour),
                text: this.add.text(0, 0, config.header),
            }),

            footer: this.rexUI.add.sizer({
                orientation: 0
            }).add(
                new Button(self, 0, 0, 'yellowButton',
                    'yellow_button_normal.png', 'yellow_button_pressed.png', 'yellow_button_hover.png',
                    'CREATE ROOM', style)
                    .setInteractive()
                    .on('pointerdown', function () {
                        self.createRoom();
                    }),
                0,         // proportion
                'center'   // align
            ).add(new Button(self, 0, 0, 'yellowButton',
                'yellow_button_normal.png', 'yellow_button_pressed.png', 'yellow_button_hover.png',
                'REFRESH', style).setInteractive().on('pointerdown', () => {
                    self.requestLobbyData();
                }),
                0,         // proportion
                'center'),   // align

            space: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,

                table: 10,
                header: 10,
                footer: 10,
            },

            createCellContainerCallback: function (cell, cellContainer) {
                let scene = cell.scene,
                    width = cell.width,
                    height = cell.height,
                    item = cell.item;
                if (cellContainer === null) {
                    cellContainer = scene.rexUI.add.label({
                        width: width,
                        height: height,

                        orientation: config.scrollMode,
                        background: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 0).setStrokeStyle(2, config.sliderBarColour),
                        text: scene.add.text(0, 0, ''),

                        space: {
                            left: (config.scrollMode === 0) ? 15 : 0,
                            top: (config.scrollMode === 0) ? 0 : 15,
                        }
                    });
                }

                // Set properties from item value
                cellContainer.setMinSize(width, height); // Size might changed in this demo
                cellContainer.getElement('text').setText(`${item.username}\'s Game`); // Set text of text object
                cellContainer.getElement('background').setStrokeStyle(2, COLOR_DARK).setDepth(0);
                return cellContainer;
            },
            items: []
        })
            .layout()

        this.roomTable.on('cell.over', (cellContainer, cellIndex, pointer) => {
            cellContainer.getElement('background')
                .setStrokeStyle(2, COLOR_LIGHT)
                .setDepth(1);
        }, this)
            .on('cell.out', (cellContainer, cellIndex, pointer) => {
                cellContainer.getElement('background')
                    .setStrokeStyle(2, COLOR_DARK)
                    .setDepth(0);
            }, this)
            .on('cell.2tap', (cellContainer, cellIndex, pointer) => {
                let roomID = cellContainer.text.split("\'");
                console.log(roomID[0]);
                this.joinRoom(roomID[0]);
            }, this);

        /**
         * Get username from html header
         */
        let query = location.href.split("?")[1];
        if (query) {
            let id = query.split("&")[0];
            this.username = id;
        }
        this.username = 'testUser';

        this.socket = io("http://localhost:3000");

        this.requestLobbyData();

    }

    update() {

    }

    /**
     * Creates a room for the player, makes them host and sends the player to the room
     */
    createRoom() {
        // Signal to the server that we would like to create a new room
        this.socket.emit('createRoom', this.socket, this.username, (isCreated) => {
            // The server creates the room and sends an ack that the room is created, switch to new room
            if (isCreated) {
                this.startBigTwo(this.username, 1);
            }
            else {
                console.log('Room creation failed');
            }
        });
    }

    /**
     * Attempts to join an existing room
     * @param {Room} room : The room we want to join, consists of the room's data we want to join
     */
    joinRoom(room) {
        let user = { socket: this.socket, username: this.username };
        // Attempt to join the room
        this.socket.emit('joinRoom', user, room, (response) => {
            // If room is joinable, join it and switch scenes
            if (response.status) {
                console.log(`Joining ${response.room}`);
                this.room = response.room;
                this.startBigTwo(this.room, response.playerNumber);
            }
            else {
                console.log('Failed to join room');
            }
        });
    }

    /**
     * Request the lobby information 
     */
    requestLobbyData() {
        this.socket.emit('requestLobbyData', (data) => {
            this.refreshLobby(data);
        });
    }

    /**
     * Refreshes the room table with the new data, if provided
     * @param {Array} data : The array we want to update the lobby list with
     */
    refreshLobby(data) {
        console.log(`Received: ${data}`);
        if (data || data.length > 0) {
            this.roomTable.setItems(data);
        }
        this.roomTable.refresh();
    }

    /**
     * Starts the Big Two game scene
     * @param {Room} room : The name of the Big Two room
     * @param {integer} playerNumber : The player number of the player when they join the room
     */
    startBigTwo(room, playerNumber) {
        this.scene.start('BigTwo', {
            username: this.username, socket: this.socket,
            room: room, playerNumber: playerNumber
        });
    }
}