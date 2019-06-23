import * as Assets from '../../assets';
import EnemyObject from '../enemyObject';
import IceObject from '../projectiles/iceObject';
import Game from '../../states/game';

export default class EagleEnemyObject extends EnemyObject {
  public fightAreaRect: Phaser.Rectangle;
  public fightStart1Rect: Phaser.Rectangle;
  public fightStart2Rect: Phaser.Rectangle;
  private state = 'stop';

  private coolDown = 6;
  private coolDownReset = 6;
  private dockLeft = true;

  // 0: ice
  // 1: dive
  // 2: laser
  // 3: dead bird
  public static enemyStage = 0;
  public static nextStage = false;

  private player: Phaser.Sprite;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, gravity: number, moveRect: Phaser.Rectangle, fightStart1Rect: Phaser.Rectangle, fightStart2Rect: Phaser.Rectangle, player: Phaser.Sprite) {
    super(game, spawnPoint, gravity);
    this.fightAreaRect = moveRect;
    this.fightStart1Rect = fightStart1Rect;
    this.fightStart2Rect = fightStart2Rect;
    this.player = player;
    //this.enemy = game.add.sprite(0, 0, Assets.Spritesheets.SpritesheetsEnemiesPropeller1221396.getName());
    this.enemy = game.add.sprite(0, 0, Assets.Spritesheets.SpritesheetsEagleBoss80070018.getName());
    // this.enemy.animations.add('take-off', [0, 1, 2, 3], 12, true);
    this.enemy.animations.add('idle', [5, 6, 7, 8], 8, true);
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
    new IceObject(this.game, new Phaser.Point(this.enemy.x, this.enemy.y), this.player);
    this.enemy.bringToTop();
    if (this.game.rnd.integerInRange(0, 10) < 3)
      this.dockLeft = !this.dockLeft;
  }
  public dive() {
    this.dockLeft = !this.dockLeft;
  }
  public shootLaser() {
  }
  public calcAttack() {
    if (this.state !== 'idle') {
      return;
    }
    this.coolDown -= this.game.time.elapsed / 1000;
    if (this.coolDown <= 0) {
      this.coolDown = this.coolDownReset + this.game.rnd.frac() * 8;
      // Attack!!
      let r = this.game.rnd.integerInRange(0, 10);
      if (EagleEnemyObject.enemyStage === 0) {
        this.shootIce();
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
	if(newScaleX != this.enemy.scale.x && Math.abs(this.enemy.x - this.player.x) > 50) this.enemy.scale.x = newScaleX;
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
        // TODO: Move birdy here (move y slowly maybe within 0.5 sec?) YBing
        //       may swap left / right, can move x within 0.25 sec?
        this.enemy.x = this.enemy.x + (target.x - this.enemy.x) * 0.02;
        this.enemy.y = this.enemy.y + (target.y - this.enemy.y) * 0.1;
        this.calcAttack();
        break;
      /*case 'ice':
        break;*/
      case 'dive':
        break;
      case 'laser':
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