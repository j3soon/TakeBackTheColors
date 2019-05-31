import * as Assets from '../assets';

export default class Background extends Phaser.Sprite {
  // 11 layer background instances.
  private tiles: Phaser.TileSprite[] = [];
  // The move difference of layers. (The higher the number, the slower it moves)
  private tilesMove: number[];

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
    super(game, 0, 0);
    let layers = [];
    // From far(10) to near(0).
    layers.push(Assets.Images.ImagesBgLayer10.getName());
    layers.push(Assets.Images.ImagesBgLayer9.getName());
    layers.push(Assets.Images.ImagesBgLayer8.getName());
    layers.push(Assets.Images.ImagesBgLayer7.getName());
    layers.push(Assets.Images.ImagesBgLayer6.getName());
    layers.push(Assets.Images.ImagesBgLayer5.getName());
    layers.push(Assets.Images.ImagesBgLayer4.getName());
    layers.push(Assets.Images.ImagesBgLayer3.getName());
    layers.push(Assets.Images.ImagesBgLayer2.getName());
    layers.push(Assets.Images.ImagesBgLayer1.getName());
    layers.push(Assets.Images.ImagesBgLayer0.getName());

    // Different moving speed to create 3D-like background effect.
    // From far([0]) to near([10]).
    this.tilesMove = [0, 32, 16, 16, 8, 4, 4, 1.5, 1.5, 1, 0.5];

    let w = 10000;
    let h = this.game.cache.getImage(layers[0]).height * w / this.game.cache.getImage(layers[0]).width;

    for (let i = 0; i < layers.length; i++) {
      let tile = this.game.add.tileSprite(0, 0, w, h, layers[i]);
      tile.fixedToCamera = true;
      tile.tileScale.x = 4;
      tile.tileScale.y = 4;
      this.tiles.push(tile);
    }

    // Inject this object to event loop.
    this.game.add.existing(this);
    Phaser.Canvas.setImageRenderingCrisp(game.canvas);
  }

  public postUpdate(): void {
    // Ground and grass layer should be above players, enemies, ...
    // Hacky way to preserve layer relationship.
    this.game.world.bringToTop(this.tiles[9]);
    this.game.world.bringToTop(this.tiles[10]);
    // BG
    for (let i = 0; i < this.tiles.length; i++) {
      let tile = this.tiles[i];
      if (this.tilesMove[i] === 0)
        continue;
      // Some offset for better background parts in test level.
      tile.tilePosition.y =  (600 - this.game.camera.view.centerY) / tile.tileScale.y;
      tile.tilePosition.x = -this.game.camera.view.centerX / tile.tileScale.x / this.tilesMove[i];
    }
  }
}