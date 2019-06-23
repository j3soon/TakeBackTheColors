import * as Assets from '../assets';
import BackgroundObject from '../objects/backgroundObject';
import MapObject from '../objects/mapObject';
import PlayerObject from '../objects/playerObject';
import RopeObject from '../objects/ropeObject';
import EnemyObject from '../objects/enemyObject';
import CheckpointObject from '../objects/checkpointObject';
import CrystalObject from '../objects/collectibles/crystalObject';
import LightningObject from '../objects/projectiles/lightningObject';
import { runInThisContext } from 'vm';

export default class Game extends Phaser.State {
  public readonly gravity = 1800;
  private bgObj: BackgroundObject;
  public mapObj: MapObject;
  public playerObj: PlayerObject;
  private ropeObj: RopeObject;
  public enemyObjs: EnemyObject[];
  private checkpointObjs: CheckpointObject[];
  private collectibles: Phaser.Sprite[];
  private debugTools = false;
  public bgm: any;
  public bossBgm: any;
  private ab: Phaser.Sprite;
  private turnDark: boolean;
  private reveal: boolean;
  // If entered from title scene.
  private firstEntrance = true;

  public preload(): void {
    if (this.debugTools)
      this.game.add.plugin(new Phaser.Plugin.Debug(this.game, this.game.plugins));
  }

  public create(): void {
	this.bossBgm = this.game.add.audio(Assets.Audio.AudioJuhaniJunkalaEpicBossBattleSeamlesslyLooping.getName());
    this.bgm = this.game.add.audio(Assets.Audio.Audio8bitBossa.getName());
    
    // this.game.forceSingleUpdate = true;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    if (this.firstEntrance) {
      this.firstEntrance = false;
      MapObject.tileMapId = 'forestTop';
    }
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
    this.game.camera.focusOn(this.playerObj.player);
    // Optimize
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
	this.updateMapData();
	this.ab = this.game.add.sprite(0, 0, Assets.Images.ImagesAllBlack.getName());
	this.ab.fixedToCamera = true;
	this.ab.bringToTop();
	if(MapObject.tileMapId === 'forestTop') { 
		// BOSS
		this.ab.alpha = 1;
		this.reveal = true;
		this.bossBgm.play('', 0, 1, true);
	} else {
		this.ab.alpha = 0;
		this.bgm.play('', 0, 1, true);
	}
  }
  updateMapData(): void {
    if (MapObject.tileMapId === 'forest') {
    } else if (MapObject.tileMapId === 'forestTop') {
      this.playerObj.setRopeEnabled();
    }
  }
  update(): void {
	this.ab.bringToTop();
	if(this.reveal) {
		this.ab.alpha = Math.max(0, this.ab.alpha - 0.03);
	} else if (this.turnDark) {
		this.ab.alpha += 0.02;
	}
    // # Rope
    if (this.ropeObj.ropeState !== 'idle') {
      // TODO: make this.enemyObjs to group.
      for (let enemy of this.enemyObjs) {
        this.game.physics.arcade.overlap(this.ropeObj.ropeAnchor, enemy.enemy, () => {
          this.ropeObj.ropeState = 'idle';
        });
      }
      // Rope disappear if hit instant death tiles.
      if (this.mapObj.instantDeathLayer !== null) {
        this.game.physics.arcade.collide(this.ropeObj.ropeAnchor, this.mapObj.instantDeathLayer, () => {
          this.ropeObj.ropeState = 'idle';
        });
      }
      this.game.physics.arcade.collide(this.ropeObj.ropeAnchor, this.mapObj.obstacleLayer);
    }
    // # Enemies
    let kills = [];
    for (let i = 0; i < this.enemyObjs.length; i++) {
      let enemy = this.enemyObjs[i];
      this.game.physics.arcade.collide(enemy.enemy, this.mapObj.obstacleLayer);
      /*for (let j = i + 1; j < this.enemyObjs.length; j++) {
        let enemy2 = this.enemyObjs[j];
        this.game.physics.arcade.collide(enemy.enemy, enemy2.enemy);
      }*/
      if (enemy.die) {
        if (this.mapObj.instantDeathLayer !== null) {
          this.game.physics.arcade.collide(enemy.enemy, this.mapObj.instantDeathLayer, () => {
            // TODO: Optimize.
            kills.push(i);
          });
        }
      }
    }
    let i = kills.length - 1;
    while (i >= 0) {
      let enemy = this.enemyObjs[kills[i]];
      this.enemyObjs.splice(kills[i], 1);
      enemy.callback();
      i--;
    }
    // # Player
    // Die if hit instant death tiles.
    if (this.mapObj.instantDeathLayer !== null) {
      this.game.physics.arcade.collide(this.playerObj.player, this.mapObj.instantDeathLayer, () => {
        this.playerObj.respawn();
      });
    }
    // Die if hit enemy.
    for (let enemy of this.enemyObjs) {
      this.game.physics.arcade.overlap(this.playerObj.player, enemy.enemy, () => {
        this.playerObj.respawn();
      });
    }
    // # Collectibles
    /*for (let collectible of this.collectibles) {
      this.game.physics.arcade.overlap(this.playerObj.player, (<CrystalObject>collectible).collectible, () => {
        (<CrystalObject>collectible).callback();
      });
    }*/
    // # Checkpoints
    for (let checkpoint of this.checkpointObjs) {
      if (checkpoint.used)
        continue;
      this.game.physics.arcade.overlap(this.playerObj.player, checkpoint.checkpoint, () => {
        checkpoint.setUsed();
        this.playerObj.spawnPoint.x = checkpoint.checkpoint.x;
        this.playerObj.spawnPoint.y = checkpoint.checkpoint.y;
      });
    }
    // # Player'
    // At last, check against walls so that dying can be more accurate.
    this.game.physics.arcade.collide(this.playerObj.player, this.mapObj.obstacleLayer);
    // # Goal
    let x = this.playerObj.player.x;
    let y = this.playerObj.player.y;
    if (this.mapObj.stageGoalRect.x < x && x < this.mapObj.stageGoalRect.x + this.mapObj.stageGoalRect.width &&
        this.mapObj.stageGoalRect.y < y && y < this.mapObj.stageGoalRect.y + this.mapObj.stageGoalRect.height) {
          if (MapObject.tileMapId === 'forest' && !this.turnDark) {
            console.log('change stage to forest top');
            MapObject.tileMapId = 'forestTop';
			// TODO: Use fade in fade out YBing
			this.turnDark = true;
            this.game.time.events.add(Phaser.Timer.SECOND * 2, function() {this.game.state.restart(true);}, this);
          }
    }
  }
  render(): void {
    if (this.debugTools)
      this.game.debug.text(this.game.time.fps.toString(), 20, 60, "#00ff00", "40pt Consolas");
  }
  public postUpdate(): void {
  }
}