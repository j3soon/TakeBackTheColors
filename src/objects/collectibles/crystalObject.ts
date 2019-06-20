import * as Assets from '../../assets';
import PlayerObject from '../playerObject';

export default class CrystalObject extends Phaser.Sprite {
  public collectible: Phaser.Sprite;
  private typeId: number;
  private playerObj: PlayerObject;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, typeId: number, playerObj: PlayerObject) {
    super(game, 0, 0);
    this.typeId = typeId;
    this.playerObj = playerObj;
    let spriteId: number[];
    switch (typeId) {
      case 0:
        spriteId = [0, 1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0];
        break;
      case 1:
        break;
      case 2:
        break;
      case 3:
        break;
      case 4:
        break;
      default: throw 'Crystal type can only be [0, 4]';
    }
    this.collectible = game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Spritesheets.SpritesheetsCrystalsCrystal27336420.getName());
    this.collectible.animations.add('idle', spriteId, 12, true);
    this.collectible.animations.play('idle');
    this.collectible.anchor.setTo(0.25);
    this.collectible.scale.set(0.25, 0.25);
    game.physics.enable(this.collectible);
    // Inject this object to event loop.
    game.add.existing(this);
  }
  public callback() {
    if (this.typeId === 0) {
      this.playerObj.setRopeEnabled();
    }
  }
}