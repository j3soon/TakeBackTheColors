import * as Assets from '../../assets';
import EnemyObject from '../enemyObject';

export default class PropellerEnemyObject extends EnemyObject {
  private topBound: number;
  private bottomBound: number;
  private walkTop = true;
  private speed = 200;

  private player: Phaser.Sprite;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, gravity: number, topBound: number, bottomBound: number, player: Phaser.Sprite) {
    super(game, spawnPoint, gravity);
    this.topBound = topBound;
    this.bottomBound = bottomBound;
    this.player = player;
    this.enemy = game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Spritesheets.SpritesheetsEnemiesPropeller1221396.getName());
    this.enemy.animations.add('float', [0, 1], 12, true);
    this.enemy.animations.add('fly', [0, 1, 2, 3], 12, true);
    this.enemy.animations.add('stand', [4, 5], 12, true);
    this.enemy.animations.play('fly');
    this.enemy.anchor.setTo(0.5);
    this.enemy.scale.set(0.5, 0.5);
    game.physics.enable(this.enemy);
    this.enemy.body.gravity.y = gravity;
    this.enemy.autoCull = true;
  }
  public update() {
    // Change direction
    if (this.walkTop === true && (this.enemy.y < this.topBound || this.enemy.body.blocked.up)) {
      this.walkTop = false;
    } else if (this.walkTop === false && (this.enemy.y > this.bottomBound || this.enemy.body.blocked.down)) {
      this.walkTop = true;
    }
    // Set velocity.
    this.enemy.body.velocity.y = this.speed * (this.walkTop ? -1 : 1);
    console.log(this.enemy.body.blocked.bottom);
    console.log(this.enemy.body.velocity.y);
  }
}