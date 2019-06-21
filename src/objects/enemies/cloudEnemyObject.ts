import * as Assets from '../../assets';
import EnemyObject from '../enemyObject';
import LightningObject from '../projectiles/lightningObject';

export default class CloudEnemyObject extends EnemyObject {
  private leftBound: number;
  private rightBound: number;
  private walkLeft = true;
  private maxSpeed = 400;
  private maxDistance = 2000;
  private acceleration = 800;

  private maxShootDistance = 800;
  private coolDown = 0;
  private coolDownReset = 1;

  private player: Phaser.Sprite;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, gravity: number, leftBound: number, rightBound: number, player: Phaser.Sprite) {
    super(game, spawnPoint, gravity);
    this.leftBound = leftBound;
    this.rightBound = rightBound;
    this.player = player;
    this.enemy = game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Images.ImagesEnemiesCloud.getName());
    this.enemy.anchor.setTo(0.5);
    this.enemy.scale.set(0.5, 0.5);
    game.physics.enable(this.enemy);
    this.enemy.autoCull = true;
  }
  private checkShoot() {
    if (this.leftBound < this.player.x && this.player.x < this.rightBound) {
      if (Phaser.Math.distance(this.enemy.x, this.enemy.y, this.player.x, this.player.y) <= this.maxShootDistance) {
        this.coolDown -= this.game.time.elapsed / 1000;
        if (this.coolDown <= 0) {
          this.coolDown = this.coolDownReset;
          // Shoot
          // TODO: Optmize it using object pool.
          new LightningObject(this.game, new Phaser.Point(this.enemy.x, this.enemy.y), this.player);
        }
      }
    }
  }
  public update() {
    this.checkShoot();
    let idle = false;
    // Target player X.
    if (Phaser.Math.distance(this.enemy.x, this.enemy.y, this.player.x, this.player.y) <= this.maxDistance) {
      if (this.leftBound < this.player.x && this.player.x < this.rightBound) {
        this.walkLeft = (this.player.x < this.enemy.x);
      }
      if (Phaser.Math.distance(this.enemy.x, 0, this.player.x, 0) <= this.maxSpeed * this.game.time.elapsed / 1000) {
        idle = true;
      }
    }
    // Change direction
    if (this.walkLeft === true && (this.enemy.x < this.leftBound || this.enemy.body.blocked.left)) {
      this.walkLeft = false;
    } else if (this.walkLeft === false && (this.enemy.x > this.rightBound || this.enemy.body.blocked.right)) {
      this.walkLeft = true;
    }
    if (idle) {
      // Idle
      this.enemy.body.acceleration.x = 0;
    }
    else if (this.walkLeft) {
      this.enemy.body.acceleration.x = -this.acceleration;
    } else {
      this.enemy.body.acceleration.x = this.acceleration;
    }
    // Clamp velocity.
    if (Math.abs(this.enemy.body.velocity.x) > this.maxSpeed) {
      this.enemy.body.velocity.x = this.maxSpeed * Math.sign(this.enemy.body.velocity.x);
    }
  }
}