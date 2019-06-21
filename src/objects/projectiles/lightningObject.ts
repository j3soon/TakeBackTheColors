import * as Assets from '../../assets';
import EnemyObject from '../enemyObject';
import Game from '../../states/game';

export default class LightningObject extends Phaser.Sprite {
  public projectile: Phaser.Sprite;
  private readonly speed = 800;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, player: Phaser.Sprite) {
    super(game, 0, 0);
    this.projectile = game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Spritesheets.SpritesheetsProjectileLightning551142.getName());
    this.projectile.animations.add('anim', null, 12, true);
    this.projectile.animations.play('anim');
    this.projectile.anchor.setTo(0.5);
    this.projectile.scale.set(0.5, 0.5);
    game.physics.enable(this.projectile);
    this.projectile.autoCull = true;

    let angle = Math.atan2(player.y - spawnPoint.y, player.x - spawnPoint.x);
    this.projectile.body.velocity.x = this.speed * Math.cos(angle);
    this.projectile.body.velocity.y = this.speed * Math.sin(angle);
    // this.projectile.body.velocity.y = this.speed;
    // this.projectile.body.velocity.x = xSpeed;
    // Inject this object to event loop.
    game.add.existing(this);
  }
  public update() {
    let mapObj = (<Game>this.game.state.getCurrentState()).mapObj;
    let playerObj = (<Game>this.game.state.getCurrentState()).playerObj;
    this.game.physics.arcade.collide(mapObj.obstacleLayer, this.projectile, () => {
      this.callback();
    });
    this.game.physics.arcade.collide(playerObj.player, this.projectile, () => {
      playerObj.respawn();
      this.callback();
    });
  }
  public callback() {
    this.projectile.kill();
    this.kill();
  }
}