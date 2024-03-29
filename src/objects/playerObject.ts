// TODO: Maybe can modify the object directly without child sprite.
import * as Assets from '../assets';
import RopeObject from '../objects/ropeObject';
import PlayerAnimation from '../playerAnimation';
import CrystalObject from './collectibles/crystalObject';
import EagleEnemyObject from './enemies/eagleEnemyObject';

export default class PlayerObject extends Phaser.Sprite {
  private gravity: number;
  private readonly jumpPower;
  private readonly jumpBoostCountMax = 64;
  private jumpBoostCount = 0;
  private readonly wallReleaseCountMax = 8;
  private wallReleaseCount = 0;
  private wallReleaseLeft = false;
  private animator: PlayerAnimation;
  private ropeObj: RopeObject;
  public dead: boolean;
  private jump: any;
  private bubble: any;

  public player: Phaser.Sprite;
  public spawnPoint: Phaser.Point;
  private emitter: Phaser.Particles.Arcade.Emitter;

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
  private ClickBurstTest(pointer) {
    console.log("burst!")
    this.emitter.start(true, 750, null, 50);
  }
  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, gravity: number) {
    super(game, 0, 0);
    // Init player.
    this.spawnPoint = spawnPoint;
    this.player = this.game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Spritesheets.SpritesheetsRabbit20025055.getName());
    this.animator = new PlayerAnimation(this.player, this.ropeObj, game);
    this.dead = false;
    this.emitter = this.game.add.emitter(0, 0, 100);
    this.emitter.makeParticles(Assets.Images.ImagesExplosion.getName());
    this.emitter.setAlpha(0.8, 0, 500);
    this.emitter.setScale(1.1, 0.2, 1.1, 0.2, 500);
    this.emitter.setXSpeed(-150, 150);
    //this.player = this.game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Images.ImagesPlayer.getName());
    this.player.anchor.setTo(0.5);
    this.player.scale.setTo(0.4);
    this.game.physics.enable(this.player);
    this.player.body.gravity.y = gravity;
    this.player.body.setSize(130, 100, 60, 140);

    this.gravity = gravity;
    // Setup Constants.
    this.jumpPower = this.gravity / 3;
    this.jump = this.game.add.audio(Assets.Audio.AudioJump.getName());
    this.bubble = this.game.add.audio(Assets.Audio.AudioBubble.getName());
    // Inject this object to event loop.
    this.game.add.existing(this);
  }
  public update() {
    this.emitter.x = this.player.x;
    this.emitter.y = this.player.y;
    const keybd = this.game.input.keyboard;
    this.emitter.x = this.player.x;
    this.emitter.y = this.player.y;
    if(this.dead) {
      this.player.body.velocity.x = 0;
      this.player.body.velocity.y = 0;
      return;
    }
    let vx = 0;
    // const gravity = (this.gravity * this.game.time.physicsElapsed / 1000);
    this.player.body.acceleration.y = 0;
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
        this.jump.play();
      } else if (this.jumpBoostCount > 0) {
        // Jump boost (if holding space)
        this.jumpBoostCount--;
        this.player.body.acceleration.y = -this.gravity * Math.pow(this.jumpBoostCount / this.jumpBoostCountMax, 2);
        // this.player.body.velocity.y -= gravity * Math.pow(this.jumpBoostCount / this.jumpBoostCountMax, 2);
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
          this.player.body.acceleration.y = -this.gravity;
          // this.player.body.velocity.y -= gravity;
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
    var moving = keybd.isDown(Phaser.Keyboard.D) || keybd.isDown(Phaser.Keyboard.A);
    var onground = this.player.body.blocked.down;
    var leaning = !onground && (this.player.body.blocked.left || this.player.body.blocked.right);
    if(this.animator.Update(moving, onground, leaning, String(this.ropeObj.ropeState), this.player.body.velocity.x, this.player.body.velocity.y, this.player.x, this.player.y, this.player.scale.x, this.player.scale.y, this.player)) this.player.animations.play(this.animator.State());
    this.player.scale.setTo((this.player.body.velocity.x > 0 ? -1 : 1) * Math.abs(this.player.scale.x), this.player.scale.y);
    // Motion
    if(this.animator.State() == 'run')
      this.player.body.velocity.x *= moveSpeedFractionX[this.player.animations.frame % 5];
  }
  public getPlayer(): Phaser.Sprite {
    return this.player;
  }
  public setRopeObject(ropeObject: RopeObject) {
    this.ropeObj = ropeObject;
  }
  public getRopeObject() {
    return this.ropeObj;
  }
  private BurstDeath() {
    console.log("burst!")
    this.emitter.start(true, 750, null, 50);
  }
  private RealRespawn() {
    this.player.x = this.spawnPoint.x;
    this.player.y = this.spawnPoint.y;
    // Add respawn effect.
    let respawn = this.game.add.sprite(this.player.x, this.player.y, Assets.Spritesheets.SpritesheetsRespawn25625625.getName())
    respawn.anchor.setTo(0.5);
    respawn.scale.set(0.6, 0.6);
    respawn.animations.add('anim', null, 24, true);
    respawn.animations.play('anim', null, false, true);
    this.player.alpha = 1;
    this.game.time.events.add(Phaser.Timer.SECOND * 0.5, ()=>this.dead=false, this);
    // Spawn crystal if needed
    if (CrystalObject.spawn) {
      // Clear flag.
      CrystalObject.spawn = false;
      if (EagleEnemyObject.enemyStage === 1)
        new CrystalObject(this.game, CrystalObject.hiP, 2, this);
      if (EagleEnemyObject.enemyStage === 2)
        new CrystalObject(this.game, CrystalObject.hiP, 3, this);
    }
    // TODO: respawn all enemies.
  }
  public respawn() {
    // Reset to spawn point. (Can be used as checkpoint)
    if(this.dead) return;
    this.bubble.play();
    this.animator.playerComp.visible = false;
    this.dead = true;
    this.game.time.events.add(Phaser.Timer.SECOND * 2, this.RealRespawn, this);
    this.player.alpha = 0;
    this.BurstDeath();
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;
    this.ropeObj.ropeState = 'idle';


  }
  public setRopeEnabled() {
    this.ropeObj.ropeEnabled = true;
  }
}