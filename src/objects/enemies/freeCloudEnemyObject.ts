import * as Assets from '../../assets';
import EnemyObject from '../enemyObject';
import LightningObject from '../projectiles/lightningObject';

export default class FreeCloudEnemyObject extends EnemyObject {
  private walkTop = true;
  private maxSpeed = 400;
  private maxDistance = 2000;
  private acceleration = 800;

  private maxShootDistance = 800;
  private coolDown = 0;
  private coolDownReset = 1;

  private player: Phaser.Sprite;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, gravity: number, player: Phaser.Sprite, walkTop: boolean) {
    super(game, spawnPoint, gravity);
    this.walkTop = walkTop;
    this.player = player;
    this.enemy = game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Images.ImagesEnemiesCloud.getName());
    this.enemy.anchor.setTo(0.5);
    this.enemy.scale.set(0.5, 0.5);
    game.physics.enable(this.enemy);
    this.enemy.autoCull = true;

    this.die = true;
  }
  private checkShoot() {
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
  public update() {
    this.checkShoot();
    // Change direction
    if (this.walkTop === true && this.enemy.body.blocked.up) {
      this.walkTop = false;
    } else if (this.walkTop === false && this.enemy.body.blocked.down) {
      this.walkTop = true;
    }
    else if (this.walkTop) {
      this.enemy.body.acceleration.y = -this.acceleration;
    } else {
      this.enemy.body.acceleration.y = this.acceleration;
    }
    // Clamp velocity.
    if (Math.abs(this.enemy.body.velocity.y) > this.maxSpeed) {
      this.enemy.body.velocity.y = this.maxSpeed * Math.sign(this.enemy.body.velocity.y);
    }
  }
  public callback() {
    this.enemy.destroy();
    this.destroy();
  }
}