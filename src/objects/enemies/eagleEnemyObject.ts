import * as Assets from '../../assets';
import EnemyObject from '../enemyObject';
import IceObject from '../projectiles/iceObject';
import LaserObject from '../projectiles/laserObject';
import Game from '../../states/game';

export default class EagleEnemyObject extends EnemyObject {
  public fightAreaRect: Phaser.Rectangle;
  public fightStart1Rect: Phaser.Rectangle;
  public fightStart2Rect: Phaser.Rectangle;
  private state = 'stop';

  private coolDown = 6;
  private coolDownReset = 6;
  private dockLeft = true;
  private ab: any;
  private diveCount = 2;
  private diveCountReset = 2;
  private laserCount = 4;
  private laserPrepareCountReset = 1;
  private laserCountReset = 4;

  private laserCD = 0.05;
  private laserCDReset = 0.05;

  private shockCount = 2;
  private shockCountReset = 2;
  private ice: any;
  private cry: any;

  // 0: ice
  // 1: dive
  // 2: laser
  // 3: dead bird
  public static enemyStage = 0;
  public static nextStage = false;

  private player: Phaser.Sprite;

  private targetPoint: Phaser.Point = new Phaser.Point();

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, gravity: number, moveRect: Phaser.Rectangle, fightStart1Rect: Phaser.Rectangle, fightStart2Rect: Phaser.Rectangle, player: Phaser.Sprite) {
    super(game, spawnPoint, gravity);
    this.fightAreaRect = moveRect;
    this.fightStart1Rect = fightStart1Rect;
	this.fightStart2Rect = fightStart2Rect;
	this.ice = this.game.add.audio(Assets.Audio.AudioCloudAttack.getName());
	this.cry = this.game.add.audio(Assets.Audio.AudioEagleCry.getName());
    this.player = player;
    //this.enemy = game.add.sprite(0, 0, Assets.Spritesheets.SpritesheetsEnemiesPropeller1221396.getName());
    this.enemy = game.add.sprite(0, 0, Assets.Spritesheets.SpritesheetsEagleBoss80070018.getName());
    // this.enemy.animations.add('take-off', [0, 1, 2, 3], 12, true);
	this.enemy.animations.add('idle', [5, 6, 7, 8], 8, true);
	this.enemy.animations.add('dive', [9, 10], 4, true);
	this.enemy.animations.add('shock', [11, 14], 6, true);
	this.enemy.animations.add('laser0', [12, 13], 1, false);
	this.enemy.animations.add('laser1', [15, 16], 1, false);
    // this.enemy.animations.add('dive', [4, 5], 12, true);
    // this.enemy.animations.add('laser', [2, 3], 12, true);
    this.enemy.animations.play('idle');
    this.enemy.anchor.setTo(0.5);
	this.enemy.scale.set(1);

    game.physics.enable(this.enemy);
	this.enemy.body.setSize(400, 350, 200, 175);
	// this.enemy.body.gravity.y = gravity;
	this.enemy.autoCull = true;

  }
  public shootIce() {
	this.ice.play();
    new IceObject(this.game, new Phaser.Point(this.enemy.x, this.enemy.y), this.player);
    this.enemy.bringToTop();
    if (this.game.rnd.integerInRange(0, 10) < 3)
      this.dockLeft = !this.dockLeft;
  }
  public eletric() {
    this.state = 'shock';
    this.shockCount = this.shockCountReset;
  }
  public dive() {
    this.dockLeft = !this.dockLeft;
    this.state = 'dive';
	this.diveCount = this.diveCountReset;
	this.enemy.animations.play('dive');
	this.cry.play();
  }
  public shootLaser() {
    this.state = 'laserPrepare';
    this.laserCount = this.laserPrepareCountReset;
    this.laserCD = this.laserCDReset;
	//  Play neck forward anim YBing
  this.enemy.animations.play('laser0');
  this.targetPoint.x = this.player.x
  this.targetPoint.y = this.player.y
  }
  public resetCD() {
    this.coolDown = this.coolDownReset + this.game.rnd.frac() * 8;
  }
  public calcAttack() {
    if (this.state !== 'idle') {
      return;
    }
    this.coolDown -= this.game.time.elapsed / 1000;
    if (this.coolDown <= 0) {
      this.resetCD();
      // Attack!!
      let r = this.game.rnd.integerInRange(0, 10);
      if (EagleEnemyObject.enemyStage === 0) {
        this.shootLaser();
      } else if (EagleEnemyObject.enemyStage === 1) {
        if (r <= 7)
          this.shootIce();
        else
          this.dive();
      } else if (EagleEnemyObject.enemyStage === 2) {
        if (r <= 4)
          this.shootIce();
        else if (r <= 7)
          this.dive();
        else
          this.shootLaser();
      }
    }
  }
  public changeState() {
	let newScaleX = this.player.x < this.enemy.x ? 1 : -1;
  // For idle, dive
  let target = new Phaser.Point();
  target.y = this.game.camera.view.centerY - 500;
  let newY = this.fightAreaRect.y + this.enemy.height / 2 - 150;
  target.y = Math.max(target.y, newY);
  if (this.dockLeft) {
    target.x = this.game.camera.view.centerX - 700;
    let newX = this.fightAreaRect.x + this.enemy.width / 2 + 50;
    target.x = Math.max(target.x, newX);
  } else {
    target.x = this.game.camera.view.centerX + 700;
    let newX = this.fightAreaRect.x + this.fightAreaRect.width - this.enemy.width / 2 - 50;
    target.x = Math.min(target.x, newX);
  }
	if (newScaleX != this.enemy.scale.x && Math.abs(this.enemy.x - this.player.x) > 50) this.enemy.scale.x = newScaleX;
    let x = this.player.x;
    let y = this.player.y;
    switch (this.state) {
      case 'stop':
        if (this.fightStart1Rect.x < x && x < this.fightStart1Rect.x + this.fightStart1Rect.width &&
            this.fightStart1Rect.y < y && y < this.fightStart1Rect.y + this.fightStart1Rect.height) {
              this.state = 'anim';
            }
        if (this.fightStart2Rect.x < x && x < this.fightStart2Rect.x + this.fightStart2Rect.width &&
            this.fightStart2Rect.y < y && y < this.fightStart2Rect.y + this.fightStart2Rect.height) {
              this.state = 'anim';
            }
        /*if (CrystalObject.greenCount === 1) {
          this.state = 'anim';
        }*/
        break;
      case 'anim':
        // TODO: Pause and animate! YBing
        // On finish:
        // Kick player back.
        // this.player.x += 200;
        this.enemy.x = this.player.x - 600;
        this.enemy.y = this.spawnPoint.y;
        // Start boss fight!
        this.state = 'idle';
        break;
      // Below are fights.
      case 'idle':
        // Want to stay at upper screen (left / right).
        // TODO: Move birdy here (move y slowly maybe within 0.5 sec?) YBing
        //       may swap left / right, can move x within 0.25 sec?
        this.enemy.x = this.enemy.x + (target.x - this.enemy.x) * 0.02;
        this.enemy.y = this.enemy.y + (target.y - this.enemy.y) * 0.1;
        this.calcAttack();
        break;
      /*case 'ice':
		break;*/
	  case 'shock':
        this.shockCount -= this.game.time.elapsed / 1000;
        if (this.shockCount <= 0) {
          this.shockCount = this.shockCountReset;
          this.resetCD();
          this.state = 'idle';
        }
        this.enemy.x = this.enemy.x + (target.x - this.enemy.x) * 0.02;
        this.enemy.y = this.enemy.y + (target.y - this.enemy.y) * 0.1;
	    break;
      case 'dive':
        this.diveCount -= this.game.time.elapsed / 1000;
        if (this.diveCount <= 0) {
          this.diveCount = this.diveCountReset;
          this.resetCD();
		  this.state = 'diveComeback';
		  this.enemy.animations.play('idle');
        }
        target.y = this.game.camera.view.centerY + 500;
        this.enemy.x = this.enemy.x + (target.x - this.enemy.x) * 0.02;
        this.enemy.y = this.enemy.y + (target.y - this.enemy.y) * 0.015;
        break;
      case 'diveComeback':
        this.diveCount -= this.game.time.elapsed / 1000;
        if (this.diveCount <= 0) {
          this.resetCD();
          this.state = 'idle';
        }
        this.enemy.x = this.enemy.x + (target.x - this.enemy.x) * 0.02;
        this.enemy.y = this.enemy.y + (target.y - this.enemy.y) * 0.02;
        break;
      case 'laserPrepare':
        this.laserCount -= this.game.time.elapsed / 1000;
        if (this.laserCount <= 0) {
          this.laserCount = this.laserCountReset;
          this.resetCD();
		  this.state = 'laser';
		  this.enemy.animations.play('laser1');
        }
        // Play neck hold anim YBing
        break;
      case 'laser':
        this.laserCount -= this.game.time.elapsed / 1000;
        if (this.laserCount <= 0) {
          this.laserCount = this.laserPrepareCountReset;
          this.resetCD();
		  this.state = 'laserComeback';
		  this.enemy.animations.play('idle');
        }
        // Shoot
        this.laserCD -= this.game.time.elapsed / 1000;
        if (this.laserCD <= 0) {
          this.laserCD = this.laserCDReset;
          this.resetCD();
          let laser = new LaserObject(this.game, new Phaser.Point(this.enemy.x, this.enemy.y), this.targetPoint);
        }
        // Play neck back anim YBing
        break;
      case 'laserComeback':
        this.laserCount -= this.game.time.elapsed / 1000;
        if (this.laserCount <= 0) {
          this.resetCD();
          this.state = 'idle';
        }
        break;
    }
  }
  public openGates() {
    // Pop instance death tiles
    let gameScene = <Game>this.game.state.getCurrentState();
    let mapObj = gameScene.mapObj;
    mapObj.layers.pop();
    mapObj.instantDeathLayer.destroy();
    mapObj.instantDeathLayer = null;
    // Kill all enemies.
    for (let enemy of gameScene.enemyObjs) {
      enemy.destroy();
    }
    gameScene.enemyObjs = [];
  }
  public update() {
    if (EagleEnemyObject.nextStage) {
      // Clear flag.
      EagleEnemyObject.nextStage = false;
      // TODO: Play eagle hit anim. YBing
      // Kill player.
      let playerObj = (<Game>this.game.state.getCurrentState()).playerObj;
      playerObj.respawn();
      EagleEnemyObject.enemyStage++;
      if (EagleEnemyObject.enemyStage === 3) {
        // TODO: Dead animation? (Dead and fall down)
        this.state = 'dead'
        this.openGates();
      }
      console.log('stage', EagleEnemyObject.enemyStage);
    }
    this.changeState();
    // Change direction
  }
}