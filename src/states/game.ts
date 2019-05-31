import * as Assets from '../assets';
import PlayerObject from '../objects/playerObject';

export default class Game extends Phaser.State {
  readonly gravity = 1800;
  private playerObj: PlayerObject;

  public create(): void {
    this.playerObj = new PlayerObject(this.game, this.gravity);
    this.game.camera.follow(this.playerObj.getPlayer(), Phaser.Camera.FOLLOW_LOCKON, 1, 1);
  }
  public update(): void {
  }
  public postUpdate(): void {
  }
}