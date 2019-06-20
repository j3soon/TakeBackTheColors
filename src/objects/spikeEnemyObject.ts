import * as Assets from '../assets';
import EnemyObject from './enemyObject';

export default class SpikeEnemyObject extends EnemyObject {
  private leftBound: number;
  private rightBound: number;
  private walkLeft = true;
  private speed = 100;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, gravity: number, leftBound: number, rightBound: number) {
    super(game, spawnPoint, gravity);
    this.leftBound = leftBound;
    this.rightBound = rightBound;
    this.enemy = game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Spritesheets.SpritesheetsEnemiesSpike1201594.getName());
    this.enemy.animations.add('idle', [0, 1], 12, true);
    this.enemy.animations.add('walkRight', [2, 3], 12, true);
    this.enemy.animations.play('idle');
    this.enemy.anchor.setTo(0.5);
    this.enemy.scale.set(0.5, 0.5);
    game.physics.enable(this.enemy);
    this.enemy.body.gravity.y = gravity;
  }
  public update() {
    // Change direction
    if (this.walkLeft && (this.enemy.x < this.leftBound || this.enemy.body.blocked.left)) {
      this.walkLeft = false;
    } else if (!this.walkLeft && (this.enemy.x > this.rightBound || this.enemy.body.blocked.right)) {
      this.walkLeft = true;
    }
    // Set velocity.
    this.enemy.body.velocity.x = this.speed * (this.walkLeft ? -1 : 1);
  }
}