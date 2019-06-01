import * as Assets from '../assets';
import BackgroundObject from '../objects/backgroundObject';
import MapObject from '../objects/mapObject';
import PlayerObject from '../objects/playerObject';
import RopeObject from '../objects/ropeObject';

export default class Game extends Phaser.State {
  public readonly gravity = 1800;
  private bgObj: BackgroundObject;
  private mapObj: MapObject;
  private playerObj: PlayerObject;
  private ropeObj: RopeObject;

  public create(): void {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.bgObj = new BackgroundObject(this.game);
    this.mapObj = new MapObject(this.game);
    this.playerObj = new PlayerObject(this.game, 64, 3072, this.gravity);
    this.ropeObj = new RopeObject(this.game, this.gravity, this.playerObj.player);
    this.game.camera.follow(this.playerObj.getPlayer(), Phaser.Camera.FOLLOW_LOCKON, 1, 1);

    // Fix Tunneling (Bullet-Through-Paper) problem.
    this.game.physics.arcade.TILE_BIAS = 128;
    // this.game.time.advancedTiming = true;
  }
  update(): void {
    this.game.physics.arcade.collide(this.playerObj.player, this.mapObj.layer);
    if (this.ropeObj.ropeState !== 'idle') {
      this.game.physics.arcade.collide(this.ropeObj.ropeAnchor, this.mapObj.layer);
    }
  }
  render(): void {
    // this.game.debug.text(this.game.time.fps.toString(), 2, 60, "#00ff00", "40pt Consolas");
  }
  public postUpdate(): void {
  }
}