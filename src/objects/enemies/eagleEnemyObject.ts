import * as Assets from '../../assets';
import EnemyObject from '../enemyObject';

export default class EagleEnemyObject extends EnemyObject {
  public fightAreaRect: Phaser.Rectangle;
  public fightStart1Rect: Phaser.Rectangle;
  public fightStart2Rect: Phaser.Rectangle;
  private state = 'stop';

  private coolDown = 5;
  private coolDownReset = 5;
  private dockLeft = true;

  private player: Phaser.Sprite;

  constructor(game: Phaser.Game, spawnPoint: Phaser.Point, gravity: number, moveRect: Phaser.Rectangle, fightStart1Rect: Phaser.Rectangle, fightStart2Rect: Phaser.Rectangle, player: Phaser.Sprite) {
    super(game, spawnPoint, gravity);
    this.fightAreaRect = moveRect;
    this.fightStart1Rect = fightStart1Rect;
    this.fightStart2Rect = fightStart2Rect;
    this.player = player;
    this.enemy = game.add.sprite(0, 0, Assets.Spritesheets.SpritesheetsEnemiesPropeller1221396.getName());
    // this.enemy.animations.add('take-off', [0, 1, 2, 3], 12, true);
    this.enemy.animations.add('hover', [0, 1], 12, true);
    // this.enemy.animations.add('dive', [4, 5], 12, true);
    // this.enemy.animations.add('laser', [2, 3], 12, true);
    this.enemy.animations.play('hover');
    this.enemy.anchor.setTo(0.5);
    this.enemy.scale.set(4, 4);
    game.physics.enable(this.enemy);
    // this.enemy.body.gravity.y = gravity;
    this.enemy.autoCull = true;
  }
  public changeState() {
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
        break;
      case 'anim':
        // TODO: Pause and animate! YBing
        // On finish:
        this.enemy.x = this.player.x - 600;
        this.enemy.y = this.spawnPoint.y;
        // Start boss fight!
        this.state = 'idle';
        break;
      // Below are fights.
      case 'idle':
        // Want to stay at upper screen (left / right).
        let target = new Phaser.Point();
        target.y = this.game.camera.view.centerY - 300;
        let newY = this.fightAreaRect.y + this.enemy.height / 2 + 50;
        target.y = Math.max(target.y, newY);
        if (this.dockLeft) {
          target.x = this.game.camera.view.centerX - 700;
          let newX = this.fightAreaRect.x + this.enemy.width / 2 + 50;
          target.x = Math.max(target.x, newX);
        }
        this.enemy.x = target.x;
        this.enemy.y = target.y;
        break;
    }
  }
  public update() {
    this.changeState();
    // Change direction
  }
}