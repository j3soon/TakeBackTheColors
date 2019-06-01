import * as Assets from '../assets';

export default class MapObject extends Phaser.Sprite {
  private map: Phaser.Tilemap;

  public layer: Phaser.TilemapLayer;

  /**
  * Sprites are the lifeblood of your game, used for nearly everything visual.
  *
  * At its most basic a Sprite consists of a set of coordinates and a texture that is rendered to the canvas.
  * They also contain additional properties allowing for physics motion (via Sprite.body), input handling (via Sprite.input),
  * events (via Sprite.events), animation (via Sprite.animations), camera culling and more. Please see the Examples for use cases.
  *
  * @param game A reference to the currently running game.
  * @param x The x coordinate (in world space) to position the Sprite at.
  * @param y The y coordinate (in world space) to position the Sprite at.
  * @param key This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture or PIXI.Texture. If this argument is omitted, the sprite will receive {@link Phaser.Cache.DEFAULT the default texture} (as if you had passed '__default'), but its `key` will remain empty.
  * @param frame If this Sprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
  */
  constructor(game: Phaser.Game) {
    // TODO: Make certain tilemap dynamic. (for boss)
    super(game, 0, 0);
    // Init tilemap.
    this.map = this.game.add.tilemap(Assets.TilemapJSON.TilemapsForest.getName());
    this.map.addTilesetImage(Assets.Images.ImagesCavesofgalletTiles.getName());
    this.layer = this.map.createLayer('Tile Layer 1');
    // this.layer.debug = true;
    this.layer.setScale(4);
    // The code below cannot work.
    // this.layer.scale.set(4);
    this.layer.resizeWorld();
    // Pixel perfect scaling.
    this.layer.smoothed = false;
    // To improve performance.
    this.layer.renderSettings.enableScrollDelta = false;
    // this.map.setCollision(1, true, this.layer);
    this.map.setCollisionByExclusion([], true, this.layer);
  }
}