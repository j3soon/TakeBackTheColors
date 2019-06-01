// TODO: Maybe can modify the object directly without child sprite.
import * as Assets from '../assets';

export default class PlayerObject extends Phaser.Sprite {
  private readonly jumpPower = 1800 / 3;
  private gravity: number;
  private readonly jumpBoostCountMax = 64;
  private jumpBoostCount = 0;
  private readonly wallReleaseCountMax = 64;
  private wallReleaseCount = 0;
  private wallReleaseLeft = false;

  private moveX = 0;

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
    this.gravity = gravity;

    // Inject this object to event loop.
    this.game.add.existing(this);
  }
  public onCollideCallback(player: Phaser.Sprite, wall: Phaser.Sprite) {
    if (player.body.blocked.left || player.body.blocked.right) {
        // Wall slide.
      this.wallReleaseCount = this.wallReleaseCountMax;
      this.wallReleaseLeft = player.body.blocked.left;
    }
  }
  public update() {
    const keybd = this.game.input.keyboard;
    if (this.player.body.blocked.left || this.player.body.blocked.right)
      this.moveX = 0;
    this.player.body.velocity.x -= this.moveX;
    let vx = 0;
    const gravity = (this.gravity * this.game.time.elapsed / 1000);
    if (keybd.isDown(Phaser.Keyboard.W)) {
      // Up
      if (this.player.body.blocked.down || this.wallReleaseCount > 0) {
        if (!this.player.body.blocked.down) {
          // Wall jump
          this.player.body.velocity.x += this.jumpPower / Math.sqrt(2) * (this.wallReleaseLeft ? 1 : -1);
          // this.moveX = 500 * (this.wallReleaseLeft ? 1 : -1);
        }
        this.player.body.velocity.y -= this.jumpPower;
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
    if (this.wallReleaseCount > 0) {
      if (this.jumpBoostCount === 0) {
        if (this.player.body.velocity.y > 0) {
          // const maxSlideSpeedY = 160;
          this.player.body.velocity.y -= gravity * 0.8;
          /*if (this.player.body.velocity.y > maxSlideSpeedY) {
            this.player.body.velocity.y = maxSlideSpeedY;
          }*/
        }
      }
    } else if (this.wallReleaseCount > 0) {
      this.wallReleaseCount--;
    }
    // const maxMoveX = 400;
    /*if (Math.abs(this.player.body.velocity.x) > maxMoveSpeedX) {
      vx = 0;
    } else if (Math.abs(this.player.body.velocity.x + vx) > maxMoveSpeedX) {
      vx = Math.sign(vx) * (maxMoveSpeedX - Math.abs(this.player.body.velocity.x));
    }*/
    this.moveX += vx;
    /*if (Math.abs(this.moveX) > maxMoveX) {
      this.moveX = Math.sign(this.moveX) * maxMoveX;
    }*/
    // Friction
    if (this.player.body.blocked.down) {
      /*let sign = Math.sign(this.player.body.velocity.x);
      this.player.body.velocity.x -= 20 * sign;
      if (sign !== Math.sign(this.player.body.velocity.x)) {
        this.player.body.velocity.x = 0;
      }*/
      // this.player.body.velocity.x *= 0.9;
    }
    // Air friction
    // TODO: Remove this.moveX anc combine to swing.
    this.player.body.velocity.x *= 0.99;
    this.player.body.velocity.y *= 0.99;
    this.moveX *= 0.9;
    if (this.player.body.velocity.x * (this.player.body.velocity.x + this.moveX) < 0) {
      // Opposite direction if release horizontal key.
      this.moveX = this.player.body.velocity.x + this.moveX;
      this.player.body.velocity.x = 0;
    }
    this.player.body.velocity.x += this.moveX;
  }
  public getPlayer(): Phaser.Sprite {
    return this.player;
  }
}
