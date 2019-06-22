import * as Assets from '../../assets';
import EnemyObject from '../enemyObject';

export default class SawEnemyObject extends EnemyObject {
  private walkLeft;
  private maxSpeed = 800;
  private maxDistance = 2000;
  private acceleration = 500;

  private player: Phaser.Sprite;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, gravity: number, player: Phaser.Sprite, walkLeft: boolean) {
    super(game, spawnPoint, gravity);
    this.player = player;
    this.walkLeft = walkLeft;
    this.enemy = game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Spritesheets.SpritesheetsEnemiesSawRoll1481482.getName());
    this.enemy.animations.add('roll', [0, 1], 24, true);
    this.enemy.animations.play('roll');
    this.enemy.anchor.setTo(0.5);
    this.enemy.scale.set(0.5, 0.5);
    game.physics.enable(this.enemy);
    this.enemy.body.gravity.y = gravity;
    this.enemy.autoCull = true;
  }
  public update() {
    // Change direction
    if (this.walkLeft === true && this.enemy.body.blocked.left) {
      this.walkLeft = false;
    } else if (this.walkLeft === false && this.enemy.body.blocked.right) {
      this.walkLeft = true;
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