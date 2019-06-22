import * as Assets from '../../assets';
import EnemyObject from '../enemyObject';

export default class EagleEnemyObject extends EnemyObject {
  public stageGoalRect: Phaser.Rectangle;

  private player: Phaser.Sprite;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, gravity: number, rect: Phaser.Rectangle, player: Phaser.Sprite) {
    super(game, spawnPoint, gravity);
    this.stageGoalRect = this.stageGoalRect;
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
  }
}