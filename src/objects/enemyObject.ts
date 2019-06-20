// TODO: Make this a base class, all enemies inherit this. Define different on dash behavior.
import * as Assets from '../assets';

export default class EnemyObject extends Phaser.Sprite {
  public gravity: number;

  public enemy: Phaser.Sprite;
  public spawnPoint: Phaser.Point;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, gravity: number) {
    super(game, 0, 0);
    this.spawnPoint = spawnPoint;
    // Inject this object to event loop.
    game.add.existing(this);
  }
  public respawn() {
    this.enemy.x = this.spawnPoint.x;
    this.enemy.y = this.spawnPoint.y;
    this.enemy.body.velocity.x = 0;
    this.enemy.body.velocity.y = 0;
  }
}