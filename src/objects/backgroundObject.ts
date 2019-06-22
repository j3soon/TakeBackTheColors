import * as Assets from '../assets';
import MapObject from './mapObject';

export default class BackgroundObject extends Phaser.Sprite {
  // 11 layer background instances.
  private tiles: Phaser.TileSprite[] = [];
  private yMove = 3;
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
    // console.log(MapObject.tileMapId);
    if (MapObject.tileMapId === 'forest') {
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
    } else if (MapObject.tileMapId === 'forestTop') {
      layers.push(Assets.Images.ImagesBg2ForestTopLayer5.getName());
      layers.push(Assets.Images.ImagesBg2ForestTopLayer4.getName());
      layers.push(Assets.Images.ImagesBg2ForestTopLayer3.getName());
      layers.push(Assets.Images.ImagesBg2ForestTopLayer2.getName());
      layers.push(Assets.Images.ImagesBg2ForestTopLayer1.getName());
      layers.push(Assets.Images.ImagesBg2ForestTopLayer0.getName());
      layers.push(Assets.Images.ImagesBgLayer2.getName());
      // Different moving speed to create 3D-like background effect.
      // From far([0]) to near([10]).
      this.tilesMove = [128, 64, 32, 16, 8, 4, 1];
    }

    let w = this.game.camera.view.width;
    let h = this.game.camera.view.height;

    for (let i = 0; i < layers.length; i++) {
      let tile = this.game.add.tileSprite(0, 0, w, h, layers[i]);
      tile.fixedToCamera = true;
      if (layers[i].includes("forest-top")) {
        tile.tileScale.x = 2;
        tile.tileScale.y = 2;
      } else {
        tile.tileScale.x = 4;
        tile.tileScale.y = 4;
      }
      tile.smoothed = false;
      this.tiles.push(tile);
    }

    // Inject this object to event loop.
    this.game.add.existing(this);
  }

  public postUpdate(): void {
    // BG
    for (let i = 0; i < this.tiles.length; i++) {
      let tile = this.tiles[i];
      if (this.tilesMove[i] === 0)
        continue;
      let deltaY1, deltaY2, deltaX2;
      if (MapObject.tileMapId === 'forest') {
        deltaY1 = this.game.camera.view.height / tile.tileScale.y + 6;
      } else if (MapObject.tileMapId === 'forestTop') {
        deltaY1 = 153 * tile.tileScale.y;
        deltaX2 = -850;
        deltaY2 = 950;
        if (i !== 0) {
          deltaY2 -= 250;
          deltaY2 += 400 / this.tilesMove[i];
        }
      }
      /*console.log(this.game.camera.view.centerY);
      console.log(this.game.world.bounds.y);
      console.log(this.game.camera.view.height / 2);*/
      // Some offset for better background parts in test leel.
      // Hide vertical tilemap if wrap.
      if (MapObject.tileMapId === 'forest') {
        // Hacky way to hide bg.
        tile.visible = (tile.tilePosition.y <= deltaY1 + 793 / 2/* * tile.tileScale.y *//*- this.game.camera.view.height / tile.tileScale.y*/);
        tile.tilePosition.y = deltaY1 + (9000 - this.game.camera.view.centerY) / tile.tileScale.y / this.tilesMove[i] / this.yMove; //this.tilesDeltaY[i] (- this.game.camera.view.height - this.game.camera.view.centerY) / tile.tileScale.y / this.tilesMove[i];
        tile.tilePosition.x = -this.game.camera.view.centerX / tile.tileScale.x / this.tilesMove[i] / this.yMove;
      } else if (MapObject.tileMapId === 'forestTop') {
        if (i === 6) {
          tile.visible = (tile.tilePosition.y <= deltaY1 + 100/* * tile.tileScale.y *//*- this.game.camera.view.height / tile.tileScale.y*/);
          tile.tilePosition.y = deltaY1 + (9000 - this.game.camera.view.centerY) / tile.tileScale.y / this.tilesMove[i];
          tile.tilePosition.x = -this.game.camera.view.centerX / tile.tileScale.x;
        } else {
          tile.visible = (tile.tilePosition.y <= deltaY2 + 800/* * tile.tileScale.y *//*- this.game.camera.view.height / tile.tileScale.y*/);
          // console.log(this.game.camera.view.centerY);
          tile.tilePosition.y = deltaY2 + (1640 - this.game.camera.view.centerY) / tile.tileScale.y / this.tilesMove[i];
          tile.tilePosition.x = deltaX2 + (-this.game.camera.view.centerX) / tile.tileScale.x / this.tilesMove[i];
        }
      }
    }
  }
  public setTopLayers() {
    // Ground and grass layer should be above players, enemies, ...
    // this.game.world.bringToTop(this.tiles[9]);
    if (MapObject.tileMapId === 'forest') {
      this.game.world.bringToTop(this.tiles[10]);
    } else if (MapObject.tileMapId === 'forestTop') {
      this.game.world.bringToTop(this.tiles[6]);
    }
  }
}