// TODO: Maybe can modify the object directly without child sprite.
import * as Assets from '../assets';
import { timingSafeEqual } from 'crypto';

export default class PlayerObject extends Phaser.Sprite {
  private readonly jumpPower = 1800 / 3;
  private gravity: number;
  private readonly jumpBoostCountMax = 64;
  private jumpBoostCount = 0;
  private readonly wallReleaseCountMax = 16;
  private wallReleaseCount = 0;
  private wallReleaseLeft = false;
  // private readonly wallHoldCountMax = 4;
  // private wallHoldCount = 0;

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
    this.game.physics.p2.enable(this.player);
    this.player.body.fixedRotation = true;
    // Simulate ARCADE mode.
    this.player.body.blocked = {};
    this.player.body.blocked.left = false;
    this.player.body.blocked.right = false;
    this.player.body.blocked.down = false;
    this.gravity = gravity;

    // Inject this object to event loop.
    this.game.add.existing(this);
  }
  public onCollideCallback(player: Phaser.Sprite, wall: Phaser.Sprite) {
  }
  // Reference: https://phaser.io/examples/v2/p2-physics/tilemap-gravity
  private updateBlocked_() {
    let topAxis = p2.vec2.fromValues(0, 1);
    let leftAxis = p2.vec2.fromValues(-1, 0);
    let rightAxis = p2.vec2.fromValues(1, 0);
    this.player.body.blocked.down = false;
    this.player.body.blocked.left = false;
    this.player.body.blocked.right = false;

    for (let i = 0; i < this.game.physics.p2.world.narrowphase.contactEquations.length; i++) {
      let c = this.game.physics.p2.world.narrowphase.contactEquations[i];

      if (c.bodyA === this.player.body.data || c.bodyB === this.player.body.data) {
          let topDot = p2.vec2.dot(c.normalA, topAxis); // Normal dot Y-axis
          let leftDot = p2.vec2.dot(c.normalA, leftAxis);
          let rightDot = p2.vec2.dot(c.normalA, rightAxis);
          if (c.bodyA === this.player.body.data) {
            topDot *= -1;
            leftDot *= -1;
            rightDot *= -1;
          }
          if (topDot > 0.5) {
            this.player.body.blocked.down = true;
          }
          if (leftDot > 0.5) {
            this.player.body.blocked.left = true;
          }
          if (rightDot > 0.5) {
            this.player.body.blocked.right = true;
          }
      }
    }
  }
  public update() {
    this.updateBlocked_();
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
          // this.moveX = 500 * (this.wallReleaseLeft ? 1 : -1);
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
    if (this.player.body.blocked.left || this.player.body.blocked.right) {
      this.wallReleaseLeft = this.player.body.blocked.left;
      // if (this.wallHoldCount > this.wallHoldCountMax) {
      //   // Wall slide.
      //   this.wallReleaseCount = this.wallReleaseCountMax;
      //   this.wallHoldCount = 0;
      // } else {
      //   this.wallHoldCount++;
      // }
      this.wallReleaseCount = this.wallReleaseCountMax;
    } else {
      // this.wallHoldCount = 0;
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
        /*if (this.player.body.velocity.y > maxSlideSpeedY) {
          this.player.body.velocity.y = maxSlideSpeedY;
        }*/
      }
    }
    const maxMoveSpeedX = 400;
    if (Math.abs(this.player.body.velocity.x) > maxMoveSpeedX) {
      vx = 0;
    } else if (Math.abs(this.player.body.velocity.x + vx) > maxMoveSpeedX) {
      vx = Math.sign(vx) * (maxMoveSpeedX - Math.abs(this.player.body.velocity.x));
    }
    this.player.body.velocity.x += vx;
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
      this.player.body.velocity.x *= 0.9;
    }
    // Air friction
    // TODO: Remove this.moveX anc combine to swing.
    this.player.body.velocity.x *= 0.99;
    this.player.body.velocity.y *= 0.99;
  }
  public getPlayer(): Phaser.Sprite {
    return this.player;
  }
}
