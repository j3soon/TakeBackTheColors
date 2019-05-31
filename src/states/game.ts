import * as Assets from '../assets';
import Background from '../objects/background';

export default class Game extends Phaser.State {
  // TODO: Make dynamic tilemap afterwards.
  private map: Phaser.Tilemap;
  private layer: Phaser.TilemapLayer;

  public create(): void {
    this.map = this.game.add.tilemap(Assets.TilemapJSON.TilemapsForest.getName());
    this.map.addTilesetImage(Assets.Images.ImagesCavesofgalletTiles.getName());
    this.layer = this.map.createLayer('Tile Layer 1');
    this.layer.resizeWorld();
    this.map.setCollision(1, true, this.layer);
  }
  public update(): void {
  }
  public postUpdate(): void {
  }
}