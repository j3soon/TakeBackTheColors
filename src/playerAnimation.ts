import * as Assets from './assets';
import PlayerObject from './objects/playerObject';
import RopeObject from './objects/ropeObject';

export default class PlayerAnimation {
    // private player: PlayerObject;
    private animState: string;
    private game: any;
    public playerComp: Phaser.Sprite;
    private playerHand: Phaser.Sprite;
    // private rope: RopeObject;
    // private game: Phaser.Game;

    constructor(player: Phaser.Sprite, r: RopeObject, g: any) {
        this.game = g;
        this.animState = 'idle';
        this.playerComp = this.game.add.sprite(0, 0, Assets.Spritesheets.SpritesheetsRabbit20025055.getName());
        this.playerComp.anchor.setTo(0.5);
        this.playerComp.scale.setTo(0.4);
        this.playerComp.sendToBack();
        for (let i = 0; i < 13; i++)
            this.playerComp.moveUp();
        this.playerComp.animations.add('wallSlide', [35, 36, 37, 38], 15, true, true);
        this.playerComp.animations.play('wallSlide');

        player.animations.add('run', [0, 1, 2, 3, 4], 10, true, true);
        player.animations.add('up', [5, 6, 7, 8, 9], 15, true, true);
        player.animations.add('down', [10, 11, 12, 13, 14], 15, true, true);
        player.animations.add('idle', [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 10, true, true);
        player.animations.add('pull', [30, 31, 32, 33, 34], 15, true, true);
        player.animations.add('wallSlide', [39], 1, true, true);
        player.animations.add('ss', [40], 1, true, true);
        for (let i = 0; i < 5; i++)
            player.animations.add(`air${i}`, [45 + i], 15, true, true);
        player.animations.add('fs', [50, 51, 52, 53, 54], 15, true, true);
    }

    public State () {
        return this.animState;
    }

    public Update(moving: boolean, onground: boolean, leaning: boolean, ropeState: string, xvel: any, yvel: any, x: any, y: any, xscale: any, yscale: any, player_spr: Phaser.Sprite) {
        // Define signals
        let oldState = this.animState;
        if (this.animState === 'idle') {
            // idle -> standing_shoot, pull, air0, run
            if (ropeState === 'extend') this.animState = 'ss';
            else if (ropeState === 'shrink' || ropeState === 'burst') this.animState = 'pull';
            else if (!onground) this.animState = 'air2';
            else if (moving && onground) this.animState = 'run';
        } else if (this.animState === 'run') {
            // TODO: run -> (run_shoot), pull, air0, idle
            if (ropeState === 'shrink' || ropeState === 'burst') this.animState = 'pull';
            else if (!onground) this.animState = 'air2';
            else if (!moving && onground) this.animState = 'idle';
        } else if (this.animState === 'pull') {
            if (ropeState === 'idle' && onground && !moving) this.animState = 'idle';
            else if (ropeState === 'idle' && onground && moving) this.animState = 'run';
            else if (!onground && ropeState === 'idle') this.animState = 'air2';
            else if (leaning) this.animState = 'wallSlide';
        } else if (this.animState === 'ss') {
            if (ropeState === 'shrink' || ropeState === 'burst') this.animState = 'pull';
            else if (ropeState === 'idle' && onground && !moving) this.animState = 'idle';
            else if (ropeState === 'idle' && onground && moving) this.animState = 'run';
            else if (!onground) this.animState = 'air2';
        } else if (this.animState === 'wallSlide') {
            if (onground && !moving) this.animState = 'idle';
            else if (onground && moving) this.animState = 'run';
            else if ((ropeState === 'shrink' || ropeState === 'burst') && !leaning) this.animState = 'pull';
            else if (!leaning) this.animState = 'air2';
        } else if (this.animState === 'fs') {
            if (ropeState === 'extend' && onground) this.animState = 'ss';
            if (ropeState === 'idle' && onground) this.animState = 'idle';
            if (ropeState === 'idle' && !onground) this.animState = 'air2';
            else if (ropeState === 'shrink' || ropeState === 'burst') this.animState = 'pull';
        } else {
            // air#, up, down
            if (onground && !moving) this.animState = 'idle';
            else if (onground && moving) this.animState = 'idle';
            else if (leaning) this.animState = 'wallSlide';
            else if (ropeState === 'shrink' || ropeState === 'burst') this.animState = 'pull';
            else if (ropeState === 'extend') this.animState = 'fs';
            else {
                const threshold = 180;
                const tooFast = Math.abs(yvel) > threshold;
                if (tooFast)
                    this.animState = yvel < 0 ? 'up' : 'down';
                else if (Math.abs(yvel) < 0.2 * threshold)
                    this.animState = 'air2';
                else if (Math.abs(yvel) < 0.5 * threshold)
                    this.animState = yvel < 0 ? 'air1' : 'air3';
                else
                    this.animState = yvel < 0 ? 'air0' : 'air4';
            }
        }
        if (this.animState === 'wallSlide') {
            this.playerComp.visible = true;
            this.playerComp.x = x;
            this.playerComp.y = y;
            this.playerComp.scale.setTo(xscale, yscale);
        } else {
            this.playerComp.visible = false;
        }

        if (this.animState === 'pull') {
            player_spr.angle = Math.atan2(yvel, xvel) / Math.PI * 180 + (player_spr.scale.x > 0 ? 180 : 0);
        } else {
            player_spr.angle = 0;
        }

        /*if(moving && this.animState !== 'run' && onground){
            this.animState = "run";
            this.Play();
        } else if(!moving && onground && this.animState !== 'idle') {
            this.animState = "idle";
            this.Play();
        } else if (!onground) {
            const threshold = 180;
            let tooFast = Math.abs(this.player.player.body.velocity.y) > threshold;
            if(tooFast)
                this.animState = this.player.player.body.velocity.y < 0 ? "up" : "down";
            else if(Math.abs(this.player.player.body.velocity.y) < 0.2 * threshold)
                this.animState = "air2";
            else if(Math.abs(this.player.player.body.velocity.y) < 0.5 * threshold)
                this.animState = this.player.player.body.velocity.y < 0 ? "air1" : "air3";
            else
                this.animState = this.player.player.body.velocity.y < 0 ? "air0" : "air4";
            this.Play();
        }*/
        // if(this.animState !== oldState) this.Play(player);
        return this.animState !== oldState;
        // Facing
        // player.player.scale.setTo((player.player.body.velocity.x > 0 ? -1 : 1) * Math.abs(player.player.scale.x), player.player.scale.y);
    }

    private Play(player: PlayerObject) {
        player.player.animations.play(this.animState);
    }

}
