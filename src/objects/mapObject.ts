import * as Assets from '../assets';
import PlayerObject from './playerObject';
import EnemyObject from './enemyObject';
import CheckpointObject from './checkpointObject';
import CollectibleObject from './collectibles/crystalObject';
import SpikeEnemyObject from './enemies/spikeEnemyObject';
import SawEnemyObject from './enemies/sawEnemyObject';
import PropellerEnemyObject from './enemies/propellerEnemyObject';
import WingEnemyObject from './enemies/wingEnemyObject';
import CloudEnemyObject from './enemies/cloudEnemyObject';
// # Forest Top
import EagleEnemyObject from './enemies/eagleEnemyObject';
import FreeSawEnemyObject from './enemies/freeSawEnemyObject';

export default class MapObject extends Phaser.Sprite {
  private map: Phaser.Tilemap;

  public decorationLayer: Phaser.TilemapLayer;
  public obstacleLayer: Phaser.TilemapLayer;
  public instantDeathLayer: Phaser.TilemapLayer;
  public layers: Phaser.TilemapLayer[] = [];

  public spawnPoint: Phaser.Point;
  public stageGoalRect: Phaser.Rectangle;
  // public enemySpawnPoints: Phaser.Point[] = [];
  public readonly mapScale: number = 4;

  public static tileMapId: string;

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
    let tileMapName;
    if (MapObject.tileMapId === 'forest')
      tileMapName = Assets.TilemapJSON.TilemapsForest.getName();
    else if (MapObject.tileMapId === 'forestTop')
      tileMapName = Assets.TilemapJSON.TilemapsForestTop.getName();
    this.map = this.game.add.tilemap(tileMapName);
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
      layer.autoCull = true;
      // layer.renderSettings.enableScrollDelta = false;
    }
    // this.map.setCollision(1, true, this.layer);
    this.map.setCollisionByExclusion([], true, this.obstacleLayer);
    this.map.setCollisionByExclusion([], true, this.instantDeathLayer);
    // Object layers.
    // # Player Spawn Point
    // console.log(this.map.objects);
    let objPlayerSpawn = this.map.objects['Player'][0];
    // console.log(objPlayerSpawn);
    if (objPlayerSpawn.name !== 'PlayerSpawn')
      throw 'Tilemap Objects[\'Player\'][0].name !== PlayerSpawn';
    this.spawnPoint = new Phaser.Point(objPlayerSpawn.x + objPlayerSpawn.width / 2, objPlayerSpawn.y + objPlayerSpawn.height / 2);
    this.spawnPoint.x *= this.mapScale;
    this.spawnPoint.y *= this.mapScale;
    // console.log(this.spawnPoint);
    // # Stage Goal Point
    let objStageGoal = this.map.objects['Triggers'][0];
    if (objStageGoal.name !== 'StageGoal')
      throw 'Tilemap Objects[\'Triggers\'][0].name !== StageGoal';
    this.stageGoalRect = new Phaser.Rectangle(objStageGoal.x * this.mapScale, objStageGoal.y * this.mapScale, objStageGoal.width * this.mapScale, objStageGoal.height * this.mapScale);
  }
  public createEnemies(game: Phaser.Game, gravity: number, player: Phaser.Sprite): EnemyObject[] {
    let enemies: EnemyObject[] = [];
    if (this.map.objects['SpikeEnemies'] !== undefined) {
      for (let obj of this.map.objects['SpikeEnemies']) {
        let pnt = new Phaser.Point(obj.x + obj.width / 2, obj.y + obj.height / 2);
        pnt.x *= this.mapScale;
        pnt.y *= this.mapScale;
        let ene = new SpikeEnemyObject(game, pnt, gravity, obj.x * this.mapScale, (obj.x + obj.width) * this.mapScale, player);
        enemies.push(ene);
      }
    }
    if (this.map.objects['PropellerEnemies'] !== undefined) {
      for (let obj of this.map.objects['SawEnemies']) {
        let pnt = new Phaser.Point(obj.x + obj.width / 2, obj.y + obj.height / 2);
        pnt.x *= this.mapScale;
        pnt.y *= this.mapScale;
        let ene = new SawEnemyObject(game, pnt, gravity, obj.x * this.mapScale, (obj.x + obj.width) * this.mapScale, player);
        enemies.push(ene);
      }
    }
    if (this.map.objects['FreeSawEnemiesL'] !== undefined) {
      for (let obj of this.map.objects['FreeSawEnemiesL']) {
        let pnt = new Phaser.Point(obj.x + obj.width / 2, obj.y + obj.height / 2);
        pnt.x *= this.mapScale;
        pnt.y *= this.mapScale;
        let ene = new FreeSawEnemyObject(game, pnt, gravity, player, true);
        enemies.push(ene);
      }
    }
    if (this.map.objects['FreeSawEnemiesR'] !== undefined) {
      for (let obj of this.map.objects['FreeSawEnemiesR']) {
        let pnt = new Phaser.Point(obj.x + obj.width / 2, obj.y + obj.height / 2);
        pnt.x *= this.mapScale;
        pnt.y *= this.mapScale;
        let ene = new FreeSawEnemyObject(game, pnt, gravity, player, false);
        enemies.push(ene);
      }
    }
    if (this.map.objects['PropellerEnemies'] !== undefined) {
      for (let obj of this.map.objects['PropellerEnemies']) {
        let pnt = new Phaser.Point(obj.x + obj.width / 2, obj.y + obj.height / 2);
        pnt.x *= this.mapScale;
        pnt.y *= this.mapScale;
        let ene = new PropellerEnemyObject(game, pnt, gravity, obj.y * this.mapScale, (obj.y + obj.height) * this.mapScale, player);
        enemies.push(ene);
      }
    }
    if (this.map.objects['WingEnemies'] !== undefined) {
      for (let obj of this.map.objects['WingEnemies']) {
        let pnt = new Phaser.Point(obj.x + obj.width / 2, obj.y + obj.height / 2);
        pnt.x *= this.mapScale;
        pnt.y *= this.mapScale;
        let ene = new WingEnemyObject(game, pnt, gravity, obj.x * this.mapScale, (obj.x + obj.width) * this.mapScale, obj.y * this.mapScale, (obj.y + obj.height) * this.mapScale, player);
        enemies.push(ene);
      }
    }
    return enemies;
  }
  public createCheckpoints(game: Phaser.Game): CheckpointObject[] {
    let checkpoints: CheckpointObject[] = [];
    if (this.map.objects['Checkpoints'] !== undefined) {
      for (let obj of this.map.objects['Checkpoints']) {
        let pnt = new Phaser.Point(obj.x + obj.width / 2, obj.y + obj.height / 2);
        pnt.x *= this.mapScale;
        pnt.y *= this.mapScale;
        let checkpoint = new CheckpointObject(game, pnt);
        checkpoints.push(checkpoint);
      }
    }
    return checkpoints;
  }
  public createCollectibles(game: Phaser.Game, playerObj: PlayerObject): Phaser.Sprite[] {
    let collectibles: Phaser.Sprite[] = [];
    if (this.map.objects['Collectibles'] !== undefined) {
      for (let obj of this.map.objects['Collectibles']) {
        let pnt = new Phaser.Point(obj.x + obj.width / 2, obj.y + obj.height / 2);
        pnt.x *= this.mapScale;
        pnt.y *= this.mapScale;
        if (obj.name === 'BlackCrystal') {
          let collectible = new CollectibleObject(game, pnt, 0, playerObj);
          collectibles.push(collectible);
        } else {
          throw 'No such crystal collectible name';
        }
      }
    }
    return collectibles;
  }
}