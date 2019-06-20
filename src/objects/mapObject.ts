import * as Assets from '../assets';
import EnemyObject from './enemyObject';
import CheckpointObject from './checkpointObject';
import SpikeEnemyObject from './spikeEnemyObject';
import SawEnemyObject from './sawEnemyObject';
import PropellerEnemyObject from './propellerEnemyObject';
import WingEnemyObject from './wingEnemyObject';

export default class MapObject extends Phaser.Sprite {
  private map: Phaser.Tilemap;

  public decorationLayer: Phaser.TilemapLayer;
  public obstacleLayer: Phaser.TilemapLayer;
  public instantDeathLayer: Phaser.TilemapLayer;
  public layers: Phaser.TilemapLayer[] = [];

  public spawnPoint: Phaser.Point;
  // public enemySpawnPoints: Phaser.Point[] = [];
  public readonly mapScale: number = 4;

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
    // Tile layers.
    this.map.addTilesetImage(Assets.Images.ImagesCavesofgalletTiles.getName());
    this.decorationLayer = this.map.createLayer('Decorations');
    this.obstacleLayer = this.map.createLayer('Obstacles');
    this.instantDeathLayer = this.map.createLayer('InstantDeath');
    this.layers.push(this.decorationLayer);
    this.layers.push(this.obstacleLayer);
    this.layers.push(this.instantDeathLayer);
    for (let layer of this.layers) {
      // this.layer.debug = true;
      layer.setScale(this.mapScale);
      // The code below cannot work.
      // this.layer.scale.set(4);
      layer.resizeWorld();
      // Pixel perfect scaling.
      layer.smoothed = false;
      // To improve performance.
      layer.renderSettings.enableScrollDelta = false;
    }
    // this.map.setCollision(1, true, this.layer);
    this.map.setCollisionByExclusion([], true, this.obstacleLayer);
    this.map.setCollisionByExclusion([], true, this.instantDeathLayer);
    // Object layers.
    // console.log(this.map.objects);
    let objPlayerSpawn = this.map.objects['Player'][0];
    console.log(objPlayerSpawn);
    if (objPlayerSpawn.name !== 'PlayerSpawn')
      throw 'Tilemap Objects[\'Player\'][0].name !== PlayerSpawn';
    this.spawnPoint = new Phaser.Point(objPlayerSpawn.x + objPlayerSpawn.width / 2, objPlayerSpawn.y + objPlayerSpawn.height / 2);
    this.spawnPoint.x *= this.mapScale;
    this.spawnPoint.y *= this.mapScale;
    console.log(this.spawnPoint);
  }
  public createEnemies(game: Phaser.Game, gravity: number, player: Phaser.Sprite): EnemyObject[] {
    let enemies: EnemyObject[] = [];
    for (let obj of this.map.objects['SpikeEnemies']) {
      let pnt = new Phaser.Point(obj.x + obj.width / 2, obj.y + obj.height / 2);
      pnt.x *= this.mapScale;
      pnt.y *= this.mapScale;
      let ene = new SpikeEnemyObject(game, pnt, gravity, obj.x * this.mapScale, (obj.x + obj.width) * this.mapScale, player);
      enemies.push(ene);
    }
    for (let obj of this.map.objects['SawEnemies']) {
      let pnt = new Phaser.Point(obj.x + obj.width / 2, obj.y + obj.height / 2);
      pnt.x *= this.mapScale;
      pnt.y *= this.mapScale;
      let ene = new SawEnemyObject(game, pnt, gravity, obj.x * this.mapScale, (obj.x + obj.width) * this.mapScale, player);
      enemies.push(ene);
    }
    for (let obj of this.map.objects['PropellerEnemies']) {
      let pnt = new Phaser.Point(obj.x + obj.width / 2, obj.y + obj.height / 2);
      pnt.x *= this.mapScale;
      pnt.y *= this.mapScale;
      let ene = new PropellerEnemyObject(game, pnt, gravity, obj.y * this.mapScale, (obj.y + obj.height) * this.mapScale, player);
      enemies.push(ene);
    }
    for (let obj of this.map.objects['WingEnemies']) {
      let pnt = new Phaser.Point(obj.x + obj.width / 2, obj.y + obj.height / 2);
      pnt.x *= this.mapScale;
      pnt.y *= this.mapScale;
      let ene = new WingEnemyObject(game, pnt, gravity, obj.x * this.mapScale, (obj.x + obj.width) * this.mapScale, obj.y * this.mapScale, (obj.y + obj.height) * this.mapScale, player);
      enemies.push(ene);
    }
    return enemies;
  }
  public createCheckpoints(game: Phaser.Game): CheckpointObject[] {
    let checkpoints: CheckpointObject[] = [];
    for (let obj of this.map.objects['Checkpoints']) {
      let pnt = new Phaser.Point(obj.x + obj.width / 2, obj.y + obj.height / 2);
      pnt.x *= this.mapScale;
      pnt.y *= this.mapScale;
      let check = new CheckpointObject(game, pnt);
      checkpoints.push(check);
    }
    return checkpoints;
  }
}