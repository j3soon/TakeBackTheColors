import * as Assets from '../assets';
import BackgroundObject from '../objects/backgroundObject';
import MapObject from '../objects/mapObject';
import PlayerObject from '../objects/playerObject';
import RopeObject from '../objects/ropeObject';
import EnemyObject from '../objects/enemyObject';
import CheckpointObject from '../objects/checkpointObject';
import CrystalObject from '../objects/collectibles/crystalObject';

export default class Game extends Phaser.State {
  public readonly gravity = 1800;
  private bgObj: BackgroundObject;
  private mapObj: MapObject;
  private playerObj: PlayerObject;
  private ropeObj: RopeObject;
  private enemyObjs: EnemyObject[];
  private checkpointObjs: CheckpointObject[];
  private collectibles: Phaser.Sprite[];

  public preload(): void {
      this.game.add.plugin(new Phaser.Plugin.Debug(this.game, this.game.plugins));
  }

  public create(): void {
    // this.game.forceSingleUpdate = true;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.bgObj = new BackgroundObject(this.game);
    this.mapObj = new MapObject(this.game);
    this.playerObj = new PlayerObject(this.game, this.mapObj.spawnPoint, this.gravity);
    this.ropeObj = new RopeObject(this.game, this.gravity, this.playerObj.player);
    this.playerObj.setRopeObject(this.ropeObj);
    this.enemyObjs = this.mapObj.createEnemies(this.game, this.gravity, this.playerObj.player);
    this.checkpointObjs = this.mapObj.createCheckpoints(this.game);
    this.collectibles = this.mapObj.createCollectibles(this.game, this.playerObj);
    this.bgObj.setTopLayers();
    this.game.camera.follow(this.playerObj.getPlayer(), Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    // Optmize
    this.game.renderer.renderSession.roundPixels = true;

    // Fix Tunneling (Bullet-Through-Paper) problem.
    this.game.physics.arcade.TILE_BIAS = 38;
    // Disable right click context menu.
    document.body.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        return false;
    });
    this.game.time.advancedTiming = true;

    this.enemyObjs.push(new EnemyObject(this.game, new Phaser.Point(100, 1000), this.gravity));
  }
  update(): void {
    // # Rope
    if (this.ropeObj.ropeState !== 'idle') {
      // TODO: make this.enemyObjs to group.
      for (let enemy of this.enemyObjs) {
        this.game.physics.arcade.overlap(this.ropeObj.ropeAnchor, enemy.enemy, () => {
          this.ropeObj.ropeState = 'idle';
        });
      }
      // Rope disappear if hit instant death tiles.
      this.game.physics.arcade.collide(this.ropeObj.ropeAnchor, this.mapObj.instantDeathLayer, () => {
        this.ropeObj.ropeState = 'idle';
      });
      this.game.physics.arcade.collide(this.ropeObj.ropeAnchor, this.mapObj.obstacleLayer);
    }
    // # Enemies
    for (let i = 0; i < this.enemyObjs.length; i++) {
      let enemy = this.enemyObjs[i];
      this.game.physics.arcade.collide(enemy.enemy, this.mapObj.obstacleLayer);
      /*for (let j = i + 1; j < this.enemyObjs.length; j++) {
        let enemy2 = this.enemyObjs[j];
        this.game.physics.arcade.collide(enemy.enemy, enemy2.enemy);
      }*/
    }
    // # Player
    // Die if hit instant death tiles.
    this.game.physics.arcade.collide(this.playerObj.player, this.mapObj.instantDeathLayer, () => {
      this.playerObj.respawn();
    });
    // Die if hit enemy.
    for (let enemy of this.enemyObjs) {
      this.game.physics.arcade.overlap(this.playerObj.player, enemy.enemy, () => {
        this.playerObj.respawn();
      });
    }
    // # Collectibles
    for (let collectible of this.collectibles) {
      this.game.physics.arcade.collide(this.playerObj.player, (<CrystalObject>collectible).collectible, () => {
        (<CrystalObject>collectible).callback();
        collectible.kill();
      });
    }
    // # Checkpoints
    for (let checkpoint of this.checkpointObjs) {
      if (checkpoint.used)
        continue;
      this.game.physics.arcade.collide(this.playerObj.player, checkpoint.checkpoint, () => {
        checkpoint.setUsed();
        this.playerObj.spawnPoint.x = checkpoint.checkpoint.x;
        this.playerObj.spawnPoint.y = checkpoint.checkpoint.y;
      });
    }
    // # Player'
    // At last, check against walls so that dying can be more accurate.
    this.game.physics.arcade.collide(this.playerObj.player, this.mapObj.obstacleLayer);
  }
  render(): void {
    this.game.debug.text(this.game.time.fps.toString(), 20, 60, "#00ff00", "40pt Consolas");
  }
  public postUpdate(): void {
  }
}