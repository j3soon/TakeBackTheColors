import * as Assets from '../../assets';
import PlayerObject from '../playerObject';
import EagleEnemyObject from '../enemies/eagleEnemyObject';

export default class CrystalObject extends Phaser.Sprite {
  // public static whiteInstance: CrystalObject;

  public collectible: Phaser.Sprite;
  private shiny: Phaser.Sprite;
  private typeId: number;
  private playerObj: PlayerObject;

  private tween: Phaser.Tween;
  private tween2: Phaser.Tween;

  public static greenCount = 0;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, typeId: number, playerObj: PlayerObject) {
    super(game, 0, 0);
    this.typeId = typeId;
    this.playerObj = playerObj;
    let spriteId: number[];
    switch (typeId) {
      case 0:
        spriteId = [0, 1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        break;
      case 1:
        spriteId = [8, 9, 10, 11, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8];
        break;
      case 2:
        spriteId = [4, 5, 6, 7, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
        break;
      case 3:
        spriteId = [12, 13, 14, 15, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12];
        break;
      case 4:
        spriteId = [16, 17, 18, 19, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16];
        // CrystalObject.whiteInstance = this;
        break;
      default: throw 'Crystal type can only be [0, 4]';
    }
    this.shiny = game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Images.ImagesShiny.getName());
    this.shiny.anchor.setTo(0.5);
    this.collectible = game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Spritesheets.SpritesheetsCrystalsCrystal27536620.getName());
    this.collectible.animations.add('idle', spriteId, 12, true);
    this.collectible.animations.play('idle');
    this.collectible.anchor.setTo(0.5);
    this.collectible.scale.set(0.25, 0.25);
    game.physics.enable(this.collectible);
    // Inject this object to event loop.
    game.add.existing(this);
    this.startTween();
    this.shiny.autoCull = true;
    this.collectible.autoCull = true;
  }
  public startTween() {
    this.shiny.scale.set(0.1, 0.1);
    this.tween = this.game.add.tween(this.shiny.scale).to({ x: 2, y: 2 }, 4000, Phaser.Easing.Exponential.Out, true);
    this.tween.repeat(-1);
    /// this.tween.onComplete.add(this.startTween, this);
    this.tween2 = this.game.add.tween(this.shiny).to({ alpha: 0 }, 4000, Phaser.Easing.Exponential.Out, true);
    this.tween2.repeat(-1);
  }
  public update() {
    this.game.physics.arcade.overlap(this.playerObj.player, this.collectible, () => {
      this.callback();
    });
  }
  public callback() {
    if (this.typeId === 0) {
      // Black
      this.playerObj.setRopeEnabled();
    } else if (this.typeId === 1) {
      // Green
      if (CrystalObject.greenCount === 0) {
        CrystalObject.greenCount = 1;
      } else {
        // Spawn Blue
        let collectible = new CrystalObject(this.game, new Phaser.Point(this.x, this.y), 2, this.playerObj);
        EagleEnemyObject.enemyStage++;
      }
    } else if (this.typeId === 2) {
      // Blue
      // Spawn Red
      let collectible = new CrystalObject(this.game, new Phaser.Point(this.x, this.y), 3, this.playerObj);
      EagleEnemyObject.enemyStage++;
    } else if (this.typeId === 3) {
      // Red
      // Eagle dead.
      EagleEnemyObject.enemyStage++;
    } else if (this.typeId === 4) {
      // White
      // TODO: Win!!!!!!! YBing
      console.log('win');
    }
    this.collectible.destroy();
    this.tween.stop();
    this.tween2.stop();
    this.shiny.destroy();
    this.destroy();
  }
}