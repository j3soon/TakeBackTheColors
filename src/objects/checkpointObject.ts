import * as Assets from '../assets';
import Game from '../states/game';

export default class CheckpointObject extends Phaser.Sprite {
  public checkpoint: Phaser.Sprite;
  public used: boolean = false;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point) {
    super(game, 0, 0);
    this.checkpoint = game.add.sprite(spawnPoint.x + 25, spawnPoint.y, Assets.Spritesheets.SpritesheetsFlag20232410.getName());
    this.checkpoint.animations.add('anim');
    this.checkpoint.animations.play('anim', 24, true);
    this.checkpoint.anchor.setTo(0.5);
    this.checkpoint.scale.set(0.25, 0.25);
    game.physics.enable(this.checkpoint);
    // Inject this object to event loop.
    game.add.existing(this);
    this.checkpoint.autoCull = true;
  }
  public setUsed() {
    this.used = true;
    this.checkpoint.body.destroy();
    this.checkpoint.loadTexture(Assets.Spritesheets.SpritesheetsRedflag20232410.getName());
    this.checkpoint.animations.add('anim');
    this.checkpoint.animations.play('anim', 24, true);
  }
}