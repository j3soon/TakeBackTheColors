import * as Assets from '../../assets';
import EnemyObject from '../enemyObject';
import FreeCloudEnemyObject from './freeCloudEnemyObject';
import EagleEnemyObject from './eagleEnemyObject';

export default class SpawnCloudEnemyObject extends Phaser.Sprite {
  private spawnPoint: Phaser.Point;
  private gravity: number;
  private player: Phaser.Sprite;
  private walkTop: boolean;
  private enemies: EnemyObject[];

  private spawnCount: number = 0;
  private readonly spawnCountReset = 2;

  private effect: Phaser.Sprite[];

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, gravity: number, player: Phaser.Sprite, walkTop: boolean, enemies: EnemyObject[]) {
    super(game, 0, 0);
    this.spawnPoint = spawnPoint;
    this.gravity = gravity;
    this.player = player;
    this.walkTop = walkTop;
    this.enemies = enemies;
    this.effect = [];
    for (let i = 0; i < 3; i++) {
      let eff = game.add.sprite(spawnPoint.x, spawnPoint.y, Assets.Spritesheets.SpritesheetsCosmicTimeEffect1501505.getName())
      this.effect.push(eff);
      eff.animations.add('anim', [i], 0, true);
      eff.animations.play('anim');
      game.physics.enable(eff);
      if (i === 0) {
        eff.body.angularVelocity = 400;
      } else if (i === 1) {
        eff.body.angularVelocity = -300;
      } else if (i === 2) {
        eff.body.angularVelocity = 200;
      } else if (i === 3) {
        eff.body.angularVelocity = -100;
      } else if (i === 4) {
        eff.body.angularVelocity = 50;
      }
      eff.anchor.setTo(0.53);
      // eff.anchor.setTo(0.53);
      eff.visible = false;
    }
    // Inject this object to event loop.
    game.add.existing(this);
  }
  public update() {
    // fin
    if (EagleEnemyObject.enemyStage === 3) {
      for (let eff of this.effect) {
        eff.visible = false;
      }
      return;
    }
    if (EagleEnemyObject.enemyStage <= 1 && this.walkTop) {
      // Lower cloud spawner. appear in stage 2.
      return;
    } else if (EagleEnemyObject.enemyStage <= 0 && !this.walkTop) {
      // Upper saw cloud. appear in stage 1.
      return;
    }
    for (let eff of this.effect) {
      eff.visible = true;
    }
    this.spawnCount -= this.game.time.elapsed / 1000;
    if (this.spawnCount <= 0) {
      this.spawnCount = this.spawnCountReset;
      this.enemies.push(new FreeCloudEnemyObject(this.game, this.spawnPoint, this.gravity, this.player, this.walkTop));
    }
  }
}