/**
 * The lobby screen, where the user can create a new game room or join an existing one
 */
import Button from '../objects/button.js';

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

        let style = {
            fontSize: 18, fontFamily: 'Trebuchet MS', color: "0xffffff"
        };

        /**
         * Create the join room and create room buttons
         */
        this.joinRoomBtn = new Button(self, width - 200, 50, 'redButton',
            'red_button_normal.png', 'red_button_pressed.png', 'red_button_hover.png',
            'JOIN ROOM', style);
        this.joinRoomBtn.setButtonScale(0.5, 0.5);

        this.createRoomBtn = new Button(self, width - 100, 150, 'redButton',
            'red_button_normal.png', 'red_button_pressed.png', 'red_button_hover.png',
            'CREATE ROOM', style);
        this.createRoomBtn.setButtonScale(0.5, 0.5);

        this.createRoomBtn.on(Phaser.Input.Events.POINTER_DOWN, this.createRoom);
    }

    update() {

    }

    createRoom() {

    }
}