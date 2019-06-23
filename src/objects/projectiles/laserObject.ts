import * as Assets from '../../assets';
import EnemyObject from '../enemyObject';
import Game from '../../states/game';

export default class LaserObject extends Phaser.Sprite {
  public projectile: Phaser.Sprite;
  private readonly speed = 1600;

  private readonly spawnCountReset = 5;
  private spawnCount: number = this.spawnCountReset;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, playerPnt: Phaser.Point) {
    super(game, 0, 0);
    this.projectile = game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Images.ImagesBeam.getName());
    this.projectile.anchor.setTo(0.5);
    this.projectile.scale.set(2, 2);
    game.physics.enable(this.projectile);
    this.projectile.autoCull = true;
    /*this.projectile.body.angularVelocity = 100;
    this.projectile.body.angularAcceleration = 50;*/

    let angle = Math.atan2(playerPnt.y - spawnPoint.y, playerPnt.x - spawnPoint.x);
    this.projectile.body.velocity.x = this.speed * Math.cos(angle);
    this.projectile.body.velocity.y = this.speed * Math.sin(angle);
    this.projectile.rotation = angle;
    // this.projectile.body.velocity.y = this.speed;
    // this.projectile.body.velocity.x = xSpeed;
    // Inject this object to event loop.
    game.add.existing(this);
  }
  public update() {
    let mapObj = (<Game>this.game.state.getCurrentState()).mapObj;
    let playerObj = (<Game>this.game.state.getCurrentState()).playerObj;
    let kill = false;
    this.spawnCount -= this.game.time.elapsed / 1000;
    if (this.spawnCount < 0) {
      kill = true;
    }
    this.game.physics.arcade.collide(playerObj.player, this.projectile, () => {
      playerObj.respawn();
      kill = true;
    });
    if (kill) {
      this.callback();
    }
  }
  public callback() {
    this.projectile.destroy();
    this.destroy();
  }
}