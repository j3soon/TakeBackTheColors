import * as Assets from '../assets';
import BackgroundObject from '../objects/backgroundObject';
import MapObject from '../objects/mapObject';
import PlayerObject from '../objects/playerObject';
import RopeObject from '../objects/ropeObject';
import EnemyObject from '../objects/enemyObject';

export default class Game extends Phaser.State {
  public readonly gravity = 1800;
  private bgObj: BackgroundObject;
  private mapObj: MapObject;
  private playerObj: PlayerObject;
  private ropeObj: RopeObject;
  private enemyObjs: EnemyObject[];

  public create(): void {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.bgObj = new BackgroundObject(this.game);
    this.mapObj = new MapObject(this.game);
    this.playerObj = new PlayerObject(this.game, this.mapObj.spawnPoint, this.gravity);
    this.ropeObj = new RopeObject(this.game, this.gravity, this.playerObj.player);
    this.enemyObjs = this.mapObj.createEnemies(this.game, this.gravity);
    this.game.camera.follow(this.playerObj.getPlayer(), Phaser.Camera.FOLLOW_LOCKON, 1, 1);

    // Fix Tunneling (Bullet-Through-Paper) problem.
    this.game.physics.arcade.TILE_BIAS = 38;
    // this.game.time.advancedTiming = true;

    this.enemyObjs.push(new EnemyObject(this.game, new Phaser.Point(100, 1000), this.gravity));
  }
  update(): void {
    this.game.physics.arcade.collide(this.playerObj.player, this.mapObj.obstacleLayer);
    if (this.ropeObj.ropeState !== 'idle') {
      this.game.physics.arcade.collide(this.ropeObj.ropeAnchor, this.mapObj.obstacleLayer);
      // TODO: make this.enemyObjs to group.
      for (let enemy of this.enemyObjs) {
        this.game.physics.arcade.collide(this.ropeObj.ropeAnchor, enemy.enemy);
      }
    }
  }
  render(): void {
    // this.game.debug.text(this.game.time.fps.toString(), 2, 60, "#00ff00", "40pt Consolas");
  }
  public postUpdate(): void {
  }
}