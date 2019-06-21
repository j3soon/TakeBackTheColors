import * as Assets from '../../assets';
import EnemyObject from '../enemyObject';

export default class WingEnemyObject extends EnemyObject {
  private readonly speedXBase = 100;
  private readonly speedYBase = 200;

  private leftBound: number;
  private rightBound: number;
  private topBound: number;
  private bottomBound: number;
  private walkLeft = true;
  private walkTop = true;
  private speedX = this.speedXBase;
  private speedY = this.speedYBase;

  private player: Phaser.Sprite;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, gravity: number, leftBound: number, rightBound: number, topBound: number, bottomBound: number, player: Phaser.Sprite) {
    super(game, spawnPoint, gravity);
    this.leftBound = leftBound;
    this.rightBound = rightBound;
    this.topBound = topBound;
    this.bottomBound = bottomBound;
    this.player = player;
    this.enemy = game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Spritesheets.SpritesheetsEnemiesWing2161475.getName());
    this.enemy.animations.add('idle', [2, 3], 12, true);
    this.enemy.animations.add('fly', [0, 1, 2, 3, 4], 12, true);
    this.enemy.animations.play('fly');
    this.enemy.anchor.setTo(0.5);
    this.enemy.scale.set(0.5, 0.5);
    game.physics.enable(this.enemy);
    this.enemy.body.gravity.y = gravity;
    this.enemy.autoCull = true;
  }
  public update() {
    let delta = 0.4;
    let changed = false;
    // Change direction
    if (this.walkLeft === true && (this.enemy.x < this.leftBound || this.enemy.body.blocked.left)) {
      this.walkLeft = false;
      changed = true;
    } else if (this.walkLeft === false && (this.enemy.x > this.rightBound || this.enemy.body.blocked.right)) {
      this.walkLeft = true;
      changed = true;
    }
    if (this.walkTop === true && (this.enemy.y < this.topBound || this.enemy.body.blocked.up)) {
      this.walkTop = false;
      changed = true;
    } else if (this.walkTop === false && (this.enemy.y > this.bottomBound || this.enemy.body.blocked.down)) {
      this.walkTop = true;
      changed = true;
    }
    // Change speed
    if (changed) {
      this.speedX = this.speedXBase * this.game.rnd.realInRange(1 - delta, 1 + delta);
      this.speedY = this.speedYBase * this.game.rnd.realInRange(1 - delta, 1 + delta);
    }
    // Set velocity.
    this.enemy.body.velocity.x = this.speedX * (this.walkLeft ? -1 : 1);
    this.enemy.body.velocity.y = this.speedY * (this.walkTop ? -1 : 1);
  }
}