import * as Assets from '../../assets';
import EnemyObject from '../enemyObject';

export default class SpikeEnemyObject extends EnemyObject {
  private leftBound: number;
  private rightBound: number;
  private walkLeft = true;
  private speed = 100;
  private maxDistance = 1000;

  private player: Phaser.Sprite;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, gravity: number, leftBound: number, rightBound: number, player: Phaser.Sprite) {
    super(game, spawnPoint, gravity);
    this.leftBound = leftBound;
    this.rightBound = rightBound;
    this.player = player;
    this.enemy = game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Spritesheets.SpritesheetsEnemiesSpike1201594.getName());
    this.enemy.animations.add('idle', [0], 12, true);
    this.enemy.animations.add('walk', [0, 1], 12, true);
    this.enemy.animations.add('walkRight', [2, 3], 12, true);
    this.enemy.animations.play('idle');
    this.enemy.anchor.setTo(0.5);
    this.enemy.scale.set(0.5, 0.5);
    game.physics.enable(this.enemy);
    this.enemy.body.gravity.y = gravity;
  }
  public update() {
    let idle = false;
    // Follow player X if player is at top and within range.
    if (Phaser.Math.distance(this.enemy.x, this.enemy.y, this.player.x, this.player.y) <= this.maxDistance) {
      if (this.leftBound < this.player.x && this.player.x < this.rightBound && this.player.y < this.enemy.y) {
        this.walkLeft = (this.player.x < this.enemy.x);
      }
      if (Phaser.Math.distance(this.enemy.x, 0, this.player.x, 0) <= this.speed * this.game.time.elapsed / 1000) {
        idle = true;
      }
    }
    // Change direction
    if (this.walkLeft === true && (this.enemy.x < this.leftBound || this.enemy.body.blocked.left)) {
      this.walkLeft = false;
    } else if (this.walkLeft === false && (this.enemy.x > this.rightBound || this.enemy.body.blocked.right)) {
      this.walkLeft = true;
    }
    // Set velocity.
    this.enemy.body.velocity.x = this.speed * (this.walkLeft ? -1 : 1);
    if (idle) {
      this.enemy.body.velocity.x = 0;
      this.enemy.animations.play('idle');
    } else {
      this.enemy.animations.play('walk');
    }
  }
}