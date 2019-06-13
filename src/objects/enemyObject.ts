// TODO: Make this a base class, all enemies inherit this. Define different on dash behavior.
import * as Assets from '../assets';

export default class EnemyObject extends Phaser.Sprite {
  private gravity: number;

  public enemy: Phaser.Sprite;
  public spawnPoint: Phaser.Point;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, gravity: number) {
    super(game, 0, 0);
    this.enemy = this.game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Spritesheets.SpritesheetsEnemiesWingFly2161475.getName());
    this.enemy.animations.add('anim');
    this.enemy.animations.play('anim', 12, true);
    this.enemy.anchor.setTo(0.5);
    this.enemy.scale.set(0.5, 0.5);
    this.game.physics.enable(this.enemy);
    this.debug = true;
    // Inject this object to event loop.
    this.game.add.existing(this);
  }
}