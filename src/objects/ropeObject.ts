import * as Assets from '../assets';

export default class RopeObject extends Phaser.Sprite {
  private gravity: number;
  private player: Phaser.Sprite;

  private ropeEnd!: Phaser.Point;
  private leftMouse!: boolean;
  private hud!: Phaser.Graphics;

  readonly speedAnchor;
  readonly speedAnchorShrink;
  readonly jumpPower;
  readonly shrinkDelta = 0.1;
  readonly shrinkMax = 6;
  readonly maxDistance = 800;
  readonly minDistance = 32;

  public ropeAnchor!: Phaser.Sprite;
  public ropeState!: String; // idle, extend, shrink, burst

  private shrinkCoef: number;

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
  constructor(game: Phaser.Game, gravity: number, player: Phaser.Sprite) {
    // TODO: Make certain tilemap dynamic. (for boss)
    super(game, 0, 0);
    this.gravity = gravity;
    this.player = player;
    // Init Rope Anchor
    this.ropeAnchor = this.game.add.sprite(0, 0, Assets.Images.ImagesAnchor.getName());
    this.ropeAnchor.visible = false;
    this.ropeAnchor.anchor.setTo(0.5);
    this.game.physics.enable(this.ropeAnchor);
    // this.ropeAnchor.body.onCollide = new Phaser.Signal();
    // this.ropeAnchor.body.onCollide.add(this.ropeLocked_, this);
    // Init Rope
    this.ropeEnd = new Phaser.Point();
    this.ropeState = 'idle';
    this.leftMouse = false;
    this.hud = this.game.add.graphics(0, 0);
    // Setup Constants.
    this.speedAnchor = this.gravity * 1.2;
    this.speedAnchorShrink = this.gravity / 20;
    this.jumpPower = this.gravity / 2;
    // Inject this object to event loop.
    this.game.add.existing(this);
  }
  public ropeLocked_() {
    console.log('locked');
    this.ropeAnchor.body.velocity.x = 0;
    this.ropeAnchor.body.velocity.y = 0;
    this.ropeAnchor.body.gravity.y = 0;
    this.ropeState = 'shrink';
    this.shrinkCoef = 1;
  }
  private changeRopeState_() {
    const keybd = this.game.input.keyboard;
    const ms = this.game.input.mousePointer;
    const x = ms.x += this.game.camera.x;
    const y = ms.y += this.game.camera.y;
    if (ms.leftButton.isDown !== this.leftMouse) {
      if (ms.leftButton.isDown === false) {
        this.ropeState = 'idle';
      } else {
        this.ropeState = 'extend';
        this.ropeAnchor.body.gravity.y = this.gravity;
        this.ropeAnchor.position.copyFrom(this.player.position);
        // Get angle
        let rotation = Math.atan2(y - this.player.y, x - this.player.x);
        // shoot toward mouse pointer.
        this.ropeAnchor.body.velocity.x = Math.cos(rotation) * this.speedAnchor;
        this.ropeAnchor.body.velocity.y = Math.sin(rotation) * this.speedAnchor;
      }
    }
    // Burst
    if (this.ropeState === 'shrink' && keybd.isDown(Phaser.Keyboard.SPACEBAR)) {
      this.ropeState = 'burst';

      let rotation = Math.atan2(this.ropeAnchor.y - this.player.y, this.ropeAnchor.x - this.player.x);
      // burst toward mouse pointer.
      let vx = this.player.body.velocity.getMagnitude() * Math.cos(rotation);
      let vy = this.player.body.velocity.getMagnitude() * Math.sin(rotation);
      this.player.body.velocity.x = vx;
      this.player.body.velocity.y = vy;
    }
    if (this.ropeState === 'burst' && !keybd.isDown(Phaser.Keyboard.SPACEBAR)) {
      this.ropeState = 'idle';
    }
    this.leftMouse = ms.leftButton.isDown;
    if (ms.rightButton.isDown) {
      // Do nothing.
    }
  }
  private procRope_() {
    if (this.ropeState === 'idle') {
      this.ropeAnchor.visible = false;
      return;
    }
    this.ropeAnchor.visible = true;
    if (this.ropeState === 'extend') {
      if (Phaser.Math.distance(this.ropeAnchor.x, this.ropeAnchor.y, this.player.x, this.player.y) > this.maxDistance) {
        this.ropeState = 'idle';
      }
      return;
    }
    if (this.ropeState === 'burst') {
      /*this.shrinkCoef += this.shrinkDelta;
      if (this.shrinkCoef >= this.shrinkMax) {
        this.shrinkCoef = this.shrinkMax;
        this.ropeState = 'idle';
      }*/
      // this.player.body.
      if (Phaser.Math.distance(this.ropeAnchor.x, this.ropeAnchor.y, this.player.x, this.player.y) < this.minDistance) {
        this.ropeState = 'idle';
      }

      let rotation = Math.atan2(this.ropeAnchor.y - this.player.y, this.ropeAnchor.x - this.player.x);
      // burst toward mouse pointer.
      this.player.body.velocity.x += Math.cos(rotation) * this.speedAnchorShrink;
      this.player.body.velocity.y += Math.sin(rotation) * this.speedAnchorShrink;
      let vx = this.player.body.velocity.getMagnitude() * Math.cos(rotation);
      let vy = this.player.body.velocity.getMagnitude() * Math.sin(rotation);
      this.player.body.velocity.x = vx;
      this.player.body.velocity.y = vy;
    }
    if (this.ropeState === 'shrink') {
      // Pull player.
      let rotation = Math.atan2(this.ropeAnchor.y - this.player.y, this.ropeAnchor.x - this.player.x);
      // shoot toward mouse pointer.

      this.player.body.velocity.x += Math.cos(rotation) * this.speedAnchorShrink;
      this.player.body.velocity.y += Math.sin(rotation) * this.speedAnchorShrink;
    }
  }
  public update() {
    this.changeRopeState_();
    this.procRope_();
    if (this.ropeAnchor.body.blocked.up ||
        this.ropeAnchor.body.blocked.left ||
        this.ropeAnchor.body.blocked.down ||
        this.ropeAnchor.body.blocked.right) {
      this.ropeLocked_();
    }
  }
  public postUpdate() {
    this.hud.clear();
    // Draw velocity
    this.hud.lineStyle(2, 0x0000ff, 1);
    this.hud.moveTo(this.player.x, this.player.y);
    this.hud.lineTo(this.player.x + this.player.body.velocity.x / 8,
      this.player.y + this.player.body.velocity.y / 8);
    this.hud.endFill();
    if (this.ropeState === 'idle') {
      return;
    }
    // Draw rope
    if (this.ropeState === 'extend') {
      this.hud.lineStyle(10, 0xffff00, 1);
    } else if (this.ropeState === 'shrink') {
      this.hud.lineStyle(10, 0x00ff00, 1);
    } else if (this.ropeState === 'burst') {
      this.hud.lineStyle(10, 0xff0000, 1);
    }
    this.hud.moveTo(this.player.x, this.player.y);
    this.hud.lineTo(this.ropeAnchor.x, this.ropeAnchor.y);
    this.hud.endFill();
  }
}