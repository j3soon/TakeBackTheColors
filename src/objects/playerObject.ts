// TODO: Maybe can modify the object directly without child sprite.
import * as Assets from '../assets';

export default class PlayerObject extends Phaser.Sprite {
  private readonly jumpPower = 1800 / 2;

  public player: Phaser.Sprite;

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
  constructor(game: Phaser.Game, x: number, y: number, gravity: number) {
    super(game, 0, 0);
    // Init player.
    this.player = this.game.add.sprite(x, y, Assets.Images.ImagesPlayer.getName());
    this.player.anchor.setTo(0.5);
    this.game.physics.arcade.enable(this.player);
    this.player.body.gravity.y = gravity;
    // Inject this object to event loop.
    this.game.add.existing(this);
  }
  public update() {
    const keybd = this.game.input.keyboard;
    let vx: number = 0;
    if (keybd.isDown(Phaser.Keyboard.W)) {
      // Up
      if (this.player.body.blocked.down) {
        // Jump
        this.player.body.velocity.y -= this.jumpPower;
      }
    }
    if (keybd.isDown(Phaser.Keyboard.S)) {
      // Down
      this.player.body.velocity.y += this.jumpPower / 10;
    }
    if (keybd.isDown(Phaser.Keyboard.A)) {
      // Left
      if (this.player.body.blocked.down) {
        vx -= 50;
      }
    }
    if (keybd.isDown(Phaser.Keyboard.D)) {
      // Right
      if (this.player.body.blocked.down) {
        vx += 50;
      }
    }
    this.player.body.velocity.x += vx;
    // Friction
    if (this.player.body.blocked.down) {
      /*let sign = Math.sign(this.player.body.velocity.x);
      this.player.body.velocity.x -= 20 * sign;
      if (sign !== Math.sign(this.player.body.velocity.x)) {
        this.player.body.velocity.x = 0;
      }*/
      this.player.body.velocity.x *= 0.9;
    }
    // Air friction
    this.player.body.velocity.x *= 0.99;
    this.player.body.velocity.y *= 0.99;
  }
  public getPlayer(): Phaser.Sprite {
    return this.player;
  }
}
