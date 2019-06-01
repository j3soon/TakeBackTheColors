import * as Assets from '../assets';
import PlayerObject from '../objects/playerObject';
import MapObject from '../objects/mapObject';
// import Background from '../objects/background';

export default class Game extends Phaser.State {
  private readonly gravity = 1800;
  private playerObj: PlayerObject;
  private mapObj: MapObject;

  // TODO: Fix Tunneling (Bullet-Through-Paper) problem by CCD.
  public create(): void {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.mapObj = new MapObject(this.game);
    this.playerObj = new PlayerObject(this.game, 64, 3072, this.gravity);
    this.game.camera.follow(this.playerObj.getPlayer(), Phaser.Camera.FOLLOW_LOCKON, 1, 1);

    // this.game.time.advancedTiming = true;
  }
  update(): void {
    this.game.physics.arcade.collide(this.playerObj.player, this.mapObj.layer);
  }
  render(): void {
    // this.game.debug.text(this.game.time.fps.toString(), 2, 60, "#00ff00", "40pt Consolas");
  }
  public postUpdate(): void {
  }
}