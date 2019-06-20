// TODO: Maybe can modify the object directly without child sprite.
import * as Assets from '../assets';
import RopeObject from '../objects/ropeObject';

export default class PlayerObject extends Phaser.Sprite {
  private gravity: number;
  private readonly jumpPower;
  private readonly jumpBoostCountMax = 64;
  private jumpBoostCount = 0;
  private readonly wallReleaseCountMax = 8;
  private wallReleaseCount = 0;
  private wallReleaseLeft = false;

  private ropeObj: RopeObject;
  private animState = 'idle';

  public player: Phaser.Sprite;
  public spawnPoint: Phaser.Point;

  /**
  * Sprites are the lifeblood of your game, used for nearly everything visual.
  *
  * At its most basic a Sprite consists of a set of coordinates and a texture that is rendered to the canvas.
  * They also contain additional properties allowing for physics motion (via Sprite.body), input handling (via Sprite.input),
  * events (via Sprite.events), animation (via Sprite.animations), camera culling and more. Please see the Examples for use cases.
  *
  * @param game A reference to the currently running game.
  * @param x The x coordinate (in world space) to position the Sprite at.
  * @param y The y coordinate (in world space) to position the Sprite at.
  * @param key This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture or PIXI.Texture. If this argument is omitted, the sprite will receive {@link Phaser.Cache.DEFAULT the default texture} (as if you had passed '__default'), but its `key` will remain empty.
  * @param frame If this Sprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
  */
  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, gravity: number) {
    super(game, 0, 0);
    // Init player.
    this.spawnPoint = spawnPoint;
    this.player = this.game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Spritesheets.SpritesheetsRabbit20020020.getName());
    this.player.animations.add('idle', [0], 1, true, true);
    this.player.animations.add('run', [0, 1, 2, 3, 4], 10, true, true);
    this.player.animations.add('up', [5, 6, 7, 8, 9], 15, true, true);
    this.player.animations.add('down', [10, 11, 12, 13, 14], 15, true, true);
    for(let i = 0; i < 5; i++)
      this.player.animations.add(`air${i}`, [15 + i], 15, true, true);
    //this.player = this.game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Images.ImagesPlayer.getName());
    this.player.anchor.setTo(0.5);
    this.player.scale.setTo(0.4);
    this.game.physics.enable(this.player);
    this.player.body.gravity.y = gravity;
    this.player.body.setSize(100, 100, 50, 100);

    this.gravity = gravity;
    // Setup Constants.
    this.jumpPower = this.gravity / 3;
    // Inject this object to event loop.
    this.game.add.existing(this);
  }
  public update() {
    const keybd = this.game.input.keyboard;
    let vx = 0;
    const gravity = (this.gravity * this.game.time.elapsed / 1000);
    if (keybd.isDown(Phaser.Keyboard.W)) {
      // Up
      if (this.player.body.blocked.down || (this.wallReleaseCount > 0 &&
          (this.wallReleaseLeft && keybd.isDown(Phaser.Keyboard.D) ||
          !this.wallReleaseLeft && keybd.isDown(Phaser.Keyboard.A)))) {
        if (!this.player.body.blocked.down) {
          // Wall jump
          this.player.body.velocity.x = this.jumpPower * (this.wallReleaseLeft ? 1 : -1);
        }
        this.player.body.velocity.y = -this.jumpPower;
        // Jump
        this.jumpBoostCount = this.jumpBoostCountMax;
        this.wallReleaseCount = 0;
      } else if (this.jumpBoostCount > 0) {
        // Jump boost (if holding space)
        this.jumpBoostCount--;
        this.player.body.velocity.y -= gravity * Math.pow(this.jumpBoostCount / this.jumpBoostCountMax, 2);
      }
    }
    if (!keybd.isDown(Phaser.Keyboard.W) || this.player.body.blocked.up) {
      // Reset jump boost.
      this.jumpBoostCount = 0;
    }
    if (keybd.isDown(Phaser.Keyboard.S)) {
      // Down
      this.player.body.velocity.y += this.jumpPower / 10;
    }
    if (keybd.isDown(Phaser.Keyboard.A)) {
      // Left
      vx -= 50;
    }
    if (keybd.isDown(Phaser.Keyboard.D)) {
      // Right
      vx += 50;
    }
    if (keybd.isDown(Phaser.Keyboard.R)) {
      this.respawn();
    }
    if (this.player.body.blocked.left || this.player.body.blocked.right) {
      this.wallReleaseLeft = this.player.body.blocked.left;
      this.wallReleaseCount = this.wallReleaseCountMax;
    }
    if (this.wallReleaseCount > 0) {
      this.wallReleaseCount--;
      if (this.jumpBoostCount === 0) {
        const maxSlideSpeedY = 160;
        if (this.player.body.velocity.y > maxSlideSpeedY) {
          this.player.body.velocity.y *= 0.8;
        } else if (this.player.body.velocity.y < 0) {
          this.player.body.velocity.y -= gravity;
          this.player.body.velocity.y *= 0.8;
        }
      }
    }
    const moveSpeedFractionX = [0.92, 0.96, 1.2, 0.93, 0.91];
    const maxMoveSpeedX = 400;
    if (Math.abs(this.player.body.velocity.x) > maxMoveSpeedX) {
      vx = 0;
    } else if (Math.abs(this.player.body.velocity.x + vx) > maxMoveSpeedX) {
      vx = Math.sign(vx) * (maxMoveSpeedX - Math.abs(this.player.body.velocity.x));
    }
    this.player.body.velocity.x += vx;
    // Friction
    if (this.player.body.blocked.down) {
      this.player.body.velocity.x *= 0.9;
    }
    // Air friction
    this.player.body.velocity.x *= 0.99;
    this.player.body.velocity.y *= 0.99;
    // Motion
    if((this.game.input.keyboard.isDown(Phaser.Keyboard.A) || this.game.input.keyboard.isDown(Phaser.Keyboard.D)) && (this.player.body.blocked.down))
      this.player.body.velocity.x *= moveSpeedFractionX[this.player.animations.frame % 5];
    this.AnimationUpdate();
  }
  public getPlayer(): Phaser.Sprite {
    return this.player;
  }
  public setRopeObject(ropeObject: RopeObject) {
    this.ropeObj = ropeObject;
  }
  public respawn() {
    // Reset to spawn point. (Can be used as checkpoint)
    this.player.x = this.spawnPoint.x;
    this.player.y = this.spawnPoint.y;
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;
    this.ropeObj.ropeState = 'idle';
    // Add respawn effect.
    let respawn = this.game.add.sprite(this.player.x, this.player.y, Assets.Spritesheets.SpritesheetsRespawn25625625.getName())
    respawn.anchor.setTo(0.5);
    respawn.scale.set(0.6, 0.6);
    respawn.animations.add('anim', null, 24, true);
    respawn.animations.play('anim', null, false, true);
    // TODO: respawn all enemies.
  }
  public setRopeEnabled() {
    this.ropeObj.ropeEnabled = true;
  }
  private AnimationUpdate() {
    //console.log(`Onground: ${this.player.body.blocked.down}, state: ${this.animState}`);
    console.log(this.player.body.center);
    var onground = this.player.body.blocked.down;
    var moving = this.game.input.keyboard.isDown(Phaser.Keyboard.A) || this.game.input.keyboard.isDown(Phaser.Keyboard.D);
    if(moving && this.animState != 'run' && onground){
      this.animState = "run";
      this.player.animations.play(this.animState);
    } else if(!moving && onground && this.animState != 'idle') {
      this.animState = "idle";
      this.player.animations.play(this.animState);
    } else if (!onground) {
      const threshold = 180;
      let tooFast = Math.abs(this.player.body.velocity.y) > threshold;
      if(tooFast)
        this.animState = this.player.body.velocity.y < 0 ? "up" : "down";
      else if(Math.abs(this.player.body.velocity.y) < 0.2 * threshold)
        this.animState = "air2";
      else if(Math.abs(this.player.body.velocity.y) < 0.5 * threshold)
        this.animState = this.player.body.velocity.y < 0 ? "air1" : "air3";
      else
        this.animState = this.player.body.velocity.y < 0 ? "air0" : "air4";
      this.player.animations.play(this.animState);
    }


    this.player.scale.setTo((this.player.body.velocity.x > 0 ? -1 : 1) * Math.abs(this.player.scale.x), this.player.scale.y);

  }
}